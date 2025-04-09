from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from core.security.mixins import GroupModuleMixin
from django.http import JsonResponse
from django.db.models import Q
from core.pos.models import Product, Customer, Invoice, InvoiceDetail, Company, AccountReceivable
from django.db import transaction
from django.core.paginator import Paginator
import json
import logging
from datetime import datetime
from django.urls import reverse_lazy

logger = logging.getLogger(__name__)

class POSView(GroupModuleMixin, LoginRequiredMixin, TemplateView):
    template_name = 'pos/tpv.html'
    context_object_name = 'context'
    products_per_page = 12

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Punto de Venta'
        company = Company.objects.first()
        context['tax_rate'] = float(company.tax) if company else 21  # Usar el IVA de la compañía
        context['customers'] = Customer.objects.all().order_by('user__names')[:10]  # Primeros 10 clientes
        context['featured_products'] = Product.objects.filter(is_featured=True)[:8]  # Productos destacados
        
        # Paginación de productos
        page = self.request.GET.get('page', 1)
        products_list = Product.objects.all().order_by('name')
        paginator = Paginator(products_list, self.products_per_page)
        products_page = paginator.get_page(page)
        
        context['products'] = products_page
        context['page_obj'] = products_page
        context['is_paginated'] = True
        context['paginator'] = paginator
        
        return context

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST.get('action')
        logger.info(f"Action received: {action}")
        logger.info(f"POST data: {request.POST}")
        
        try:
            if action == 'search':
                term = request.POST.get('term', '')
                data = []
                for product in Product.objects.filter(Q(name__icontains=term) | Q(code__icontains=term)):
                    data.append({
                        'id': product.id,
                        'code': product.code,
                        'name': product.name,
                        'pvp': float(product.pvp),
                        'stock': product.stock
                    })
            elif action == 'search_customer':
                term = request.POST.get('term', '')
                query = Customer.objects.all()
                if term:
                    query = query.filter(Q(user__names__icontains=term) | Q(dni__icontains=term))
                data = []
                for customer in query.order_by('user__names')[:10]:
                    data.append({
                        'id': customer.id,
                        'text': customer.user.names,
                        'dni': customer.dni
                    })
            elif action == 'add':
                with transaction.atomic():
                    # Crear factura
                    invoice = Invoice()
                    invoice.date_joined = datetime.now().date()
                    invoice.company = Company.objects.first()
                    invoice.employee_id = request.user.id
                    invoice.payment_type = request.POST.get('payment_type', 'efectivo')
                    invoice.customer_id = int(request.POST.get('customer'))
                    invoice.tax = float(invoice.company.tax) / 100 if invoice.company else 0.21
                    invoice.save()

                    # Agregar productos
                    products_json = request.POST.get('products', '[]')
                    logger.info(f"Products JSON received: {products_json}")
                    products = json.loads(products_json)
                    
                    for product_data in products:
                        logger.info(f"Processing product: {product_data}")
                        product = Product.objects.get(pk=product_data['id'])
                        invoice_detail = InvoiceDetail.objects.create(
                            invoice_id=invoice.id,
                            product_id=product.id,
                            quantity=int(product_data['quantity']),
                            price=float(product_data['current_price']),
                            discount=float(product_data.get('discount', 0))
                        )
                        invoice_detail.deduct_product_stock()

                    # Recalcular totales
                    invoice.recalculate_invoice()

                    # Si es crédito, crear cuenta por cobrar
                    if invoice.payment_type == 'credito':
                        invoice.end_credit = datetime.now().date()
                        invoice.save()
                        AccountReceivable.objects.create(
                            invoice_id=invoice.id,
                            date_joined=invoice.date_joined,
                            end_date=invoice.end_credit,
                            debt=invoice.total_amount
                        )

                    data = {'print_url': str(reverse_lazy('pos:invoice_print', kwargs={'pk': invoice.id}))}
            elif action == 'load_more_products':
                page = int(request.POST.get('page', 1))
                logger.info(f"Loading more products, page: {page}")
                
                products_list = Product.objects.all().order_by('name')
                paginator = Paginator(products_list, self.products_per_page)
                products_page = paginator.get_page(page)
                
                products_data = []
                for product in products_page:
                    products_data.append({
                        'id': product.id,
                        'name': product.name,
                        'code': product.code,
                        'category': product.category.name if product.category else '',
                        'stock': product.stock,
                        'pvp': float(product.pvp),
                        'image': product.image.url if product.image else None
                    })
                
                data = {
                    'products': products_data,
                    'has_next': products_page.has_next(),
                    'next_page': products_page.next_page_number() if products_page.has_next() else None
                }
                logger.info(f"Sending {len(products_data)} products, has_next: {data['has_next']}, next_page: {data['next_page']}")
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except json.JSONDecodeError as e:
            logger.error(f"Error al decodificar JSON: {str(e)}")
            logger.error(f"JSON recibido: {request.POST.get('products', '[]')}")
            data = {'error': 'Error en el formato de los datos'}
        except Customer.DoesNotExist:
            logger.error("Cliente no encontrado")
            data = {'error': 'Cliente no encontrado'}
        except Product.DoesNotExist:
            logger.error("Producto no encontrado")
            data = {'error': 'Uno o más productos no encontrados'}
        except ValueError as e:
            logger.error(f"Error de conversión de datos: {str(e)}")
            data = {'error': 'Error en el formato de los datos'}
        except Exception as e:
            logger.error(f"Error en POSView: {str(e)}", exc_info=True)
            data = {'error': 'Error al procesar la solicitud'}
        
        logger.info(f"Response data: {data}")
        return JsonResponse(data, safe=False)

    def search_products(self, request):
        try:
            logger.info("Buscando productos...")
            term = request.POST.get('term', '').lower()
            logger.info(f"Término de búsqueda: {term}")
            
            # Construir el filtro base
            filters = Q()
            if term:
                filters &= Q(name__icontains=term) | Q(code__icontains=term)
            
            # Obtener productos de la base de datos
            products = Product.objects.filter(filters).order_by('name')
            if not term:
                products = products[:10]  # Limitar a 10 resultados si no hay término de búsqueda
            
            # Convertir productos a formato JSON
            data = [product.as_dict() for product in products]
            
            logger.info(f"Productos encontrados: {len(data)}")
            return JsonResponse(data, safe=False)
            
        except Exception as e:
            logger.error(f"Error en search_products: {str(e)}")
            return JsonResponse({'error': str(e)})

    def search_customers(self, request):
        try:
            term = request.POST.get('term', '')
            customers = Customer.objects.filter(
                Q(user__names__icontains=term) |
                Q(dni__icontains=term)
            ).order_by('user__names')[:10]
            
            data = []
            for customer in customers:
                data.append({
                    'id': customer.id,
                    'text': customer.user.names,
                    'dni': customer.dni
                })
            return JsonResponse(data, safe=False)
        except Exception as e:
            logger.error(f"Error en search_customers: {str(e)}")
            return JsonResponse({'error': str(e)})

    def create_invoice(self, request):
        try:
            with transaction.atomic():
                # Obtener datos del request
                customer_id = request.POST.get('customer')
                products_data = json.loads(request.POST.get('products'))
                
                if not customer_id:
                    return JsonResponse({'error': 'Cliente no seleccionado'})
                
                if not products_data:
                    return JsonResponse({'error': 'No hay productos en el carrito'})
                
                # Obtener la compañía
                company = Company.objects.first()
                if not company:
                    return JsonResponse({'error': 'No hay una compañía configurada en el sistema'})
                
                # Crear factura
                invoice = Invoice()
                invoice.company = company
                invoice.customer_id = customer_id
                invoice.date_joined = datetime.now()
                invoice.employee = request.user
                invoice.tax = company.tax / 100  # Guardar el IVA como decimal
                invoice.save()

                # Crear detalles de la factura
                for product_data in products_data:
                    InvoiceDetail.objects.create(
                        invoice=invoice,
                        product_id=product_data['id'],
                        quantity=product_data['quantity'],
                        price=product_data['current_price'],
                        discount=0
                    )

                invoice.recalculate_invoice()
                data = {'invoice_id': invoice.id}
                return JsonResponse(data)
                
        except Exception as e:
            logger.error(f"Error en create_invoice: {str(e)}")
            return JsonResponse({'error': str(e)})

    def load_more_products(self, request):
        try:
            page = int(request.POST.get('page', 1))
            products_list = Product.objects.all().order_by('name')
            paginator = Paginator(products_list, self.products_per_page)
            products_page = paginator.get_page(page)
            
            products_data = []
            for product in products_page:
                product_data = {
                    'id': product.id,
                    'name': product.name,
                    'code': product.code,
                    'category': {'name': product.category.name} if product.category else {'name': ''},
                    'stock': product.stock,
                    'pvp': float(product.pvp),
                    'image': product.image.url if product.image else None
                }
                products_data.append(product_data)
            
            return JsonResponse({
                'products': products_data,
                'has_next': products_page.has_next(),
                'next_page': products_page.next_page_number() if products_page.has_next() else None
            })
        except Exception as e:
            logger.error(f"Error en load_more_products: {str(e)}")
            return JsonResponse({'error': str(e)})

    def get(self, request, *args, **kwargs):
        if 'search_customers' in request.path:
            return self.search_customers(request)
        return super().get(request, *args, **kwargs) 
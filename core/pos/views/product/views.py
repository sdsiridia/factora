import json
from io import BytesIO

import pandas as pd
import xlsxwriter
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView, DeleteView, ListView, TemplateView
from django.views.generic.base import View

from core.pos.forms import ProductForm, Product, Category
from core.security.mixins import GroupPermissionMixin


class ProductListView(GroupPermissionMixin, ListView):
    model = Product
    template_name = 'product/list.html'
    permission_required = 'view_product'

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'list':
                data = []
                for i in self.model.objects.filter():
                    data.append(i.as_dict())
            elif action == 'search':
                data = []
                for i in self.model.objects.filter():
                    data.append(i.as_dict())
            elif action == 'upload_excel':
                with transaction.atomic():
                    archive = request.FILES['archive']
                    df = pd.read_excel(archive, engine='openpyxl', dtype={'Código': str})
                    for record in json.loads(df.to_json(orient='records')):
                        product, created = self.model.objects.update_or_create(
                            code=str(record['Código']),
                            defaults={
                                'name': record['Nombre'],
                                'category': Category.objects.get_or_create(name=record['Categoría'])[0],
                                'price': float(record['Precio de Compra']),
                                'pvp': float(record['Precio de Venta']),
                                'stock': int(record['Stock']),
                                'is_inventoried': record['¿Es inventariado?'],
                                'has_tax': record['¿Se cobra impuesto?']
                            }
                        )
                        print(f'{product.id} => {created}')
            elif action == 'delete_multiple':
                with transaction.atomic():
                    ids = json.loads(request.POST['ids'])
                    products_to_delete = self.model.objects.filter(id__in=ids)
                    deleted_count = 0
                    error_products = []
                    
                    for product in products_to_delete:
                        try:
                            product.delete()
                            deleted_count += 1
                        except Exception as e:
                            error_products.append(product.name)
                    
                    if deleted_count > 0:
                        data['success'] = f'Se eliminaron {deleted_count} productos exitosamente.'
                    if error_products:
                        data['error'] = f'No se pudieron eliminar los siguientes productos porque están siendo utilizados en facturas, compras o cotizaciones: {", ".join(error_products)}'
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'Listado de {self.model._meta.verbose_name_plural}'
        context['create_url'] = reverse_lazy('pos:product_create')
        return context


class ProductCreateView(GroupPermissionMixin, CreateView):
    model = Product
    template_name = 'product/create.html'
    form_class = ProductForm
    success_url = reverse_lazy('pos:product_list')
    permission_required = 'add_product'

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'add':
                data = self.get_form().save()
            elif action == 'validate_data':
                field = request.POST['field']
                filters = Q()
                if field == 'code':
                    filters &= Q(code__iexact=request.POST['code'])
                data['valid'] = not self.model.objects.filter(filters).exists() if filters.children else True
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data()
        context['title'] = f'Creación de un {self.model._meta.verbose_name}'
        context['list_url'] = self.success_url
        context['action'] = 'add'
        return context


class ProductUpdateView(GroupPermissionMixin, UpdateView):
    model = Product
    template_name = 'product/create.html'
    form_class = ProductForm
    success_url = reverse_lazy('pos:product_list')
    permission_required = 'change_product'

    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'edit':
                data = self.get_form().save()
            elif action == 'validate_data':
                field = request.POST['field']
                filters = Q()
                if field == 'code':
                    filters &= Q(code__iexact=request.POST['code'])
                data['valid'] = not self.model.objects.filter(filters).exclude(id=self.object.id).exists() if filters.children else True
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data()
        context['title'] = f'Edición de un {self.model._meta.verbose_name}'
        context['list_url'] = self.success_url
        context['action'] = 'edit'
        return context


class ProductDeleteView(GroupPermissionMixin, DeleteView):
    model = Product
    template_name = 'delete.html'
    success_url = reverse_lazy('pos:product_list')
    permission_required = 'delete_product'

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            self.get_object().delete()
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'Eliminación de un {self.model._meta.verbose_name}'
        context['list_url'] = self.success_url
        return context


class ProductStockAdjustmentView(GroupPermissionMixin, ListView):
    model = Product
    template_name = 'product/stock_adjustment.html'
    permission_required = 'adjust_product_stock'

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'search_product':
                data = []
                ids = json.loads(request.POST['ids'])
                term = request.POST['term']
                filters = Q(is_inventoried=True)
                if len(term):
                    filters &= Q(Q(name__icontains=term) | Q(code__icontains=term))
                queryset = self.model.objects.filter(filters).exclude(id__in=ids).order_by('name')
                if filters.children and len(term):
                    queryset = queryset[0:10]
                for i in queryset:
                    item = i.as_dict()
                    item['quantity'] = i.stock
                    data.append(item)
            elif action == 'create':
                with transaction.atomic():
                    for i in json.loads(request.POST['products']):
                        product = self.model.objects.get(pk=i['id'])
                        product.stock = int(i['quantity'])
                        product.save()
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'juste de Stock de {self.model._meta.verbose_name_plural}'
        return context


class ProductExportExcelView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        try:
            columns_info = [
                ('Código', 20, lambda c: c.code),
                ('Nombre', 50, lambda c: c.name),
                ('Categoría', 35, lambda c: c.category.name),
                ('Precio de Compra', 30, lambda c: f'{c.price:.4f}'),
                ('Precio de Venta', 30, lambda c: f'{c.pvp:.4f}'),
                ('Stock', 30, lambda c: f'{c.stock}'),
                ('¿Es inventariado?', 30, lambda c: c.is_inventoried),
                ('¿Se cobra impuesto?', 30, lambda c: c.has_tax),
            ]
            output = BytesIO()
            workbook = xlsxwriter.Workbook(output)
            worksheet = workbook.add_worksheet('Productos')
            cell_format = workbook.add_format({'bold': True, 'align': 'center', 'border': 1})
            row_format = workbook.add_format({'align': 'center', 'border': 1})
            for index, (name, width, _) in enumerate(columns_info):
                worksheet.set_column(index, index, width)
                worksheet.write(0, index, name, cell_format)
            for row, product in enumerate(Product.objects.filter(), start=1):
                for col, (_, _, value_func) in enumerate(columns_info):
                    worksheet.write(row, col, value_func(product), row_format)
            workbook.close()
            output.seek(0)
            filename = 'PRODUCTOS.xlsx'
            response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename={filename}'
            return response
        except Exception as e:
            messages.error(request, str(e))
        return HttpResponseRedirect(reverse_lazy('pos:product_list'))


class ProductQrCodeView(GroupPermissionMixin, LoginRequiredMixin, TemplateView):
    template_name = 'product/qr_code.html'
    permission_required = 'view_product'

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'search_product_id':
                term = request.POST['term']
                if len(term):
                    product = Product.objects.filter(code=term).first()
                    if product:
                        product.stock += 1
                        product.save()
                        data = product.as_dict()
                    else:
                        data['error'] = 'No se encontró un producto asociado al código escaneado'
                else:
                    data['error'] = 'No se pudo extraer un código de barras válido de la imagen subida'
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Escaneo de Producto'
        context['list_url'] = reverse_lazy('pos:product_list')
        context['entity'] = 'Productos'
        context['action'] = 'scan'
        return context

import json
from datetime import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Sum, FloatField
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.views.generic import TemplateView

from core.pos.models import Product, Invoice, Customer, Provider, Category, Purchase
from core.security.models import Dashboard


class DashboardView(LoginRequiredMixin, TemplateView):
    def get_template_names(self):
        dashboard = Dashboard.objects.first()
        if dashboard and dashboard.layout == 1:
            return 'vtc_dashboard_client.html' if self.request.user.is_customer else 'vtc_dashboard_admin.html'
        return 'hzt_dashboard.html'

    def get(self, request, *args, **kwargs):
        request.user.set_group_session()
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'get_top_stock_products':
                data = []
                for i in Product.objects.filter(stock__gt=0).order_by('-stock')[0:10]:
                    data.append([i.name, i.stock])
            elif action == 'get_monthly_sales_and_purchases':
                data = []
                year = datetime.now().year
                rows = []
                for month in range(1, 13):
                    result = Invoice.objects.filter(date_joined__month=month, date_joined__year=year).aggregate(result=Coalesce(Sum('total_amount'), 0.00, output_field=FloatField()))['result']
                    rows.append(float(result))
                data.append({'name': 'Ventas', 'data': rows})
                rows = []
                for month in range(1, 13):
                    result = Purchase.objects.filter(date_joined__month=month, date_joined__year=year).aggregate(result=Coalesce(Sum('total_amount'), 0.00, output_field=FloatField()))['result']
                    rows.append(float(result))
                data.append({'name': 'Compras', 'data': rows})
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Panel de administración'
        if not self.request.user.is_customer:
            context['customers'] = Customer.objects.all().count()
            context['providers'] = Provider.objects.all().count()
            context['categories'] = Category.objects.filter().count()
            context['products'] = Product.objects.all().count()
            context['invoices'] = Invoice.objects.filter().order_by('-id')[0:10]
        return context
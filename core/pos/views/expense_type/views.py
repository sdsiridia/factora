import json

from django.db.models import Q
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView

from core.pos.forms import ExpenseType, ExpenseTypeForm
from core.security.mixins import GroupPermissionMixin


class ExpenseTypeListView(GroupPermissionMixin, ListView):
    model = ExpenseType
    template_name = 'expense_type/list.html'
    permission_required = 'view_expense_type'

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'search':
                data = []
                for i in self.model.objects.all():
                    data.append(i.as_dict())
            else:
                data['error'] = 'No ha seleccionado ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'Listado de {self.model._meta.verbose_name_plural}'
        context['create_url'] = reverse_lazy('pos:expense_type_create')
        return context


class ExpenseTypeCreateView(GroupPermissionMixin, CreateView):
    model = ExpenseType
    template_name = 'expense_type/create.html'
    form_class = ExpenseTypeForm
    success_url = reverse_lazy('pos:expense_type_list')
    permission_required = 'add_expense_type'

    def post(self, request, *args, **kwargs):
        data = {}
        action = request.POST['action']
        try:
            if action == 'add':
                data = self.get_form().save()
            elif action == 'validate_data':
                field = request.POST['field']
                filters = Q()
                if field == 'name':
                    filters &= Q(name__iexact=request.POST['name'])
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


class ExpenseTypeUpdateView(GroupPermissionMixin, UpdateView):
    model = ExpenseType
    template_name = 'expense_type/create.html'
    form_class = ExpenseTypeForm
    success_url = reverse_lazy('pos:expense_type_list')
    permission_required = 'change_expense_type'

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
                if field == 'name':
                    filters &= Q(name__iexact=request.POST['name'])
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


class ExpenseTypeDeleteView(GroupPermissionMixin, DeleteView):
    model = ExpenseType
    template_name = 'delete.html'
    success_url = reverse_lazy('pos:expense_type_list')
    permission_required = 'delete_expense_type'

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

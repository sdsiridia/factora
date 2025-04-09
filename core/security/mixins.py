from crum import get_current_request
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import Group
from django.http import HttpResponseRedirect
from django.db.models import Q

from config import settings
from core.security.models import Module, GroupModule


class BaseGroupMixin(LoginRequiredMixin):
    redirect_field_name = settings.LOGIN_REDIRECT_URL

    def get_last_url(self):
        request = get_current_request()
        last_url = request.session.get('url_last', settings.LOGIN_REDIRECT_URL)
        return last_url if last_url != request.path else settings.LOGIN_REDIRECT_URL

    def get_user_group(self, request):
        try:
            group_data = request.session.get('group')
            return Group.objects.get(id=group_data['id'])
        except:
            return None

    def set_module_in_session(self, request, group_module):
        if group_module:
            request.session['url_last'] = request.path
            module_dict = group_module.module.as_dict()
            request.session['module'] = module_dict
            print(f"Módulo guardado en sesión: {module_dict}")  # Debug


class GroupPermissionMixin(BaseGroupMixin):
    permission_required = None

    def get_permissions(self):
        if isinstance(self.permission_required, str):
            return [self.permission_required]
        return list(self.permission_required or [])

    def get(self, request, *args, **kwargs):
        group = self.get_user_group(request)
        if not group:
            return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)

        permissions = self.get_permissions()
        if not permissions:
            return super().get(request, *args, **kwargs)

        group_permissions = group.permissions.filter(codename__in=permissions)
        if group_permissions.count() == len(permissions):
            group_module = group.groupmodule_set.filter(module__permissions__codename=permissions[0]).first()
            self.set_module_in_session(request, group_module)
            return super().get(request, *args, **kwargs)

        messages.error(request, 'No tienes los permisos necesarios para acceder a esta sección')
        return HttpResponseRedirect(self.get_last_url())


class GroupModuleMixin(BaseGroupMixin):
    def get(self, request, *args, **kwargs):
        group = self.get_user_group(request)
        if not group:
            return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)

        # Permitir acceso al TPV sin verificar permisos
        if request.path == '/pos/tpv/' or request.path == '/pos/tpv':
            try:
                # Primero, buscar si existe un módulo con la URL del TPV
                tpv_module = Module.objects.filter(url='/pos/tpv/').first()
                
                if not tpv_module:
                    # Si no existe, crear uno nuevo con un ID diferente
                    tpv_module = Module.objects.create(
                        name='Punto de Venta',
                        url='/pos/tpv/',
                        icon='bi bi-cart',
                        description='Permite realizar ventas en el sistema',
                        module_type_id=4
                    )
                    print(f"Módulo TPV creado con ID: {tpv_module.id}")
                
                # Asegurar que el módulo tenga el permiso view_pos
                from django.contrib.auth.models import Permission
                view_permission, _ = Permission.objects.get_or_create(
                    codename='view_pos',
                    defaults={
                        'name': 'Can view POS',
                        'content_type_id': 1
                    }
                )
                tpv_module.permissions.add(view_permission)
                
                # Asignar el módulo al grupo del usuario
                group_module, created = GroupModule.objects.get_or_create(
                    group=group,
                    module=tpv_module
                )
                
                print(f"Módulo TPV {'creado' if created else 'actualizado'} para el grupo {group.name}")
                self.set_module_in_session(request, group_module)
                return super().get(request, *args, **kwargs)
            except Exception as e:
                print(f"Error al asignar el módulo TPV: {str(e)}")
                messages.error(request, 'Error al acceder al TPV')
                return HttpResponseRedirect(self.get_last_url())

        # Para otros módulos, mantener la verificación normal
        group_module = group.groupmodule_set.filter(
            Q(module__url=request.path) | 
            Q(module__url__startswith=request.path)
        ).first()
        
        if group_module:
            self.set_module_in_session(request, group_module)
            return super().get(request, *args, **kwargs)

        messages.error(request, 'No tienes los permisos necesarios para acceder a esta sección')
        return HttpResponseRedirect(self.get_last_url())

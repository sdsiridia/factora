from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from core.security.models import Module, GroupModule
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = 'Actualiza la URL del módulo TPV y asigna los permisos necesarios'

    def handle(self, *args, **options):
        try:
            # Obtener o crear el módulo TPV
            module, created = Module.objects.get_or_create(
                id=20,
                defaults={
                    'name': 'Punto de Venta',
                    'url': '/pos/tpv/',
                    'icon': 'bi bi-cart',
                    'description': 'Permite realizar ventas en el sistema',
                    'module_type_id': 4
                }
            )
            
            if not created:
                module.url = '/pos/tpv/'
                module.save()
            
            # Obtener o crear los permisos necesarios
            view_permission, _ = Permission.objects.get_or_create(
                codename='view_pos',
                defaults={
                    'name': 'Can view POS',
                    'content_type_id': 1  # Ajusta esto según tu ContentType
                }
            )
            
            # Asignar permisos al módulo
            module.permissions.add(view_permission)
            
            # Asignar el módulo a todos los grupos existentes
            for group in Group.objects.all():
                GroupModule.objects.get_or_create(
                    group=group,
                    module=module
                )
            
            self.stdout.write(self.style.SUCCESS('Módulo TPV actualizado exitosamente'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al actualizar el módulo TPV: {str(e)}')) 
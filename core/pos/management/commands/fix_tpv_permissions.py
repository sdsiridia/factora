from django.core.management.base import BaseCommand
from core.security.models import Module

class Command(BaseCommand):
    help = 'Arregla los permisos del módulo TPV'

    def handle(self, *args, **options):
        try:
            module = Module.ensure_tpv_module()
            if module:
                self.stdout.write(self.style.SUCCESS('Permisos del módulo TPV arreglados exitosamente'))
            else:
                self.stdout.write(self.style.ERROR('No se pudo arreglar el módulo TPV'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al arreglar el módulo TPV: {str(e)}')) 
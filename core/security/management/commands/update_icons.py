from django.core.management.base import BaseCommand
from core.security.models import ModuleType, Module
from django.conf import settings
import json
import os

class Command(BaseCommand):
    help = 'Actualiza los iconos de FontAwesome a Bootstrap Icons'

    def handle(self, *args, **options):
        # Actualizar iconos de tipos de módulos
        module_types_file = os.path.join(settings.BASE_DIR, 'deploy', 'json', 'module_type.json')
        with open(module_types_file) as f:
            module_types_data = json.load(f)
        
        for mt_data in module_types_data:
            ModuleType.objects.filter(id=mt_data['id']).update(icon=mt_data['icon'])
        
        self.stdout.write(self.style.SUCCESS('Iconos de tipos de módulos actualizados'))

        # Actualizar iconos de módulos
        modules_file = os.path.join(settings.BASE_DIR, 'deploy', 'json', 'module.json')
        with open(modules_file) as f:
            modules_data = json.load(f)
        
        for m_data in modules_data:
            Module.objects.filter(id=m_data['id']).update(icon=m_data['icon'])
        
        self.stdout.write(self.style.SUCCESS('Iconos de módulos actualizados')) 
from django.core.management.base import BaseCommand
from core.security.models import Module
import json
import os

class Command(BaseCommand):
    help = 'Corrige los IDs de los módulos según module.json'

    def handle(self, *args, **options):
        try:
            # Leer el archivo module.json
            module_json_path = os.path.join('deploy', 'json', 'module.json')
            with open(module_json_path, 'r') as f:
                modules_data = json.load(f)

            # Actualizar los módulos
            for module_data in modules_data:
                module, created = Module.objects.update_or_create(
                    id=module_data['id'],
                    defaults={
                        'name': module_data['name'],
                        'url': module_data['url'],
                        'icon': module_data['icon'],
                        'description': module_data['description'],
                        'module_type_id': module_data['module_type_id']
                    }
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Módulo {module.name} (ID: {module.id}) actualizado correctamente')
                )

            self.stdout.write(self.style.SUCCESS('Todos los módulos han sido actualizados correctamente'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al actualizar los módulos: {str(e)}')) 
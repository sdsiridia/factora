import json
import os
from django.core.management import BaseCommand
from django.contrib.auth.models import Permission
from core.security.models import Module, ModuleType

class Command(BaseCommand):
    help = 'Añade el módulo de escaneo QR a la base de datos'

    def handle(self, *args, **options):
        try:
            # Obtener el tipo de módulo Bodega (id=2)
            module_type = ModuleType.objects.get(id=2)
            
            # Crear el módulo de escaneo QR
            module = Module.objects.create(
                name="Escanear productos",
                url="/pos/product/qr-code/",
                icon="fas fa-barcode",
                description="Permite escanear productos mediante código QR",
                module_type=module_type
            )
            
            # Añadir el permiso view_product
            permission = Permission.objects.get(codename='view_product')
            module.permissions.add(permission)
            
            self.stdout.write(self.style.SUCCESS('Módulo de escaneo QR añadido exitosamente'))
            
        except ModuleType.DoesNotExist:
            self.stdout.write(self.style.ERROR('No se encontró el tipo de módulo Bodega'))
        except Permission.DoesNotExist:
            self.stdout.write(self.style.ERROR('No se encontró el permiso view_product'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al añadir el módulo: {str(e)}')) 
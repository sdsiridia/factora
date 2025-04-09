from django import template

register = template.Library()


@register.filter
def split_form_fields(form, quantity):
    list_of_fields = form.visible_fields()
    splitted_list = list()
    for i in range(0, len(list_of_fields), quantity):
        splitted_list.append(list_of_fields[i:i + quantity])
    return splitted_list

@register.filter
def split(value, delimiter='/'):
    """Divide una cadena por el delimitador especificado"""
    return value.split(delimiter)

@register.filter
def map(queryset, attr):
    """Mapea un atributo de una lista de objetos"""
    return [getattr(obj, attr) for obj in queryset]

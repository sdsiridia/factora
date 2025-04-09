document.addEventListener('DOMContentLoaded', function (e) {
    const fv = FormValidation.formValidation(document.getElementById('frmForm'), {
            locale: 'es_ES',
            localization: FormValidation.locales.es_ES,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                icon: new FormValidation.plugins.Icon({
                    valid: 'fa fa-check',
                    invalid: 'fa fa-times',
                    validating: 'fa fa-refresh',
                }),
            },
            fields: {
                name: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    name: fv.form.querySelector('[name="name"]').value,
                                    field: 'name',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El nombre ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                ruc: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 9,
                            max: 9,
                            message: 'El CIF debe tener 9 caracteres'
                        },
                        regexp: {
                            regexp: /^[A-HJNPQRSUVW][0-9]{7}[0-9A-J]$/,
                            message: 'Formato de CIF inválido'
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    ruc: fv.form.querySelector('[name="ruc"]').value,
                                    field: 'ruc',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de CIF ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        },
                    }
                },
                mobile: {
                    validators: {
                        notEmpty: {
                            message: 'Por favor ingrese un número de teléfono'
                        },
                        stringLength: {
                            min: 9,
                            max: 9,
                            message: 'El número de teléfono debe tener 9 dígitos'
                        },
                        digits: {
                            message: 'El teléfono solo puede contener números'
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    mobile: fv.form.querySelector('[name="mobile"]').value,
                                    field: 'mobile',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de teléfono ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                email: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 5
                        },
                        regexp: {
                            regexp: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i,
                            message: 'El formato email no es correcto'
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    email: fv.form.querySelector('[name="email"]').value,
                                    field: 'email',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El email ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                address: {
                    validators: {
                        // stringLength: {
                        //     min: 4,
                        // }
                    }
                }
            },
        }
    )
        .on('core.element.validated', function (e) {
            if (e.valid) {
                const groupEle = FormValidation.utils.closest(e.element, '.form-group');
                if (groupEle) {
                    FormValidation.utils.classSet(groupEle, {
                        'has-success': false,
                    });
                }
                FormValidation.utils.classSet(e.element, {
                    'is-valid': false,
                });
            }
            const iconPlugin = fv.getPlugin('icon');
            const iconElement = iconPlugin && iconPlugin.icons.has(e.element) ? iconPlugin.icons.get(e.element) : null;
            iconElement && (iconElement.style.display = 'none');
        })
        .on('core.validator.validated', function (e) {
            if (!e.result.valid) {
                const messages = [].slice.call(fv.form.querySelectorAll('[data-field="' + e.field + '"][data-validator]'));
                messages.forEach((messageEle) => {
                    const validator = messageEle.getAttribute('data-validator');
                    messageEle.style.display = validator === e.validator ? 'block' : 'none';
                });
            }
        })
        .on('core.form.valid', function () {
            var args = {
                'params': new FormData(fv.form),
                'form': fv.form
            };

            if (window.opener) {
                args['success'] = function (request) {
                    localStorage.setItem('provider', JSON.stringify(request));
                    window.close();
                }
            }

            submit_with_formdata(args);
        });
});

$(function () {
    $('input[name="ruc"]').on('keypress', function (e) {
        var key = e.charCode || e.keyCode || 0;
        // Permitir letras (mayúsculas) y números
        return (
            (key >= 65 && key <= 90) ||   // A-Z
            (key >= 48 && key <= 57)      // 0-9
        );
    });

    $('input[name="mobile"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });
});
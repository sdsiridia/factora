var fv;
var input_tax;

document.addEventListener('DOMContentLoaded', function (e) {
    fv = FormValidation.formValidation(document.getElementById('frmForm'), {
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
                ruc: {
                    validators: {
                        notEmpty: {
                            message: 'Por favor ingrese un número de CIF'
                        },
                        stringLength: {
                            min: 9,
                            max: 9,
                            message: 'El CIF debe tener 9 caracteres'
                        },
                        regexp: {
                            regexp: /^[A-HJNPQRSUVW][0-9]{7}[0-9A-J]$/,
                            message: 'Formato de CIF inválido'
                        }
                    }
                },
                name: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                address: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                image: {
                    validators: {
                        file: {
                            extension: 'jpeg,jpg,png',
                            type: 'image/jpeg,image/png',
                            maxFiles: 1,
                            message: 'Introduce una imagen válida'
                        }
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
                        }
                    }
                },
                phone: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 7,
                        },
                        digits: {},
                    }
                },
                email: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 5
                        }
                    }
                },
                website: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                description: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                establishment_code: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 3,
                        },
                        digits: {},
                    }
                },
                issuing_point_code: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 3,
                        },
                        digits: {},
                    }
                },
                tax: {
                    validators: {
                        numeric: {
                            message: 'El valor no es un número',
                            thousandsSeparator: '',
                            decimalSeparator: '.'
                        }
                    }
                },
                email_host: {
                    validators: {
                        notEmpty: {},
                    }
                },
                email_port: {
                    validators: {
                        digits: {},
                        notEmpty: {},
                    }
                },
                email_host_user: {
                    validators: {
                        notEmpty: {},
                    }
                },
                email_host_password: {
                    validators: {
                        notEmpty: {},
                    }
                },
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
            submit_with_formdata(args);
        });
});

$(function () {
    input_tax = $('input[name="tax"]');

    $('.select2').select2({
        theme: 'bootstrap4',
        language: 'es'
    });

    $('input[name="ruc"]').on('keypress', function (e) {
        var key = e.charCode || e.keyCode || 0;
        // Permitir letras (mayúsculas) y números
        return (
            (key >= 65 && key <= 90) ||   // A-Z
            (key >= 48 && key <= 57)      // 0-9
        );
    });

    $('input[name="mobile"]').on('keypress', function (e) {
        var key = e.charCode || e.keyCode || 0;
        // Permitir números y letras
        return (
            (key >= 48 && key <= 57) ||  // números
            (key >= 65 && key <= 90) ||  // letras mayúsculas
            (key >= 97 && key <= 122)    // letras minúsculas
        );
    });

    $('input[name="establishment_code"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="issuing_point_code"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="email_port"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    input_tax
        .TouchSpin({
            min: 0.00,
            max: 1000000,
            step: 0.01,
            decimals: 2,
            boostat: 5,
            maxboostedstep: 10,
            prefix: '%'
        })
        .on('change touchspin.on.min touchspin.on.max', function () {
            fv.revalidateField('tax');
        })
        .on('keypress', function (e) {
            return validate_text_box({'event': e, 'type': 'decimals'});
        });

    $('i[data-field="tax"]').hide();
});
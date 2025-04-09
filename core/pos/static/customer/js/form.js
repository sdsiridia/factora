var fv;
var input_birthdate;

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
                names: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                dni: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 8,
                            max: 9,
                            message: 'El DNI debe tener 8 o 9 caracteres'
                        },
                        regexp: {
                            regexp: /^[XYZ]?\d{7,8}[A-Z]$/,
                            message: 'Formato inválido. Use: 12345678A o X1234567B'
                        },
                        callback: {
                            message: 'El número de DNI/CIF es incorrecto',
                            callback: function (input) {
                                var value = input.value;
                                // Si empieza con X, Y, Z es un NIE
                                if (/^[XYZ]/.test(value)) {
                                    return value.length === 9;
                                }
                                // Si no, es un DNI normal
                                return value.length === 8 && /^[0-9]{7}[A-Z]$/.test(value);
                            },
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    dni: fv.form.querySelector('[name="dni"]').value,
                                    field: 'dni',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de DNI ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                mobile: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 7
                        },
                        digits: {}
                    }
                },
                email: {
                    validators: {
                        optional: true,
                        stringLength: {
                            min: 5
                        },
                        regexp: {
                            regexp: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i,
                            message: 'El formato email no es correcto'
                        }
                    }
                },
                address: {
                    validators: {
                        optional: true,
                        stringLength: {
                            min: 4,
                        }
                    }
                },
                birthdate: {
                    validators: {
                        notEmpty: {
                            message: 'La fecha es obligatoria'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La fecha no es válida'
                        }
                    },
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
                    localStorage.setItem('customer', JSON.stringify(request));
                    window.close();
                }
            }

            submit_with_formdata(args);
        });
});

$(function () {
    input_birthdate = $('input[name="birthdate"]');

    input_birthdate.datetimepicker({
        useCurrent: false,
        format: 'YYYY-MM-DD',
        locale: 'es',
        keepOpen: false,
    });

    input_birthdate.on('change.datetimepicker', function (e) {
        fv.revalidateField('birthdate');
    });

    $('input[name="names"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'letters'});
    });

    $('input[name="dni"]').on('keypress', function (e) {
        var key = e.charCode || e.keyCode || 0;
        // Permitir letras (mayúsculas y minúsculas) y números
        return (
            (key >= 65 && key <= 90) ||   // A-Z
            (key >= 97 && key <= 122) ||  // a-z
            (key >= 48 && key <= 57)      // 0-9
        );
    });

    $('input[name="mobile"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });
});
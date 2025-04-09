var tblProducts, tblSearchProducts;
var fv;
var select_payment_type, select_provider;
var input_date_joined, input_search_product, input_end_credit;
var container_credit;

var purchase = {
    detail: {
        subtotal: 0.00,
        tax: 0.00,
        total_tax: 0.00,
        total_amount: 0.00,
        products: [],
    },
    addProduct: function (item) {
        this.detail.products.push(item);
        this.listProducts();
    },
    getProductId: function () {
        return this.detail.products.map(value => value.id);
    },
    listProducts: function () {
        this.totalCalculator();
        tblProducts = $('#tblProducts').DataTable({
            autoWidth: false,
            destroy: true,
            data: this.detail.products,
            ordering: false,
            lengthChange: false,
            searching: false,
            paginate: false,
            columns: [
                {data: "id"},
                {data: "code"},
                {data: "short_name"},
                {data: "quantity"},
                {data: "price"},
                {data: "subtotal"},
            ],
            columnDefs: [
                {
                    targets: [-3],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '<input type="text" class="form-control" autocomplete="off" name="quantity" value="' + row.quantity + '">';
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '<input type="text" class="form-control" autocomplete="off" name="price" value="' + row.price + '">';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data.toFixed(2) + ' €';
                    }
                },
                {
                    targets: [0],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '<a rel="remove" class="btn btn-danger btn-xs btn-flat"><i class="fas fa-times"></i></a>';
                    }
                },
            ],
            rowCallback: function (row, data, index) {
                var tr = $(row).closest('tr');
                tr.find('input[name="quantity"]')
                    .TouchSpin({
                        min: 1,
                        max: 10000000
                    })
                    .on('keypress', function (e) {
                        return validate_text_box({'event': e, 'type': 'numbers'});
                    });
                tr.find('input[name="price"]')
                    .TouchSpin({
                        min: 0.0000,
                        max: 1000000,
                        step: 0.0001,
                        decimals: 4,
                        boostat: 5,
                        maxboostedstep: 10,
                    })
                    .on('keypress', function (e) {
                        return validate_text_box({'event': e, 'type': 'decimals'});
                    });
            },
            initComplete: function (settings, json) {
                $(this).wrap('<div class="dataTables_scroll"><div/>');
            }
        });
    },
    totalCalculator: function () {
        var tax = this.detail.tax / 100;
        this.detail.products.forEach(function (value, index, array) {
            value.subtotal = value.quantity * value.price;
        });
        this.detail.subtotal = this.detail.products.reduce((a, b) => a + (b.subtotal || 0), 0);
        this.detail.total_tax = this.detail.subtotal * tax;
        this.detail.total_amount = (Math.round(this.detail.subtotal * 100) / 100) + (Math.round(this.detail.total_tax * 100) / 100);

        $('input[name="subtotal"]').val(this.detail.subtotal.toFixed(2));
        $('input[name="tax"]').val(this.detail.tax.toFixed(2));
        $('input[name="total_tax"]').val(this.detail.total_tax.toFixed(2));
        $('input[name="total_amount"]').val(this.detail.total_amount.toFixed(2));
    },
};

document.addEventListener('DOMContentLoaded', function (e) {
    fv = FormValidation.formValidation(document.getElementById('frmForm'), {
            locale: 'es_ES',
            localization: FormValidation.locales.es_ES,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                excluded: new FormValidation.plugins.Excluded(),
                icon: new FormValidation.plugins.Icon({
                    valid: 'fa fa-check',
                    invalid: 'fa fa-times',
                    validating: 'fa fa-refresh',
                }),
            },
            fields: {
                number: {
                    validators: {
                        notEmpty: {},
                        digits: {},
                        stringLength: {
                            min: 8,
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    field: 'number',
                                    number: fv.form.querySelector('[name="number"]').value,
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de factura ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                payment_type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un tipo de pago'
                        },
                    }
                },
                provider: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un proveedor'
                        },
                    }
                },
                date_joined: {
                    validators: {
                        notEmpty: {
                            message: 'La fecha es obligatoria'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La fecha no es válida'
                        }
                    }
                },
                end_credit: {
                    validators: {
                        notEmpty: {
                            message: 'La fecha es obligatoria'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La fecha no es válida'
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
            if (purchase.detail.products.length === 0) {
                return message_error('Debe tener al menos un item en el detalle');
            }
            var params = new FormData(fv.form);
            params.append('end_credit', input_end_credit.val());
            params.append('products', JSON.stringify(purchase.detail.products));
            var args = {
                'params': params,
                'form': fv.form,
            };
            submit_with_formdata(args);
        });
});

$(function () {
    input_date_joined = $('input[name="date_joined"]');
    input_end_credit = $('input[name="end_credit"]');
    container_credit = $(input_end_credit).parent().parent();
    input_search_product = $('input[name="search_product"]');
    select_provider = $('select[name="provider"]');
    select_payment_type = $('select[name="payment_type"]');

    $('.select2').select2({
        theme: 'bootstrap4',
        language: 'es',
    });

    // Products

    input_search_product.autocomplete({
        source: function (request, response) {
            $.ajax({
                url: pathname,
                data: {
                    'action': 'search_product',
                    'term': request.term,
                    'product_id': JSON.stringify(purchase.getProductId()),
                },
                dataType: "json",
                type: "POST",
                headers: {
                    'X-CSRFToken': csrftoken
                },
                beforeSend: function () {

                },
                success: function (data) {
                    response(data);
                }
            });
        },
        min_length: 3,
        delay: 300,
        select: function (event, ui) {
            event.preventDefault();
            $(this).blur();
            ui.item.quantity = 1;
            purchase.addProduct(ui.item);
            $(this).val('').focus();
        }
    });

    $('.btnClearProducts').on('click', function () {
        input_search_product.val('').focus();
    });

    $('#tblProducts tbody')
        .off()
        .on('change', 'input[name="quantity"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            purchase.detail.products[tr.row].quantity = parseInt($(this).val());
            purchase.totalCalculator();
            $('td:last', tblProducts.row(tr.row).node()).html(purchase.detail.products[tr.row].subtotal.toFixed(2) + ' €');
        })
        .on('change', 'input[name="price"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            purchase.detail.products[tr.row].price = parseFloat($(this).val());
            purchase.totalCalculator();
            $('td:last', tblProducts.row(tr.row).node()).html(purchase.detail.products[tr.row].subtotal.toFixed(2) + ' €');
        })
        .on('click', 'a[rel="remove"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            purchase.detail.products.splice(tr.row, 1);
            tblProducts.row(tr.row).remove().draw();
            purchase.totalCalculator();
            $('.tooltip').remove();
        });

    $('.btnSearchProducts').on('click', function () {
        tblSearchProducts = $('#tblSearchProducts').DataTable({
            autoWidth: false,
            destroy: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: {
                    'action': 'search_product',
                    'term': input_search_product.val(),
                    'product_id': JSON.stringify(purchase.getProductId()),
                },
                dataSrc: ""
            },
            columns: [
                {data: "code"},
                {data: "short_name"},
                {data: "price"},
                {data: "pvp"},
                {data: "stock"},
                {data: "id"},
            ],
            columnDefs: [
                {
                    targets: [-3, -4],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data.toFixed(4) + ' €';
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (row.stock > 0) {
                            return '<span class="badge bg-success rounded-pill">' + data + '</span>'
                        }
                        return '<span class="badge bg-warning rounded-pill">' + data + '</span>'
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '<a rel="add" class="btn btn-success btn-sm"><i class="fas fa-plus"></i></a>'
                    }
                }
            ],
            rowCallback: function (row, data, index) {
                if (data.stock === 0) {
                    $(row).addClass('low-stock');
                }
            },
            initComplete: function (settings, json) {
                $(this).wrap('<div class="dataTables_scroll"><div/>');
            }
        });
        var searchModal = new bootstrap.Modal(document.getElementById('myModalSearchProducts'));
        searchModal.show();
    });

    $('#myModalSearchProducts').on('shown.bs.modal', function () {
        purchase.listProducts();
    });

    $('#tblSearchProducts tbody')
        .off()
        .on('click', 'a[rel="add"]', function () {
            var row = tblSearchProducts.row($(this).parents('tr')).data();
            row.quantity = 1;
            purchase.addProduct(row);
            tblSearchProducts.row($(this).parents('tr')).remove().draw();
        });

    $('.btnRemoveAllProducts').on('click', function () {
        if (purchase.detail.products.length === 0) return false;
        dialog_action({
            'content': '¿Estas seguro de eliminar todos los items de tu detalle?',
            'success': function () {
                purchase.detail.products = [];
                purchase.listProducts();
            },
            'cancel': function () {

            }
        });
    });

    // Search Provider

    select_provider.select2({
        theme: "bootstrap4",
        language: 'es',
        allowClear: true,
        width: null,
        ajax: {
            delay: 250,
            type: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            url: pathname,
            data: function (params) {
                return {
                    term: params.term,
                    action: 'search_provider'
                };
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
        },
        placeholder: 'Ingrese un nombre o ruc de proveedor',
        minimumInputLength: 1,
    })
        .on('select2:select', function (e) {
            fv.revalidateField('provider');
        })
        .on('select2:clear', function (e) {
            fv.revalidateField('provider');
        });

    $('.btnAddProvider').on('click', function () {
        var url = $(this).data('url');
        var popupWindow = open_centered_popup(url, 600, 900);
        var checkInterval = setInterval(function () {
            if (popupWindow.closed) {
                clearInterval(checkInterval);
                handle_dynamic_local_storage('provider', select_provider, fv);
            }
        }, 500);
    });

    // Form

    $('input[name="number"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    select_payment_type
        .on('change.select2', function () {
            fv.revalidateField('payment_type');
            var id = $(this).val();
            var start_date = input_date_joined.val();
            input_end_credit.datetimepicker('minDate', start_date);
            input_end_credit.datetimepicker('date', start_date);
            $(container_credit).hide();
            if (id === 'credito') {
                $(container_credit).show();
            }
        });

    input_date_joined.datetimepicker({
        format: 'YYYY-MM-DD',
        useCurrent: false,
        locale: 'es',
        orientation: 'bottom',
        keepOpen: false
    });

    input_date_joined.on('change.datetimepicker', function (e) {
        fv.revalidateField('date_joined');
        input_end_credit.datetimepicker('minDate', e.date);
        input_end_credit.datetimepicker('date', e.date);
    });

    input_end_credit.datetimepicker({
        useCurrent: false,
        format: 'YYYY-MM-DD',
        locale: 'es',
        keepOpen: false,
        minDate: new moment().format("YYYY-MM-DD")
    });

    input_end_credit.datetimepicker('date', input_end_credit.val());

    input_end_credit.on('change.datetimepicker', function (e) {
        fv.revalidateField('end_credit');
    });

    $(container_credit).hide();

    $('i[data-field="provider"]').hide();
    $('i[data-field="input_search_product"]').hide();
});
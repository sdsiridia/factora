var fv;
var select_customer;
var input_search_product, input_date_joined;
var tblProducts, tblSearchProducts;

var quotation = {
    detail: {
        tax: 0.00,
        subtotal_without_tax: 0.00,
        subtotal_with_tax: 0.00,
        total_discount: 0.00,
        subtotal: 0.00,
        total_tax: 0.00,
        total_amount: 0.00,
        products: []
    },
    addProduct: function (item) {
        var index = this.detail.products.findIndex(value => value.code === item.code);
        if (index === -1) {
            this.detail.products.push(item);
        } else {
            var product = this.detail.products[index];
            product.quantity += 1;
        }
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
            // ordering: false,
            lengthChange: false,
            searching: false,
            paginate: false,
            columns: [
                {data: "id"},
                {data: "code"},
                {data: "name"},
                {data: "stock"},
                {data: "quantity"},
                {data: "current_price"},
                {data: "total_discount"},
                {data: "total_amount"},
            ],
            columnDefs: [
                {
                    targets: [-5],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (row.is_inventoried) {
                            if (row.stock > 0) {
                                return '<span class="badge badge-success badge-pill">' + row.stock + '</span>';
                            }
                            return '<span class="badge badge-danger badge-pill">' + row.stock + '</span>';
                        }
                        return '<span class="badge badge-secondary badge-pill">Sin stock</span>';
                    }
                },
                {
                    targets: [-4],
                    class: 'text-center',
                    width: '20%',
                    render: function (data, type, row) {
                        return '<input type="text" class="form-control" autocomplete="off" name="quantity" value="' + row.quantity + '">';
                    }
                },
                {
                    targets: [-3],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '<input type="text" class="form-control" autocomplete="off" name="current_price" value="' + row.current_price + '">';
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    width: '20%',
                    render: function (data, type, row) {
                        return '<input type="text" class="form-control" autocomplete="off" name="discount" value="' + row.discount + '">';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '$' + data.toFixed(2);
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
                        max: 1000000
                    })
                    .on('keypress', function (e) {
                        return validate_text_box({'event': e, 'type': 'numbers'});
                    });

                tr.find('input[name="current_price"]')
                    .TouchSpin({
                        min: 0.0000,
                        max: 1000000,
                        step: 0.0001,
                        decimals: 4,
                        boostat: 5,
                        maxboostedstep: 10
                    })
                    .on('keypress', function (e) {
                        return validate_text_box({'event': e, 'type': 'decimals'});
                    });

                tr.find('input[name="discount"]')
                    .TouchSpin({
                        min: 0.00,
                        max: 100,
                        step: 0.01,
                        decimals: 2,
                        boostat: 5,
                        maxboostedstep: 10,
                        postfix: "0.00"
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
            value.tax = parseFloat(tax);
            value.price_with_tax = value.current_price + (value.current_price * value.tax);
            value.subtotal = value.current_price * value.quantity;
            value.total_discount = value.subtotal * parseFloat((value.discount / 100));
            value.total_tax = (value.subtotal - value.total_discount) * value.tax;
            value.total_amount = value.subtotal - value.total_discount;
        });

        this.detail.subtotal_without_tax = this.detail.products.filter(value => !value.has_tax).reduce((a, b) => a + (b.total_amount || 0), 0);
        this.detail.subtotal_with_tax = this.detail.products.filter(value => value.has_tax).reduce((a, b) => a + (b.total_amount || 0), 0);
        this.detail.total_discount = this.detail.products.reduce((a, b) => a + (b.total_discount || 0), 0);
        this.detail.subtotal = parseFloat(this.detail.subtotal_without_tax) + parseFloat(this.detail.subtotal_with_tax);
        this.detail.total_tax = parseFloat(this.detail.products.filter(value => value.has_tax).reduce((a, b) => a + (b.total_tax || 0), 0).toFixed(3));
        this.detail.total_amount = (Math.round(this.detail.subtotal * 100) / 100) + (Math.round(this.detail.total_tax * 100) / 100);

        $('input[name="subtotal_without_tax"]').val(this.detail.subtotal_without_tax.toFixed(2));
        $('input[name="subtotal_with_tax"]').val(this.detail.subtotal_with_tax.toFixed(2));
        $('input[name="tax"]').val(this.detail.tax.toFixed(2));
        $('input[name="total_tax"]').val(this.detail.total_tax.toFixed(2));
        $('input[name="total_discount"]').val(this.detail.total_discount.toFixed(2));
        $('input[name="total_amount"]').val(this.detail.total_amount.toFixed(2));
    }
};

document.addEventListener('DOMContentLoaded', function (e) {
    fv = FormValidation.formValidation(document.getElementById('frmForm'), {
            locale: 'es_ES',
            localization: FormValidation.locales.es_ES,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // excluded: new FormValidation.plugins.Excluded(),
                icon: new FormValidation.plugins.Icon({
                    valid: 'fa fa-check',
                    invalid: 'fa fa-times',
                    validating: 'fa fa-refresh',
                }),
            },
            fields: {
                customer: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un cliente'
                        }
                    }
                },
                date_joined: {
                    validators: {
                        notEmpty: {
                            enabled: false,
                            message: 'La fecha es obligatoria'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La fecha no es válida'
                        }
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
            if (quotation.detail.products.length === 0) {
                return message_error('Debe tener al menos un item en el detalle de la venta');
            }
            var href_url = $(fv.form).attr('data-url');
            var params = new FormData(fv.form);
            params.append('products', JSON.stringify(quotation.detail.products));
            var args = {
                'params': params,
                'success': function (request) {
                    dialog_action({
                        'content': '¿Desea Imprimir la proforma?',
                        'success': function () {
                            window.open(request.print_url, '_blank');
                            location.href = href_url;
                        },
                        'cancel': function () {
                            location.href = href_url;
                        }
                    });
                }
            };
            submit_with_formdata(args);
        });
});

$(function () {
    select_customer = $('select[name="customer"]');
    input_search_product = $('input[name="search"]');
    input_date_joined = $('input[name="date_joined"]');

    $('.select2').select2({
        theme: 'bootstrap4',
        language: 'es',
    });

    // Customer

    select_customer.select2({
        theme: 'bootstrap4',
        language: 'es',
        allowClear: true,
        width: '100%',
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
                    action: 'search_customer'
                };
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
        },
        placeholder: 'Ingrese un nombre o DNI (ej: 12345678A) o NIE (ej: X1234567B)',
        minimumInputLength: 1,
    })
        .on('select2:select', function (e) {
            fv.revalidateField('customer');
        })
        .on('select2:clear', function (e) {
            fv.revalidateField('customer');
        });

    $('.btnAddCustomer').on('click', function () {
        var url = $(this).data('url');
        var popupWindow = open_centered_popup(url, 600, 900);
        var checkInterval = setInterval(function () {
            if (popupWindow.closed) {
                clearInterval(checkInterval);
                handle_dynamic_local_storage('customer', select_customer, fv);
            }
        }, 500);
    });

    // quotation

    input_date_joined.datetimepicker({
        useCurrent: false,
        format: 'YYYY-MM-DD',
        locale: 'es',
        keepOpen: false,
    });

    input_date_joined.on('change.datetimepicker', function (e) {
        fv.revalidateField('date_joined');
    });

    $('i[data-field="customer"]').hide();
    $('i[data-field="input_search_product"]').hide();

    // Product

    input_search_product.autocomplete({
        source: function (request, response) {
            $.ajax({
                url: pathname,
                data: {
                    'action': 'search_product',
                    'term': request.term,
                    'product_id': JSON.stringify(quotation.getProductId()),
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
            quotation.addProduct(ui.item);
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
            quotation.detail.products[tr.row].quantity = parseInt($(this).val());
            quotation.totalCalculator();
            $('td:last', tblProducts.row(tr.row).node()).html('$' + quotation.detail.products[tr.row].total_amount.toFixed(2));
        })
        .on('change', 'input[name="current_price"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            quotation.detail.products[tr.row].current_price = parseFloat($(this).val());
            quotation.totalCalculator();
            $('td:last', tblProducts.row(tr.row).node()).html('$' + quotation.detail.products[tr.row].total_amount.toFixed(2));
        })
        .on('change', 'input[name="discount"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            quotation.detail.products[tr.row].discount = parseFloat($(this).val());
            quotation.totalCalculator();
            var parent = $(this).closest('.bootstrap-touchspin');
            parent.find('.bootstrap-touchspin-postfix').children().html(quotation.detail.products[tr.row].total_discount.toFixed(2));
            $('td:last', tblProducts.row(tr.row).node()).html('$' + quotation.detail.products[tr.row].total_amount.toFixed(2));
        })
        .on('click', 'a[rel="remove"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            quotation.detail.products.splice(tr.row, 1);
            tblProducts.row(tr.row).remove().draw();
            quotation.totalCalculator();
        });

    $('.btnSearchProducts').on('click', function () {
        tblSearchProducts = $('#tblSearchProducts').DataTable({
            responsive: true,
            autoWidth: false,
            destroy: true,
            deferRender: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: {
                    'action': 'search_product',
                    'term': input_search_product.val(),
                    'product_id': JSON.stringify(quotation.getProductId()),
                },
                dataSrc: ""
            },
            columns: [
                {data: "code"},
                {data: "short_name"},
                {data: "pvp"},
                {data: "price_promotion"},
                {data: "stock"},
                {data: "id"},
            ],
            columnDefs: [
                {
                    targets: [-3, -4],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (row.is_inventoried) {
                            if (row.stock > 0) {
                                return '<span class="badge badge-success badge-pill">' + row.stock + '</span>';
                            }
                            return '<span class="badge badge-danger badge-pill">' + row.stock + '</span>';
                        }
                        return '<span class="badge badge-secondary badge-pill">Sin stock</span>';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<a rel="add" class="btn btn-success btn-xs"><i class="fas fa-plus"></i></a>';
                    }
                }
            ],
            initComplete: function (settings, json) {
                $(this).wrap('<div class="dataTables_scroll"><div/>');
            }
        });
        $('#myModalSearchProducts').modal('show');
    });

    $('#tblSearchProducts tbody').on('click', 'a[rel="add"]', function () {
        var tr = $(this).closest('tr');
        var row = tblSearchProducts.row(tr).data();
        row.quantity = 1;
        quotation.addProduct(row);
        tblSearchProducts.row(tr).remove().draw();
    });

    $('.btnRemoveAllProducts').on('click', function () {
        if (quotation.detail.products.length === 0) return false;
        dialog_action({
            'content': '¿Estas seguro de eliminar todos los items de tu detalle?',
            'success': function () {
                quotation.detail.products = [];
                quotation.listProducts();
            },
            'cancel': function () {

            }
        });
    });

    // Barcode

    $(document).on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            execute_ajax_request({
                'params': {
                    'action': 'search_product_code',
                    'code': input_search_product.val()
                },
                'success': function (request) {
                    input_search_product.autocomplete('close');
                    if (!$.isEmptyObject(request)) {
                        request.quantity = 1;
                        quotation.addProduct(request);
                        input_search_product.val('').focus();
                    } else {
                        message_error('El producto no fue encontrado');
                    }
                }
            });
        }
    });
});
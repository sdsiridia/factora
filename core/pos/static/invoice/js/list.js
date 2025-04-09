var input_date_range;
var tblInvoice;

var invoice = {
    list: function (args = {}) {
        var params = {'action': 'search'};
        if ($.isEmptyObject(args)) {
            params['start_date'] = input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD');
            params['end_date'] = input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD');
        } else {
            params = Object.assign({}, params, args);
        }
        tblInvoice = $('#data').DataTable({
            autoWidth: false,
            destroy: true,
            deferRender: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: params,
                dataSrc: ""
            },
            order: [[0, "desc"]],
            columns: [
                {data: "id"},
                {data: "number"},
                {data: "date_joined"},
                {data: "customer.user.names"},
                {data: "payment_type"},
                {data: "status"},
                {data: "subtotal"},
                {data: "total_tax"},
                {data: "total_discount"},
                {data: "total_amount"},
                {data: "id"},
            ],
            columnDefs: [
                {
                    targets: [0],
                    class: 'text-center',
                    orderable: false,
                },
                {
                    targets: [1, 2, 3, 4, 5],
                    class: 'text-center'
                },
                {
                    targets: [-2, -3, -4, -5],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data.toFixed(2) + ' €';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<div class="btn-group" role="group">';
                        buttons += '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-list"></i> Opciones</button>';
                        buttons += '<ul class="dropdown-menu dropdown-menu-end">';
                        buttons += '<li><a class="dropdown-item" rel="detail"><i class="fas fa-folder-open"></i> Detalle de productos</a></li>';
                        buttons += '<li><a class="dropdown-item" href="' + pathname + 'print/' + row.id + '/" target="_blank"><i class="fas fa-print"></i> Imprimir</a></li>';
                        buttons += '<li><a class="dropdown-item" rel="send_receipt_by_email"><i class="fas fa-envelope"></i> Enviar comprobantes por email</a></li>';
                        buttons += '<li><a class="dropdown-item" rel="create_credit_note"><i class="fas fa-minus-circle"></i> Crear devolución</a></li>';
                        buttons += '</ul>';
                        buttons += '</div>';
                        return buttons;
                    }
                }
            ],
            initComplete: function (settings, json) {
                // Inicializar los dropdowns después de que la tabla se haya cargado
                var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
                dropdownElementList.map(function (dropdownToggleEl) {
                    return new bootstrap.Dropdown(dropdownToggleEl);
                });
            }
        });
    }
};

$(function () {
    input_date_range = $('input[name="date_range"]');

    $('#data tbody')
        .off()
        .on('click', 'a[rel="detail"]', function () {
            $('.tooltip').remove();
            var row = tblInvoice.row($(this).closest('tr')).data();
            $('#tblProducts').DataTable({
                autoWidth: false,
                destroy: true,
                ajax: {
                    url: pathname,
                    type: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    data: {
                        'action': 'search_detail_products',
                        'id': row.id
                    },
                    dataSrc: ""
                },
                columns: [
                    {data: "product.code"},
                    {data: "product.name"},
                    {data: "price"},
                    {data: "quantity"},
                    {data: "total_discount"},
                    {data: "total_amount"},
                ],
                columnDefs: [
                    {
                        targets: [-4],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return data.toFixed(4) + ' €';
                        }
                    },
                    {
                        targets: [-3],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return data;
                        }
                    },
                    {
                        targets: [-1, -2],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return data.toFixed(2) + ' €';
                        }
                    },
                ],
                initComplete: function (settings, json) {
                    $(this).wrap('<div class="dataTables_scroll"><div/>');
                }
            });
            var myModal = new bootstrap.Modal(document.getElementById('myModalDetail'));
            myModal.show();
        })
        .on('click', 'a[rel="send_receipt_by_email"]', function () {
            $('.tooltip').remove();
            var row = tblInvoice.row($(this).closest('tr')).data();
            var params = new FormData();
            params.append('action', 'send_receipt_by_email');
            params.append('id', row.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de enviar los comprobantes por email?',
                'success': function (request) {
                    alert_sweetalert({
                        'message': 'Se han enviado los comprobantes por email',
                        'timer': 2000,
                        'callback': function () {
                            tblInvoice.ajax.reload();
                        }
                    })
                }
            };
            submit_with_formdata(args);
        })
        .on('click', 'a[rel="create_credit_note"]', function () {
            $('.tooltip').remove();
            var row = tblInvoice.row($(this).closest('tr')).data();
            var params = new FormData();
            params.append('action', 'create_credit_note');
            params.append('id', row.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de crear una nota de crédito?',
                'success': function (request) {
                    alert_sweetalert({
                        'message': 'Se ha creado la nota de crédito correctamente',
                        'timer': 2000,
                        'callback': function () {
                            tblInvoice.ajax.reload();
                        }
                    })
                }
            };
            submit_with_formdata(args);
        });

    input_date_range
        .daterangepicker({
                language: 'auto',
                startDate: new Date(),
                locale: {
                    format: 'YYYY-MM-DD',
                },
                autoApply: true,
            }
        )
        .on('change.daterangepicker apply.daterangepicker', function (ev, picker) {
            invoice.list();
        });

    $('.drp-buttons').hide();

    invoice.list();

    $('.btnSearchAll').on('click', function () {
        invoice.list({'start_date': '', 'end_date': ''});
    });
}); 
var tblAccountsPayableDetail, tblAccountsReceivable;
var input_date_range;
var account_receivable = {
    list: function (args = {}) {
        var params = {'action': 'search'};
        if ($.isEmptyObject(args)) {
            params['start_date'] = input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD');
            params['end_date'] = input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD');
        } else {
            params = Object.assign({}, params, args);
        }
        tblAccountsReceivable = $('#data').DataTable({
            autoWidth: false,
            destroy: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: params,
                dataSrc: ""
            },
            columns: [
                {data: "invoice.receipt_number"},
                {data: "invoice.customer.user.names"},
                {data: "date_joined"},
                {data: "end_date"},
                {data: "debt"},
                {data: "balance"},
                {data: "active"},
                {data: "id"},
            ],
            columnDefs: [
                {
                    targets: [-5, -6],
                    class: 'text-center',
                },
                {
                    targets: [2, 3],
                    orderable: false,
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            var date = new Date(data);
                            return date.getDate().toString().padStart(2, '0') + '/' + 
                                   (date.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                                   date.getFullYear().toString().substr(-2);
                        }
                        return data;
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<span class="badge badge-danger badge-pill">Adeuda</span>';
                        }
                        return '<span class="badge badge-success badge-pill">Pagado</span>';
                    }
                },
                {
                    targets: [-1],
                    orderable: false,
                    class: 'text-center',
                    render: function (data, type, row) {
                        var buttons = '<div class="btn-group" role="group">';
                        buttons += '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-list"></i> Opciones</button>';
                        buttons += '<ul class="dropdown-menu dropdown-menu-end">';
                        buttons += '<li><a class="dropdown-item" rel="payments"><i class="fas fa-dollar-sign"></i> Pagos</a></li>';
                        buttons += '<li><a class="dropdown-item" href="' + pathname + 'delete/' + row.id + '/"><i class="fas fa-trash"></i> Eliminar</a></li>';
                        buttons += '</ul>';
                        buttons += '</div>';
                        return buttons;
                    }
                },
            ],
            initComplete: function (settings, json) {
                $('[data-toggle="tooltip"]').tooltip();
                $(this).wrap('<div class="dataTables_scroll"><div/>');
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
            account_receivable.list();
        });

    $('.drp-buttons').hide();

    account_receivable.list();

    $('.btnSearchAll').on('click', function () {
        account_receivable.list({'start_date': '', 'end_date': ''});
    });

    $('#data tbody')
        .off()
        .on('click', 'a[rel="payments"]', function () {
            $('.tooltip').remove();
            var row = tblAccountsReceivable.row($(this).closest('tr')).data();
            
            // Limpiar cualquier instancia previa del modal
            if (window.currentModal) {
                window.currentModal.dispose();
            }
            
            tblAccountsPayableDetail = $('#tblPayments').DataTable({
                autoWidth: false,
                destroy: true,
                searching: false,
                ajax: {
                    url: pathname,
                    type: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    data: function (d) {
                        d.action = 'search_payments';
                        d.id = row.id;
                    },
                    dataSrc: ""
                },
                columns: [
                    {data: "index"},
                    {data: "date_joined"},
                    {data: "amount"},
                    {data: "description"},
                    {data: "amount"},
                ],
                columnDefs: [
                    {
                        targets: [-3],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return '$' + data.toFixed(2);
                        }
                    },
                    {
                        targets: [-1],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return '<a rel="delete" class="btn btn-danger btn-xs btn-flat"><i class="fas fa-times"></i></a>';
                        }
                    }
                ],
                rowCallback: function (row, data, index) {

                },
                initComplete: function (settings, json) {
                    $(this).wrap('<div class="dataTables_scroll"><div/>');
                    // Mostrar el modal después de que la tabla se haya inicializado
                    var modalElement = document.getElementById('myModalPayments');
                    window.currentModal = new bootstrap.Modal(modalElement);
                    window.currentModal.show();
                }
            });
        });

    $('#tblPayments tbody')
        .off()
        .on('click', 'a[rel="delete"]', function () {
            $('.tooltip').remove();
            var row = tblAccountsPayableDetail.row($(this).closest('tr')).data();
            var params = new FormData();
            params.append('id', row.id);
            params.append('action', 'delete_payment');
            var args = {
                'params': params,
                'content': '¿Estas seguro de eliminar el registro?',
                'success': function (request) {
                    tblAccountsPayableDetail.ajax.reload();
                }
            };
            submit_with_formdata(args);
        });

    document.getElementById('myModalPayments').addEventListener('hidden.bs.modal', function () {
        tblAccountsReceivable.ajax.reload();
        // Limpiar la instancia del modal cuando se cierre
        if (window.currentModal) {
            window.currentModal.dispose();
            window.currentModal = null;
        }
    });
});

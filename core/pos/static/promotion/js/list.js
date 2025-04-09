var tblPromotion;
var input_date_range;
var promotion = {
    list: function (args = {}) {
        var params = {'action': 'search'};
        if ($.isEmptyObject(args)) {
            params['start_date'] = input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD');
            params['end_date'] = input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD');
        } else {
            params = Object.assign({}, params, args);
        }
        tblPromotion = $('#data').DataTable({
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
            columns: [
                {data: "id"},
                {data: "start_date"},
                {data: "end_date"},
                {data: "active"},
                {data: "id"},
            ],
            columnDefs: [
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<span class="badge badge-success badge-pill">Activo</span>';
                        }
                        return '<span class="badge badge-danger badge-pill">Inactivo</span>';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    render: function (data, type, row) {
                        var buttons = '<a class="btn btn-success btn-xs btn-flat" rel="details" data-toggle="tooltip" title="Detalle" ><i class="fas fa-folder-open"></i></a> ';
                        buttons += '<a href="' + pathname + 'update/' + row.id + '/" data-toggle="tooltip" title="Editar" class="btn btn-warning btn-xs btn-flat"><i class="fas fa-edit"></i></a> ';
                        buttons += '<a href="' + pathname + 'delete/' + row.id + '/" data-toggle="tooltip" title="Eliminar" class="btn btn-danger btn-xs btn-flat"><i class="fas fa-trash"></i></a>';
                        return buttons;
                    }
                },
            ],
            rowCallback: function (row, data, index) {

            },
            initComplete: function (settings, json) {
                $('[data-toggle="tooltip"]').tooltip();
                $(this).wrap('<div class="dataTables_scroll"><div/>');
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
            promotion.list();
        });

    $('.drp-buttons').hide();

    promotion.list();

    $('.btnSearchAll').on('click', function () {
        promotion.list({'start_date': '', 'end_date': ''});
    });

    $('#data tbody')
        .off()
        .on('click', 'a[rel="details"]', function () {
            $('.tooltip').remove();
            var tr = tblPromotion.cell($(this).closest('td, li')).index(),
                row = tblPromotion.row(tr.row).data();
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
                    {data: "product.full_name"},
                    {data: "current_price"},
                    {data: "discount"},
                    {data: "total_discount"},
                    {data: "final_price"},
                ],
                columnDefs: [
                    {
                        targets: [-3],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return data.toFixed(2) + '%';
                        }
                    },
                    {
                        targets: [-1, -2, -4],
                        class: 'text-center',
                        render: function (data, type, row) {
                            return '$' + data.toFixed(4);
                        }
                    }
                ],
                initComplete: function (settings, json) {
                    $(this).wrap('<div class="dataTables_scroll"><div/>');
                }
            });
            $('#myModalDetail').modal('show');
        });
});
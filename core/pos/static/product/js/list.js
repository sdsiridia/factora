var tblProducts;
var product = {
    list: function () {
        tblProducts = $('#data').DataTable({
            autoWidth: false,
            destroy: true,
            deferRender: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: function (d) {
                    d.action = 'list';
                    return d;
                },
                dataSrc: ""
            },
            columns: [
                {
                    data: null,
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<input type="checkbox" class="product-checkbox" value="' + row.id + '">';
                    }
                },
                {data: "id"},
                {data: "name"},
                {data: "code"},
                {data: "category.name"},
                {
                    data: "is_inventoried",
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<span class="badge bg-success">Si</span>';
                        }
                        return '<span class="badge bg-danger">No</span>';
                    }
                },
                {
                    data: "image",
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<img src="' + data + '" class="img-fluid d-block mx-auto" style="width: 50px; height: 50px;">';
                        }
                        return '<img src="{% static "img/none.png" %}" class="img-fluid d-block mx-auto" style="width: 50px; height: 50px;">';
                    }
                },
                {
                    data: "barcode",
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<img src="' + data + '" class="img-fluid d-block mx-auto" style="width: 60px; height: 30px;">';
                        }
                        return '<img src="{% static "img/none.png" %}" class="img-fluid d-block mx-auto" style="width: 60px; height: 30px;">';
                    }
                },
                {
                    data: "price",
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data.toFixed(4) + ' €';
                    }
                },
                {
                    data: "pvp",
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data.toFixed(4) + ' €';
                    }
                },
                {
                    data: "price_promotion",
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data.toFixed(4) + ' €';
                    }
                },
                {
                    data: "stock",
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data > 0) {
                            return '<span class="badge bg-success">' + data + '</span>';
                        }
                        return '<span class="badge bg-danger">' + data + '</span>';
                    }
                },
                {
                    data: null,
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<a rel="edit" class="btn btn-warning btn-xs btn-flat"><i class="bi bi-pencil-square"></i></a> ';
                        buttons += '<a rel="delete" class="btn btn-danger btn-xs btn-flat"><i class="bi bi-trash"></i></a>';
                        return buttons;
                    }
                }
            ],
            order: [[1, 'asc']]
        });
    }
};

$(function () {
    product.list();

    $('#data').addClass('table-sm');

    // Checkbox para seleccionar todos
    $('#data thead').on('change', 'input[type="checkbox"]', function() {
        var checked = $(this).prop('checked');
        $('#data tbody input[type="checkbox"]').prop('checked', checked);
    });

    // Botón de borrado masivo
    $('.btnDeleteSelected').on('click', function() {
        var selectedIds = [];
        $('#data tbody input[type="checkbox"]:checked').each(function() {
            selectedIds.push($(this).val());
        });

        if (selectedIds.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Debe seleccionar al menos un producto para eliminar',
                icon: 'error'
            });
            return;
        }

        dialog_action({
            'content': '¿Estás seguro de eliminar los productos seleccionados?',
            'success': function () {
                var params = new FormData();
                params.append('action', 'delete_multiple');
                params.append('ids', JSON.stringify(selectedIds));
                var args = {
                    'params': params,
                    'success': function (request) {
                        if (request.success) {
                            Swal.fire({
                                title: 'Éxito',
                                text: request.success,
                                icon: 'success'
                            });
                        }
                        if (request.error) {
                            Swal.fire({
                                title: 'Error',
                                text: request.error,
                                icon: 'error'
                            });
                        }
                        location.reload();
                    }
                };
                submit_with_formdata(args);
            },
            'cancel': function () {
            }
        });
    });

    $('#data tbody')
        .off()
        .on('click', 'a[rel="image"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            var data = tblProducts.row(tr.row).data();
            load_image({'url': data.image});
        })
        .on('click', 'a[rel="barcode"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            var data = tblProducts.row(tr.row).data();
            load_image({'url': data.barcode});
        });

    $('#data tbody')
        .off()
        .on('click', 'a[rel="edit"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            var row = tblProducts.row(tr.row).data();
            location.href = '/pos/product/update/' + row.id + '/';
        })
        .on('click', 'a[rel="delete"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            var row = tblProducts.row(tr.row).data();
            dialog_action({
                'content': '¿Estás seguro de eliminar el producto?',
                'success': function () {
                    var params = new FormData();
                    params.append('action', 'delete_multiple');
                    params.append('ids', JSON.stringify([row.id]));
                    var args = {
                        'params': params,
                        'success': function (request) {
                            if (request.success) {
                                Swal.fire({
                                    title: 'Éxito',
                                    text: request.success,
                                    icon: 'success'
                                });
                            }
                            if (request.error) {
                                Swal.fire({
                                    title: 'Error',
                                    text: request.error,
                                    icon: 'error'
                                });
                            }
                            location.reload();
                        }
                    };
                    submit_with_formdata(args);
                },
                'cancel': function () {
                }
            });
        });
});
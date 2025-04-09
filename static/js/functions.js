function alert_sweetalert(args) {
    if (!args.hasOwnProperty('type')) {
        args.type = 'success';
    }
    if (!args.hasOwnProperty('title')) {
        args.title = 'Notificación';
    }
    if (args.hasOwnProperty('message')) {
        args.html = '';
    } else {
        args.message = '';
    }
    if (!args.hasOwnProperty('timer')) {
        args.timer = null;
    }
    Swal.fire({
        icon: args.type,
        title: args.title,
        text: args.message,
        html: args.html,
        grow: true,
        showCloseButton: true,
        allowOutsideClick: true,
        timer: args.timer
    }).then((result) => {
        args.callback();
    });
}

function message_error(message) {
    var content = message;
    if (typeof (message) === "object") {
        content = JSON.stringify(message);
    }
    alert_sweetalert({
        'type': 'error',
        'message': content,
        'timer': null,
        'callback': function () {

        }
    });
}

function submit_with_formdata(args) {
    if (!args.hasOwnProperty('type')) {
        args.type = '';
    }
    if (!args.hasOwnProperty('theme')) {
        args.theme = 'modern';
    }
    if (!args.hasOwnProperty('title')) {
        args.title = 'Notificación';
    }
    if (!args.hasOwnProperty('icon')) {
        args.icon = 'bi bi-info-circle';
    }
    if (!args.hasOwnProperty('content')) {
        args.content = '¿Estas seguro de realizar la siguiente acción?';
    }
    if (!args.hasOwnProperty('pathname')) {
        args.pathname = pathname;
    }

    $.confirm({
        type: args.type,
        theme: args.theme,
        title: args.title,
        icon: args.icon,
        content: args.content,
        columnClass: 'small',
        typeAnimated: true,
        cancelButtonClass: 'btn-primary',
        draggable: true,
        dragWindowBorder: false,
        buttons: {
            info: {
                text: "Si",
                btnClass: 'btn-primary',
                action: function () {
                    $.ajax({
                        url: args.pathname,
                        data: args.params,
                        type: 'POST',
                        dataType: 'json',
                        headers: {
                            'X-CSRFToken': csrftoken
                        },
                        processData: false,
                        contentType: false,
                        beforeSend: function () {
                            loading({'text': '...'});
                        },
                        success: function (request) {
                            if (!request.hasOwnProperty('error')) {
                                if (request.hasOwnProperty('resp') && request.resp === false) {
                                    return message_error(request.msg);
                                }
                                if (args.hasOwnProperty('success')) {
                                    args.success(request);
                                } else {
                                    location.href = $(args.form).attr('data-url');
                                }
                                return false;
                            }
                            return message_error(request.error);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            message_error(errorThrown + ' ' + textStatus);
                        },
                        complete: function () {
                            $.LoadingOverlay("hide");
                        }
                    });
                }
            },
            danger: {
                text: "No",
                btnClass: 'btn-red',
                action: function () {

                }
            },
        }
    });
}

function loading(args) {
    if (!args.hasOwnProperty('fontawesome')) {
        args.fontawesome = 'bi bi-arrow-clockwise';
    }
    if (!args.hasOwnProperty('text')) {
        args.fontawesome = 'Cargando...';
    }
    $.LoadingOverlay("show", {
        image: "",
        fontawesome: args.fontawesome,
        custom: $("<div>", {
            "class": "loading",
            "text": args.text
        })
    });
}

function dialog_action(args) {
    if (!args.hasOwnProperty('type')) {
        args.type = '';
    }
    if (!args.hasOwnProperty('theme')) {
        args.theme = 'modern';
    }
    if (!args.hasOwnProperty('title')) {
        args.title = 'Confirmación';
    }
    if (!args.hasOwnProperty('icon')) {
        args.icon = 'bi bi-info-circle';
    }
    if (!args.hasOwnProperty('content')) {
        args.content = '¿Estas seguro de realizar la siguiente acción?';
    }
    $.confirm({
        type: args.type,
        theme: args.theme,
        title: args.title,
        icon: args.icon,
        content: args.content,
        columnClass: 'small',
        typeAnimated: true,
        cancelButtonClass: "btn-primary",
        draggable: true,
        dragWindowBorder: false,
        buttons: {
            info: {
                text: "Si",
                btnClass: 'btn-primary',
                action: function () {
                    args.success();
                }
            },
            danger: {
                text: "No",
                btnClass: 'btn-red',
                action: function () {
                    args.cancel();
                }
            },
        }
    });
}

function validate_text_box(args) {
    if (!args.hasOwnProperty('type')) {
        args.type = 'numbers';
    }
    var key = args.event.keyCode || args.event.which;
    var numbers = (key > 47 && key < 58) || key === 8;
    var numbers_spaceless = key > 47 && key < 58;
    var letters = !((key !== 32) && (key < 65) || (key > 90) && (key < 97) || (key > 122 && key !== 241 && key !== 209 && key !== 225 && key !== 233 && key !== 237 && key !== 243 && key !== 250 && key !== 193 && key !== 201 && key !== 205 && key !== 211 && key !== 218)) || key === 8;
    var letters_spaceless = !((key < 65) || (key > 90) && (key < 97) || (key > 122 && key !== 241 && key !== 209 && key !== 225 && key !== 233 && key !== 237 && key !== 243 && key !== 250 && key !== 193 && key !== 201 && key !== 205 && key !== 211 && key !== 218)) || key === 8;
    var decimals = ((key > 47 && key < 58) || key === 8 || key === 46);

    switch (args.type) {
        case "numbers":
            return numbers;
        case "numbers_spaceless":
            return numbers_spaceless;
        case "letters":
            return letters;
        case "numbers_letters":
            return numbers || letters;
        case "letters_spaceless":
            return letters_spaceless;
        case "decimals":
            return decimals;
    }
    return true;
}

function load_image(args) {
    if (!args.hasOwnProperty('alt')) {
        args.alt = '';
    }
    Swal.fire({
        imageUrl: args.url,
        imageWidth: '100%',
        imageHeight: 250,
        imageAlt: args.alt,
        animation: false
    })
}

function convert_to_formdata(data) {
    if (!(data instanceof FormData)) {
        let params = new FormData();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                params.append(key, data[key]);
            }
        }
        return params;
    }
    return data;
}

function execute_ajax_request(args) {
    if (!args.hasOwnProperty('pathname')) {
        args.pathname = pathname;
    }
    if (!args.hasOwnProperty('loading')) {
        args.loading = true;
    }

    let ajaxConfig = {
        url: args.pathname,
        data: convert_to_formdata(args.params),
        type: 'POST',
        processData: false,
        contentType: false,
        headers: {
            'X-CSRFToken': csrftoken
        },
        beforeSend: function () {
            if (args.loading) {
                loading({'text': '...'});
            }
            if (args.hasOwnProperty('beforeSend')) {
                args.beforeSend();
            }
        },
        success: function (data, status, request) {
            if (!data.hasOwnProperty('error')) {
                args.success(data, status, request);
                return false;
            }
            message_error(data.error);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            message_error(errorThrown + ' ' + textStatus);
        },
        complete: function () {
            $.LoadingOverlay("hide");
            if (args.hasOwnProperty('complete')) {
                args.complete();
            }
        }
    };

    if (!args.hasOwnProperty('dataType')) {
        args.dataType = 'json';
    }

    switch (args.dataType) {
        case "json":
            ajaxConfig.dataType = 'json';
            break;
        case "blob":
            ajaxConfig.xhrFields = {
                responseType: 'blob'
            };
            break;
    }

    $.ajax(ajaxConfig);
}

function validate_dni_ruc(numero) {
    if (numero === '9999999999999') {
        return true;
    }
    var suma = 0;
    var residuo = 0;
    var pri = false;
    var pub = false;
    var nat = false;
    var numeroProvincias = 22;
    var modulo = 11;

    /* Verifico que el campo no contenga letras */
    var ok = 1;
    for (i = 0; i < numero.length && ok == 1; i++) {
        var n = parseInt(numero.charAt(i));
        if (isNaN(n)) ok = 0;
    }
    if (ok == 0) {
        return false;
    }

    if (numero.length < 10) {
        console.log('El número ingresado no es válido');
        return false;
    }

    /* Los primeros dos digitos corresponden al codigo de la provincia */
    provincia = numero.substr(0, 2);
    if (provincia < 1 || provincia > numeroProvincias) {
        console.log('El código de la provincia (dos primeros dígitos) es inválido');
        return false;
    }

    /* Aqui almacenamos los digitos de la cedula en variables. */
    d1 = numero.substr(0, 1);
    d2 = numero.substr(1, 1);
    d3 = numero.substr(2, 1);
    d4 = numero.substr(3, 1);
    d5 = numero.substr(4, 1);
    d6 = numero.substr(5, 1);
    d7 = numero.substr(6, 1);
    d8 = numero.substr(7, 1);
    d9 = numero.substr(8, 1);
    d10 = numero.substr(9, 1);

    /* El tercer digito es: */
    /* 9 para sociedades privadas y extranjeros   */
    /* 6 para sociedades publicas */
    /* menor que 6 (0,1,2,3,4,5) para personas naturales */

    if (d3 == 7 || d3 == 8) {
        return false;
    }

    /* Solo para personas naturales (modulo 10) */
    if (d3 < 6) {
        nat = true;
        p1 = d1 * 2;
        if (p1 >= 10) p1 -= 9;
        p2 = d2 * 1;
        if (p2 >= 10) p2 -= 9;
        p3 = d3 * 2;
        if (p3 >= 10) p3 -= 9;
        p4 = d4 * 1;
        if (p4 >= 10) p4 -= 9;
        p5 = d5 * 2;
        if (p5 >= 10) p5 -= 9;
        p6 = d6 * 1;
        if (p6 >= 10) p6 -= 9;
        p7 = d7 * 2;
        if (p7 >= 10) p7 -= 9;
        p8 = d8 * 1;
        if (p8 >= 10) p8 -= 9;
        p9 = d9 * 2;
        if (p9 >= 10) p9 -= 9;
        modulo = 10;
    }

        /* Solo para sociedades publicas (modulo 11) */
    /* Aqui el digito verficador esta en la posicion 9, en las otras 2 en la pos. 10 */
    else if (d3 == 6) {
        pub = true;
        p1 = d1 * 3;
        p2 = d2 * 2;
        p3 = d3 * 7;
        p4 = d4 * 6;
        p5 = d5 * 5;
        p6 = d6 * 4;
        p7 = d7 * 3;
        p8 = d8 * 2;
        p9 = 0;
    }

    /* Solo para entidades privadas (modulo 11) */
    else if (d3 == 9) {
        pri = true;
        p1 = d1 * 4;
        p2 = d2 * 3;
        p3 = d3 * 2;
        p4 = d4 * 7;
        p5 = d5 * 6;
        p6 = d6 * 5;
        p7 = d7 * 4;
        p8 = d8 * 3;
        p9 = d9 * 2;
    }

    suma = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
    residuo = suma % modulo;

    /* Si residuo=0, dig.ver.=0, caso contrario 10 - residuo*/
    digitoVerificador = residuo == 0 ? 0 : modulo - residuo;

    /* ahora comparamos el elemento de la posicion 10 con el dig. ver.*/
    if (pub == true) {
        if (digitoVerificador != d9) {
            console.log('El ruc de la empresa del sector público es incorrecto.');
            return false;
        }
        /* El ruc de las empresas del sector publico terminan con 0001*/
        if (numero.substr(9, 4) != '0001') {
            console.log('El ruc de la empresa del sector público debe terminar con 0001');
            return false;
        }
    } else if (pri == true) {
        if (digitoVerificador != d10) {
            console.log('El ruc de la empresa del sector privado es incorrecto.');
            return false;
        }
        if (numero.substr(10, 3) != '001') {
            console.log('El ruc de la empresa del sector privado debe terminar con 001');
            return false;
        }
    } else if (nat == true) {
        if (digitoVerificador != d10) {
            console.log('El número de cédula de la persona natural es incorrecto.');
            return false;
        }
        if (numero.length > 10 && numero.substr(10, 3) != '001') {
            console.log('El ruc de la persona natural debe terminar con 001');
            return false;
        }
    }
    return true;
}

function open_centered_popup(url, width = 600, height = 400) {
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;

    var left = (screenWidth - width) / 2;
    var top = (screenHeight - height) / 2;

    return window.open(
        url,
        'popup',
        `width=${width},height=${height},top=${top},left=${left}`
    );
}

function handle_dynamic_local_storage(key, field, form) {
    var data = JSON.parse(localStorage.getItem(key));
    if (!$.isEmptyObject(data)) {
        field.select2('trigger', 'select', {data: data});
        if (form) {
            form.revalidateField(key);
        }
        localStorage.removeItem(key);
    }
}
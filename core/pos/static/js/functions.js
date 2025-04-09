// Namespace global para funciones de la aplicación
window.App = window.App || {};

// Función para inicializar modales de Bootstrap 5
window.App.initializeBootstrap5Modal = function(modalId, options = {}) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.error(`Modal con ID ${modalId} no encontrado`);
        return null;
    }

    // Configurar opciones por defecto
    const defaultOptions = {
        backdrop: 'static',
        keyboard: false,
        focus: true
    };

    // Combinar opciones por defecto con las proporcionadas
    const modalOptions = { ...defaultOptions, ...options };

    // Actualizar botones de cierre antiguos a Bootstrap 5
    modalElement.querySelectorAll('.close').forEach(button => {
        button.classList.remove('close');
        button.classList.add('btn-close');
        button.setAttribute('data-bs-dismiss', 'modal');
        button.removeAttribute('data-dismiss');
        button.innerHTML = '';
    });

    // Inicializar el modal con Bootstrap 5
    const modalInstance = new bootstrap.Modal(modalElement, modalOptions);

    // Agregar manejadores de eventos para cerrar el modal
    modalElement.querySelectorAll('.btn-close, .btnClose, [data-bs-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', () => {
            modalInstance.hide();
        });
    });

    return modalInstance;
};

// Alias para compatibilidad
window.initializeBootstrap5Modal = window.App.initializeBootstrap5Modal; 
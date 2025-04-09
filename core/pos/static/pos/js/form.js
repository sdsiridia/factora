var vents = {
    items: {
        details: [],
        subtotal: 0,
        iva: 0,
        total: 0
    },

    calculateTotals: function() {
        let subtotal = 0;
        let items = this.items.details;
        
        items.forEach(function(item) {
            subtotal += parseFloat(item.subtotal);
        });

        let tax = subtotal * 0.21; // 21% IVA
        let total = subtotal + tax;

        // Formatear y mostrar los totales
        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('iva').textContent = this.formatCurrency(tax);
        document.getElementById('total').textContent = this.formatCurrency(total);

        // Actualizar los valores en el objeto items
        this.items.subtotal = subtotal;
        this.items.iva = tax;
        this.items.total = total;
    },

    formatCurrency: function(value) {
        return parseFloat(value).toFixed(2) + ' €';
    },

    addItem: function(item) {
        this.items.details.push(item);
        this.calculateTotals();
    },

    removeItem: function(index) {
        this.items.details.splice(index, 1);
        this.calculateTotals();
    },

    save: function() {
        // Aquí iría la lógica para guardar la venta
        if (this.items.details.length === 0) {
            Swal.fire('Error', 'Agregue al menos un producto a la venta', 'error');
            return;
        }
        // ... resto del código para guardar
    }
}; 
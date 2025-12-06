class Checkout {
    constructor() {
        this.orderKey = 'checkout_items';
        this.ordersKey = 'user_orders';
        this.subtotalKey = 'checkout_subtotal';
        this.discountKey = 'checkout_discount';
        this.promoCodeKey = 'checkout_promo_code';
        this.totalKey = 'checkout_total';
        this.init();
    }

    init() {
        this.loadCheckoutItems();
        this.setupEventListeners();
        this.updateDeliveryCost();
    }

    // Загрузить товары для оформления (обновленный метод)
    loadCheckoutItems() {
        const checkoutItems = JSON.parse(localStorage.getItem(this.orderKey) || '[]');
        const itemsContainer = document.getElementById('checkout-items');
        
        if (checkoutItems.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-checkout">
                    <p>Нет товаров для оформления</p>
                    <a href="cart.html" class="continue-shopping">Вернуться в корзину</a>
                </div>
            `;
            return;
        }

        let itemsHTML = '';
        let subtotal = 0;

        checkoutItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            itemsHTML += `
                <div class="checkout-item">
                    <div class="checkout-item-image">
                        <img src="${item.image}" alt="${item.name}" 
                             onerror="this.src='https://via.placeholder.com/80x80/cccccc/666666?text=No+Image'">
                    </div>
                    <div class="checkout-item-info">
                        <h4 class="checkout-item-title">${item.name}</h4>
                        <p class="checkout-item-brand">${item.brand}</p>
                        <p class="checkout-item-description">${item.description}</p>
                        <div class="checkout-item-details">
                            <span class="checkout-item-quantity">Количество: ${item.quantity}</span>
                            <span class="checkout-item-sizes">Размер: ${item.size || 'Не указан'}</span>
                        </div>
                        <div class="checkout-item-price">
                            ${itemTotal.toLocaleString()} ₽
                        </div>
                    </div>
                </div>
            `;
        });

        itemsContainer.innerHTML = itemsHTML;
        this.updateOrderSummary();
    }

    // Обновить итоговую информацию (обновленный метод)
    updateOrderSummary() {
        const subtotal = parseFloat(localStorage.getItem(this.subtotalKey)) || this.calculateSubtotal();
        const discount = parseFloat(localStorage.getItem(this.discountKey)) || 0;
        const deliveryCost = this.getDeliveryCost();
        const total = subtotal - discount + deliveryCost;

        // Обновляем отображение
        document.getElementById('checkout-subtotal').textContent = `${subtotal.toLocaleString()} ₽`;
        
        // Добавляем отображение скидки
        const discountElement = document.getElementById('checkout-discount');
        if (!discountElement) {
            this.createDiscountElement();
        }
        
        if (discount > 0) {
            document.getElementById('checkout-discount').textContent = `-${discount.toLocaleString()} ₽`;
            document.getElementById('checkout-discount').style.display = 'block';
            document.getElementById('checkout-discount-row').style.display = 'flex';
            
            // Показываем информацию о промокоде
            const promoCode = localStorage.getItem(this.promoCodeKey);
            if (promoCode) {
                this.showPromoCodeInfo(promoCode, discount);
            }
        } else {
            document.getElementById('checkout-discount').style.display = 'none';
            document.getElementById('checkout-discount-row').style.display = 'none';
        }
        
        document.getElementById('checkout-delivery').textContent = deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toLocaleString()} ₽`;
        document.getElementById('checkout-total').textContent = `${total.toLocaleString()} ₽`;
    }

    // Создать элемент для отображения скидки (новый метод)
    createDiscountElement() {
        const summaryDetails = document.querySelector('.summary-details');
        if (!summaryDetails) return;

        // Добавляем строку скидки перед доставкой
        const deliveryRow = document.querySelector('.summary-row:nth-child(2)');
        if (deliveryRow) {
            const discountRow = document.createElement('div');
            discountRow.className = 'summary-row';
            discountRow.id = 'checkout-discount-row';
            discountRow.style.display = 'none';
            discountRow.innerHTML = `
                <span>Скидка по промокоду:</span>
                <span id="checkout-discount" style="color: #28a745; font-weight: bold;">0 ₽</span>
            `;
            deliveryRow.parentNode.insertBefore(discountRow, deliveryRow);
        }
    }

    // Показать информацию о промокоде (новый метод)
    showPromoCodeInfo(promoCode, discount) {
        let promoInfo = document.getElementById('promo-code-info');
        if (!promoInfo) {
            promoInfo = document.createElement('div');
            promoInfo.id = 'promo-code-info';
            promoInfo.className = 'promo-code-info';
            const summarySection = document.querySelector('.order-summary');
            if (summarySection) {
                // Вставляем перед кнопкой оформления заказа
                const checkoutBtn = summarySection.querySelector('.checkout-btn');
                if (checkoutBtn) {
                    summarySection.insertBefore(promoInfo, checkoutBtn);
                }
            }
        }
        
        promoInfo.style.display = 'block';
        promoInfo.innerHTML = `
            ✅ Промокод "${promoCode}" применен<br>
            <small>Скидка: ${discount.toLocaleString()} ₽</small>
        `;
    }

    // Получить стоимость доставки
    getDeliveryCost() {
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
        if (selectedDelivery && selectedDelivery.value === 'express') {
            return 500;
        }
        return 0;
    }

    // Обновить стоимость доставки при изменении способа
    updateDeliveryCost() {
        const subtotal = this.calculateSubtotal();
        this.updateOrderSummary(subtotal);
    }

    // Рассчитать сумму товаров
    calculateSubtotal() {
        const checkoutItems = JSON.parse(localStorage.getItem(this.orderKey) || '[]');
        return checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Настроить обработчики событий
    setupEventListeners() {
        const form = document.getElementById('checkout-form');
        form.addEventListener('submit', (e) => this.handleOrderSubmit(e));

        // Слушаем изменения способа доставки
        document.querySelectorAll('input[name="delivery"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateDeliveryCost());
        });

        // Маска для телефона
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Обработка отправки формы
    async handleOrderSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        const order = await this.createOrder(formData);

        if (order) {
            this.showSuccessMessage(order);
            this.clearCheckoutItems();
            
            // Перенаправление на страницу подтверждения
            setTimeout(() => {
                window.location.href = 'order-success.html?order=' + order.orderNumber;
            }, 2000);
        }
    }

    // Валидация формы
    validateForm() {
        const requiredFields = document.querySelectorAll('#checkout-form [required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            this.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        }

        return isValid;
    }

    // Получить данные формы (обновленный метод)
    getFormData() {
        const form = document.getElementById('checkout-form');
        const formData = new FormData(form);
        
        const subtotal = parseFloat(localStorage.getItem(this.subtotalKey)) || this.calculateSubtotal();
        const discount = parseFloat(localStorage.getItem(this.discountKey)) || 0;
        const deliveryCost = this.getDeliveryCost();
        const total = subtotal - discount + deliveryCost;
        const promoCode = localStorage.getItem(this.promoCodeKey) || '';
        
        return {
            contact: {
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            shipping: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                address: formData.get('address'),
                city: formData.get('city'),
                postalCode: formData.get('postalCode')
            },
            delivery: document.querySelector('input[name="delivery"]:checked').value,
            payment: document.querySelector('input[name="payment"]:checked').value,
            comment: formData.get('comment'),
            items: JSON.parse(localStorage.getItem(this.orderKey) || '[]'),
            subtotal: subtotal,
            discount: discount,
            promoCode: promoCode,
            deliveryCost: deliveryCost,
            total: total,
            orderDate: new Date().toISOString(),
            orderNumber: this.generateOrderNumber()
        };
    }

    // Создать заказ и сохранить его в профиль
    async createOrder(orderData) {
        try {
            // Сохраняем заказ в localStorage
            const existingOrders = JSON.parse(localStorage.getItem(this.ordersKey) || '[]');
            existingOrders.push(orderData);
            localStorage.setItem(this.ordersKey, JSON.stringify(existingOrders));

            // Сохраняем заказ в профиль пользователя
            this.saveOrderToUserProfile(orderData);

            return orderData;
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            this.showNotification('Ошибка оформления заказа', 'error');
            return null;
        }
    }

    // Добавляем метод для сохранения заказа в профиль пользователя
    saveOrderToUserProfile(orderData) {
        try {
            console.log('Сохраняем заказ в профиль пользователя...');
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                console.log('Пользователь не авторизован, заказ сохранен только локально');
                return;
            }

            console.log('Текущий пользователь:', currentUser);

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            
            console.log('Индекс пользователя в базе:', userIndex);

            if (userIndex !== -1) {
                // Инициализируем массив заказов, если его нет
                if (!users[userIndex].orders) {
                    users[userIndex].orders = [];
                    console.log('Инициализирован массив заказов');
                }

                // Форматируем заказ для профиля
                const profileOrder = {
                    id: orderData.orderNumber,
                    date: new Date(orderData.orderDate).toLocaleDateString('ru-RU'),
                    total: orderData.total,
                    status: 'Обрабатывается',
                    items: orderData.items,
                    delivery: orderData.delivery,
                    payment: orderData.payment,
                    shipping: orderData.shipping
                };

                console.log('Добавляем заказ:', profileOrder);

                // Добавляем заказ в начало массива
                users[userIndex].orders.unshift(profileOrder);
                
                // Сохраняем обновленных пользователей
                localStorage.setItem('users', JSON.stringify(users));
                
                // Обновляем текущего пользователя
                currentUser.orders = users[userIndex].orders;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                console.log('Заказ успешно сохранен в профиль пользователя');
                console.log('Теперь заказов у пользователя:', currentUser.orders.length);
            } else {
                console.log('Пользователь не найден в базе users');
            }
        } catch (error) {
            console.error('Ошибка сохранения заказа в профиль:', error);
        }
    }

    // Показать сообщение об успехе
    showSuccessMessage(order) {
        this.showNotification(`
            Заказ №${order.orderNumber} успешно оформлен!<br>
            Сумма: ${order.total.toLocaleString()} ₽<br>
            Ожидайте подтверждения на email
        `, 'success');
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `checkout-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Очистить данные оформления (обновленный метод)
    clearCheckoutItems() {
        localStorage.removeItem(this.orderKey);
        localStorage.removeItem(this.subtotalKey);
        localStorage.removeItem(this.discountKey);
        localStorage.removeItem(this.promoCodeKey);
        localStorage.removeItem(this.totalKey);
    }

    // Сгенерировать номер заказа
    generateOrderNumber() {
        return 'SS' + Date.now() + Math.floor(Math.random() * 1000);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем стили для страницы оформления
    injectCheckoutStyles();
    
    // Инициализируем оформление заказа
    window.checkout = new Checkout();
});

// Добавляем CSS стили для страницы оформления
function injectCheckoutStyles() {
    const styles = `
        <style>
            .checkout-form {
                margin-top: 20px;
            }

            .form-section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: white;
            }

            .form-section h3 {
                margin-bottom: 20px;
                color: #333;
                font-size: 18px;
                border-bottom: 2px solid #e44d26;
                padding-bottom: 10px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #333;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.3s;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #e44d26;
            }

            .form-group textarea {
                height: 80px;
                resize: vertical;
            }

            .delivery-options,
            .payment-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .delivery-option,
            .payment-option {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .delivery-option:hover,
            .payment-option:hover {
                border-color: #e44d26;
            }

            .delivery-option input,
            .payment-option input {
                margin-right: 15px;
            }

            .option-content {
                flex: 1;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .option-title {
                font-weight: 500;
            }

            .option-price {
                color: #e44d26;
                font-weight: bold;
            }

            .option-time {
                color: #666;
                font-size: 12px;
            }

            .option-icon {
                font-size: 20px;
            }

            .delivery-option input:checked,
            .payment-option input:checked {
                accent-color: #e44d26;
            }

            .checkout-item {
                display: flex;
                gap: 15px;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
            }

            .checkout-item-image img {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 6px;
            }

            .checkout-item-info {
                flex: 1;
            }

            .checkout-item-title {
                margin: 0 0 5px 0;
                font-size: 16px;
                color: #333;
                font-weight: 600;
            }

            .checkout-item-brand {
                margin: 0 0 5px 0;
                font-size: 14px;
                color: #666;
            }

            .checkout-item-description {
                margin: 0 0 10px 0;
                font-size: 13px;
                color: #777;
            }

            .checkout-item-details {
                display: flex;
                gap: 15px;
                font-size: 13px;
                color: #888;
                margin-bottom: 10px;
            }

            .checkout-item-price {
                font-size: 16px;
                font-weight: bold;
                color: #e44d26;
            }

            .empty-checkout {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }

            .summary-details {
                margin: 20px 0;
                padding: 20px 0;
                border-top: 1px solid #eee;
            }

            /* Стили для отображения скидки */
            #checkout-discount-row {
                transition: all 0.3s ease;
                background-color: #f8fff9;
                border-radius: 4px;
                padding: 8px 12px;
                margin: 5px 0;
                border: 1px solid #e8f5e8;
            }

            .promo-code-info {
                background: #d4edda;
                color: #155724;
                padding: 12px 15px;
                border-radius: 8px;
                margin-bottom: 15px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #c3e6cb;
            }

            .promo-code-info small {
                display: block;
                margin-top: 5px;
                font-size: 0.9em;
                opacity: 0.8;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 10px 0;
                transition: all 0.3s ease;
            }

            .summary-row.total {
                border-top: 2px solid #eee;
                font-weight: bold;
                font-size: 1.2rem;
                color: #e44d26;
                margin-top: 10px;
                padding-top: 15px;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}
// Загрузка данных заказа при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    injectSuccessStyles();
});

function loadOrderData() {
    // Получаем номер заказа из URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    if (!orderNumber) {
        showError('Номер заказа не найден');
        return;
    }

    // Ищем заказ в localStorage
    const orders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
        showError('Заказ не найден');
        return;
    }

    // Заполняем информацию о заказе
    displayOrderInfo(order);
}

function displayOrderInfo(order) {
    // Основная информация
    document.getElementById('order-number').textContent = order.orderNumber;
    document.getElementById('order-date').textContent = new Date(order.orderDate).toLocaleDateString('ru-RU');
    document.getElementById('order-total').textContent = order.total.toLocaleString() + ' ₽';
    document.getElementById('delivery-method').textContent = getDeliveryMethodText(order.delivery);
    document.getElementById('payment-method').textContent = getPaymentMethodText(order.payment);

    // Адрес доставки
    const shippingAddress = document.getElementById('shipping-address');
    shippingAddress.innerHTML = `
        <p><strong>${order.shipping.firstName} ${order.shipping.lastName}</strong></p>
        <p>${order.shipping.address}</p>
        <p>${order.shipping.city}, ${order.shipping.postalCode}</p>
        <p>📞 ${order.contact.phone}</p>
        <p>✉️ ${order.contact.email}</p>
    `;

    // Товары в заказе
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = order.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}" 
                     onerror="this.src='https://via.placeholder.com/80x80/cccccc/666666?text=No+Image'">
            </div>
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p class="item-brand">${item.brand}</p>
                <p class="item-description">${item.description}</p>
                <div class="item-details">
                    <span>Размеры: ${Array.isArray(item.sizes) ? item.sizes.join(', ') : 'Не указаны'}</span>
                    <span>Количество: ${item.quantity}</span>
                </div>
            </div>
            <div class="order-item-price">
                ${(item.price * item.quantity).toLocaleString()} ₽
            </div>
        </div>
    `).join('');
}

function getDeliveryMethodText(method) {
    const methods = {
        'courier': 'Курьерская доставка',
        'pickup': 'Самовывоз',
        'express': 'Экспресс доставка'
    };
    return methods[method] || method;
}

function getPaymentMethodText(method) {
    const methods = {
        'card': 'Банковская карта',
        'cash': 'Наличными при получении',
        'online': 'Онлайн-банкинг'
    };
    return methods[method] || method;
}

function showError(message) {
    const content = document.querySelector('.success-content');
    content.innerHTML = `
        <div class="error-icon">❌</div>
        <h1>Ошибка</h1>
        <p class="error-message">${message}</p>
        <div class="error-actions">
            <a href="cart.html" class="continue-shopping-btn">Вернуться в корзину</a>
            <a href="catalog.html" class="track-order-btn">Перейти в каталог</a>
        </div>
    `;
}

function injectSuccessStyles() {
    const styles = `
        <style>
            .order-success-container {
                max-width: 1000px;
                margin: 100px auto 50px;
                padding: 0 20px;
            }

            .success-content {
                background: white;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }

            .success-icon {
                font-size: 80px;
                margin-bottom: 20px;
            }

            .error-icon {
                font-size: 80px;
                margin-bottom: 20px;
                color: #dc3545;
            }

            .success-content h1 {
                color: #28a745;
                margin-bottom: 15px;
                font-size: 2.5rem;
            }

            .success-message {
                font-size: 1.2rem;
                color: #666;
                margin-bottom: 40px;
            }

            .error-message {
                font-size: 1.2rem;
                color: #dc3545;
                margin-bottom: 40px;
            }

            .order-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 40px;
                text-align: left;
            }

            .order-info, .shipping-info {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                border-left: 4px solid #e44d26;
            }

            .order-info h3, .shipping-info h3 {
                margin-bottom: 20px;
                color: #333;
                border-bottom: 2px solid #e44d26;
                padding-bottom: 10px;
            }

            .info-grid {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }

            .info-label {
                font-weight: 500;
                color: #666;
            }

            .info-value {
                font-weight: bold;
                color: #333;
            }

            .address-details p {
                margin: 8px 0;
                color: #555;
            }

            .order-items {
                margin-bottom: 40px;
                text-align: left;
            }

            .order-items h3 {
                margin-bottom: 20px;
                color: #333;
                border-bottom: 2px solid #e44d26;
                padding-bottom: 10px;
            }

            .order-item {
                display: flex;
                gap: 20px;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 15px;
                background: white;
            }

            .order-item-image img {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 6px;
            }

            .order-item-info {
                flex: 1;
            }

            .order-item-info h4 {
                margin: 0 0 5px 0;
                color: #333;
            }

            .item-brand {
                color: #666;
                margin: 0 0 5px 0;
                font-size: 14px;
            }

            .item-description {
                color: #777;
                margin: 0 0 10px 0;
                font-size: 13px;
            }

            .item-details {
                display: flex;
                gap: 20px;
                font-size: 13px;
                color: #888;
            }

            .order-item-price {
                font-size: 18px;
                font-weight: bold;
                color: #e44d26;
                min-width: 100px;
                text-align: right;
            }

            .next-steps {
                margin-bottom: 40px;
                text-align: left;
            }

            .next-steps h3 {
                margin-bottom: 20px;
                color: #333;
                border-bottom: 2px solid #e44d26;
                padding-bottom: 10px;
            }

            .steps-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .step-item {
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }

            .step-number {
                width: 40px;
                height: 40px;
                background: #e44d26;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }

            .step-content {
                flex: 1;
            }

            .step-content strong {
                display: block;
                margin-bottom: 5px;
                color: #333;
            }

            .step-content p {
                color: #666;
                margin: 0;
            }

            .success-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-bottom: 40px;
                flex-wrap: wrap;
            }

            .continue-shopping-btn,
            .track-order-btn,
            .print-order-btn {
                padding: 12px 25px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s;
                border: none;
                cursor: pointer;
            }

            .continue-shopping-btn {
                background: #6c757d;
                color: white;
            }

            .track-order-btn {
                background: #e44d26;
                color: white;
            }

            .print-order-btn {
                background: #28a745;
                color: white;
            }

            .continue-shopping-btn:hover {
                background: #5a6268;
            }

            .track-order-btn:hover {
                background: #d1401a;
            }

            .print-order-btn:hover {
                background: #218838;
            }

            .support-info {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                text-align: left;
            }

            .support-info h3 {
                margin-bottom: 15px;
                color: #333;
            }

            .support-info p {
                color: #666;
                margin-bottom: 20px;
            }

            .contact-options {
                display: flex;
                gap: 30px;
                flex-wrap: wrap;
            }

            .contact-option {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                color: #555;
            }

            .error-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
            }

            @media (max-width: 768px) {
                .order-details {
                    grid-template-columns: 1fr;
                }

                .success-actions {
                    flex-direction: column;
                    align-items: center;
                }

                .contact-options {
                    flex-direction: column;
                    gap: 15px;
                }

                .order-item {
                    flex-direction: column;
                    text-align: center;
                }

                .order-item-price {
                    text-align: center;
                }

                .item-details {
                    flex-direction: column;
                    gap: 5px;
                }
            }

            @media print {
                .success-actions,
                .support-info,
                .next-steps,
                footer {
                    display: none;
                }

                .success-content {
                    box-shadow: none;
                    padding: 20px;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}
// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (!StorageService.checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    loadUserData();
    setupTabs();
    setupEventListeners();
});

function loadUserData() {
    const user = StorageService.getCurrentUser();
    if (!user) return;

    //Заполняем форму профиля
    if (document.getElementById('profileName')) {
        document.getElementById('profileName').value = user.fullName || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
    }

    //Загружаем заказы
    loadOrders(user);

    // Загружаем адреса
    loadAddresses(user);
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Убираем активные классы
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Добавляем активные классы
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function setupEventListeners() {
    //Сохранение профиля
    if (document.getElementById('profileForm')) {
        document.getElementById('profileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile();
        });
    }

    // Выход из системы
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function() {
            StorageService.logout();
            window.location.href = 'login.html';
        });
    }

    // Добавление адреса
    if (document.getElementById('addressForm')) {
        document.getElementById('addressForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addAddress();
        });
    }
}

function saveProfile() {
    const user = StorageService.getCurrentUser();

    user.fullName = document.getElementById('profileName').value;
    user.phone = document.getElementById('profilePhone').value;

    StorageService.saveUser(user);
    alert('Данные сохранены!');
}

function loadOrders(user) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    console.log('Загружаем заказы для пользователя:', user);

    let orders = [];
    
    // Сначала проверяем заказы в текущем пользователе
    if (user.orders && user.orders.length > 0) {
        orders = user.orders;
        console.log('Найдены заказы в текущем пользователе:', orders.length);
    } 
    // Если нет, проверяем в базе users
    else {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userInDb = users.find(u => u.email === user.email);
        
        if (userInDb && userInDb.orders && userInDb.orders.length > 0) {
            orders = userInDb.orders;
            console.log('Найдены заказы в базе users:', orders.length);
            
            // Обновляем текущего пользователя
            user.orders = orders;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }
    
    // Если все еще нет заказов, проверяем локальные заказы
    if (orders.length === 0) {
        const localOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        console.log('Проверяем локальные заказы:', localOrders.length);
        
        if (localOrders.length > 0) {
            orders = localOrders.map(order => ({
                id: order.orderNumber,
                date: new Date(order.orderDate).toLocaleDateString('ru-RU'),
                total: order.total,
                status: 'Обрабатывается',
                items: order.items,
                delivery: order.delivery,
                payment: order.payment,
                shipping: order.shipping
            }));
            
            console.log('Конвертировали локальные заказы:', orders.length);
            
            // Сохраняем эти заказы в профиль пользователя
            saveOrdersToProfile(orders, user);
        }
    }

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <p>У вас пока нет заказов</p>
                <a href="catalog.html" class="continue-shopping-btn">Начать покупки</a>
            </div>
        `;
        return;
    }

    console.log('Отсортированные заказы (новые сверху):', orders);
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" onclick="showOrderDetails('${order.id}')">
            <div class="order-header">
                <div class="order-info">
                    <h4>Заказ #${order.id}</h4>
                    <span class="order-date">${order.date}</span>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            <div class="order-details">
                <div class="order-summary">
                    <span class="order-total">${order.total.toLocaleString()} ₽</span>
                    <span class="order-items">${order.items ? order.items.length : 0} товара</span>
                </div>
                <div class="order-shipping">
                    <span>Доставка: ${getDeliveryMethodText(order.delivery)}</span>
                    <span>Оплата: ${getPaymentMethodText(order.payment)}</span>
                </div>
            </div>
            <div class="order-actions">
                <button class="order-details-btn" onclick="event.stopPropagation(); showOrderDetails('${order.id}')">
                    Подробнее
                </button>
                ${order.status === 'Обрабатывается' ? `
                    <button class="order-cancel-btn" onclick="event.stopPropagation(); cancelOrder('${order.id}')">
                        Отменить
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Функция для сохранения заказов в профиль пользователя
function saveOrdersToProfile(orders, user) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === user.email);
        
        if (userIndex !== -1) {
            users[userIndex].orders = orders;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Обновляем текущего пользователя
            user.orders = orders;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            console.log('Заказы сохранены в профиль пользователя');
        }
    } catch (error) {
        console.error('Ошибка сохранения заказов в профиль:', error);
    }
}

// Вспомогательные функции для статусов
function getStatusClass(status) {
    const statusClasses = {
        'Обрабатывается': 'status-processing',
        'В пути': 'status-shipping',
        'Доставлен': 'status-delivered',
        'Отменен': 'status-cancelled'
    };
    return statusClasses[status] || 'status-processing';
}

function getStatusText(status) {
    const statusTexts = {
        'Обрабатывается': 'Обрабатывается',
        'В пути': 'В пути',
        'Доставлен': 'Доставлен',
        'Отменен': 'Отменен'
    };
    return statusTexts[status] || 'Обрабатывается';
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

// Функция для показа деталей заказа
function showOrderDetails(orderId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const user = users.find(u => u.email === currentUser.email);
    
    const order = user.orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.createElement('div');
    modal.className = 'order-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Детали заказа #${order.id}</h3>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="order-info-section">
                    <h4>Информация о заказе</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Дата заказа:</span>
                            <span>${order.date}</span>
                        </div>
                        <div class="info-item">
                            <span>Статус:</span>
                            <span class="status ${getStatusClass(order.status)}">${order.status}</span>
                        </div>
                        <div class="info-item">
                            <span>Сумма:</span>
                            <span>${order.total.toLocaleString()} ₽</span>
                        </div>
                        <div class="info-item">
                            <span>Способ доставки:</span>
                            <span>${getDeliveryMethodText(order.delivery)}</span>
                        </div>
                        <div class="info-item">
                            <span>Способ оплаты:</span>
                            <span>${getPaymentMethodText(order.payment)}</span>
                        </div>
                    </div>
                </div>

                <div class="order-items-section">
                    <h4>Товары в заказе</h4>
                    <div class="order-items-list">
                        ${order.items ? order.items.map(item => `
                            <div class="order-item-detail">
                                <img src="${item.image}" alt="${item.name}" 
                                     onerror="this.src='https://via.placeholder.com/60x60/cccccc/666666?text=No+Image'">
                                <div class="item-info">
                                    <h5>${item.name}</h5>
                                    <p class="item-brand">${item.brand}</p>
                                    <div class="item-details">
                                        <span>Размер: ${Array.isArray(item.sizes) ? item.sizes[0] : 'Не указан'}</span>
                                        <span>Количество: ${item.quantity}</span>
                                    </div>
                                </div>
                                <div class="item-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('') : 'Информация о товарах недоступна'}
                    </div>
                </div>

                ${order.shipping ? `
                <div class="shipping-info-section">
                    <h4>Адрес доставки</h4>
                    <div class="shipping-address">
                        <p><strong>${order.shipping.firstName} ${order.shipping.lastName}</strong></p>
                        <p>${order.shipping.address}</p>
                        <p>${order.shipping.city}, ${order.shipping.postalCode}</p>
                        <p>📞 ${order.shipping.phone || 'Не указан'}</p>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Закрыть</button>
                ${order.status === 'Обрабатывается' ? `
                    <button class="cancel-order-btn" onclick="cancelOrder('${order.id}'); this.parentElement.parentElement.parentElement.remove()">Отменить заказ</button>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    injectModalStyles();
}

// Функция для отмены заказа
function cancelOrder(orderId) {
    if (!confirm('Вы уверены, что хотите отменить этот заказ?')) {
        return;
    }

    try {
        console.log('Отменяем заказ:', orderId);
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        console.log('Текущий пользователь:', currentUser);
        console.log('Все пользователи:', users);

        if (!currentUser) {
            alert('Пользователь не авторизован');
            return;
        }

        // Ищем пользователя в базе
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        console.log('Индекс пользователя:', userIndex);

        if (userIndex === -1) {
            alert('Пользователь не найден в базе');
            return;
        }

        // Проверяем наличие заказов
        if (!users[userIndex].orders || users[userIndex].orders.length === 0) {
            alert('У пользователя нет заказов');
            return;
        }

        console.log('Заказы пользователя:', users[userIndex].orders);
        const orderIndex = users[userIndex].orders.findIndex(o => o.id === orderId);
        console.log('Индекс заказа:', orderIndex);

        if (orderIndex === -1) {
            alert('Заказ не найден');
            return;
        }

        // Обновляем статус заказа
        users[userIndex].orders[orderIndex].status = 'Отменен';
        localStorage.setItem('users', JSON.stringify(users));

        // Обновляем текущего пользователя
        currentUser.orders = users[userIndex].orders;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Перезагружаем список заказов
        loadOrders(currentUser);

    } catch (error) {
        console.error('Ошибка при отмене заказа:', error);
        alert('Произошла ошибка при отмене заказа');
    }
}

function loadAddresses(user) {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;

    if (!user.addresses || user.addresses.length === 0) {
        addressesList.innerHTML= '<p>У вас нет сохраненных адресов</p>';
        return;
    }
    
    addressesList.innerHTML = user.addresses.map(address => `
        <div class="address-item">
            <strong>${address.name}</strong>
            <p>${address.value}</p>
            <button onclick="deleteAddress('${address.name}')">Удалить</button>
        </div>
    `).join('');
 }

 function addAddress() {
    const name = document.getElementById('addressName').value;
    const value = document.getElementById('addressValue').value;

    if (!name || !value) {
        alert('Заполните все поля!');
        return;
    }

    const user = StorageService.getCurrentUser();
    if (!user.adresses) user.adresses = [];

    user.adresses.push({ name,value });
    StorageService.saveUser(user);

    document.getElementById('addressForm').reset();
    loadAddresses(user);
 }

 function deleteAddress(addressName) {
    const user = StorageService.getCurrentUser();
    user.addresses = user.addresses.filter(addr => addr.name !== addressName);
    StorageService.saveUser(user);
    loadAddresses(user);
 }
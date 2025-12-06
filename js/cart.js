class Cart {
    constructor() {
        this.storageKey = 'shopping_cart';
        this.products = []; // Кэш товаров
        this.selectedItemsKey = 'selected_cart_items';
        this.promoCodeKey = 'applied_promo_code';
        this.discountKey = 'applied_discount'; // Новый ключ для скидки
        this.init();
    }

    // Загрузить товар из products.json по ID
    async loadProductFromJSON(productId) {
        try {
            console.log('Ищем товар с ID:', productId);
            
            // Если товары уже загружены, ищем в кэше
            if (this.products.length > 0) {
                const product = this.products.find(p => p.id === productId);
                console.log('Найден в кэше:', product);
                if (product) return product;
            }

            // Загружаем товары из JSON файла
            console.log('Загружаем товары из JSON...');
            const response = await fetch('../json/products.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить товары');
            }

            const data = await response.json();
            this.products = data.products; // Сохраняем в кэш
            console.log('Загружено товаров:', this.products.length);

            const product = this.products.find(p => p.id === productId);
            console.log('Найден после загрузки:', product);
            
            if (!product) {
                throw new Error(`Товар с ID ${productId} не найден`);
            }
            
            return product;
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            return null;
        }
    }

    init() {
        // Инициализация при загрузке страницы
        this.updateCartCounter();
        if (this.isCartPage()) {
            this.displayCart();
        }
    }

    // Получить корзину из localStorage
    getCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            return [];
        }
    }

    // Получить выбранные товары из localStorage
    getSelectedItems() {
        try {
            const selectedData = localStorage.getItem(this.selectedItemsKey);
            return selectedData ? JSON.parse(selectedData) : {};
        } catch (error) {
            console.error('Ошибка загрузки выбранных товаров:', error);
            return {};
        }
    }

    // Получить примененный промокод
    getAppliedPromoCode() {
        try {
            return localStorage.getItem(this.promoCodeKey) || '';
        } catch (error) {
            console.error('Ошибка загрузки промокода:', error);
            return '';
        }
    }

    // Сохранить примененный промокод
    saveAppliedPromoCode(promoCode) {
        try {
            localStorage.setItem(this.promoCodeKey, promoCode);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения промокода:', error);
            return false;
        }
    }

    // Очистить примененный промокод
    clearAppliedPromoCode() {
        try {
            localStorage.removeItem(this.promoCodeKey);
            return true;
        } catch (error) {
            console.error('Ошибка очистки промокода:', error);
            return false;
        }
    }

    // Получить примененную скидку
    getAppliedDiscount() {
        try {
            const discount = localStorage.getItem(this.discountKey);
            return discount ? parseFloat(discount) : 0;
        } catch (error) {
            console.error('Ошибка загрузки скидки:', error);
            return 0;
        }
    }

    // Сохранить примененную скидку
    saveAppliedDiscount(discountAmount) {
        try {
            localStorage.setItem(this.discountKey, discountAmount.toString());
            return true;
        } catch (error) {
            console.error('Ошибка сохранения скидки:', error);
            return false;
        }
    }

    // Очистить примененную скидку
    clearAppliedDiscount() {
        try {
            localStorage.removeItem(this.discountKey);
            return true;
        } catch (error) {
            console.error('Ошибка очистки скидки:', error);
            return false;
        }
    }

    // Сохранить корзину в localStorage
    saveCart(cart) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(cart));
            this.updateCartCounter();
            return true;
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
            return false;
        }
    }

    // Сохранить выбранные товары в localStorage
    saveSelectedItems(selectedItems) {
        try {
            localStorage.setItem(this.selectedItemsKey, JSON.stringify(selectedItems));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения выбранных товаров:', error);
            return false;
        }
    }

    // Переключить выбор товара
    toggleItemSelection(uniqueId) {
        // Убедимся, что uniqueId - строка
        const idString = String(uniqueId);
        const selectedItems = this.getSelectedItems();
        selectedItems[idString] = !selectedItems[idString];
        this.saveSelectedItems(selectedItems);
        
        if (this.isCartPage()) {
            this.displayCart();
            this.updateSelectedSummary();
        }
        
        return selectedItems[idString];
    }

    // Выбрать все товары
    selectAllItems() {
        const cart = this.getCart();
        const selectedItems = {};
        cart.forEach(item => {
            selectedItems[item.uniqueId] = true;
        });
        this.saveSelectedItems(selectedItems);
        
        if (this.isCartPage()) {
            this.displayCart();
            this.updateSelectedSummary();
        }
    }

    // Снять выбор со всех товаров
    deselectAllItems() {
        this.saveSelectedItems({});
        
        if (this.isCartPage()) {
            this.displayCart();
            this.updateSelectedSummary();
        }
    }

    // Получить выбранные товары
    getSelectedCartItems() {
        const cart = this.getCart();
        const selectedItems = this.getSelectedItems();
        return cart.filter(item => selectedItems[item.uniqueId]);
    }

    // Получить общую сумму выбранных товаров
    getSelectedTotalPrice() {
        const selectedItems = this.getSelectedCartItems();
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Получить общее количество выбранных товаров
    getSelectedTotalItems() {
        const selectedItems = this.getSelectedCartItems();
        return selectedItems.reduce((total, item) => total + item.quantity, 0);
    }

    // Применить скидку к сумме
    applyDiscount(subtotal) {
        const promoCode = this.getAppliedPromoCode();
        if (promoCode === 'davidik') {
            return subtotal * 0.8; // 20% скидка
        }
        return subtotal;
    }

    // Получить размер скидки
    getDiscountAmount(subtotal) {
        const promoCode = this.getAppliedPromoCode();
        if (promoCode === 'davidik') {
            return subtotal * 0.2; // 20% скидка
        }
        return 0;
    }

    // Обновить информацию о выбранных товарах
    updateSelectedSummary() {
        const selectedCountElement = document.getElementById('selected-items-count');
        const selectedSubtotalElement = document.getElementById('selected-subtotal');
        const cartTotalElement = document.getElementById('cart-total');
        
        const subtotal = this.getSelectedTotalPrice();
        const discount = this.getDiscountAmount(subtotal);
        const total = this.applyDiscount(subtotal);
        
        if (selectedCountElement) {
            selectedCountElement.textContent = this.getSelectedTotalItems();
        }
        
        if (selectedSubtotalElement) {
            selectedSubtotalElement.textContent = subtotal.toLocaleString();
        }
        
        if (cartTotalElement) {
            if (discount > 0) {
                cartTotalElement.innerHTML = `
                    <span style="text-decoration: line-through; color: #999; margin-right: 10px;">${subtotal.toLocaleString()}</span>
                    <span style="color: #e44d26; font-weight: bold;">${total.toLocaleString()}</span>
                `;
            } else {
                cartTotalElement.textContent = total.toLocaleString();
            }
        }

        // Обновить отображение скидки
        this.updateDiscountDisplay(discount, subtotal);
    }

    // Обновить отображение информации о скидке (обновленный метод)
    updateDiscountDisplay(discount, subtotal) {
        let discountInfo = document.querySelector('.discount-info');
        const promoCode = this.getAppliedPromoCode();
        
        if (discount > 0 && promoCode) {
            if (!discountInfo) {
                discountInfo = document.createElement('div');
                discountInfo.className = 'discount-info';
                const promoSection = document.querySelector('.promo-code');
                if (promoSection) {
                    promoSection.appendChild(discountInfo);
                }
            }
            
             discountInfo.innerHTML = `
                    <button onclick="cart.removePromoCode()" style="background: none; border: none; color: #ba1b1bff; margin-left: 10px; cursor: pointer; font-weight: bold;">Отменить промокод</button>
            `;
        } else if (discountInfo) {
            discountInfo.remove();
        }
    }

    // Получить данные для оформления заказа (новый метод)
    getCheckoutData() {
        const selectedItems = this.getSelectedCartItems();
        const subtotal = this.getSelectedTotalPrice();
        const promoCode = this.getAppliedPromoCode();
        const discount = this.getAppliedDiscount();
        const total = subtotal - discount;

        return {
            items: selectedItems,
            subtotal: subtotal,
            discount: discount,
            promoCode: promoCode,
            total: total
        };
    }

    // Применить промокод (обновленный метод)
    applyPromoCode() {
        const promoInput = document.getElementById('promo-code-input');
        const promoCode = promoInput.value.trim();

        if (promoCode === '') {
            alert('Введите промокод');
            return;
        }

        // Проверка промокода
        if (promoCode === 'davidik') {
            const subtotal = this.getSelectedTotalPrice();
            const discountAmount = subtotal * 0.2; // 20% скидка
            
            this.saveAppliedPromoCode(promoCode);
            this.saveAppliedDiscount(discountAmount); // Сохраняем сумму скидки

            this.showNotification('Промокод "davidik" применен! Скидка 20% активирована.');
            this.updateSelectedSummary();
            
            // Очищаем поле ввода
            if (promoInput) {
                promoInput.value = '';
            }
        } else {
            alert('Неверный промокод. Попробуйте еще раз.');
            this.clearAppliedPromoCode();
            this.clearAppliedDiscount();
            this.updateSelectedSummary();
        }
    }

    // Удалить промокод (обновленный метод)
    removePromoCode() {
        this.clearAppliedPromoCode();
        this.clearAppliedDiscount();
        this.showNotification('Промокод удален');
        this.updateSelectedSummary();
    }

    // Добавить товар в корзину
    addItem(product, selectedSize = null) {
        console.log('=== addItem вызван ===');
        console.log('product:', product);
        console.log('selectedSize:', selectedSize);
        
        if (!product || !product.id) {
            console.error('Неверный товар:', product);
            this.showNotification('Ошибка добавления товара');
            return false;
        }

        // Создаем уникальный идентификатор с учетом размера
        const uniqueId = selectedSize ? `${product.id}-${selectedSize}` : product.id.toString();
        
        const cart = this.getCart();
        const existingItem = cart.find(item => item.uniqueId === uniqueId);

        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Увеличили количество:', existingItem.quantity);
        } else {
            cart.push({
                id: product.id, // оригинальный ID товара
                uniqueId: uniqueId, // уникальный ID с размером
                name: product.name,
                price: product.price,
                brand: product.brand,
                image: product.image,
                description: product.description,
                sizes: product.sizes,
                size: selectedSize, // сохраняем выбранный размер
                quantity: 1
            });
            console.log('Добавили новый товар с размером:', selectedSize);
            
            // Автоматически выбираем новый товар
            const selectedItems = this.getSelectedItems();
            selectedItems[uniqueId] = true;
            this.saveSelectedItems(selectedItems);
        }

        const success = this.saveCart(cart);
        
        if (success) {
            this.showNotification('Товар добавлен в корзину!');
            this.updateCartCounter();
            
            if (this.isCartPage()) {
                this.displayCart();
                this.updateSelectedSummary();
            }
        }
        return success;
    }

    // Удалить товар из корзины
    removeItem(uniqueId) {
        const idString = String(uniqueId);
        const cart = this.getCart();
        const newCart = cart.filter(item => item.uniqueId !== idString);
        const success = this.saveCart(newCart);
        
        // Удаляем из выбранных
        const selectedItems = this.getSelectedItems();
        delete selectedItems[idString];
        this.saveSelectedItems(selectedItems);
        
        if (success && this.isCartPage()) {
            this.displayCart();
            this.updateSelectedSummary();
        }
        
        return success;
    }

    // Изменить количество товара
    updateQuantity(uniqueId, newQuantity) {
        const idString = String(uniqueId);
        if (newQuantity < 1) {
            return this.removeItem(idString);
        }

        const cart = this.getCart();
        const item = cart.find(item => item.uniqueId === idString);
        
        if (item) {
            item.quantity = newQuantity;
            const success = this.saveCart(cart);
            
            if (success && this.isCartPage()) {
                this.displayCart();
                this.updateSelectedSummary();
            }
            
            return success;
        }
        
        return false;
    }

    // Очистить корзину
    clearCart() {
        const success = this.saveCart([]);
        this.saveSelectedItems({}); // Очищаем выбранные товары
        this.clearAppliedPromoCode(); // Очищаем промокод
        
        if (success && this.isCartPage()) {
            this.displayCart();
            this.updateSelectedSummary();
        }
        return success;
    }

    // Получить общую сумму
    getTotalPrice() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Получить общее количество товаров
    getTotalItems() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Обновить счетчик корзины
    updateCartCounter() {
        const counters = document.querySelectorAll('.cart-count, #cart-count, [data-cart-count]');
        const totalItems = this.getTotalItems();
        
        counters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    // Проверить, находимся ли на странице корзины
    isCartPage() {
        return window.location.pathname.includes('cart.html') || 
               document.getElementById('cart-items') !== null;
    }

    // Показать уведомление
    showNotification(message) {
        // Удаляем существующие уведомления
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;

        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    openProductPage(productId) {
        console.log('Пытаемся открыть product.html с ID:', productId);
        console.log('Текущий путь:', window.location.pathname);
        console.log('Новый URL:', `product.html?id=${productId}`);
    }

    // Отобразить корзину на странице
    displayCart() {
        console.log('Начинаем отображение корзины...');
        
        const cartItemsElement = document.getElementById('cart-items');
        const emptyCartElement = document.getElementById('empty-cart');
        const cartContentElement = document.getElementById('cart-content');

        if (!cartItemsElement) {
            console.error('Элемент cart-items не найден!');
            return;
        }

        const cart = this.getCart();
        const selectedItems = this.getSelectedItems();
        console.log('Товары в корзине для отображения:', cart);

        if (cart.length === 0) {
            console.log('Корзина пуста');
            if (emptyCartElement) {
                emptyCartElement.style.display = 'block';
                console.log('Показываем сообщение о пустой корзине');
            }
            if (cartContentElement) {
                cartContentElement.style.display = 'none';
            }
            return;
        }

        console.log('Корзина не пустая, отображаем товары');
        if (emptyCartElement) emptyCartElement.style.display = 'none';
        if (cartContentElement) cartContentElement.style.display = 'block';

        let itemsHTML = '';
        
        // Добавляем кнопки выбора всех товаров
        itemsHTML += `
            <div class="cart-selection-controls">
                <button class="select-all-btn" onclick="cart.selectAllItems()">Выбрать все</button>
                <button class="deselect-all-btn" onclick="cart.deselectAllItems()">Снять выделение</button>
            </div>
        `;
        
        // В блоке формирования HTML для товара:
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const isSelected = selectedItems[item.uniqueId] || false;
            
            itemsHTML += `
                <div class="cart-item ${isSelected ? 'selected' : ''}" data-id="${item.uniqueId}">
                    <div class="cart-item-selector">
                        <input type="checkbox" id="item-${item.uniqueId}" ${isSelected ? 'checked' : ''} 
                            onchange="cart.toggleItemSelection('${item.uniqueId}')">
                    </div>
                    <div class="cart-item-content" onclick="cart.openProductPage(${item.id})" style="cursor: pointer; display: flex; gap: 15px; flex: 1;">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" 
                                onerror="this.src='https://via.placeholder.com/100x100/cccccc/666666?text=No+Image'">
                        </div>
                        <div class="cart-item-info">
                            <h3 class="cart-item-title">${item.name}</h3>
                            <p class="cart-item-brand">${item.brand}</p>
                            <p class="cart-item-description">${item.description}</p>
                            <div class="cart-item-sizes">
                                <strong>Размер:</strong> ${item.size || 'Не указан'}
                            </div>
                            <div class="cart-item-price-single">
                                Цена: ${item.price ? item.price.toLocaleString() : '0'} ₽
                            </div>
                        </div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="event.stopPropagation(); cart.updateQuantity('${item.uniqueId}', ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="event.stopPropagation(); cart.updateQuantity('${item.uniqueId}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="cart-item-total">
                            Итого: <strong>${itemTotal.toLocaleString()} ₽</strong>
                        </div>
                        <button class="remove-btn" onclick="event.stopPropagation(); cart.removeItem('${item.uniqueId}')">
                            🗑️ Удалить
                        </button>
                    </div>
                </div>
            `;
        });

        console.log('HTML корзины:', itemsHTML);
        cartItemsElement.innerHTML = itemsHTML;

        this.updateSelectedSummary();
        this.updateCartCounter();
    }
}

// Дополнительные функции для корзины
function saveCartForLater() {
    alert('Корзина сохранена! Вы можете вернуться к ней позже.');
}

// Глобальная функция применения промокода
function applyPromoCode() {
    cart.applyPromoCode();
}

function proceedToCheckout() {
    const selectedItems = cart.getSelectedCartItems();
    if (selectedItems.length === 0) {
        alert('Выберите товары для оформления заказа.');
        return;
    }
    
    // Получаем полные данные для оформления
    const checkoutData = cart.getCheckoutData();
    
    // Сохраняем все данные для оформления заказа
    localStorage.setItem('checkout_items', JSON.stringify(checkoutData.items));
    localStorage.setItem('checkout_subtotal', checkoutData.subtotal.toString());
    localStorage.setItem('checkout_discount', checkoutData.discount.toString());
    localStorage.setItem('checkout_promo_code', checkoutData.promoCode);
    localStorage.setItem('checkout_total', checkoutData.total.toString());

    // Переходим на страницу оформления
    window.location.href = 'checkout.html';
}

// Обновляем счетчик в навигации
function updateNavCartCounter() {
    const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const navCounter = document.getElementById('cart-count-nav');
    if (navCounter) {
        navCounter.textContent = totalItems;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    updateNavCartCounter();
});

// Добавляем CSS стили для выбора товаров
function injectCartStyles() {
    const styles = `
        <style>
            .cart-notification {
                font-family: Arial, sans-serif;
                font-size: 14px;
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
            
            .cart-count {
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: -5px;
                right: -5px;
            }
            
            .cart-item {
                display: flex;
                gap: 15px;
                padding: 20px 0;
                border-bottom: 1px solid #eee;
                position: relative;
                bottom: 120px;
                transition: background-color 0.2s;
            }
            
            .cart-item.selected {
                background-color: #f0f8ff;
                border-left: 4px solid #2c5aa0;
                padding-left: 10px;
            }
            
            .cart-item-selector {
                display: flex;
                align-items: flex-start;
                padding-top: 10px;
            }
            
            .cart-item-selector input {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            .cart-item-image img {
                width: 100px;
                height: 100px;
                object-fit: cover;
                border-radius: 4px;
            }
            
            .cart-item-info {
                flex: 1;
            }
            
            .cart-item-title {
                margin: 0 0 5px 0;
                color: #333;
            }
            
            .cart-item-brand {
                color: #666;
                margin: 0 0 5px 0;
                font-size: 14px;
            }
            
            .cart-item-description {
                color: #777;
                margin: 0 0 10px 0;
                font-size: 13px;
            }
            
            .cart-item-link {
                display: flex;
                gap: 15px;
                flex: 1;
                text-decoration: none;
                color: inherit;
                transition: opacity 0.2s;
            }

            .cart-item-link:hover {
                opacity: 0.8;
            }

            .cart-item-sizes {
                font-size: 13px;
                color: #888;
                margin-bottom: 10px;
            }
            
            .cart-item-price-single {
                font-weight: bold;
                color: #333;
            }
            
            .cart-item-controls {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
            }

            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .quantity-btn {
                width: 30px;
                height: 30px;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .quantity {
                min-width: 30px;
                text-align: center;
                font-weight: bold;
            }
            
            .cart-item-total {
                font-size: 16px;
                color: #e44d26;
                font-weight: bold;
            }
            
            .remove-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .cart-selection-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                position: relative;
                bottom: 110px;
            }
            
            .select-all-btn, .deselect-all-btn {
                background: #6c757d;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .select-all-btn:hover {
                background: #5a6268;
            }
            
            .deselect-all-btn:hover {
                background: #5a6268;
            }
            
            .selected-items-info {
                background: #e8f4ff;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #2c5aa0;
            }
            
            .summary-row.selected {
                background: #e8f4ff;
                padding: 10px;
                border-radius: 4px;
                font-weight: bold;
            }

            /* Остальные существующие стили остаются без изменений */
            .cart-container {
                max-width: 1200px;
                margin: 60px auto 50px;
                padding: 0 20px;
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 40px;
            }

            .cart-items-section {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                bottom: 500px;
            }
            
            .cart-items-section h2 {
                color: black;
            }

            .order-summary {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                height: fit-content;
                position: sticky;
                top: 5px;
            }

            .checkout-steps {
                display: flex;
                justify-content: space-between;
                margin-bottom: 60px;
                position: relative;
            }

            .checkout-steps::before {
                content: '';
                position: absolute;
                top: 40px;
                left: 0;
                right: 0;
                height: 2px;
                background: #ddd;
                z-index: 1;
            }

            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                z-index: 2;
                background: white;
                padding: 0 10px;
                height: 80px;
                justify-content: center;
            }

            .step span:first-child {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #ddd;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 5px;
                font-weight: bold;
            }

            .step.active span:first-child {
                background: #e44d26;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 10px 0;
            }

            .summary-row.total {
                border-top: 2px solid #eee;
                font-weight: bold;
                font-size: 1.2rem;
                color: #e44d26;
                margin-top: 10px;
            }

            .checkout-btn {
                width: 100%;
                background: #e44d26;
                color: white;
                border: none;
                padding: 15px;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.3s;
            }

            .checkout-btn:hover {
                background: #d1401a;
            }

            .cart-benefits {
                margin-top: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .benefit {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                font-size: 14px;
            }

            .cart-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                flex-direction: column;
                gap: 10px;
            }

            .continue-shopping {
                background: #6c757d;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }

            .save-cart {
                background: #28a745;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
            }

            .promo-code {
                margin: 20px 0;
            }

            .promo-input {
                display: flex;
                gap: 10px;
            }

            .promo-input input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .promo-input button {
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
            }

            #empty-cart {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            #empty-cart h3 {
                margin-bottom: 10px;
                color: #333;
            }

            @media (max-width: 768px) {
                .cart-container {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .cart-item {
                    flex-direction: column;
                    text-align: center;
                }
                
                .cart-item-controls {
                    align-items: center;
                }
                
                .checkout-steps {
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .cart-selection-controls {
                    flex-direction: column;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Инициализация глобального объекта корзины
const cart = new Cart();

window.cartInstance = new Cart();

// Добавляем стили при загрузке
document.addEventListener('DOMContentLoaded', injectCartStyles);

// Глобальные функции
window.addToCart = async function(productId, selectedSize = null) {
    
    // Загружаем товар из JSON
    const product = await cart.loadProductFromJSON(productId);
    console.log('Найденный товар:', product);
    
    if (product) {
        const result = cart.addItem(product, selectedSize);
        console.log('Результат добавления:', result);
        return result;
    } else {
        console.error('Товар не найден по ID:', productId);
        cart.showNotification('Товар не найден');
        return false;
    }
};

window.removeFromCart = function(productId) {
    return cart.removeItem(productId);
};

window.clearCart = function() {
    if (confirm('Вы уверены, что хотите очистить всю корзину?')) {
        cart.clearCart();
        cart.showNotification('Корзина очищена');
    }
};

window.goToCart = function() {
    window.location.href = 'cart.html';
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем корзину');
    injectCartStyles();
    cart.updateCartCounter();
    
    // Если это страница корзины, отображаем содержимое
    if (cart.isCartPage()) {
        console.log('Отображаем корзину при загрузке');
        cart.displayCart();
    }
});
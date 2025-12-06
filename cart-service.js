class CartService {
    static async addToCart(productId, size = null) {
        try {
            console.log('Добавляем товар в корзину:', productId, 'Размер:', size);
            
            // Проверяем, что размер выбран
            if (!size) {
                throw new Error('Пожалуйста, выберите размер');
            }

            // Проверяем, что выбранный размер доступен
            const product = await this.loadProduct(productId);
            if (!product) {
                throw new Error('Товар не найден');
            }

            if (!product.sizes.includes(size.toString())) {
                throw new Error('Выбранный размер недоступен для этого товара');
            }

            // Получаем текущую корзину
            const cart = this.getCart();
            
            // СОЗДАЕМ УНИКАЛЬНЫЙ ID С УЧЕТОМ РАЗМЕРА
            const uniqueId = `${productId}-${size}`;
            
            // Ищем товар в корзине с ТАКИМ ЖЕ РАЗМЕРОМ (используя uniqueId)
            const existingItemIndex = cart.findIndex(item => 
                item.uniqueId === uniqueId
            );

            if (existingItemIndex > -1) {
                // Увеличиваем количество существующего товара с таким же размером
                cart[existingItemIndex].quantity += 1;
                console.log('Увеличили количество товара с размером:', size);
            } else {
                // Добавляем новый товар с выбранным размером
                cart.push({
                    id: product.id,
                    uniqueId: uniqueId, // ДОБАВЛЯЕМ УНИКАЛЬНЫЙ ID
                    name: product.name,
                    price: product.price,
                    brand: product.brand,
                    image: product.image,
                    description: product.description,
                    sizes: product.sizes,
                    size: size, // Сохраняем выбранный размер
                    quantity: 1
                });
                console.log('Добавили новый товар с размером:', size);
            }

            // Сохраняем корзину
            this.saveCart(cart);
            this.showNotification(`Товар добавлен в корзину! Размер: ${size}`);
            
            return true;
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            this.showNotification(error.message);
            return false;
        }
    }

    static async loadProduct(productId) {
        try {
            // Пробуем разные пути к products.json
            const possiblePaths = [
                'products.json',
                '../products.json',
                './products.json',
                '/products.json',
                'json/products.json',
                '../json/products.json'
            ];

            let product = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log('Пробуем загрузить по пути:', path);
                    const response = await fetch(path);
                    if (response.ok) {
                        const data = await response.json();
                        product = data.products.find(p => p.id === productId);
                        if (product) {
                            console.log('Товар найден по пути:', path);
                            break;
                        }
                    }
                } catch (error) {
                    console.log('Не удалось загрузить по пути:', path);
                    continue;
                }
            }

            if (!product) {
                // Пробуем загрузить из localStorage как запасной вариант
                const products = JSON.parse(localStorage.getItem('products')) || [];
                product = products.find(p => p.id === productId);
                console.log('Поиск в localStorage:', product);
            }

            return product;
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            return null;
        }
    }

    static getCart() {
        try {
            const cartData = localStorage.getItem('shopping_cart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            return [];
        }
    }

    static saveCart(cart) {
        try {
            localStorage.setItem('shopping_cart', JSON.stringify(cart));
            this.updateCartCounter();
            return true;
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
            return false;
        }
    }

    static updateCartCounter() {
        const cart = this.getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        const counters = document.querySelectorAll('.cart-count, #cart-count');
        counters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    static showNotification(message) {
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
}

// Добавляем стили для уведомлений
const notificationStyles = `
    <style>
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
    </style>
`;
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Делаем сервис глобально доступным
window.CartService = CartService;

// Инициализация счетчика при загрузке
document.addEventListener('DOMContentLoaded', () => {
    CartService.updateCartCounter();
});
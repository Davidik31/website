class ProductDetail {
    static async loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        console.log('Загружаем товар с ID:', productId);

        if (!productId) {
            console.error('ID товара не указан');
            window.location.href = 'catalog.html';
            return;
        }

        try {
            // Загружаем товары из catalog.js
            const products = await this.getProducts();
            const product = products.find(p => p.id === productId);

            if (!product) {
                console.error('Товар не найден');
                window.location.href = 'catalog.html';
                return;
            }

            console.log('Товар найден:', product);
            this.renderProduct(product);
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            window.location.href = 'catalog.html';
        }
    }

    static async getProducts() {
        try {
            // Пробуем разные пути
            const possiblePaths = [
                '../json/products.json'
            ];

            for (const path of possiblePaths) {
                try {
                    console.log('Пробуем загрузить products.json по пути:', path);
                    const response = await fetch(path);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Успешно загружено по пути:', path);
                        // Сохраняем в localStorage для backup
                        localStorage.setItem('products', JSON.stringify(data.products));
                        return data.products;
                    }
                } catch (error) {
                    console.log('Не удалось загрузить по пути:', path);
                    continue;
                }
            }
            
            // Если не удалось загрузить из файла, используем localStorage
            console.log('Используем данные из localStorage');
            return JSON.parse(localStorage.getItem('products')) || [];
        } catch (error) {
            console.log('Не удалось загрузить JSON, используем локальные данные');
            return JSON.parse(localStorage.getItem('products')) || [];
        }
    }

    static renderProduct(product) {
        const productDetail = document.getElementById('product-detail');
        const discountedPrice = product.discount > 0 
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;

        // ПРОВЕРЯЕМ ID ТОВАРА ДЛЯ КОТОРОГО ХОТИМ ПОКАЗАТЬ ВИДЕО
        const showVideo = product.id === 4; 

        productDetail.innerHTML = `
            <div class="product-detail-container">
                <div class="product-images">
                    <img src="${product.image}" alt="${product.name}" class="main-product-image" 
                        onerror="this.src='https://via.placeholder.com/400x400/cccccc/666666?text=No+Image'">
                    
                    ${showVideo ? '<div id="video-container-placeholder"></div>' : ''}
                </div>
                
                <div class="product-info">
                    <div class="product-breadcrumbs">
                        <span class="product-brand">${product.brand}</span> > 
                        <span class="product-category">${this.getCategoryName(product.category)}</span>
                    </div>
                    
                    <h1 class="product-title">${product.name}</h1>
                    
                    <div class="product-rating">
                        ${this.generateRatingStars(product.rating)}
                        <span class="rating-value">${product.rating}</span>
                        <span class="reviews-count">(${product.reviews || 125} отзывов)</span>
                    </div>
                    
                    <div class="product-price-section">
                        ${product.discount > 0 ? `
                            <div class="product-price-old">${product.price.toLocaleString()} ₽</div>
                            <div class="product-price-discount">-${product.discount}%</div>
                        ` : ''}
                        <div class="product-price-current">${discountedPrice.toLocaleString()} ₽</div>
                    </div>
                    
                    <!-- КОМПАКТНЫЕ ХАРАКТЕРИСТИКИ -->
                    <div class="product-features-compact">
                        <div class="feature-item">
                            <strong>Бренд:</strong> ${product.brand}
                        </div>
                        <div class="feature-item">
                            <strong>Категория:</strong> ${this.getCategoryName(product.category)}
                        </div>
                        <div class="feature-item">
                            <strong>Пол:</strong> ${this.getGenderName(product.gender)}
                        </div>
                        <div class="feature-item">
                            <strong>Цвет:</strong> ${this.getColorName(product.color)}
                        </div>
                        ${product.isNew ? '<div class="feature-item"><strong>Статус:</strong> Новинка</div>' : ''}
                    </div>
                    
                    <div class="product-sizes-section">
                        <h3>Размеры</h3>
                        <div class="size-selector-compact">
                            ${product.sizes.map(size => `
                                <label class="size-option-compact">
                                    <input type="radio" name="size" value="${size}" required>
                                    <span class="size-label">${size}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-actions-compact">
                        <button class="add-to-cart-btn primary" onclick="ProductDetail.addToCart(${product.id})">
                            🛒 Добавить в корзину
                        </button>
                        <button class="buy-now-btn secondary" onclick="ProductDetail.buyNow(${product.id})">
                            ⚡ Купить сейчас
                        </button>
                    </div>
                    
                    <!-- КОМПАКТНАЯ ИНФОРМАЦИЯ О ДОСТАВКЕ -->
                    <div class="product-delivery-compact">
                        <div class="delivery-item">
                            <span class="delivery-icon">🚚</span>
                            <span>Бесплатная доставка от 5000 ₽</span>
                        </div>
                        <div class="delivery-item">
                            <span class="delivery-icon">↩️</span>
                            <span>Возврат в течение 14 дней</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (showVideo) {
            setTimeout(() => {
                this.addVideoToProduct();
            }, 100);
        }
    }

    static addVideoToProduct() {
        const videoPlaceholder = document.getElementById('video-container-placeholder');
        if (videoPlaceholder) {
            videoPlaceholder.innerHTML = `
                <div class="product-video-section">
                    <h3>Видеообзор</h3>
                    <div class="video-container">
                        <iframe 
                            width="100%" 
                            height="250" 
                            src="https://yandex.ru/video/preview/15113817456166166892" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;
        }
    }

    static generateRatingStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push('★');
        }
        if (hasHalfStar) {
            stars.push('☆');
        }
        while (stars.length < 5) {
            stars.push('☆');
        }

        return stars.join('');
    }

    static getCategoryName(category) {
        const categories = {
            'running': 'Беговые',
            'basketball': 'Баскетбольные',
            'football': 'Футбольные',
            'training': 'Для тренировок',
            'lifestyle': 'Повседневные',
            'hiking': 'Трекинговые',
            'tennis': 'Теннисные'
        };
        return categories[category] || category;
    }

    static getGenderName(gender) {
        const genders = {
            'male': 'Мужские',
            'female': 'Женские',
            'unisex': 'Унисекс'
        };
        return genders[gender] || gender;
    }

    static getColorName(color) {
        const colors = {
            'black': 'Черный',
            'white': 'Белый',
            'red': 'Красный',
            'blue': 'Синий',
            'green': 'Зеленый',
            'grey': 'Серый',
            'pink': 'Розовый',
            'purple': 'Фиолетовый',
            'yellow': 'Желтый',
            'orange': 'Оранжевый',
            'beige': 'Бежевый',
            'silver': 'Серебряный',
            'multicolor': 'Разноцветный'
        };
        return colors[color] || color;
    }

    static async addToCart(productId) {
        // Получаем выбранный размер
        const selectedSizeInput = document.querySelector('input[name="size"]:checked');
        
        if (!selectedSizeInput) {
            alert('Пожалуйста, выберите размер');
            return;
        }

        const selectedSize = selectedSizeInput.value;

        try {
            // Используем CartService вместо window.addToCart
            const success = await CartService.addToCart(productId, selectedSize);
            if (success) {
                console.log('Товар успешно добавлен в корзину');
            } else {
                alert('Не удалось добавить товар в корзину');
            }
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Произошла ошибка при добавлении в корзину');
        }
    }

    static async buyNow(productId) {
        const selectedSizeInput = document.querySelector('input[name="size"]:checked');
        if (!selectedSizeInput) {
            alert('Пожалуйста, выберите размер');
            return;
        }

        const selectedSize = selectedSizeInput.value;

        try {
            // Используем CartService вместо window.addToCart
            const success = await CartService.addToCart(productId, selectedSize);
            if (success) {
                // Переходим в корзину после успешного добавления
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 1000);
            } else {
                alert('Не удалось добавить товар в корзину');
            }
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Произошла ошибка при добавлении в корзину');
        }
    }
}

// Загружаем товар при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, начинаем загрузку товара');
    ProductDetail.loadProduct();
});

// Добавьте в конец product.js
const videoStyles = `
    <style>
        .product-video-section {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #eee;
        }

        .product-video-section h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #333;
        }

        .video-container {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .video-container iframe {
            border-radius: 10px;
            display: block;
            border: none;
        }

        @media (max-width: 768px) {
            .video-container iframe {
                height: 200px;
            }
        }
    </style>
`;

// Вставьте стили при загрузке
document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', videoStyles);
});
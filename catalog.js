class CatalogService {
    static async getProducts() {
        try {
            const response = await fetch('products.json');
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('products', JSON.stringify(data.products));
                return data.products;
            }
        } catch (error) {
            console.log('Не удалось загрузить JSON, используем локальные данные');
        }
        
        return JSON.parse(localStorage.getItem('products')) || [];
    }

    static addProduct(product) {
        const products = this.getProducts();
        product.id = Date.now();
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        return product;
    }
}

class CatalogUI {
    static renderProducts(products) {
        const catalog = document.getElementById('catalog');
        const productsCount = document.getElementById('products-count');
        
        catalog.innerHTML = '';
        
        if (products.length === 0) {
            catalog.innerHTML = '<p class="no-products">Товары не найдены. Попробуйте изменить параметры фильтрации.</p>';
            productsCount.textContent = 'Товаров не найдено';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='images/placeholder.jpg'">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-sizes">Размеры: ${product.sizes.join(', ')}</div>
                    <div class="product-gender">${this.getGenderName(product.gender)}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                </a>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCartAsync(${product.id})" data-product-id="${product.id}">
                    В корзину
                </button>
            `;
            
            // Добавляем обработчик клика на всю карточку
            productCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart')) {
                    window.location.href = `product.html?id=${product.id}`;
                }
            });
            
            catalog.appendChild(productCard);
        });
        
        productsCount.textContent = `Найдено товаров: ${products.length}`;
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
        return genders[gender] || '';
    }

    static setupFilters() {
        const searchInput = document.getElementById('search');
        const categorySelect = document.getElementById('category');
        const brandSelect = document.getElementById('brand');
        const priceSelect = document.getElementById('price');
        const genderSelect = document.getElementById('gender');
        const sortSelect = document.getElementById('sort');
        const resetButton = document.getElementById('reset-filters');

        const filterAndSortProducts = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const category = categorySelect.value;
            const brand = brandSelect.value;
            const priceRange = priceSelect.value;
            const gender = genderSelect.value;
            const sortOption = sortSelect.value;

            CatalogService.getProducts().then(products => {
                let filteredProducts = products;

                // Поиск
                if (searchTerm) {
                    filteredProducts = filteredProducts.filter(product => 
                        product.name.toLowerCase().includes(searchTerm) ||
                        product.brand.toLowerCase().includes(searchTerm) ||
                        product.description.toLowerCase().includes(searchTerm)
                    );
                }

                // Фильтр по категории
                if (category) {
                    filteredProducts = filteredProducts.filter(product => product.category === category);
                }

                // Фильтр по бренду
                if (brand) {
                    filteredProducts = filteredProducts.filter(product => product.brand === brand);
                }

                // Фильтр по цене
                if (priceRange) {
                    filteredProducts = filteredProducts.filter(product => {
                        switch (priceRange) {
                            case '0-5000': return product.price <= 5000;
                            case '5000-10000': return product.price > 5000 && product.price <= 10000;
                            case '10000-15000': return product.price > 10000 && product.price <= 15000;
                            case '15000-20000': return product.price > 15000 && product.price <= 20000;
                            case '20000+': return product.price > 20000;
                            default: return true;
                        }
                    });
                }

                // Фильтр по полу
                if (gender) {
                    filteredProducts = filteredProducts.filter(product => product.gender === gender);
                }

                // Сортировка
                filteredProducts = this.sortProducts(filteredProducts, sortOption);

                this.renderProducts(filteredProducts);
            });
        };

        // Сортировка продуктов
        this.sortProducts = (products, sortOption) => {
            const sortedProducts = [...products];
            
            switch (sortOption) {
                case 'price-asc':
                    return sortedProducts.sort((a, b) => a.price - b.price);
                case 'price-desc':
                    return sortedProducts.sort((a, b) => b.price - a.price);
                case 'name-asc':
                    return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                case 'name-desc':
                    return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                case 'brand-asc':
                    return sortedProducts.sort((a, b) => a.brand.localeCompare(b.brand));
                default:
                    return sortedProducts;
            }
        };

        // Сброс фильтров
        resetButton.addEventListener('click', () => {
            searchInput.value = '';
            categorySelect.value = '';
            brandSelect.value = '';
            priceSelect.value = '';
            genderSelect.value = '';
            sortSelect.value = 'default';
            filterAndSortProducts();
        });

        // Слушатели событий
        searchInput.addEventListener('input', filterAndSortProducts);
        categorySelect.addEventListener('change', filterAndSortProducts);
        brandSelect.addEventListener('change', filterAndSortProducts);
        priceSelect.addEventListener('change', filterAndSortProducts);
        genderSelect.addEventListener('change', filterAndSortProducts);
        sortSelect.addEventListener('change', filterAndSortProducts);

        // Инициализация
        filterAndSortProducts();
    }
}

//Функция добавления товара в корзину
async function addToCartAsync(productId) {
    try {
        // Получаем данные товара
        const product = await getProductById(productId);
        
        if (!product) {
            throw new Error('Товар не найден');
        }

        // Используем глобальный экземпляр корзины
        const success = window.cartInstance.addItem(product);
        
        if (success) {
            // Визуальная обратная связь
            const button = document.querySelector(`[data-product-id="${productId}"]`);
        } else {
            throw new Error('Не удалось добавить товар в корзину');
        }
    }
    catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        alert('Произошла ошибка при добавлении товара в корзину');
    }
}

// Функция для получения данных товара по ID
async function getProductById(productId) {
        try {
            // Загружаем товары из JSON файла
            const response = await fetch('products.json');
            if (response.ok) {
                const data = await response.json();
                return data.products.find(p => p.id === productId);
            }
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        }
        return null;
    }

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems > 0 ? totalItems : '';
}

function goToCart() {
    window.location.href = 'cart.html';
}

// Инициализация каталога при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    await CatalogUI.setupFilters();
    updateCartCount();
});
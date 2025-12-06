class ProductSearch {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.searchInput = document.getElementById('search');
        this.categoryFilter = document.getElementById('category');
        this.brandFilter = document.getElementById('brand');
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.displayAllProducts();
    }

    // Загрузка товаров из JSON файла
    async loadProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить товары');
            }
            const data = await response.json();
            this.products = data.products;
            console.log('Товары загружены:', this.products.length);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            this.products = [];
        }
    }

    setupEventListeners() {
        // Поиск при вводе текста
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.performSearch();
            });
        }

        // Фильтрация по категории
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => {
                this.performSearch();
            });
        }

        // Фильтрация по бренду
        if (this.brandFilter) {
            this.brandFilter.addEventListener('change', () => {
                this.performSearch();
            });
        }
    }

    performSearch() {
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
        const category = this.categoryFilter ? this.categoryFilter.value : '';
        const brand = this.brandFilter ? this.brandFilter.value : '';

        console.log('Поиск:', { searchTerm, category, brand });

        this.filteredProducts = this.products.filter(product => {
            // Поиск по тексту
            let matchesSearch = true;
            if (searchTerm) {
                matchesSearch = 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.brand.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm);
            }

            // Фильтрация по категории
            let matchesCategory = true;
            if (category) {
                matchesCategory = product.category === category;
            }

            // Фильтрация по бренду
            let matchesBrand = true;
            if (brand) {
                matchesBrand = product.brand === brand;
            }

            return matchesSearch && matchesCategory && matchesBrand;
        });

        console.log('Найдено товаров:', this.filteredProducts.length);
        this.displayResults();
    }

    displayAllProducts() {
        this.filteredProducts = [...this.products];
        this.displayResults();
    }

    displayResults() {
        const catalog = document.getElementById('catalog');
        if (!catalog) {
            console.error('Элемент каталога не найден');
            return;
        }

        if (this.filteredProducts.length === 0) {
            catalog.innerHTML = `
                <div class="no-products">
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос или параметры фильтрации</p>
                    <button onclick="productSearch.clearFilters()" class="clear-filters-btn">
                        Сбросить фильтры
                    </button>
                </div>
            `;
            return;
        }

        let productsHTML = '';
        this.filteredProducts.forEach(product => {
            productsHTML += `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image"
                         onerror="this.src='https://via.placeholder.com/300x300/cccccc/666666?text=No+Image'">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-sizes">Размеры: ${Array.isArray(product.sizes) ? product.sizes.join(', ') : 'Не указаны'}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        В корзину
                    </button>
                </div>
            `;
        });

        catalog.innerHTML = productsHTML;
        this.updateResultsCount();
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `Найдено товаров: ${this.filteredProducts.length}`;
        }
    }

    clearFilters() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.categoryFilter) this.categoryFilter.value = '';
        if (this.brandFilter) this.brandFilter.value = '';
        this.displayAllProducts();
    }

    // Поиск по ID (для корзины и других нужд)
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Получить все категории для фильтра
    getAllCategories() {
        const categories = [...new Set(this.products.map(product => product.category))];
        return categories;
    }

    // Получить все бренды для фильтра
    getAllBrands() {
        const brands = [...new Set(this.products.map(product => product.brand))];
        return brands;
    }

    // Инициализация фильтров (если они динамические)
    initFilters() {
        if (this.categoryFilter) {
            const categories = this.getAllCategories();
            let categoryOptions = '<option value="">Все категории</option>';
            categories.forEach(category => {
                categoryOptions += `<option value="${category}">${this.getCategoryName(category)}</option>`;
            });
            this.categoryFilter.innerHTML = categoryOptions;
        }

        if (this.brandFilter) {
            const brands = this.getAllBrands();
            let brandOptions = '<option value="">Все бренды</option>';
            brands.forEach(brand => {
                brandOptions += `<option value="${brand}">${brand}</option>`;
            });
            this.brandFilter.innerHTML = brandOptions;
        }
    }

    getCategoryName(category) {
        const categoryNames = {
            'running': 'Беговые',
            'basketball': 'Баскетбольные', 
            'football': 'Футбольные',
            'training': 'Для тренировок',
            'lifestyle': 'Повседневные'
        };
        return categoryNames[category] || category;
    }
}

// Создаем глобальный экземпляр
const productSearch = new ProductSearch();

// Глобальные функции
window.clearSearchFilters = function() {
    productSearch.clearFilters();
};

// Функция для добавления в корзину (совместимость)
window.addToCart = async function(productId) {
    const product = productSearch.getProductById(productId);
    if (product) {
        if (typeof cart !== 'undefined') {
            await cart.addItem(product);
        } else {
            console.error('Корзина не инициализирована');
        }
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Автоматическая инициализация фильтров через секунду (после загрузки товаров)
    setTimeout(() => {
        productSearch.initFilters();
    }, 1000);
});
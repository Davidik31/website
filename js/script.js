// Обновляем счетчик при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
});

document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burgerMenu');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;
    
    // Создаем оверлей для мобильного меню
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    
    // Функция для открытия/закрытия меню
    function toggleMenu() {
        burgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Блокировка скролла при открытом меню
        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }
    
    // Открытие/закрытие по клику на бургер
    burgerMenu.addEventListener('click', toggleMenu);
    
    // Закрытие по клику на оверлей
    overlay.addEventListener('click', toggleMenu);
    
    // Закрытие по клику на ссылку в меню (для мобильных)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // Закрытие меню при изменении размера окна на десктоп
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            burgerMenu.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        }
    });
});
// FAQ функционал
document.addEventListener('DOMContentLoaded', function() {
    // Раскрытие/скрытие ответов
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // Фильтрация по категориям
    const categoryBtns = document.querySelectorAll('.faq-category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Активная кнопка
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Показ/скрытие вопросов
            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            // Показ/скрытие секций
            const faqSections = document.querySelectorAll('.faq-section');
            faqSections.forEach(section => {
                const hasVisibleItems = Array.from(section.querySelectorAll('.faq-item'))
                    .some(item => item.style.display !== 'none');
                section.style.display = hasVisibleItems ? 'block' : 'none';
            });
        });
    });

    // Поиск по вопросам
    const searchInput = document.getElementById('faq-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Показ/скрытие секций
        const faqSections = document.querySelectorAll('.faq-section');
        faqSections.forEach(section => {
            const hasVisibleItems = Array.from(section.querySelectorAll('.faq-item'))
                .some(item => item.style.display !== 'none');
            section.style.display = hasVisibleItems ? 'block' : 'none';
        });
    });
});
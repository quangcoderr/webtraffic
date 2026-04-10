// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    // Replace all i elements with data-lucide attribute
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Simple smooth reveal for cards
    const cards = document.querySelectorAll('.article-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        observer.observe(card);
    });
});

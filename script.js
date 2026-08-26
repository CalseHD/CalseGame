document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ARAMA FİLTRELEME İŞLEVİ ---
    const searchInput = document.querySelector('.search-box input');
    const gameCards = document.querySelectorAll('.game-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            gameCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                if (title.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // --- 2. POP-UP (MODAL) YÖNETİMİ ---
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.modal-close');

    // Oturum Aç Butonu
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });
    }

    // Kayıt Ol Butonu
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'flex';
        });
    }

    // Kapatma Butonları (X)
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Pencere Dışına Tıklayınca Kapatma
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    });
});
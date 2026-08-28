document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ARAMA VE SAYFALAMA ENTEGRASYONU ---
    const searchInput = document.querySelector('.search-box input');
    const gameGrid = document.getElementById('gameGrid');
    const paginationContainer = document.getElementById('pagination');
    let allCards = gameGrid ? Array.from(gameGrid.querySelectorAll('.game-card')) : [];

    const itemsPerPage = 15; // Her sayfada en fazla 15 oyun
    let currentPage = 1;

    function updatePaginationAndDisplay(cardsToDisplay) {
        if (!gameGrid) return;
        
        const totalPages = Math.ceil(cardsToDisplay.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        gameGrid.innerHTML = ''; // Ekranı temizle

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentCards = cardsToDisplay.slice(start, end);

        // O sayfaya ait kartları ekrana bas
        currentCards.forEach(card => gameGrid.appendChild(card));

        // Sayfa butonlarını oluştur
        renderPaginationButtons(totalPages, cardsToDisplay);
    }

    function renderPaginationButtons(totalPages, cardsToDisplay) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        // Eğer toplam sayfa 1 veya daha azsa buton gösterme
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.style.padding = '8px 14px';
            btn.style.borderRadius = '6px';
            btn.style.border = '1px solid #333';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';

            if (i === currentPage) {
                btn.style.background = '#ff3333';
                btn.style.color = '#fff';
                btn.style.borderColor = '#ff3333';
            } else {
                btn.style.background = '#222';
                btn.style.color = '#fff';
            }

            btn.addEventListener('click', () => {
                currentPage = i;
                updatePaginationAndDisplay(cardsToDisplay);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            paginationContainer.appendChild(btn);
        }
    }

    // Arama İşlevi (Arama yapıldığında sayfalamayı da filtreye göre uyarlar)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            currentPage = 1; // Arama yapınca 1. sayfaya dön

            const filteredCards = allCards.filter(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                return title.includes(query);
            });

            updatePaginationAndDisplay(filteredCards);
        });
    }

    // İlk açılışta tüm oyunları sayfalı şekilde yükle
    if (gameGrid) {
        updatePaginationAndDisplay(allCards);
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
            closeModals();
        });
    });

    // Pencere Dışına Tıklayınca Kapatma
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
        const profileModal = document.getElementById('profileModal');
        if (e.target === profileModal) profileModal.style.display = 'none';
    });

    // Oturum Durumunu Kontrol Et
    checkAuthStatus();
    setupProfileListeners();
});

// --- 3. KLASİK GİRİŞ / KAYIT İŞLEMLERİ ---
const loginForm = document.querySelector('#loginModal .auth-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const usernameInput = this.querySelector('input[type="text"]').value;
        
        const userData = {
            username: usernameInput || "Kullanıcı",
            profilePic: "images/default-avatar.png" 
        };
        
        localStorage.setItem('calseUser', JSON.stringify(userData));
        closeModals();
        checkAuthStatus();
    });
}

// --- 4. GOOGLE İLE GİRİŞ ENTEGRASYONU ---
function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    
    const permanentCustomName = localStorage.getItem('customSavedUsername');
    const permanentCustomPic = localStorage.getItem('customSavedProfilePic');

    const user = {
        username: permanentCustomName ? permanentCustomName : responsePayload.name,
        email: responsePayload.email,
        profilePic: permanentCustomPic ? permanentCustomPic : responsePayload.picture
    };

    localStorage.setItem('calseUser', JSON.stringify(user));
    closeModals(); 
    checkAuthStatus();
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// --- 5. OTURUM DURUMU VE NAVBAR GÜNCELLEME ---
function checkAuthStatus() {
    const savedUser = localStorage.getItem('calseUser');
    const navAuth = document.querySelector('.nav-auth');

    if (savedUser && navAuth) {
        const user = JSON.parse(savedUser);
        
        navAuth.innerHTML = `
            <div class="user-profile-menu" id="openProfileBtn" style="display: flex; align-items: center; gap: 10px; cursor: pointer;" title="Profili Düzenle">
                <img src="${user.profilePic || 'images/default-avatar.png'}" alt="Profil" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #ff3333;">
                <span style="color: #fff; font-weight: bold; font-size: 14px;">${user.username}</span>
                <button id="logoutBtn" style="background: #333; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 5px;">Çıkış</button>
            </div>
        `;

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.stopPropagation(); 
            localStorage.removeItem('calseUser');
            window.location.reload();
        });
        
        document.getElementById('openProfileBtn').addEventListener('click', () => {
            openProfileModal();
        });
    }
}

// --- 6. MODAL VE PROFİL YÖNETİMİ ---
function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if(modal) modal.style.display = 'none';
}

function openProfileModal() {
    const savedUser = localStorage.getItem('calseUser');
    if (!savedUser) return;
    
    const user = JSON.parse(savedUser);
    const modal = document.getElementById('profileModal');
    const imgElement = document.getElementById('modalProfileImg');
    const inputElement = document.getElementById('profileUsernameInput');
    
    if (modal && imgElement && inputElement) {
        imgElement.src = user.profilePic || 'images/default-avatar.png';
        inputElement.value = user.username;
        modal.style.display = 'flex';
    }
}

function setupProfileListeners() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newName = document.getElementById('profileUsernameInput').value;

            localStorage.setItem('customSavedUsername', newName);
            
            let savedUser = localStorage.getItem('calseUser');
            if(savedUser){
                let user = JSON.parse(savedUser);
                user.username = newName;
                localStorage.setItem('calseUser', JSON.stringify(user));
            }
            
            closeProfileModal();
            checkAuthStatus();
        });
    }

    const uploadAvatarInput = document.getElementById('uploadAvatar');
    if (uploadAvatarInput) {
        uploadAvatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    
                    localStorage.setItem('customSavedProfilePic', base64Image);
                    
                    document.getElementById('modalProfileImg').src = base64Image;
                    
                    let savedUser = localStorage.getItem('calseUser');
                    let user = savedUser ? JSON.parse(savedUser) : {};
                    user.profilePic = base64Image;
                    localStorage.setItem('calseUser', JSON.stringify(user));
                    
                    checkAuthStatus();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

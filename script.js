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
    
    // Daha önce kalıcı olarak kaydedilmiş özel isim ve fotoğraf kilitleri var mı?
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

// JWT Token Çözücü Yardımcı Fonksiyonu
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

        // Çıkış yapma butonu
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.stopPropagation(); 
            localStorage.removeItem('calseUser');
            window.location.reload();
        });
        
        // Profil alanına tıklayınca profil modalını aç
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

            // İsmi kalıcı olarak kilitliyoruz
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
                    
                    // KESİN ÇÖZÜM: Fotoğrafı da kalıcı hafızaya kilitliyoruz!
                    localStorage.setItem('customSavedProfilePic', base64Image);
                    
                    document.getElementById('modalProfileImg').src = base64Image;
                    
                    let savedUser = localStorage.getItem('calseUser');
                    let user = savedUser ? JSON.parse(savedUser) : {};
                    user.profilePic = base64Image;
                    localStorage.setItem('caglesUser', JSON.stringify(user)); // Güvenli güncelleme
                    localStorage.setItem('calseUser', JSON.stringify(user));
                    
                    checkAuthStatus();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}
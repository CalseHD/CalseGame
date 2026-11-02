document.addEventListener('DOMContentLoaded', () => {
    // --- 0. OTOMATİK MODAL, YOL VE GOOGLE KÜTÜPHANESİ OLUŞTURUCU ---
    
    // Alt sayfalar klasör içinde (örn: games/) olduğu için resim yollarını otomatik ayarla
    const isSubPage = window.location.pathname.split('/').filter(Boolean).length > 1;
    const assetPrefix = isSubPage ? '../' : '';

    // 1. Google GSI Kütüphanesini Eksik Olan Sayfalara Otomatik Ekle
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const googleScript = document.createElement('script');
        googleScript.src = "https://accounts.google.com/gsi/client";
        googleScript.async = true;
        googleScript.defer = true;
        googleScript.onload = () => initGoogleSignIn();
        document.head.appendChild(googleScript);
    } else {
        initGoogleSignIn();
    }

    // 2. Oturum Aç / Kayıt Ol ve Profil Modallarını Eksik Sayfalara Otomatik Ekle
    if (!document.getElementById('loginModal')) {
        const modalsHTML = `
            <div id="loginModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <h2>Oturum Aç</h2>
                    <form class="auth-form">
                        <input type="text" placeholder="Kullanıcı Adı veya İsim" required>
                        <input type="password" placeholder="Şifre" required>
                        <button type="submit" class="btn-submit">Giriş Yap</button>
                    </form>
                    <div class="divider">veya</div>
                    <!-- Google Giriş Butonu Konteyneri -->
                    <div id="googleLoginBtnContainer" style="display: flex; justify-content: center; margin-top: 10px;"></div>
                </div>
            </div>

            <div id="registerModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <h2>Kayıt Ol</h2>
                    <form class="auth-form">
                        <input type="text" placeholder="İsim" required>
                        <input type="email" placeholder="Gmail / E-posta" required>
                        <input type="password" placeholder="Şifre" required>
                        <button type="submit" class="btn-submit">Kayıt Ol</button>
                    </form>
                    <div class="divider">veya</div>
                    <!-- Google Kayıt Butonu Konteyneri -->
                    <div id="googleRegisterBtnContainer" style="display: flex; justify-content: center; margin-top: 10px;"></div>
                </div>
            </div>

            <div id="profileModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeProfileModal()">&times;</span>
                    <h2>Profili Düzenle</h2>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <img id="modalProfileImg" src="${assetPrefix}images/default-avatar.png" alt="Profil" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid #ff3333; margin-bottom: 10px;">
                        <br>
                        <label for="uploadAvatar" style="background: #333; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; display: inline-block;">Fotoğraf Değiştir</label>
                        <input type="file" id="uploadAvatar" accept="image/*" style="display: none;">
                    </div>
                    <form id="profileForm" class="auth-form">
                        <label style="color: #aaa; font-size: 12px;">Kullanıcı Adı:</label>
                        <input type="text" id="profileUsernameInput" required>
                        <button type="submit" class="btn-submit">Kaydet</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
        initGoogleSignIn();
    }

    // --- 1. ARAMA VE SAYFALAMA ENTEGRASYONU ---
    const searchInput = document.querySelector('.search-box input');
    const gameGrid = document.getElementById('gameGrid');
    const paginationContainer = document.getElementById('pagination');
    let allCards = gameGrid ? Array.from(gameGrid.querySelectorAll('.game-card')) : [];

    const itemsPerPage = 15; 
    let currentPage = 1;

    function updatePaginationAndDisplay(cardsToDisplay) {
        if (!gameGrid) return;
        
        const totalPages = Math.ceil(cardsToDisplay.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        gameGrid.innerHTML = ''; 

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentCards = cardsToDisplay.slice(start, end);

        currentCards.forEach(card => gameGrid.appendChild(card));
        renderPaginationButtons(totalPages, cardsToDisplay);
    }

    function renderPaginationButtons(totalPages, cardsToDisplay) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

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

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            currentPage = 1; 

            const filteredCards = allCards.filter(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                return title.includes(query);
            });

            updatePaginationAndDisplay(filteredCards);
        });
    }

    if (gameGrid) {
        updatePaginationAndDisplay(allCards);
    }

    // --- 2. POP-UP (MODAL) YÖNETİMİ ---
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.modal-close');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(loginModal) loginModal.style.display = 'flex';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(registerModal) registerModal.style.display = 'flex';
        });
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModals();
        });
    });

    window.addEventListener('click', (e) => {
        if (loginModal && e.target === loginModal) loginModal.style.display = 'none';
        if (registerModal && e.target === registerModal) registerModal.style.display = 'none';
        const profileModal = document.getElementById('profileModal');
        if (profileModal && e.target === profileModal) profileModal.style.display = 'none';
    });

    checkAuthStatus();
    setupProfileListeners();
});

// --- 3. GOOGLE GİS BAŞLATICI ---
function initGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: "906297734505-5as4t6t523o2l9309593n9pcaatfvoi8.apps.googleusercontent.com", // Kendi Client ID'ni buraya yaz
            callback: handleCredentialResponse
        });

        const loginContainer = document.getElementById('googleLoginBtnContainer');
        if (loginContainer && loginContainer.innerHTML === '') {
            google.accounts.id.renderButton(loginContainer, { theme: "filled_black", size: "large", width: "100%" });
        }

        const registerContainer = document.getElementById('googleRegisterBtnContainer');
        if (registerContainer && registerContainer.innerHTML === '') {
            google.accounts.id.renderButton(registerContainer, { theme: "filled_black", size: "large", width: "100%" });
        }
    }
}

// --- 4. KLASİK GİRİŞ / KAYIT İŞLEMLERİ ---
document.addEventListener('submit', function(e) {
    if (e.target && e.target.matches('#loginModal .auth-form')) {
        e.preventDefault();
        const usernameInput = e.target.querySelector('input[type="text"]').value;
        
        const isSubPage = window.location.pathname.split('/').filter(Boolean).length > 1;
        const assetPrefix = isSubPage ? '../' : '';

        const userData = {
            username: usernameInput || "Kullanıcı",
            profilePic: assetPrefix + "images/default-avatar.png" 
        };
        
        localStorage.setItem('calseUser', JSON.stringify(userData));
        closeModals();
        checkAuthStatus();
    }
});

// --- 5. GOOGLE İLE GİRİŞ ENTEGRASYONU ---
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

// --- 6. OTURUM DURUMU VE NAVBAR GÜNCELLEME ---
function checkAuthStatus() {
    const savedUser = localStorage.getItem('calseUser');
    const navAuth = document.querySelector('.nav-auth');

    if (savedUser && navAuth) {
        const user = JSON.parse(savedUser);
        const isSubPage = window.location.pathname.split('/').filter(Boolean).length > 1;
        const assetPrefix = isSubPage ? '../' : '';
        const defaultPic = assetPrefix + "images/default-avatar.png";
        
        navAuth.innerHTML = `
            <div class="user-profile-menu" id="openProfileBtn" style="display: flex; align-items: center; gap: 10px; cursor: pointer;" title="Profili Düzenle">
                <img src="${user.profilePic || defaultPic}" alt="Profil" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #ff3333;">
                <span style="color: #fff; font-weight: bold; font-size: 14px;">${user.username}</span>
                <button id="logoutBtn" style="background: #333; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 5px;">Çıkış</button>
            </div>
        `;

        const logoutBtn = document.getElementById('logoutBtn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                localStorage.removeItem('calseUser');
                window.location.reload();
            });
        }
        
        const openProfileBtn = document.getElementById('openProfileBtn');
        if(openProfileBtn) {
            openProfileBtn.addEventListener('click', () => {
                openProfileModal();
            });
        }
    }
}

// --- 7. MODAL VE PROFİL YÖNETİMİ ---
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
    const isSubPage = window.location.pathname.split('/').filter(Boolean).length > 1;
    const assetPrefix = isSubPage ? '../' : '';
    
    if (modal && imgElement && inputElement) {
        imgElement.src = user.profilePic || (assetPrefix + 'images/default-avatar.png');
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
                    
                    const modalImg = document.getElementById('modalProfileImg');
                    if(modalImg) modalImg.src = base64Image;
                    
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
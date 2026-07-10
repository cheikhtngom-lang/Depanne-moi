document.addEventListener("DOMContentLoaded", () => {
    // --- RESET TEMPORAIRE DES MOTS DE PASSE DEMANDÉ PAR L'UTILISATEUR ---
    if (!localStorage.getItem('passwords_reset_123456_v2')) {
        let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
        workers.forEach(w => w.password = '123456');
        localStorage.setItem('depanne_workers', JSON.stringify(workers));
        
        let users = JSON.parse(localStorage.getItem('depanne_users')) || [];
        users.forEach(u => {
            if(u.role !== 'Admin') u.password = '123456';
        });
        localStorage.setItem('depanne_users', JSON.stringify(users));
        
        localStorage.setItem('passwords_reset_123456_v2', 'true');
    }
    // --------------------------------------------------------------------


    // --- Gestion de l'état de connexion UI ---
    const updateAuthUI = () => {
        const isClientLoggedIn = sessionStorage.getItem('client_logged_in') === 'true';
        const clientName = sessionStorage.getItem('client_name') || 'Utilisateur';
        const loginBtn = document.getElementById('openUserLoginModalBtn');
        const logoutBtn = document.getElementById('logoutClientBtn');
        
        if (loginBtn && logoutBtn) {
            if (isClientLoggedIn) {
                // Raccourcir le nom s'il est trop long pour le bouton
                const shortName = clientName.length > 15 ? clientName.substring(0, 15) + '...' : clientName;
                loginBtn.innerHTML = `<span class="btn-bg"></span><span class="btn-text" style="font-weight: 600;">👤 ${shortName}</span>`;
                loginBtn.title = `Connecté en tant que : ${clientName}`;
                logoutBtn.style.display = 'block';
            } else {
                loginBtn.innerHTML = `<span class="btn-bg"></span><span class="btn-text">Connexion</span>`;
                loginBtn.removeAttribute('title');
                logoutBtn.style.display = 'none';
            }
        }
    };
    
    // Initial UI check
    updateAuthUI();
    
    const logoutBtn = document.getElementById('logoutClientBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                sessionStorage.removeItem('client_logged_in');
                sessionStorage.removeItem('client_name');
                updateAuthUI();
                alert('Vous avez été déconnecté avec succès.');
            }
        });
    }

    // 1. Scroll Reveal Animations with IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    // 2. Magnetic Button Effect on All Buttons
    const allBtns = document.querySelectorAll('.btn');
    allBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Limit the movement
            const moveX = x * 0.3;
            const moveY = y * 0.3;
            
            // Applique l'effet magnetique + le scale demandé
            btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
            // Reset position smoothly
            btn.style.transform = ''; // Laisse le CSS gérer le retour à la normale
        });
    });

    // 3. Parallax Effect on background abstract image (Optional subtleness)
    const bgAbstract = document.querySelector('.bg-abstract');
    window.addEventListener('scroll', () => {
        if (bgAbstract) {
            const scrollPos = window.scrollY;
            bgAbstract.style.transform = `translateY(${scrollPos * 0.3}px)`;
        }
    });
    // 4. Modal Logic
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const registrationModal = document.getElementById('registrationModal');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalSubmitBtnText = document.getElementById('modalSubmitBtnText');

    if (closeModalBtn && registrationModal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const plan = btn.getAttribute('data-plan');
                const price = btn.getAttribute('data-price');
                
                const workerForm = document.querySelector('#registrationModal .registration-form'); // on récupère le bon formulaire
                if(workerForm) {
                    workerForm.setAttribute('data-current-plan', plan);
                    workerForm.setAttribute('data-current-price', price);
                }
                
                if (plan === 'premium') {
                    modalSubtitle.innerHTML = `Formule <span style="color: var(--color-primary-light);">Premium</span> - ${price} FCFA/mois`;
                    modalSubmitBtnText.textContent = `Valider & Payer ${price} FCFA`;
                } else if (plan === 'essai') {
                    modalSubtitle.innerHTML = `Formule <span style="color: #2ecc71;">Gratuite (3 mois renouv.)</span> - 0 FCFA`;
                    modalSubmitBtnText.textContent = `Créer mon compte (Gratuit)`;
                } else {
                    modalSubtitle.innerHTML = `Formule <span style="color: var(--color-primary);">Standard</span> - ${price} FCFA/mois`;
                    modalSubmitBtnText.textContent = `Valider & Payer ${price} FCFA`;
                }

                registrationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        closeModalBtn.addEventListener('click', () => {
            registrationModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close on outside click
        registrationModal.addEventListener('click', (e) => {
            if (e.target === registrationModal) {
                registrationModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Profile photo preview
        const regProfilePhoto = document.getElementById('regProfilePhoto');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        const profilePhotoText = document.getElementById('profilePhotoText');

        if (regProfilePhoto && profilePhotoPreview && profilePhotoText) {
            regProfilePhoto.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePhotoPreview.src = e.target.result;
                        profilePhotoPreview.style.display = 'block';
                        profilePhotoText.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                } else {
                    profilePhotoPreview.src = '';
                    profilePhotoPreview.style.display = 'none';
                    profilePhotoText.style.display = 'block';
                }
            });
        }

        // --- Legal and CGU Modals ---
        const openLegalModalBtn = document.getElementById('openLegalModalBtn');
        const legalModal = document.getElementById('legalModal');
        const closeLegalModalBtn = document.getElementById('closeLegalModalBtn');

        const openTermsModalBtn = document.getElementById('openTermsModalBtn');
        const termsModal = document.getElementById('termsModal');
        const closeTermsModalBtn = document.getElementById('closeTermsModalBtn');

        if(openLegalModalBtn && legalModal) {
            openLegalModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                legalModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            closeLegalModalBtn.addEventListener('click', () => {
                legalModal.classList.remove('active');
                document.body.style.overflow = '';
            });
            legalModal.addEventListener('click', (e) => {
                if (e.target === legalModal) {
                    legalModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        if(openTermsModalBtn && termsModal) {
            openTermsModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                termsModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            closeTermsModalBtn.addEventListener('click', () => {
                termsModal.classList.remove('active');
                document.body.style.overflow = '';
            });
            termsModal.addEventListener('click', (e) => {
                if (e.target === termsModal) {
                    termsModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // --- User Login Modal Logic ---
        const openUserLoginBtn = document.getElementById('openUserLoginModalBtn');
        const userLoginModal = document.getElementById('userLoginModal');
        const closeUserLoginBtn = document.getElementById('closeUserLoginModalBtn');
        const userLoginForm = document.getElementById('userLoginForm');
        const userLoginError = document.getElementById('userLoginError');
        
        if (openUserLoginBtn && userLoginModal && closeUserLoginBtn) {
            openUserLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                userLoginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                if(userLoginError) userLoginError.classList.add('hidden');
                
                // Pré-remplissage Se souvenir de moi
                const savedUser = localStorage.getItem('user_saved_login');
                const savedPass = localStorage.getItem('user_saved_pass');
                if (savedUser && savedPass) {
                    document.getElementById('userLoginInput').value = savedUser;
                    document.getElementById('userPassInput').value = savedPass;
                    document.getElementById('userRememberMe').checked = true;
                }
            });
            
            closeUserLoginBtn.addEventListener('click', () => {
                userLoginModal.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            userLoginModal.addEventListener('click', (e) => {
                if (e.target === userLoginModal) {
                    userLoginModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        if (userLoginForm) {
            userLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const user = document.getElementById('userLoginInput').value.trim();
                const pass = document.getElementById('userPassInput').value;
                const remember = document.getElementById('userRememberMe').checked;
                
                let depanne_users = JSON.parse(localStorage.getItem('depanne_users')) || [];
                let depanne_workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                
                // Combiner les deux listes, en excluant les Admins
                const allowedUsers = [
                    ...depanne_users.filter(u => u.role !== 'Admin'),
                    ...depanne_workers // Les workers n'ont pas de rôle Admin par défaut
                ];

                const validUser = allowedUsers.find(u => {
                    const safeName = (u.name || '').toString().trim().toLowerCase();
                    const safeContact = (u.contact || '').toString().trim().toLowerCase();
                    const safePhone = (u.phone || '').toString().trim().toLowerCase();
                    const safeEmail = (u.email || '').toString().trim().toLowerCase();
                    const inputLower = user.trim().toLowerCase();
                    
                    if (!safeName && !safeContact && !safePhone && !safeEmail) return false;

                    const matchName = safeName === inputLower;
                    const matchContact = safeContact === inputLower || safePhone === inputLower || safeEmail === inputLower;
                    
                    return (matchName || matchContact) && 
                           String(u.password).trim() === String(pass).trim() && 
                           u.status === 'Actif';
                });
                
                if (validUser) {
                    if (remember) {
                        localStorage.setItem('user_saved_login', user);
                        localStorage.setItem('user_saved_pass', pass);
                    } else {
                        localStorage.removeItem('user_saved_login');
                        localStorage.removeItem('user_saved_pass');
                    }
                    
                    userLoginModal.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // Déterminer si l'utilisateur est un Client ou un Artisan
                    const isArtisan = validUser.plan || validUser.job || validUser.role === 'Artisan';

                    if (isArtisan) {
                        // --- Logique ARTISAN ---
                        sessionStorage.setItem('artisan_auth_token', 'true');
                        sessionStorage.setItem('artisan_id', validUser.id);
                        alert(`Connexion réussie ! Bienvenue dans votre tableau de bord, ${validUser.name}.`);
                        
                        // Redirection vers le dashboard
                        const submitBtn = userLoginForm.querySelector('button[type="submit"]');
                        if (submitBtn) {
                            const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
                            btnText.textContent = "Redirection...";
                            submitBtn.style.opacity = '0.8';
                        }
                        
                        setTimeout(() => {
                            window.location.href = 'artisan.html';
                        }, 600);
                        
                    } else {
                        // --- Logique CLIENT ---
                        sessionStorage.setItem('client_logged_in', 'true');
                        sessionStorage.setItem('client_name', validUser.name);
                        alert(`Bienvenue dans votre Espace Utilisateur, ${validUser.name} !`);
                        
                        // Modification de l'UI pour montrer l'état connecté
                        updateAuthUI();
                        
                        // Le bouton de profil est maintenant géré dynamiquement, pas besoin de ré-attacher l'alerte à chaque fois
                        const loginBtn = document.getElementById('openUserLoginModalBtn');
                        if (loginBtn) {
                            loginBtn.onclick = (ev) => {
                                if (sessionStorage.getItem('client_logged_in') === 'true') {
                                    ev.preventDefault();
                                    alert("Votre espace personnel est actuellement vide. Utilisez la recherche pour contacter des artisans !");
                                }
                            };
                        }
                        
                        // Si on était en attente de contacter un ouvrier
                        const pendingLink = sessionStorage.getItem('pending_contact_link');
                        if (pendingLink) {
                            sessionStorage.removeItem('pending_contact_link');
                            window.location.href = pendingLink;
                        }
                    }
                } else {
                    // Fallback to Supabase pour les anciens comptes non stockés dans localStorage
                    const submitBtn = userLoginForm.querySelector('button[type="submit"]');
                    const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
                    const originalText = btnText.textContent;
                    
                    btnText.textContent = "Vérification...";
                    submitBtn.style.opacity = '0.8';
                    userLoginError.classList.add('hidden');

                    try {
                        let isWorker = true;
                        const { data: workersByName, error: errW1 } = await window.db.from('workers').select('id, password').ilike('name', `%${user}%`);
                        const { data: workersByPhone, error: errW2 } = await window.db.from('workers').select('id, password').eq('phone', user);
                        
                        if (errW1 || errW2) throw new Error("Erreur Supabase");

                        let accountList = [...(workersByName || []), ...(workersByPhone || [])];

                        if (accountList.length === 0) {
                            isWorker = false;
                            const { data: usersByName, error: errU1 } = await window.db.from('users').select('id, password, role').ilike('name', `%${user}%`);
                            const { data: usersByContact, error: errU2 } = await window.db.from('users').select('id, password, role').eq('phone', user);
                            
                            if (errU1 || errU2) throw new Error("Erreur Supabase");
                            
                            accountList = [...(usersByName || []), ...(usersByContact || [])];
                        }

                        const validAccount = (accountList || []).find(acc => String(acc.password) === String(pass).trim());

                        if (!validAccount) {
                            userLoginError.classList.remove('hidden');
                            userLoginError.textContent = "Identifiants incorrects.";
                            btnText.textContent = originalText;
                            submitBtn.style.opacity = '1';
                            return;
                        }

                        if (remember) {
                            localStorage.setItem('user_saved_login', user);
                            localStorage.setItem('user_saved_pass', pass);
                        } else {
                            localStorage.removeItem('user_saved_login');
                            localStorage.removeItem('user_saved_pass');
                        }

                        // Synchronisation vers localStorage pour les prochaines connexions hors ligne
                        if (isWorker) {
                            const { data: fullWorker } = await window.db.from('workers').select('*').eq('id', validAccount.id).single();
                            if (fullWorker) {
                                let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                                if (!workers.find(w => String(w.id) === String(fullWorker.id))) {
                                    workers.push(fullWorker);
                                    localStorage.setItem('depanne_workers', JSON.stringify(workers));
                                }
                            }
                            
                            btnText.textContent = "Redirection...";
                            sessionStorage.setItem('artisan_auth_token', 'true');
                            sessionStorage.setItem('artisan_id', validAccount.id.toString());
                            setTimeout(() => { window.location.href = 'artisan.html'; }, 600);
                            
                        } else {
                            const { data: fullUser } = await window.db.from('users').select('*').eq('id', validAccount.id).single();
                            if (fullUser) {
                                let users = JSON.parse(localStorage.getItem('depanne_users')) || [];
                                if (!users.find(u => String(u.id) === String(fullUser.id))) {
                                    users.push(fullUser);
                                    localStorage.setItem('depanne_users', JSON.stringify(users));
                                }
                            }
                            
                            if (validAccount.role === 'Admin') {
                                btnText.textContent = "Redirection...";
                                sessionStorage.setItem('admin_logged_in', 'true');
                                setTimeout(() => { window.location.href = 'admin.html'; }, 600);
                            } else {
                                sessionStorage.setItem('client_auth_token', 'true');
                                sessionStorage.setItem('client_id', validAccount.id.toString());
                                sessionStorage.setItem('client_logged_in', 'true');
                                sessionStorage.setItem('client_name', fullUser ? fullUser.name : 'Client');
                                
                                alert("Bienvenue dans votre espace client !");
                                userLoginModal.classList.remove('active');
                                document.body.style.overflow = '';
                                updateAuthUI();
                                btnText.textContent = originalText;
                                submitBtn.style.opacity = '1';
                            }
                        }
                    } catch (err) {
                        console.error("Erreur de connexion fallback :", err);
                        userLoginError.classList.remove('hidden');
                        userLoginError.textContent = "Identifiants incorrects ou erreur réseau.";
                        btnText.textContent = originalText;
                        submitBtn.style.opacity = '1';
                    }
                }
            });
        }
        
        // --- Client Registration Modal Logic (Interception) ---
        const clientRegistrationModal = document.getElementById('clientRegistrationModal');
        const closeClientRegModalBtn = document.getElementById('closeClientRegModalBtn');
        const clientRegistrationForm = document.getElementById('clientRegistrationForm');
        const switchToLoginBtn = document.getElementById('switchToLoginBtn');
        
        if (clientRegistrationModal && closeClientRegModalBtn) {
            closeClientRegModalBtn.addEventListener('click', () => {
                clientRegistrationModal.classList.remove('active');
                document.body.style.overflow = '';
            });
            clientRegistrationModal.addEventListener('click', (e) => {
                if (e.target === clientRegistrationModal) {
                    clientRegistrationModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clientRegistrationModal.classList.remove('active');
                if (userLoginModal) {
                    userLoginModal.classList.add('active');
                }
            });
        }
        
        const switchToClientRegBtn = document.getElementById('switchToClientRegBtn');
        if (switchToClientRegBtn) {
            switchToClientRegBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (userLoginModal) userLoginModal.classList.remove('active');
                clientRegistrationModal.classList.add('active');
            });
        }
        
        if (clientRegistrationForm) {
            clientRegistrationForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newClient = {
                    id: Date.now(),
                    name: document.getElementById('clientRegName').value.trim(),
                    contact: document.getElementById('clientRegPhone').value.trim(),
                    email: document.getElementById('clientRegEmail').value.trim(),
                    password: document.getElementById('clientRegPass').value,
                    role: 'Client',
                    status: 'Actif',
                    dateJoined: new Date().toLocaleDateString('fr-FR')
                };
                
                let depanne_users = JSON.parse(localStorage.getItem('depanne_users')) || [];
                depanne_users.push(newClient);
                localStorage.setItem('depanne_users', JSON.stringify(depanne_users));
                
                let error = null;
                if (window.db) {
                    const { error: dbError } = await window.db.from('users').insert([{
                        id: newClient.id,
                        name: newClient.name,
                        phone: newClient.contact,
                        password: newClient.password,
                        role: newClient.role,
                        status: newClient.status,
                        dateJoined: newClient.dateJoined
                    }]);
                    error = dbError;
                }
                
                if (error) {
                    console.error("Erreur création client :", error);
                    alert("Erreur lors de la création de votre compte.");
                    return;
                }
                
                sessionStorage.setItem('client_logged_in', 'true');
                sessionStorage.setItem('client_name', newClient.name);
                clientRegistrationModal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Mettre à jour UI
                updateAuthUI();
                
                const loginBtn = document.getElementById('openUserLoginModalBtn');
                if (loginBtn) {
                    loginBtn.onclick = (ev) => {
                        if (sessionStorage.getItem('client_logged_in') === 'true') {
                            ev.preventDefault();
                            alert("Votre profil artisan/client sera bientôt disponible.");
                        }
                    };
                }
                
                // Reprendre l'action de contact en attente
                const pendingLink = sessionStorage.getItem('pending_contact_link');
                if (pendingLink) {
                    sessionStorage.removeItem('pending_contact_link');
                    window.location.href = pendingLink;
                } else {
                    alert("Compte Client créé avec succès ! Vous pouvez maintenant contacter nos ouvriers.");
                }
            });
        }

        // Simulate Account Creation and Activation
        const workerForm = registrationModal.querySelector('.registration-form');
        if (workerForm) {
            
            // --- Audio Recording Logic ---
            let mediaRecorder;
            let audioChunks = [];
            let currentAudioBase64 = null;
            let recordingTimerInterval;
            let secondsRecorded = 0;

            const recordAudioBtn = document.getElementById('recordAudioBtn');
            const stopAudioBtn = document.getElementById('stopAudioBtn');
            const recordingTimer = document.getElementById('recordingTimer');
            const audioPlayback = document.getElementById('audioPlayback');

            if (recordAudioBtn && stopAudioBtn) {
                recordAudioBtn.addEventListener('click', async () => {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];

                        mediaRecorder.addEventListener("dataavailable", event => {
                            audioChunks.push(event.data);
                        });

                        mediaRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            const audioUrl = URL.createObjectURL(audioBlob);
                            audioPlayback.src = audioUrl;
                            audioPlayback.style.display = 'block';

                            // Convert to Base64 for localStorage
                            const reader = new FileReader();
                            reader.readAsDataURL(audioBlob);
                            reader.onloadend = () => {
                                currentAudioBase64 = reader.result;
                            };

                            // Stop tracks to release mic
                            stream.getTracks().forEach(track => track.stop());
                        });

                        mediaRecorder.start();
                        
                        recordAudioBtn.style.display = 'none';
                        stopAudioBtn.style.display = 'inline-block';
                        recordingTimer.style.display = 'inline-block';
                        
                        secondsRecorded = 0;
                        recordingTimer.textContent = "00:00";
                        recordingTimerInterval = setInterval(() => {
                            secondsRecorded++;
                            let m = Math.floor(secondsRecorded / 60).toString().padStart(2, '0');
                            let s = (secondsRecorded % 60).toString().padStart(2, '0');
                            recordingTimer.textContent = `${m}:${s}`;
                            
                            // Auto stop at 30 seconds
                            if (secondsRecorded >= 30) {
                                stopAudioBtn.click();
                            }
                        }, 1000);

                    } catch (err) {
                        alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès.");
                        console.error(err);
                    }
                });

                stopAudioBtn.addEventListener('click', () => {
                    if (mediaRecorder && mediaRecorder.state !== "inactive") {
                        mediaRecorder.stop();
                    }
                    clearInterval(recordingTimerInterval);
                    stopAudioBtn.style.display = 'none';
                    recordAudioBtn.style.display = 'inline-block';
                    recordAudioBtn.textContent = "🔴 Réenregistrer";
                    recordingTimer.style.display = 'none';
                });
            }
            // --- End Audio Recording Logic ---

            // Payment Logic Variables
            let pendingWorkerData = null;
            const paymentModal = document.getElementById('paymentModal');
            const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
            const paymentAmountText = document.getElementById('paymentAmountText');
            const paymentOptions = document.getElementById('paymentOptions');
            const paymentProcessing = document.getElementById('paymentProcessing');
            const paymentStatusText = document.getElementById('paymentStatusText');

            // Geolocation logic was removed in favor of automatic geocoding on submit.

            workerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtnText = document.getElementById('modalSubmitBtnText');
                const originalBtnText = submitBtnText.textContent;
                
                // Déterminer la formule choisie dynamiquement
                const savedPlan = workerForm.getAttribute('data-current-plan');
                let selectedPlan = "Standard";
                if (savedPlan === 'premium') selectedPlan = "Premium";
                if (savedPlan === 'essai') selectedPlan = "Essai";
                
                let planPrice = parseInt(workerForm.getAttribute('data-current-price')) || 0;

                // Geocoding automatique basé sur la région et le quartier
                const region = document.getElementById('regRegion').value;
                const area = document.getElementById('regArea').value;
                let lat = null;
                let lon = null;
                
                submitBtnText.textContent = "Recherche localisation...";
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(area + ', ' + region + ', Senegal')}&format=json&limit=1`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                    } else {
                        // Fallback sur la région seule
                        const fallback = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region + ', Senegal')}&format=json&limit=1`);
                        const fallbackData = await fallback.json();
                        if (fallbackData && fallbackData.length > 0) {
                            lat = parseFloat(fallbackData[0].lat);
                            lon = parseFloat(fallbackData[0].lon);
                        }
                    }
                } catch (e) {
                    console.error("Geocoding failed", e);
                }
                
                submitBtnText.textContent = originalBtnText;

                pendingWorkerData = {
                    id: Date.now(),
                    name: document.getElementById('regName').value,
                    password: document.getElementById('regPassword') ? document.getElementById('regPassword').value : '123456',
                    phone: document.getElementById('regPhone').value,
                    job: document.getElementById('regJob').value,
                    zone: `${region} / ${area}`,
                    latitude: lat,
                    longitude: lon,
                    description: document.getElementById('regDescription') ? document.getElementById('regDescription').value : '',
                    audioDescription: currentAudioBase64,
                    profilePhoto: document.getElementById('profilePhotoPreview') ? document.getElementById('profilePhotoPreview').src : '',
                    plan: selectedPlan,
                    price: planPrice,
                    status: 'Actif',
                    date: new Date().toLocaleDateString('fr-FR')
                };

                // Si c'est l'essai gratuit, pas de paiement
                if (planPrice === 0) {
                    await finalizeRegistration("Compte créé avec succès (Supabase) ! Votre essai gratuit est activé.");
                } else {
                    // Cacher modal inscription et afficher modal paiement
                    registrationModal.classList.remove('active');
                    
                    paymentAmountText.textContent = `Montant à payer : ${new Intl.NumberFormat('fr-FR').format(planPrice).replace(/,/g, ' ')} FCFA`;
                    paymentOptions.style.display = 'flex';
                    paymentProcessing.style.display = 'none';
                    
                    paymentModal.classList.add('active');
                }
            });

            async function finalizeRegistration(message) {
                let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                workers.push(pendingWorkerData);
                localStorage.setItem('depanne_workers', JSON.stringify(workers));
                
                let error = null;
                if (window.db) {
                    const { error: dbError } = await window.db.from('workers').insert([pendingWorkerData]);
                    error = dbError;
                }
                if (error) {
                    console.error("Erreur d'inscription :", error);
                    alert("Une erreur est survenue lors de l'enregistrement de vos données.");
                    return;
                }
                
                // Connexion automatique de l'artisan
                sessionStorage.setItem('artisan_auth_token', 'true');
                sessionStorage.setItem('artisan_id', pendingWorkerData.id.toString());
                
                alert(message);
                
                // Redirection automatique vers le reçu si ce n'est pas un essai gratuit
                if (pendingWorkerData.plan && pendingWorkerData.plan !== "Essai") {
                    window.open(`facture.html?id=${pendingWorkerData.id}`, '_blank');
                }
                
                workerForm.reset();
                if (paymentModal) paymentModal.classList.remove('active');
                if (registrationModal) registrationModal.classList.remove('active');
                document.body.style.overflow = '';
            }

            // Gestion du paiement Wave/OM
            if (paymentModal) {
                const payWaveBtn = document.getElementById('payWaveBtn');
                const payOmBtn = document.getElementById('payOmBtn');

                const processPayment = async (provider) => {
                    if (pendingWorkerData) {
                        pendingWorkerData.paymentMethod = provider;
                        
                        const fakeIp = `102.164.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                        pendingWorkerData.ipLocation = `${fakeIp} - ${pendingWorkerData.zone || 'Localisation inconnue'}`;
                        
                        sessionStorage.setItem('pendingWorkerData', JSON.stringify(pendingWorkerData));
                    }
                    paymentOptions.style.display = 'none';
                    paymentProcessing.style.display = 'block';
                    paymentStatusText.textContent = `Connexion sécurisée à PayDunya (${provider})...`;
                    
                    if (window.PaydunyaService) {
                        // Utilisation du nouveau Skill PayDunya
                        const result = await window.PaydunyaService.initPayment(pendingWorkerData);
                        
                        if (result.success) {
                            paymentStatusText.textContent = "Paiement validé par l'opérateur ! Finalisation...";
                            
                            // Enregistrement dans la DB après validation du paiement
                            let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                            workers.push(pendingWorkerData);
                            localStorage.setItem('depanne_workers', JSON.stringify(workers));
                            
                            if (window.db) {
                                const { error: dbError } = await window.db.from('workers').insert([pendingWorkerData]);
                                if (dbError) console.error("Erreur d'insertion:", dbError);
                            }
                            
                            sessionStorage.setItem('artisan_auth_token', 'true');
                            sessionStorage.setItem('artisan_id', pendingWorkerData.id.toString());
                            
                            setTimeout(() => {
                                window.location.href = result.paymentUrl;
                            }, 1000);
                        } else {
                            alert("Erreur lors de l'initialisation du paiement: " + result.error);
                            paymentOptions.style.display = 'flex';
                            paymentProcessing.style.display = 'none';
                        }
                    }
                };

                if (payWaveBtn) payWaveBtn.addEventListener('click', () => processPayment('Wave'));
                if (payOmBtn) payOmBtn.addEventListener('click', () => processPayment('Orange Money'));

                closePaymentModalBtn.addEventListener('click', () => {
                    paymentModal.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
        }
    }

    // 5. Login Modal Logic (Client/Ouvrier)
    const openLoginModalBtn = document.getElementById('openLoginModalBtn');
    const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
    const loginModal = document.getElementById('loginModal');

    if (openLoginModalBtn && closeLoginModalBtn && loginModal) {
        openLoginModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeLoginModalBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Vraie connexion via Supabase (Artisans uniquement pour l'instant) - DESACTIVEE CAR CONFLICTUELLE
        /* const userLoginFormSupabase = document.getElementById('userLoginForm');
        if (userLoginFormSupabase) {
            // Logique de connexion commentée pour forcer l'usage du localStorage selon les règles du projet
        } */
    }

    // 6. Search Logic
    const searchJob = document.getElementById('searchJob');
    const searchLoc = document.getElementById('searchLoc');
    const mainSearchBtn = document.getElementById('mainSearchBtn');
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const searchResultsModal = document.getElementById('searchResultsModal');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    const searchResultsList = document.getElementById('searchResultsList');
    const searchQueryText = document.getElementById('searchQueryText');

    // --- RECHERCHE VOCALE ---
    if (voiceSearchBtn && searchJob) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'fr-FR';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            voiceSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                voiceSearchBtn.style.transform = 'scale(1.2)';
                voiceSearchBtn.style.color = '#e74c3c';
                searchJob.placeholder = "Écoute en cours...";
                searchJob.value = "";
                
                try {
                    recognition.start();
                } catch(err) {}
            });

            recognition.addEventListener('result', (e) => {
                const transcript = e.results[0][0].transcript;
                searchJob.value = transcript;
                searchJob.placeholder = "Ex: Plombier, Électricien";
                voiceSearchBtn.style.transform = 'scale(1)';
                voiceSearchBtn.style.color = 'var(--color-primary-light)';
                
                // Déclencher automatiquement la recherche après une recherche vocale
                if (mainSearchBtn) mainSearchBtn.click();
            });

            recognition.addEventListener('speechend', () => {
                recognition.stop();
                voiceSearchBtn.style.transform = 'scale(1)';
                voiceSearchBtn.style.color = 'var(--color-primary-light)';
                searchJob.placeholder = "Ex: Plombier, Électricien";
            });

            recognition.addEventListener('error', (e) => {
                console.error("Erreur vocale :", e.error);
                voiceSearchBtn.style.transform = 'scale(1)';
                voiceSearchBtn.style.color = 'var(--color-primary-light)';
                searchJob.placeholder = "Erreur micro. Tapez votre recherche.";
            });
        } else {
            voiceSearchBtn.style.display = 'none';
        }
    }

    // --- RECHERCHE INTELLIGENTE (Fuzzy Search & Levenshtein) ---
    function levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                                 matrix[i - 1][j] + 1) // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function normalizeString(str) {
        if (!str) return "";
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\w\s]/gi, '');
    }

    function smartMatch(query, targetJob) {
        if (!query || query.trim() === '') return true;
        
        const normQuery = normalizeString(query);
        const normJob = normalizeString(targetJob);
        
        if (normJob.includes(normQuery) || normQuery.includes(normJob)) return true;
        
        // Séparer la phrase en mots-clés et ignorer les mots trop courts
        const queryWords = normQuery.split(' ').filter(w => w.length > 3);
        const jobWords = normJob.split(' ').filter(w => w.length > 2);
        
        for (let qw of queryWords) {
            for (let jw of jobWords) {
                const distance = levenshteinDistance(qw, jw);
                // Tolérer plus d'erreurs pour les mots plus longs (ex: 1 faute tolérée par 3 lettres)
                const maxErrors = Math.floor(jw.length / 3); 
                if (distance <= maxErrors) {
                    return true;
                }
            }
        }
        return false;
    }

    if (mainSearchBtn && searchResultsModal) {
        mainSearchBtn.addEventListener('click', async () => {
            const isClientLoggedIn = sessionStorage.getItem('client_logged_in') === 'true';
            
            if (!isClientLoggedIn) {
                // S'ils ne sont pas connectés, on ouvre la modale d'inscription client
                const clientRegModal = document.getElementById('clientRegistrationModal');
                if (clientRegModal) {
                    clientRegModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                return; // On arrête l'exécution de la recherche
            }

            const job = searchJob ? searchJob.value.trim() : '';
            const loc = searchLoc ? searchLoc.value.trim() : '';
            
            const btnText = mainSearchBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = "Recherche en cours...";
            
            try {
                // Récupération depuis Supabase
                let allWorkers = [];
                if (window.db) {
                    const { data, error } = await window.db.from('workers').select('*');
                    if (error) {
                        console.error("Erreur de récupération Supabase:", error);
                        allWorkers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                    } else {
                        allWorkers = data || [];
                        localStorage.setItem('depanne_workers', JSON.stringify(allWorkers));
                    }
                } else {
                    allWorkers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                }
                
                btnText.textContent = originalText;
                
                let queryLabel = [];
                if (job) queryLabel.push(job);
                if (loc) queryLabel.push(loc);
                searchQueryText.textContent = queryLabel.length > 0 ? `Résultats pour : ${queryLabel.join(' - ')}` : "Tous les artisans à proximité";
                
                // Filtrage intelligent
                const filtered = allWorkers.filter(w => {
                    const matchJob = smartMatch(job, w.job);
                    const matchLoc = loc === '' || (w.zone && w.zone.toLowerCase().includes(loc.toLowerCase()));
                    return matchJob && matchLoc;
                });

                searchResultsList.innerHTML = '';
                
                if (filtered.length === 0) {
                    searchResultsList.innerHTML = '<p style="text-align:center; color: var(--color-text-light); padding: 20px;">Aucun artisan trouvé pour ces critères. Essayez une autre région ou profession.</p>';
                } else {
                    filtered.forEach(w => {
                        const badgeStyle = w.plan === 'Premium' ? 'background: rgba(58, 134, 255, 0.1); color: var(--color-primary-light); padding: 4px 10px; border-radius: 12px; font-weight: 600;' : 'background: rgba(141, 153, 174, 0.1); color: var(--color-text-light); padding: 4px 10px; border-radius: 12px; font-weight: 600;';
                        
                        // Liens de contact
                        const phoneClean = w.phone ? w.phone.replace(/[^0-9+]/g, '') : '';
                        const waLink = `https://wa.me/${phoneClean.replace('+', '')}?text=${encodeURIComponent(`Bonjour ${w.name}, j'ai trouvé votre profil sur Dépanne Moi et j'ai besoin de vos services pour...`)}`;
                        const callLink = `tel:${phoneClean}`;
                        
                        // Enregistrer la vue du profil (simulation de trafic local)
                        let stats = JSON.parse(localStorage.getItem('depanne_worker_stats')) || {};
                        if (!stats[w.id]) stats[w.id] = { views: 0, wa: 0, calls: 0 };
                        stats[w.id].views++;
                        localStorage.setItem('depanne_worker_stats', JSON.stringify(stats));
                        
                        searchResultsList.innerHTML += `
                            <div class="glass-panel" style="padding: 15px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.4s ease; background: rgba(255,255,255,0.85);">
                                <div style="text-align: left;">
                                    <h4 style="margin-bottom: 5px; color: var(--color-primary); font-family: var(--font-heading); font-size: 1.1rem;">${w.name}</h4>
                                    <p style="font-size: 0.85rem; color: var(--color-text-light); margin-bottom: 5px;">🛠 ${w.job} • 📍 ${w.zone}</p>
                                    <div class="distance-badge" data-lat="${w.latitude || ''}" data-lng="${w.longitude || ''}" style="display: inline-block; font-size: 0.8rem; background: rgba(0,0,0,0.05); padding: 3px 8px; border-radius: 4px; color: #555;">
                                        ${w.latitude ? '📍 Distance en calcul...' : '📍 Position exacte non renseignée'}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <span style="${badgeStyle}">${w.plan}</span><br>
                                    <div style="margin-top: 10px; display: flex; gap: 5px; justify-content: flex-end;">
                                        <a href="#" class="btn magnetic review-worker-btn" data-id="${w.id}" data-name="${w.name}" style="padding: 6px 10px; font-size: 0.75rem; background: #f39c12; color: white; border-radius: 8px; border: none; text-decoration: none; box-shadow: 0 4px 10px rgba(243, 156, 18, 0.2);">⭐ Évaluer</a>
                                        <a href="#" data-id="${w.id}" data-link="${waLink}" class="btn magnetic solicit-worker-btn" style="padding: 6px 10px; font-size: 0.75rem; background: #25D366; color: white; border-radius: 8px; border: none; text-decoration: none; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);">💬 WA</a>
                                        <a href="#" data-id="${w.id}" data-link="${callLink}" class="btn magnetic solicit-worker-btn" style="padding: 6px 10px; font-size: 0.75rem; background: var(--color-primary); color: white; border-radius: 8px; border: none; text-decoration: none; box-shadow: 0 4px 10px rgba(26, 86, 123, 0.2);">📞 Appel</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }

                searchResultsModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Calcul de distance si le visiteur autorise la localisation
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const visitorLat = position.coords.latitude;
                        const visitorLng = position.coords.longitude;
                        
                        const distanceBadges = document.querySelectorAll('.distance-badge');
                        distanceBadges.forEach(badge => {
                            const artisanLat = parseFloat(badge.getAttribute('data-lat'));
                            const artisanLng = parseFloat(badge.getAttribute('data-lng'));
                            
                            if (artisanLat && artisanLng) {
                                // Formule de Haversine
                                const R = 6371; // Rayon de la terre en km
                                const dLat = (artisanLat - visitorLat) * Math.PI / 180;
                                const dLon = (artisanLng - visitorLng) * Math.PI / 180;
                                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                          Math.cos(visitorLat * Math.PI / 180) * Math.cos(artisanLat * Math.PI / 180) * 
                                          Math.sin(dLon/2) * Math.sin(dLon/2);
                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                const distanceKm = (R * c).toFixed(1);
                                
                                // Estimation du temps (vitesse moyenne en ville : 30 km/h)
                                const timeMin = Math.round((distanceKm / 30) * 60);
                                
                                badge.innerHTML = `<span style="color: #2ecc71; font-weight: bold;">📍 À ${distanceKm} km</span> (env. ${timeMin} min en voiture)`;
                                badge.style.background = 'rgba(46, 204, 113, 0.1)';
                            }
                        });
                    }, (error) => {
                        console.warn("Localisation visiteur refusée ou indisponible.");
                        const distanceBadges = document.querySelectorAll('.distance-badge');
                        distanceBadges.forEach(badge => {
                            if (badge.getAttribute('data-lat')) {
                                badge.innerHTML = `📍 Autorisez la localisation pour voir la distance`;
                            }
                        });
                    });
                }
                
                const solicitBtns = document.querySelectorAll('.solicit-worker-btn');
                solicitBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const isClientLoggedIn = sessionStorage.getItem('client_logged_in') === 'true';
                        const targetLink = btn.getAttribute('data-link');
                        const artisanId = btn.getAttribute('data-id');
                        
                        // Enregistrer le clic (WA ou Appel)
                        if (artisanId) {
                            let stats = JSON.parse(localStorage.getItem('depanne_worker_stats')) || {};
                            if (!stats[artisanId]) stats[artisanId] = { views: 0, wa: 0, calls: 0 };
                            if (targetLink.includes('wa.me')) stats[artisanId].wa++;
                            else if (targetLink.includes('tel:')) stats[artisanId].calls++;
                            localStorage.setItem('depanne_worker_stats', JSON.stringify(stats));
                        }
                        
                        if (isClientLoggedIn) {
                            if (targetLink.includes('wa.me')) {
                                const wantsToShareLoc = confirm("Voulez-vous partager votre position GPS avec l'artisan pour faciliter son arrivée ?");
                                if (wantsToShareLoc && "geolocation" in navigator) {
                                    navigator.geolocation.getCurrentPosition((position) => {
                                        const lat = position.coords.latitude;
                                        const lng = position.coords.longitude;
                                        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                                        const newLink = targetLink + encodeURIComponent(`\n\n📍 Ma position actuelle : ${mapsLink}`);
                                        window.open(newLink, '_blank');
                                    }, (error) => {
                                        alert("Impossible de récupérer la position. Envoi du message sans la localisation.");
                                        window.open(targetLink, '_blank');
                                    });
                                } else {
                                    window.open(targetLink, '_blank');
                                }
                            } else {
                                window.location.href = targetLink;
                            }
                        } else {
                            // Mémoriser le lien pour y aller juste après la connexion/inscription
                            sessionStorage.setItem('pending_contact_link', targetLink);
                            
                            // Ouvrir la modale d'inscription client (et fermer celle des résultats)
                            searchResultsModal.classList.remove('active');
                            const clientRegModal = document.getElementById('clientRegistrationModal');
                            if (clientRegModal) {
                                clientRegModal.classList.add('active');
                            }
                        }
                    });
                });
                
                // Attacher les écouteurs pour les boutons "Évaluer"
                const reviewBtns = document.querySelectorAll('.review-worker-btn');
                const reviewModal = document.getElementById('reviewModal');
                
                reviewBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const isClientLoggedIn = sessionStorage.getItem('client_logged_in') === 'true';
                        
                        if (!isClientLoggedIn) {
                            alert("Vous devez être connecté en tant que client pour laisser un avis.");
                            searchResultsModal.classList.remove('active');
                            const clientRegModal = document.getElementById('clientRegistrationModal');
                            if (clientRegModal) clientRegModal.classList.add('active');
                            return;
                        }
                        
                        const artisanId = btn.getAttribute('data-id');
                        const artisanName = btn.getAttribute('data-name');
                        
                        const revIdInput = document.getElementById('reviewArtisanId');
                        const revNameInput = document.getElementById('reviewArtisanNameInput');
                        const revNameText = document.getElementById('reviewArtisanName');
                        
                        if (revIdInput) revIdInput.value = artisanId;
                        if (revNameInput) revNameInput.value = artisanName;
                        if (revNameText) revNameText.textContent = artisanName;
                        
                        searchResultsModal.classList.remove('active');
                        if (reviewModal) reviewModal.classList.add('active');
                    });
                });
            } catch (err) {
                console.error("Erreur générale lors de la recherche :", err);
                btnText.textContent = originalText;
                searchResultsList.innerHTML = '<p style="text-align:center; color: #e74c3c; padding: 20px;">Erreur de connexion à la base de données. Veuillez réessayer.</p>';
                searchResultsModal.classList.add('active');
            }
        });

        closeSearchModalBtn.addEventListener('click', () => {
            searchResultsModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        searchResultsModal.addEventListener('click', (e) => {
            if (e.target === searchResultsModal) {
                searchResultsModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Client Forgot Password Logic (index.html)
    const openForgotPassClientBtn = document.getElementById('openForgotPassClientBtn');
    const closeForgotPassClientBtn = document.getElementById('closeForgotPassClientBtn');
    const forgotPassClientModal = document.getElementById('forgotPassClientModal');
    const forgotPassClientForm = document.getElementById('forgotPassClientForm');
    const forgotPassClientSuccess = document.getElementById('forgotPassClientSuccess');
    const forgotPassClientSubmitBtn = document.getElementById('forgotPassClientSubmitBtn');

    if (openForgotPassClientBtn && forgotPassClientModal) {
        openForgotPassClientBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Close login modal if open
            if(loginModal) loginModal.classList.remove('active');
            
            // Open forgot password modal
            forgotPassClientModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeForgotPassClientBtn && forgotPassClientModal) {
        closeForgotPassClientBtn.addEventListener('click', () => {
            forgotPassClientModal.classList.remove('active');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                if(forgotPassClientForm) forgotPassClientForm.reset();
                if(forgotPassClientSuccess) {
                    forgotPassClientSuccess.style.display = 'none';
                    forgotPassClientSuccess.textContent = '';
                }
                if(forgotPassClientSubmitBtn) forgotPassClientSubmitBtn.style.display = 'block';
            }, 300);
        });
    }

    if (forgotPassClientForm) {
        forgotPassClientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const contact = document.getElementById('forgotClientContact').value;
            if (!contact) return;

            // Simuler l'envoi d'un email/SMS
            forgotPassClientSubmitBtn.style.display = 'none';
            forgotPassClientSuccess.textContent = "Recherche de vos informations...";
            forgotPassClientSuccess.style.display = 'block';

            setTimeout(() => {
                forgotPassClientSuccess.innerHTML = `✅ Si <strong>${contact}</strong> correspond à un compte actif, un lien de réinitialisation vous a été envoyé.<br><br>Veuillez vérifier vos messages.`;
                
                setTimeout(() => {
                    if (closeForgotPassClientBtn) closeForgotPassClientBtn.click();
                }, 4000); // Fermeture automatique après 4s
            }, 1500);
        });
    }

    // 7. Review Modal Logic
    const mainReviewModal = document.getElementById('reviewModal');
    const mainCloseReviewModalBtn = document.getElementById('closeReviewModalBtn');
    const starRatingSpans = document.querySelectorAll('#starRating span');
    const reviewScoreInput = document.getElementById('reviewScore');
    const reviewForm = document.getElementById('reviewForm');
    const ratingProgressBar = document.getElementById('ratingProgressBar');
    const ratingText = document.getElementById('ratingText');
    
    if (mainReviewModal && mainCloseReviewModalBtn) {
        mainCloseReviewModalBtn.addEventListener('click', () => {
            mainReviewModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        mainReviewModal.addEventListener('click', (e) => {
            if (e.target === mainReviewModal) {
                mainReviewModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    if (starRatingSpans.length > 0) {
        starRatingSpans.forEach(star => {
            star.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-value'));
                reviewScoreInput.value = value;
                
                // Colorize stars
                starRatingSpans.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= value) {
                        s.style.color = '#f1c40f'; // Yellow
                    } else {
                        s.style.color = '#bdc3c7'; // Gray
                    }
                });
                
                // Update Progress Bar
                if (ratingProgressBar && ratingText) {
                    const percentage = (value / 5) * 100;
                    ratingProgressBar.style.width = percentage + '%';
                    if (value >= 4) {
                        ratingProgressBar.style.background = '#2ecc71'; // Green
                        ratingText.textContent = "Satisfaisant";
                        ratingText.style.color = '#2ecc71';
                    } else if (value >= 2) {
                        ratingProgressBar.style.background = '#f39c12'; // Orange
                        ratingText.textContent = "Moyen";
                        ratingText.style.color = '#f39c12';
                    } else {
                        ratingProgressBar.style.background = '#e74c3c'; // Red
                        ratingText.textContent = "Médiocre";
                        ratingText.style.color = '#e74c3c';
                    }
                }
            });
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const score = parseInt(reviewScoreInput.value);
            if (score === 0) {
                alert("Veuillez sélectionner au moins une étoile.");
                return;
            }
            
            const artisanId = document.getElementById('reviewArtisanId').value;
            const artisanName = document.getElementById('reviewArtisanNameInput').value;
            const comment = document.getElementById('reviewComment').value.trim();
            const clientName = sessionStorage.getItem('client_name') || 'Client Anonyme';
            
            const newReview = {
                id: Date.now(),
                artisanId: artisanId,
                artisanName: artisanName,
                clientName: clientName,
                rating: score,
                comment: comment,
                date: new Date().toLocaleDateString('fr-FR')
            };
            
            let reviews = JSON.parse(localStorage.getItem('depanne_reviews')) || [];
            reviews.push(newReview);
            localStorage.setItem('depanne_reviews', JSON.stringify(reviews));
            
            mainReviewModal.classList.remove('active');
            document.body.style.overflow = '';
            alert("Merci ! Votre avis a bien été enregistré.");
            
            // Reset Form
            reviewForm.reset();
            reviewScoreInput.value = 0;
            starRatingSpans.forEach(s => s.style.color = '#bdc3c7');
            if (ratingProgressBar && ratingText) {
                ratingProgressBar.style.width = '0%';
                ratingText.textContent = "Veuillez donner une note";
                ratingText.style.color = 'var(--color-text-light)';
            }
        });
    }

    // --- Footer Modals Logic ---
    const openLegalBtn = document.getElementById('openLegalModalBtn');
    const openTermsBtn = document.getElementById('openTermsModalBtn');
    const legalModal = document.getElementById('legalModal');
    const termsModal = document.getElementById('termsModal');
    const closeLegalBtn = document.getElementById('closeLegalModalBtn');
    const closeTermsBtn = document.getElementById('closeTermsModalBtn');

    if (openLegalBtn && legalModal) {
        openLegalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            legalModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeLegalBtn && legalModal) {
        closeLegalBtn.addEventListener('click', () => {
            legalModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (openTermsBtn && termsModal) {
        openTermsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeTermsBtn && termsModal) {
        closeTermsBtn.addEventListener('click', () => {
            termsModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});

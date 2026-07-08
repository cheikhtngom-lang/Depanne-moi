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
            userLoginForm.addEventListener('submit', (e) => {
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
                    const contactField = (u.contact || u.phone || u.email || '').toString().trim().toLowerCase();
                    const inputLower = user.trim().toLowerCase();
                    
                    // Si l'utilisateur enregistré n'a ni nom ni contact valides, on l'ignore
                    if (!safeName && !contactField) return false;

                    const matchName = safeName === inputLower;
                    const matchContact = contactField === inputLower;
                    
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
                    userLoginError.classList.remove('hidden');
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
        
        if (clientRegistrationForm) {
            clientRegistrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newClient = {
                    id: Date.now(),
                    name: document.getElementById('clientRegName').value.trim(),
                    contact: document.getElementById('clientRegPhone').value.trim(),
                    address: document.getElementById('clientRegAddress').value.trim(),
                    password: document.getElementById('clientRegPass').value,
                    role: 'Client',
                    status: 'Actif',
                    dateJoined: new Date().toLocaleDateString('fr-FR')
                };
                
                let depanne_users = JSON.parse(localStorage.getItem('depanne_users')) || [];
                depanne_users.push(newClient);
                localStorage.setItem('depanne_users', JSON.stringify(depanne_users));
                
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

            workerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const submitBtnText = document.getElementById('modalSubmitBtnText');
                
                // Déterminer la formule choisie
                let selectedPlan = "Standard";
                let planPrice = 5000;
                if (submitBtnText.textContent.includes('8990')) {
                    selectedPlan = "Premium";
                    planPrice = 8990;
                } else if (submitBtnText.textContent.includes('Gratuit')) {
                    selectedPlan = "Essai";
                    planPrice = 0;
                }

                pendingWorkerData = {
                    id: Date.now(),
                    name: document.getElementById('regName').value,
                    password: document.getElementById('regPassword') ? document.getElementById('regPassword').value : '123456',
                    phone: document.getElementById('regPhone').value,
                    job: document.getElementById('regJob').value,
                    zone: `${document.getElementById('regRegion').value} / ${document.getElementById('regArea').value}`,
                    description: document.getElementById('regDescription') ? document.getElementById('regDescription').value : '',
                    audioDescription: currentAudioBase64,
                    plan: selectedPlan,
                    price: planPrice,
                    status: 'Actif',
                    date: new Date().toLocaleDateString('fr-FR')
                };

                // Si c'est l'essai gratuit, pas de paiement
                if (planPrice === 0) {
                    finalizeRegistration("Compte créé avec succès ! Votre essai gratuit est activé.");
                } else {
                    // Cacher modal inscription et afficher modal paiement
                    registrationModal.classList.remove('active');
                    
                    paymentAmountText.textContent = `Montant à payer : ${new Intl.NumberFormat('fr-FR').format(planPrice).replace(/,/g, ' ')} FCFA`;
                    paymentOptions.style.display = 'flex';
                    paymentProcessing.style.display = 'none';
                    
                    paymentModal.classList.add('active');
                }
            });

            // Fonction pour finaliser
            function finalizeRegistration(message) {
                let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                workers.push(pendingWorkerData);
                localStorage.setItem('depanne_workers', JSON.stringify(workers));
                
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
                        
                        // Simulation d'une IP et récupération de la zone
                        const fakeIp = `102.164.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                        pendingWorkerData.ipLocation = `${fakeIp} - ${pendingWorkerData.zone || 'Localisation inconnue'}`;
                        
                        // Sauvegarder les données temporaires dans sessionStorage pour les retrouver après la redirection
                        sessionStorage.setItem('pendingWorkerData', JSON.stringify(pendingWorkerData));
                    }
                    paymentOptions.style.display = 'none';
                    paymentProcessing.style.display = 'block';
                    paymentStatusText.textContent = `Initialisation du paiement via ${provider}...`;
                    
                    try {
                        const response = await fetch('http://localhost:5000/api/payments/initiate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: pendingWorkerData.name || 'Inconnu',
                                amount: pendingWorkerData.price || 5000,
                                provider: provider,
                                planType: pendingWorkerData.plan || 'Standard',
                                returnUrl: window.location.href.split('?')[0] // Envoyer l'URL courante exacte sans paramètres
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok && data.success) {
                            paymentStatusText.textContent = "Paiement en cours dans la nouvelle fenêtre...";
                            
                            // Ouvrir la page de paiement dans un nouvel onglet
                            window.open(data.paymentUrl, '_blank');
                            
                            // Démarrer la vérification régulière (polling) du statut du paiement
                            let pollCount = 0;
                            const pollInterval = setInterval(async () => {
                                try {
                                    const statusRes = await fetch(`http://localhost:5000/api/payments/status/${data.paymentId}`);
                                    const statusData = await statusRes.json();
                                    
                                    if (statusData.status === 'Success') {
                                        clearInterval(pollInterval);
                                        paymentStatusText.textContent = "Paiement validé ! Activation...";
                                        setTimeout(() => {
                                            let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                                            workers.push(pendingWorkerData);
                                            localStorage.setItem('depanne_workers', JSON.stringify(workers));
                                            
                                            alert("Paiement réussi ! Votre abonnement est activé.");
                                            window.open(`facture.html?id=${pendingWorkerData.id}`, '_blank');
                                            
                                            workerForm.reset();
                                            paymentModal.classList.remove('active');
                                            registrationModal.classList.remove('active');
                                            document.body.style.overflow = '';
                                        }, 1000);
                                    } else if (statusData.status === 'Failed') {
                                        clearInterval(pollInterval);
                                        paymentStatusText.textContent = "Le paiement a échoué.";
                                        paymentStatusText.style.color = "red";
                                        setTimeout(() => {
                                            paymentOptions.style.display = 'flex';
                                            paymentProcessing.style.display = 'none';
                                            paymentStatusText.style.color = "var(--color-primary)";
                                        }, 3000);
                                    }
                                    
                                    pollCount++;
                                    if (pollCount > 60) { // Timeout après 2 minutes (60 * 2s)
                                        clearInterval(pollInterval);
                                        paymentStatusText.textContent = "Délai d'attente dépassé.";
                                        paymentStatusText.style.color = "red";
                                        setTimeout(() => {
                                            paymentOptions.style.display = 'flex';
                                            paymentProcessing.style.display = 'none';
                                            paymentStatusText.style.color = "var(--color-primary)";
                                        }, 3000);
                                    }
                                } catch (e) {
                                    console.error("Erreur de vérification du statut", e);
                                }
                            }, 2000); // Vérifier toutes les 2 secondes

                        } else {
                            paymentStatusText.textContent = data.error || "Erreur d'initialisation.";
                            paymentStatusText.style.color = "red";
                            setTimeout(() => {
                                paymentOptions.style.display = 'flex';
                                paymentProcessing.style.display = 'none';
                                paymentStatusText.style.color = "var(--color-primary)";
                            }, 3000);
                        }
                    } catch (error) {
                        console.error('Erreur API Paiement:', error);
                        paymentStatusText.textContent = "Serveur inaccessible.";
                        paymentStatusText.style.color = "red";
                        setTimeout(() => {
                            paymentOptions.style.display = 'flex';
                            paymentProcessing.style.display = 'none';
                            paymentStatusText.style.color = "var(--color-primary)";
                        }, 3000);
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
        
        // Prevent form submission redirect for mockup
        const clientLoginForm = document.getElementById('clientLoginForm');
        if (clientLoginForm) {
            clientLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const now = Date.now();
                let rateLimit = JSON.parse(localStorage.getItem('login_rate_limit')) || { attempts: 0, firstAttempt: now, blockedUntil: null };
                const errorMsgDiv = document.getElementById('loginErrorMsg');

                function showError(msg) {
                    if (errorMsgDiv) {
                        errorMsgDiv.textContent = msg;
                        errorMsgDiv.style.display = 'block';
                    } else {
                        alert(msg);
                    }
                }

                // Vérifier si l'utilisateur est actuellement bloqué
                if (rateLimit.blockedUntil && now < rateLimit.blockedUntil) {
                    const remainingMinutes = Math.ceil((rateLimit.blockedUntil - now) / 60000);
                    showError(`Accès bloqué par sécurité. Veuillez réessayer dans ${remainingMinutes} minute(s).`);
                    return;
                }

                // Réinitialiser le compteur si la fenêtre de 2 minutes est dépassée et qu'on n'est pas bloqué
                if (!rateLimit.blockedUntil && (now - rateLimit.firstAttempt > 2 * 60 * 1000)) {
                    rateLimit = { attempts: 0, firstAttempt: now, blockedUntil: null };
                }

                // Simulation d'une vérification de mot de passe (le mot de passe correct est "admin123")
                const passwordInput = clientLoginForm.querySelector('input[type="password"]');
                const password = passwordInput ? passwordInput.value : '';

                if (password !== "admin123") {
                    rateLimit.attempts++;
                    if (rateLimit.attempts >= 5) {
                        rateLimit.blockedUntil = now + 10 * 60 * 1000; // Bloqué pour 10 minutes
                        localStorage.setItem('login_rate_limit', JSON.stringify(rateLimit));
                        showError(`Mot de passe incorrect. 5 tentatives échouées. Compte bloqué pour 10 minutes.`);
                    } else {
                        localStorage.setItem('login_rate_limit', JSON.stringify(rateLimit));
                        showError(`Mot de passe incorrect. Tentative ${rateLimit.attempts}/5. (Astuce : tapez 'admin123')`);
                    }
                    return;
                }

                // Succès : réinitialisation du compteur
                localStorage.removeItem('login_rate_limit');
                sessionStorage.setItem('artisan_auth_token', 'true');
                if (errorMsgDiv) errorMsgDiv.style.display = 'none';

                alert("Connexion réussie ! (Redirection en cours...)");
                loginModal.classList.remove('active');
                const submitBtn = clientLoginForm.querySelector('button[type="submit"]');
                const submitBtnText = submitBtn.querySelector('.btn-text') || submitBtn;
                const originalText = submitBtnText.textContent;
                
                submitBtnText.textContent = "Connexion...";
                submitBtn.style.opacity = '0.8';
                
                setTimeout(() => {
                    window.location.href = 'artisan.html';
                }, 1000);
            });
        }
    }

    // 6. Search Logic
    const searchJob = document.getElementById('searchJob');
    const searchLoc = document.getElementById('searchLoc');
    const mainSearchBtn = document.getElementById('mainSearchBtn');
    const searchResultsModal = document.getElementById('searchResultsModal');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    const searchResultsList = document.getElementById('searchResultsList');
    const searchQueryText = document.getElementById('searchQueryText');

    if (mainSearchBtn && searchResultsModal) {
        mainSearchBtn.addEventListener('click', () => {
            const job = searchJob ? searchJob.value.trim() : '';
            const loc = searchLoc ? searchLoc.value.trim() : '';
            
            const btnText = mainSearchBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = "Recherche en cours...";
            
            setTimeout(() => {
                btnText.textContent = originalText;
                
                let queryLabel = [];
                if (job) queryLabel.push(job);
                if (loc) queryLabel.push(loc);
                searchQueryText.textContent = queryLabel.length > 0 ? `Résultats pour : ${queryLabel.join(' - ')}` : "Tous les artisans à proximité";
                
                // Récupération des vrais inscrits
                const workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
                
                // Ajout de quelques faux profils pour que la recherche donne toujours un résultat
                const mockWorkers = [
                    { name: 'Mamadou Diop', job: 'Plombier', zone: 'Dakar / Almadies', plan: 'Premium', phone: '+221771234567' },
                    { name: 'Alioune Ndiaye', job: 'Électricien', zone: 'Thiès', plan: 'Standard', phone: '+221761234567' }
                ];
                
                const allWorkers = [...workers, ...mockWorkers];
                
                // Filtrage
                const filtered = allWorkers.filter(w => {
                    const matchJob = job === '' || w.job.toLowerCase().includes(job.toLowerCase());
                    const matchLoc = loc === '' || w.zone.toLowerCase().includes(loc.toLowerCase());
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
                        
                        searchResultsList.innerHTML += `
                            <div class="glass-panel" style="padding: 15px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.4s ease; background: rgba(255,255,255,0.85);">
                                <div style="text-align: left;">
                                    <h4 style="margin-bottom: 5px; color: var(--color-primary); font-family: var(--font-heading); font-size: 1.1rem;">${w.name}</h4>
                                    <p style="font-size: 0.85rem; color: var(--color-text-light);">🛠 ${w.job} • 📍 ${w.zone}</p>
                                </div>
                                <div style="text-align: right;">
                                    <span style="${badgeStyle}">${w.plan}</span><br>
                                    <div style="margin-top: 10px; display: flex; gap: 5px; justify-content: flex-end;">
                                        <a href="#" class="btn magnetic review-worker-btn" data-id="${w.id}" data-name="${w.name}" style="padding: 6px 10px; font-size: 0.75rem; background: #f39c12; color: white; border-radius: 8px; border: none; text-decoration: none; box-shadow: 0 4px 10px rgba(243, 156, 18, 0.2);">⭐ Évaluer</a>
                                        <a href="#" data-link="${waLink}" class="btn magnetic solicit-worker-btn" style="padding: 6px 10px; font-size: 0.75rem; background: #25D366; color: white; border-radius: 8px; border: none; text-decoration: none; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);">💬 WA</a>
                                        <a href="#" data-link="${callLink}" class="btn magnetic solicit-worker-btn" style="padding: 6px 10px; font-size: 0.75rem; background: var(--color-primary); color: white; border-radius: 8px; border: none; text-decoration: none; box-shadow: 0 4px 10px rgba(26, 86, 123, 0.2);">📞 Appel</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }

                searchResultsModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Attacher les écouteurs pour l'interception de contact
                const solicitBtns = document.querySelectorAll('.solicit-worker-btn');
                solicitBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const isClientLoggedIn = sessionStorage.getItem('client_logged_in') === 'true';
                        const targetLink = btn.getAttribute('data-link');
                        
                        if (isClientLoggedIn) {
                            if (targetLink.includes('wa.me')) {
                                window.open(targetLink, '_blank');
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
            }, 800);
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

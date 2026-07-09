document.addEventListener("DOMContentLoaded", () => {
    // 0. Login Logic (Basic Auth Protection)
    const loginForm = document.getElementById('adminLoginForm');
    const loginOverlay = document.getElementById('adminLoginOverlay');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginError = document.getElementById('loginError');

    // "Se souvenir de moi" - Pré-remplissage
    const adminUserInput = document.getElementById('adminUser');
    const adminPassInput = document.getElementById('adminPass');
    const rememberMeCheckbox = document.getElementById('adminRememberMe');
    
    if (adminUserInput && adminPassInput && rememberMeCheckbox) {
        const savedUser = localStorage.getItem('admin_saved_user');
        const savedPass = localStorage.getItem('admin_saved_pass');
        if (savedUser && savedPass) {
            adminUserInput.value = savedUser;
            adminPassInput.value = savedPass;
            rememberMeCheckbox.checked = true;
        }
    }

    // Vérification de session locale (Mitigation basique)
    const isAuthenticated = sessionStorage.getItem('admin_auth_token') === 'true';

    if (isAuthenticated && adminDashboard) {
        if(loginOverlay) loginOverlay.style.display = 'none';
        adminDashboard.style.display = 'grid';
    } else if(loginOverlay && adminDashboard) {
        loginOverlay.style.display = 'flex';
        adminDashboard.style.display = 'none';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // --- RATE LIMITING SUPPRIMÉ TEMPORAIREMENT ---
            localStorage.removeItem('admin_login_attempts'); // Force le déblocage
            // ----------------------------------------

            const user = document.getElementById('adminUser').value.trim();
            const pass = document.getElementById('adminPass').value;

            // Vérification des utilisateurs dans le localStorage
            let depanne_users = JSON.parse(localStorage.getItem('depanne_users')) || [];
            
            const validUser = depanne_users.find(u => {
                if (!u.name || !u.contact) return false;
                const matchName = u.name.toLowerCase() === user.toLowerCase();
                const matchContact = u.contact.toLowerCase() === user.toLowerCase();
                return (matchName || matchContact) && 
                       u.password === pass && 
                       u.status === 'Actif' &&
                       u.role === 'Admin';
            });

            // Identifiants: admin / admin123456 (par défaut) OU utilisateur valide
            if ((user === 'admin' && pass === 'admin123456') || validUser) {
                // Sauvegarde de la session
                sessionStorage.setItem('admin_auth_token', 'true');
                localStorage.removeItem('admin_login_attempts'); // Réinitialiser après succès
                
                // Se souvenir de moi
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    localStorage.setItem('admin_saved_user', user);
                    localStorage.setItem('admin_saved_pass', pass);
                } else {
                    localStorage.removeItem('admin_saved_user');
                    localStorage.removeItem('admin_saved_pass');
                }
                
                loginOverlay.classList.add('hidden-overlay');
                setTimeout(() => {
                    loginOverlay.style.display = 'none';
                    adminDashboard.style.display = 'grid'; // Layout principal
                }, 500);
            } else {
                loginError.textContent = `Identifiants incorrects.`;
                
                loginError.classList.remove('hidden');
            }
        });

        // Forgot Password Logic
        const openForgotPassBtn = document.getElementById('openForgotPassBtn');
        const closeForgotPassBtn = document.getElementById('closeForgotPassBtn');
        const forgotPassOverlay = document.getElementById('forgotPassOverlay');
        const forgotPassForm = document.getElementById('forgotPassForm');
        const forgotPassSuccess = document.getElementById('forgotPassSuccess');
        const forgotPassSubmitBtn = document.getElementById('forgotPassSubmitBtn');

        if (openForgotPassBtn && forgotPassOverlay) {
            openForgotPassBtn.addEventListener('click', (e) => {
                e.preventDefault();
                forgotPassOverlay.style.display = 'flex';
                setTimeout(() => forgotPassOverlay.classList.remove('hidden-overlay'), 50);
            });
        }

        if (closeForgotPassBtn && forgotPassOverlay) {
            closeForgotPassBtn.addEventListener('click', () => {
                forgotPassOverlay.classList.add('hidden-overlay');
                setTimeout(() => {
                    forgotPassOverlay.style.display = 'none';
                    if(forgotPassForm) forgotPassForm.reset();
                    if(forgotPassSuccess) {
                        forgotPassSuccess.classList.add('hidden');
                        forgotPassSuccess.textContent = '';
                    }
                    if(forgotPassSubmitBtn) forgotPassSubmitBtn.style.display = 'block';
                }, 300);
            });
        }

        if (forgotPassForm) {
            forgotPassForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const contact = document.getElementById('forgotContact').value;
                if (!contact) return;

                // Simuler l'envoi d'un email/SMS
                forgotPassSubmitBtn.style.display = 'none'; // Cacher le bouton pendant le "chargement"
                forgotPassSuccess.textContent = "Recherche de vos informations...";
                forgotPassSuccess.classList.remove('hidden');

                setTimeout(() => {
                    forgotPassSuccess.innerHTML = `✅ Si <strong>${contact}</strong> correspond à un compte actif, un lien de réinitialisation vous a été envoyé.<br><br>Veuillez vérifier vos messages.`;
                    
                    setTimeout(() => {
                        closeForgotPassBtn.click();
                    }, 4000); // Fermeture automatique après 4s
                }, 1500);
            });
        }

        // Logout Logic
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', () => {
                if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
                    // Suppression de la session
                    sessionStorage.removeItem('admin_auth_token');

                    // Réinitialise le formulaire
                    document.getElementById('adminLoginForm').reset();
                    loginError.classList.add('hidden');
                    
                    // Réaffiche la page de connexion
                    loginOverlay.style.display = 'flex';
                    setTimeout(() => {
                        loginOverlay.classList.remove('hidden-overlay');
                    }, 50);
                    
                    // Masque le dashboard
                    adminDashboard.style.display = 'none';
                }
            });
        }
    }

    // 1. Dynamic Data Loading from localStorage
    const adminWorkersTable = document.getElementById('adminWorkersTable');
    const adminBillingTable = document.getElementById('adminBillingTable');
    const adminHistoryTable = document.getElementById('adminHistoryTable');
    const statRevenue = document.getElementById('statRevenue');
    const statPremiumWorkers = document.getElementById('statPremiumWorkers');

    const adminStandardTable = document.getElementById('adminStandardTable');
    const adminPremiumTable = document.getElementById('adminPremiumTable');

    if (adminWorkersTable || adminBillingTable || adminHistoryTable || adminStandardTable || adminPremiumTable) {
        // Fonction d'échappement pour contrer les failles XSS
        const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
        
        async function loadAdminData() {
            try {
                const { data: workers, error } = await window.db.from('workers').select('*').order('id', { ascending: false });
                if (error) {
                    console.error("Erreur de chargement depuis Supabase:", error);
                    return;
                }
                
                let html = '';
                let billingHtml = '';
                let historyHtml = '';
                let standardHtml = '';
                let premiumHtml = '';
                let totalRevenue = 0;
                let premiumCount = 0;

                if (workers && workers.length > 0) {
                    workers.forEach(w => {
                const badgeClass = w.plan === "Premium" ? "premium" : "standard";
                
                // Nettoyage du numéro de téléphone (conserve uniquement les chiffres)
                const phoneClean = w.phone ? w.phone.replace(/[^0-9]/g, '') : '';
                // Message de facturation WhatsApp (TVA Incluse dans le total)
                const total = parseInt(w.price) || 0;
                const tva = Math.round(total * 0.18);
                const subtotal = total - tva;
                const invoiceDate = w.date || new Date().toLocaleDateString('fr-FR');
                const waMessage = `*Facture Bustane*\n\n*N° Facture :* INV-${w.id}\n*Date :* ${invoiceDate}\n\n*Facturé à :*\n${w.name}\nDakar, Sénégal\n\n*Détails :*\nAbonnement : Formule ${w.plan}\nDurée : 1 Mois\n\n*Résumé :*\nSous-total : ${subtotal} FCFA\nTVA (18%) : ${tva} FCFA\n*Total : ${total} FCFA*\n\n_Merci de votre confiance._`;

                const commonRowActions = `
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn profile" onclick="openAdminProfileModal(${w.id})" title="Voir le profil">👤</button>
                            <a href="facture.html?id=${w.id}" target="_blank" class="action-btn" title="Voir la facture" style="text-decoration: none;">📄</a>
                            <button class="action-btn delete" onclick="deleteWorker(${w.id}, this)" title="Supprimer cet abonné">🗑️</button>
                            <button class="action-btn reset" onclick="resetWorkerPassword(${w.id})" title="Réinitialiser Mot de passe">🔑</button>
                        </div>
                    </td>
                `;

                const workerRowHtml = `
                    <tr style="animation: fadeIn 0.5s ease;" data-date="${escapeHTML(w.date || '')}">
                        <td><strong>${escapeHTML(w.name)}</strong> <span style="font-size: 0.7rem; color: #2ecc71; margin-left: 5px;">(Nouveau)</span></td>
                        <td>${escapeHTML(w.job)}</td>
                        <td>${escapeHTML(w.zone)}</td>
                        <td><span class="badge ${badgeClass}">${w.plan}</span></td>
                        <td><span class="status active">Vérifié</span></td>
                        ${commonRowActions}
                    </tr>
                `;

                html += workerRowHtml;

                // Specific tables for standard and premium
                const planSpecificRowHtml = `
                    <tr style="animation: fadeIn 0.5s ease;" data-date="${escapeHTML(w.date || '')}">
                        <td><strong>${escapeHTML(w.name)}</strong></td>
                        <td>${escapeHTML(w.job)}</td>
                        <td>${escapeHTML(w.zone)}</td>
                        <td><span class="status active">Vérifié</span></td>
                        ${commonRowActions}
                    </tr>
                `;

                if (w.plan === 'Standard') {
                    standardHtml += planSpecificRowHtml;
                } else if (w.plan === 'Premium') {
                    premiumHtml += planSpecificRowHtml;
                }
                
                let paymentBg = w.paymentMethod === 'Orange Money' ? '#ff7900' : (w.paymentMethod === 'Wave' ? '#00a8ff' : '#95a5a6');
                let paymentMethodBadge = w.paymentMethod ? `<span class="badge" style="background:${paymentBg};">${escapeHTML(w.paymentMethod)}</span>` : `<span style="color:#bdc3c7;">-</span>`;

                billingHtml += `
                    <tr style="animation: fadeIn 0.5s ease;" data-date="${escapeHTML(w.date || '')}">
                        <td>${escapeHTML(w.date || 'Aujourd\'hui')}</td>
                        <td><strong>${escapeHTML(w.name)}</strong></td>
                        <td><span class="badge ${badgeClass}">${escapeHTML(w.plan)}</span></td>
                        <td>${w.price}</td>
                        <td>${paymentMethodBadge}</td>
                        <td><span class="status active">Payé</span></td>
                        <td>
                            <a href="https://wa.me/${phoneClean}?text=${encodeURIComponent(waMessage)}" target="_blank" class="btn btn-primary magnetic" style="padding: 8px 15px; font-size: 0.8rem; background: #25D366; color: white; border: none; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">
                                💬 Envoyer Reçu (WA)
                            </a>
                        </td>
                    </tr>
                `;
                historyHtml += `
                    <tr style="animation: fadeIn 0.5s ease;" data-date="${escapeHTML(w.date || '')}">
                        <td>${escapeHTML(w.date || 'Aujourd\'hui')}</td>
                        <td>${escapeHTML(w.name)} (Client)</td>
                        <td>Paiement</td>
                        <td>Abonnement ${escapeHTML(w.plan)} via ${escapeHTML(w.paymentMethod || 'Carte')}</td>
                        <td>${escapeHTML(w.ipLocation || 'Localisation inconnue')}</td>
                    </tr>
                `;

                totalRevenue += w.price;
                if(w.plan === "Premium") premiumCount++;
            });
            
            // On ajoute les nouvelles entrées au-dessus des fausses données
            if (adminWorkersTable) {
                adminWorkersTable.innerHTML = html + adminWorkersTable.innerHTML;
            }
            if (adminBillingTable) {
                adminBillingTable.innerHTML = billingHtml + adminBillingTable.innerHTML;
            }
            if (adminHistoryTable) {
                adminHistoryTable.innerHTML = historyHtml + adminHistoryTable.innerHTML;
            }
            if (adminStandardTable) {
                adminStandardTable.innerHTML = standardHtml;
            }
            if (adminPremiumTable) {
                adminPremiumTable.innerHTML = premiumHtml;
            }
            
            if (statRevenue) {
                // Format avec espaces
                statRevenue.textContent = new Intl.NumberFormat('fr-FR').format(totalRevenue).replace(/,/g, ' ') + " FCFA";
            }
            if (statPremiumWorkers) {
                statPremiumWorkers.textContent = premiumCount;
            }
        } else {
            // Update UI with empty variables even if workers.length === 0
            if (adminWorkersTable) adminWorkersTable.innerHTML = html;
            if (adminBillingTable) adminBillingTable.innerHTML = billingHtml;
            if (adminHistoryTable) adminHistoryTable.innerHTML = historyHtml;
            if (adminStandardTable) adminStandardTable.innerHTML = standardHtml;
            if (adminPremiumTable) adminPremiumTable.innerHTML = premiumHtml;
            if (statRevenue) statRevenue.textContent = "0 FCFA";
            if (statPremiumWorkers) statPremiumWorkers.textContent = "0";
        }
            } catch (err) {
                console.error("Exception in loadAdminData:", err);
            }
        }
        
        loadAdminData();
    }

    // Global Filter Logic (Text Search + Date)
    const adminSearchFilter = document.getElementById('adminSearchFilter');
    const adminGlobalDateFilter = document.getElementById('adminGlobalDateFilter');

    function applyGlobalFilters() {
        const searchText = adminSearchFilter ? adminSearchFilter.value.toLowerCase() : '';
        const dateFilter = adminGlobalDateFilter ? adminGlobalDateFilter.value : ''; // Format YYYY-MM-DD
        
        let targetDateFormatted = '';
        if (dateFilter) {
            // Convert YYYY-MM-DD to DD/MM/YYYY
            const [y, m, d] = dateFilter.split('-');
            targetDateFormatted = `${d}/${m}/${y}`;
        }

        // Get all tables to filter
        const tablesToFilter = [
            document.getElementById('adminWorkersTable'),
            document.getElementById('adminBillingTable'),
            document.getElementById('adminHistoryTable'),
            document.getElementById('adminUsersTable'),
            document.getElementById('adminStandardTable'),
            document.getElementById('adminPremiumTable')
        ];

        tablesToFilter.forEach(tbody => {
            if (!tbody) return;
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                // Check text match
                const matchesText = textContent.includes(searchText);
                
                // Check date match
                let matchesDate = true;
                if (targetDateFormatted) {
                    const rowDate = row.getAttribute('data-date') || textContent; 
                    matchesDate = rowDate.includes(targetDateFormatted);
                }

                if (matchesText && matchesDate) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    if (adminSearchFilter) adminSearchFilter.addEventListener('input', applyGlobalFilters);
    if (adminGlobalDateFilter) adminGlobalDateFilter.addEventListener('change', applyGlobalFilters);

    // Tab switching logic for the Sidebar and Topbar
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked nav item
            item.classList.add('active');

            // Hide all views
            viewSections.forEach(section => section.classList.remove('active'));
            
            // Show target view
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuBtn && sidebar && sidebarOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
        });
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if(window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }

    // ---------------- CHARTS INITIALIZATION ----------------
    // Configuration commune pour le style
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#8d99ae', font: { family: 'Inter' } } }
        },
        scales: {
            y: { ticks: { color: '#8d99ae' }, grid: { color: 'rgba(141, 153, 174, 0.1)' } },
            x: { ticks: { color: '#8d99ae' }, grid: { color: 'rgba(141, 153, 174, 0.1)' } }
        }
    };
    const pieOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#8d99ae', font: { family: 'Inter' } } } }
    };

    // Variables pour stocker les instances de graphiques
    let chartRegion, chartJob, chartTraffic, chartConversion;

    // 1. Demandes par Région (Bar Chart)
    const ctxRegion = document.getElementById('regionChart');
    if (ctxRegion) {
        chartRegion = new Chart(ctxRegion, {
            type: 'bar',
            data: {
                labels: ['Dakar', 'Thiès', 'Diourbel', 'St-Louis', 'Fatick'],
                datasets: [{
                    label: 'Commandes',
                    data: [1250, 450, 320, 210, 150],
                    backgroundColor: 'rgba(58, 134, 255, 0.7)',
                    borderColor: 'rgba(58, 134, 255, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: chartOptions
        });
    }

    // 2. Professions Sollicitées (Doughnut)
    const ctxJob = document.getElementById('jobChart');
    if (ctxJob) {
        chartJob = new Chart(ctxJob, {
            type: 'doughnut',
            data: {
                labels: ['Plombier', 'Électricien', 'Maçon', 'Menuisier', 'Autres'],
                datasets: [{
                    data: [35, 25, 20, 10, 10],
                    backgroundColor: [
                        '#3a86ff', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'
                    ],
                    borderWidth: 0
                }]
            },
            options: pieOptions
        });
    }

    // 3. Fréquence du site (Line Chart)
    const ctxTraffic = document.getElementById('trafficChart');
    if (ctxTraffic) {
        chartTraffic = new Chart(ctxTraffic, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Visiteurs uniques',
                    data: [1200, 1350, 1100, 1400, 1600, 1850, 1900],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });
    }

    // 4. Taux d'appels / Contacts (Horizontal Bar)
    const ctxConversion = document.getElementById('conversionChart');
    if (ctxConversion) {
        // Copie des options pour désactiver la grille X (adaptation simple)
        const convOptions = JSON.parse(JSON.stringify(chartOptions));
        convOptions.indexAxis = 'y';
        
        chartConversion = new Chart(ctxConversion, {
            type: 'bar',
            data: {
                labels: ['Vues Simples', 'Clics WhatsApp', 'Appels Directs'],
                datasets: [{
                    label: 'Interactions',
                    data: [8500, 3200, 1800],
                    backgroundColor: ['#8d99ae', '#2ecc71', '#3a86ff'],
                    borderRadius: 4
                }]
            },
            options: convOptions
        });
    }
    // ---------------- FILTER LOGIC ----------------
    const timeFilter = document.getElementById('chartTimeFilter');
    if (timeFilter) {
        timeFilter.addEventListener('change', (e) => {
            const filter = e.target.value;
            let multiplier = 1;
            
            if (filter === 'jour') multiplier = 0.15;
            if (filter === 'mois') multiplier = 4;
            if (filter === 'trimestre') multiplier = 12;
            if (filter === 'annee') multiplier = 48;

            // Mise à jour Region Chart
            if (chartRegion) {
                chartRegion.data.datasets[0].data = [1250, 450, 320, 210, 150].map(v => Math.round(v * multiplier));
                chartRegion.update();
            }

            // Mise à jour Job Chart (variation légère)
            if (chartJob) {
                chartJob.data.datasets[0].data = [35, 25, 20, 10, 10].map(v => Math.round(v * multiplier + (Math.random() * 5 * multiplier)));
                chartJob.update();
            }

            // Mise à jour Traffic Chart (modification des labels)
            if (chartTraffic) {
                if (filter === 'jour') {
                    chartTraffic.data.labels = ['8h', '10h', '12h', '14h', '16h', '18h', '20h'];
                    chartTraffic.data.datasets[0].data = [120, 150, 200, 180, 250, 300, 220];
                } else if (filter === 'semaine') {
                    chartTraffic.data.labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                    chartTraffic.data.datasets[0].data = [1200, 1350, 1100, 1400, 1600, 1850, 1900];
                } else if (filter === 'mois') {
                    chartTraffic.data.labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                    chartTraffic.data.datasets[0].data = [5200, 5800, 6100, 6500];
                } else if (filter === 'trimestre') {
                    chartTraffic.data.labels = ['Mois 1', 'Mois 2', 'Mois 3'];
                    chartTraffic.data.datasets[0].data = [21000, 23500, 25000];
                } else {
                    chartTraffic.data.labels = ['T1', 'T2', 'T3', 'T4'];
                    chartTraffic.data.datasets[0].data = [65000, 72000, 81000, 95000];
                }
                chartTraffic.update();
            }

            // Mise à jour Conversion Chart
            if (chartConversion) {
                chartConversion.data.datasets[0].data = [8500, 3200, 1800].map(v => Math.round(v * multiplier));
                chartConversion.update();
            }
        });
    }
    // ---------------- END CHARTS ----------------

    // Fonction globale pour supprimer un ouvrier
    window.deleteWorker = async function(id, btnElement) {
        if(confirm("🚨 Êtes-vous sûr de vouloir supprimer cet ouvrier de la plateforme ?\nCette action est irréversible.")) {
            const { error } = await window.db.from('workers').delete().eq('id', id);
            if (error) {
                alert("Erreur lors de la suppression de l'artisan.");
                console.error(error);
                return;
            }

            // Supprimer visuellement la ligne avec une petite animation
            const tr = btnElement.closest('tr');
            if (tr) {
                tr.style.transition = 'opacity 0.3s ease';
                tr.style.opacity = '0';
                setTimeout(() => tr.remove(), 300);
            }
        }
    };

    // Magnetic Button logic (Reused for admin settings buttons)
    const magneticBtns = document.querySelectorAll('.magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const moveX = x * 0.3;
            const moveY = y * 0.3;
            btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // Notification Bell Logic
    const adminNotifBell = document.getElementById('adminNotifBell');
    const adminNotifDropdown = document.getElementById('adminNotifDropdown');
    
    if (adminNotifBell && adminNotifDropdown) {
        adminNotifBell.addEventListener('click', (e) => {
            adminNotifDropdown.classList.toggle('active');
            e.stopPropagation();
        });
        
        document.addEventListener('click', (e) => {
            if (!adminNotifBell.contains(e.target)) {
                adminNotifDropdown.classList.remove('active');
            }
        });
    }

});

// Global Function for Admin Profile View
window.openAdminProfileModal = async function(workerId) {
    const { data: worker, error } = await window.db.from('workers').select('*').eq('id', workerId).single();
    if (error || !worker) {
        alert("Impossible de charger les données de cet artisan.");
        return;
    }

    const modal = document.getElementById('adminProfileModal');
    const closeBtn = document.getElementById('closeAdminProfileModalBtn');
    
    // UI Elements
    const avatar = document.getElementById('adminModalAvatar');
    const name = document.getElementById('adminModalName');
    const job = document.getElementById('adminModalJob');
    const description = document.getElementById('adminModalDescription');
    const audioSection = document.getElementById('adminModalAudioSection');
    const audioPlayback = document.getElementById('adminModalAudioPlayback');

    if (!modal) return;

    // Fonction d'échappement pour contrer les failles XSS
    const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

    // Populate Data
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=0F5A4D&color=fff`;
    name.textContent = escapeHTML(worker.name);
    job.textContent = escapeHTML(worker.job) + ` (${escapeHTML(worker.zone)})`;
    description.textContent = escapeHTML(worker.description) || "Aucune description fournie par l'artisan.";

    // Handle Audio (Premium Only)
    if (worker.plan === 'Premium' && worker.audioDescription) {
        audioPlayback.src = worker.audioDescription;
        audioSection.style.display = 'block';
    } else {
        audioPlayback.src = '';
        audioSection.style.display = 'none';
    }

    // Show Modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.remove('hidden-overlay');
    }, 50);

    // Close logic
    const closeModal = () => {
        modal.classList.add('hidden-overlay');
        setTimeout(() => {
            modal.style.display = 'none';
            audioPlayback.pause(); // Stop audio if playing
        }, 300);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
};

// ============================================
// Module : Gestion des Utilisateurs (CRUD)
// ============================================

// Initialisation des données si vides
let depanne_users = JSON.parse(localStorage.getItem('depanne_users'));
if (!depanne_users) {
    depanne_users = [
        {
            id: 1,
            name: "Administrateur Principal",
            contact: "admin@depanne-moi.sn",
            password: "admin", // Demo purpose
            role: "Admin",
            status: "Actif",
            dateJoined: new Date().toLocaleDateString('fr-FR')
        }
    ];
    localStorage.setItem('depanne_users', JSON.stringify(depanne_users));
}

// Fonction pour rafraîchir le tableau
async function renderUsersTable() {
    const tbody = document.getElementById('adminUsersTable');
    if (!tbody) return;
    
    // Fonction d'échappement XSS
    const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));

    const { data: users, error } = await window.db.from('users').select('*').order('id', { ascending: false });
    
    let html = '';

    if (!error && users && users.length > 0) {
        users.forEach(u => {
            const statusBadge = u.status === 'Actif' ? 'active' : 'inactive'; 
            const statusColor = u.status === 'Actif' ? '#2ecc71' : '#e74c3c';
            const roleColor = u.role === 'Admin' ? '#9b59b6' : (u.role === 'Artisan' ? '#f39c12' : '#3498db');

            html += `
                <tr style="animation: fadeIn 0.3s ease;">
                    <td><strong>${escapeHTML(u.name)}</strong></td>
                    <td>${escapeHTML(u.contact)}</td>
                    <td><span style="background: ${roleColor}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${escapeHTML(u.role)}</span></td>
                    <td><span style="color: ${statusColor}; font-weight: bold;">${escapeHTML(u.status)}</span></td>
                    <td>${escapeHTML(u.dateJoined)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn profile" onclick="editUser(${u.id})" title="Modifier">✏️</button>
                            <button class="action-btn" onclick="toggleUserStatus(${u.id})" title="${u.status === 'Actif' ? 'Bloquer' : 'Activer'}">🚫</button>
                            <button class="action-btn delete" onclick="deleteAppUser(${u.id})" title="Supprimer">🗑️</button>
                            <button class="action-btn reset" onclick="resetUserPassword(${u.id})" title="Réinitialiser Mot de passe">🔑</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    if (users.length === 0) {
        html = `<tr><td colspan="6" style="text-align: center;">Aucun utilisateur trouvé.</td></tr>`;
    }
    
    tbody.innerHTML = html;
}

// Appel initial
document.addEventListener('DOMContentLoaded', () => {
    renderUsersTable();

    // Logique de la fenêtre modale (Ajout/Modification)
    const userModal = document.getElementById('userManagementModal');
    const openAddUserBtn = document.getElementById('openAddUserModalBtn');
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    const userForm = document.getElementById('userManagementForm');

    if (openAddUserBtn && userModal) {
        openAddUserBtn.addEventListener('click', () => {
            document.getElementById('userModalTitle').textContent = "Ajouter un Utilisateur";
            document.getElementById('userPasswordInput').setAttribute('required', 'true');
            userForm.reset();
            document.getElementById('userIdInput').value = ""; // Mode création
            
            userModal.style.display = 'flex';
            setTimeout(() => userModal.classList.remove('hidden-overlay'), 50);
        });
    }

    if (closeUserModalBtn && userModal) {
        const closeUserModal = () => {
            userModal.classList.add('hidden-overlay');
            setTimeout(() => userModal.style.display = 'none', 300);
        };
        closeUserModalBtn.addEventListener('click', closeUserModal);
        userModal.addEventListener('click', (e) => {
            if (e.target === userModal) closeUserModal();
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idInput = document.getElementById('userIdInput').value;
            
            const userData = {
                name: document.getElementById('userNameInput').value,
                contact: document.getElementById('userContactInput').value,
                role: document.getElementById('userRoleInput').value,
                status: document.getElementById('userStatusInput').value
            };
            
            const pass = document.getElementById('userPasswordInput').value;

            if (idInput) {
                // Modification
                if (pass) userData.password = pass; // Update pass only if filled
                const { error } = await window.db.from('users').update(userData).eq('id', idInput);
                if (error) {
                    console.error(error);
                    alert("Erreur lors de la modification.");
                    return;
                }
            } else {
                // Création
                userData.password = pass;
                userData.dateJoined = new Date().toLocaleDateString('fr-FR');
                const { error } = await window.db.from('users').insert([userData]);
                if (error) {
                    console.error(error);
                    alert("Erreur lors de la création.");
                    return;
                }
            }

            renderUsersTable();
            closeUserModalBtn.click();
        });
    }
});

// Fonctions Globales pour les boutons (Éditer, Bloquer, Supprimer)
window.editUser = async function(id) {
    const { data: user, error } = await window.db.from('users').select('*').eq('id', id).single();
    if (error || !user) {
        alert("Impossible de charger l'utilisateur.");
        return;
    }

    document.getElementById('userModalTitle').textContent = "Modifier l'Utilisateur";
    document.getElementById('userIdInput').value = user.id;
    document.getElementById('userNameInput').value = user.name;
    document.getElementById('userContactInput').value = user.contact;
    document.getElementById('userRoleInput').value = user.role;
    document.getElementById('userStatusInput').value = user.status;
    
    // Le mot de passe n'est pas obligatoire pour l'édition
    document.getElementById('userPasswordInput').removeAttribute('required');
    document.getElementById('userPasswordInput').value = '';

    const modal = document.getElementById('userManagementModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.remove('hidden-overlay'), 50);
};

window.toggleUserStatus = async function(id) {
    const { data: user } = await window.db.from('users').select('status').eq('id', id).single();
    if (user) {
        const newStatus = user.status === 'Actif' ? 'Bloqué' : 'Actif';
        await window.db.from('users').update({ status: newStatus }).eq('id', id);
        renderUsersTable();
    }
};

window.deleteAppUser = async function(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?")) {
        await window.db.from('users').delete().eq('id', id);
        renderUsersTable();
    }
};

window.resetUserPassword = async function(id) {
    const { data: user } = await window.db.from('users').select('name').eq('id', id).single();
    if (!user) return;
    
    const newPassword = prompt(`Entrez le nouveau mot de passe pour l'utilisateur ${user.name}\n(Laissez vide pour en générer un automatiquement) :`);
    
    if (newPassword !== null) {
        const finalPassword = newPassword.trim() !== "" ? newPassword.trim() : Math.random().toString(36).slice(-8);
        await window.db.from('users').update({ password: finalPassword }).eq('id', id);
        alert(`✅ Mot de passe réinitialisé avec succès pour ${user.name}.\n\nNouveau mot de passe : ${finalPassword}\n\nVeuillez le communiquer à l'utilisateur de manière sécurisée.`);
    }
};

window.resetWorkerPassword = async function(id) {
    const { data: worker } = await window.db.from('workers').select('name').eq('id', id).single();
    if (!worker) return;
    
    const newPassword = prompt(`Entrez le nouveau mot de passe pour l'abonné ${worker.name}\n(Laissez vide pour en générer un automatiquement) :`);
    
    if (newPassword !== null) {
        const finalPassword = newPassword.trim() !== "" ? newPassword.trim() : Math.random().toString(36).slice(-8);
        await window.db.from('workers').update({ password: finalPassword }).eq('id', id);
        alert(`✅ Mot de passe réinitialisé avec succès pour l'abonné ${worker.name}.\n\nNouveau mot de passe : ${finalPassword}\n\nVeuillez le communiquer à l'abonné de manière sécurisée.`);
    }
};

// --- Cinematic Charts Initialization ---
window.initAdminCharts = async function() {
    if (typeof Chart === 'undefined') return;

    // --- Dynamic Data Extraction ---
    const { data: workersList } = await window.db.from('workers').select('*');
    const { data: usersList } = await window.db.from('users').select('*');
    
    const workers = workersList || [];
    const users = usersList || [];
    
    // Update Global Stats
    const statGrowth = document.getElementById('statGrowth');
    const statAvgTime = document.getElementById('statAvgTime');
    const statSatisfaction = document.getElementById('statSatisfaction');
    
    if(statGrowth) statGrowth.textContent = `${users.length} / ${workers.length}`;
    
    let premiumCount = 0;
    let standardRevenue = 0;
    const regionCounts = {};
    const jobCounts = {};
    
    workers.forEach(w => {
        if (w.plan === 'Premium') premiumCount++;
        if (w.plan === 'Standard') standardRevenue += 5000;
        
        let region = w.zone.split('/')[0] ? w.zone.split('/')[0].trim() : 'Inconnu';
        regionCounts[region] = (regionCounts[region] || 0) + 1;
        
        let job = w.job ? w.job.trim() : 'Inconnu';
        jobCounts[job] = (jobCounts[job] || 0) + 1;
    });
    
    if(statAvgTime) statAvgTime.textContent = premiumCount;
    if(statSatisfaction) statSatisfaction.textContent = new Intl.NumberFormat('fr-FR').format(standardRevenue).replace(/,/g, ' ') + " FCFA";

    // Prepare Region Data
    const sortedRegions = Object.entries(regionCounts).sort((a,b)=>b[1]-a[1]).slice(0, 5);
    const regionLabels = sortedRegions.map(k => k[0]);
    const regionData = sortedRegions.map(k => k[1]);
    
    // Prepare Job Data
    const sortedJobs = Object.entries(jobCounts).sort((a,b)=>b[1]-a[1]).slice(0, 5);
    const jobLabels = sortedJobs.map(k => k[0]);
    const jobData = sortedJobs.map(k => k[1]);

    // --- Chart Defaults ---
    Chart.defaults.color = 'rgba(26, 86, 123, 0.6)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1A567B',
                bodyColor: '#1A567B',
                borderColor: 'rgba(26, 86, 123, 0.1)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
            }
        },
        scales: {
            y: {
                border: { display: false },
                grid: { color: 'rgba(26, 86, 123, 0.05)', drawBorder: false },
                ticks: { padding: 10 }
            },
            x: {
                border: { display: false },
                grid: { display: false },
                ticks: { padding: 10 }
            }
        }
    };

    const ctxRegion = document.getElementById('regionChart');
    if (ctxRegion) {
        new Chart(ctxRegion, {
            type: 'bar',
            data: {
                labels: regionLabels.length ? regionLabels : ['Aucune donnée'],
                datasets: [{
                    data: regionData.length ? regionData : [0],
                    backgroundColor: 'rgba(58, 134, 255, 0.8)',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: commonOptions
        });
    }

    const ctxJob = document.getElementById('jobChart');
    if (ctxJob) {
        new Chart(ctxJob, {
            type: 'doughnut',
            data: {
                labels: jobLabels.length ? jobLabels : ['Aucune donnée'],
                datasets: [{
                    data: jobData.length ? jobData : [0],
                    backgroundColor: ['#3a86ff', '#2ecc71', '#f39c12', '#9b59b6', '#e74c3c'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.7)', padding: 15, usePointStyle: true, font: {size: 10} } }
                }
            }
        });
    }

    const ctxTraffic = document.getElementById('trafficChart');
    if (ctxTraffic) {
        const gradient = ctxTraffic.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(46, 204, 113, 0.4)');
        gradient.addColorStop(1, 'rgba(46, 204, 113, 0.0)');

        new Chart(ctxTraffic, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    data: [120, 190, 150, 220, 180, 250, 210],
                    borderColor: '#2ecc71',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient,
                    pointBackgroundColor: '#2ecc71',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: commonOptions
        });
    }

    const ctxCalls = document.getElementById('callsChart');
    if (ctxCalls) {
        const gradient2 = ctxCalls.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, 'rgba(243, 156, 18, 0.4)');
        gradient2.addColorStop(1, 'rgba(243, 156, 18, 0.0)');

        new Chart(ctxCalls, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    data: [45, 60, 55, 80, 65, 90, 75],
                    borderColor: '#f39c12',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient2,
                    pointBackgroundColor: '#f39c12',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: commonOptions
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('#chartTimeFilter button');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Effet visuel au changement de filtre
            const chartContainers = document.querySelectorAll('.chart-container canvas');
            chartContainers.forEach(canvas => {
                canvas.style.transition = 'opacity 0.3s ease';
                canvas.style.opacity = '0.3';
                setTimeout(() => { canvas.style.opacity = '1'; }, 300);
            });
        });
    });

    setTimeout(window.initAdminCharts, 800); // Laisse le temps à Chart.js de charger
    
    // --- Load Admin Reviews ---
    const loadAdminReviews = () => {
        const adminReviewsTable = document.getElementById('adminReviewsTable');
        if (!adminReviewsTable) return;
        
        const allReviews = JSON.parse(localStorage.getItem('depanne_reviews')) || [];
        if (allReviews.length === 0) {
            adminReviewsTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--color-text-light);">Aucun avis déposé pour le moment.</td></tr>`;
            return;
        }
        
        // Fonction d'échappement XSS (au cas où elle n'est pas dans le scope global)
        const escapeHTMLStr = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
        
        let html = '';
        // Plus récent au plus ancien
        const sortedReviews = [...allReviews].reverse();
        
        sortedReviews.forEach(r => {
            let stars = '';
            for(let i=1; i<=5; i++) {
                stars += i <= r.rating ? '<span style="color:#f1c40f;">★</span>' : '<span style="color:#bdc3c7;">★</span>';
            }
            
            let ratingLabel = '';
            if (r.rating >= 4) {
                ratingLabel = '<span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem; margin-left: 5px;">(Satisfaisant)</span>';
            } else if (r.rating >= 2) {
                ratingLabel = '<span style="color: #f39c12; font-weight: 600; font-size: 0.85rem; margin-left: 5px;">(Moyen)</span>';
            } else {
                ratingLabel = '<span style="color: #e74c3c; font-weight: 600; font-size: 0.85rem; margin-left: 5px;">(Médiocre)</span>';
            }
            
            html += `
                <tr style="animation: fadeIn 0.5s ease;">
                    <td>${escapeHTMLStr(r.date)}</td>
                    <td><strong>${escapeHTMLStr(r.clientName)}</strong></td>
                    <td>${escapeHTMLStr(r.artisanName)}</td>
                    <td><div style="font-size: 1.1rem; display: flex; align-items: center;">${stars} ${ratingLabel}</div></td>
                    <td><span style="font-size: 0.9rem;">${escapeHTMLStr(r.comment)}</span></td>
                </tr>
            `;
        });
        
        adminReviewsTable.innerHTML = html;
    };
    
    setTimeout(loadAdminReviews, 500);
});

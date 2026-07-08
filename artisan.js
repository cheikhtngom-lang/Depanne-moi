document.addEventListener('DOMContentLoaded', () => {
    // Vérification de session locale (Mitigation basique)
    const isAuthenticated = sessionStorage.getItem('artisan_auth_token') === 'true';
    if (!isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Navigation Sidebar
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            
            viewSections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('hidden');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                // Small delay to allow display:block to apply before animating opacity
                setTimeout(() => targetSection.classList.add('active'), 10);
            }
        });
    });

    // 2. Déconnexion
    const artisanLogoutBtn = document.getElementById('artisanLogoutBtn');
    if (artisanLogoutBtn) {
        artisanLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('artisan_auth_token');
            window.location.href = 'index.html';
        });
    }

    // 3. Charger les données de l'artisan connecté via son ID
    let workers = JSON.parse(localStorage.getItem('depanne_workers')) || [];
    const artisanId = sessionStorage.getItem('artisan_id');
    
    let currentWorker = null;
    if (artisanId) {
        // Chercher dans depanne_workers
        currentWorker = workers.find(w => w.id == artisanId);
        
        // S'il n'est pas dans depanne_workers (peut-être créé depuis l'admin et listé dans depanne_users), chercher là-bas
        if (!currentWorker) {
            const users = JSON.parse(localStorage.getItem('depanne_users')) || [];
            currentWorker = users.find(u => u.id == artisanId);
        }
    }
    
    // Fallback de sécurité si l'artisan n'est pas trouvé
    if (!currentWorker) {
        currentWorker = workers.length > 0 ? workers[workers.length - 1] : { name: "Ouvrier Test", plan: "Essai" };
    }

    // Fonction d'échappement XSS
    const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

    // Update UI with worker data
    document.getElementById('artisanHeaderName').textContent = escapeHTML(currentWorker.name);
    document.getElementById('welcomeName').textContent = escapeHTML(currentWorker.name);
    
    // Fill Settings Form
    if (document.getElementById('settingName')) {
        document.getElementById('settingName').value = currentWorker.name;
    }
    if (document.getElementById('settingDescription')) {
        document.getElementById('settingDescription').value = currentWorker.description || '';
    }

    // Audio Section Logic
    const premiumAudioSettings = document.getElementById('premiumAudioSettings');
    const standardAudioLock = document.getElementById('standardAudioLock');
    
    // Update plan badge
    const planBadge = document.getElementById('planBadge');
    if (currentWorker.plan === 'Premium') {
        if (planBadge) {
            planBadge.className = 'badge premium';
            planBadge.textContent = 'Formule Premium (Max 20 photos)';
        }
        if (premiumAudioSettings) premiumAudioSettings.style.display = 'block';
        if (standardAudioLock) standardAudioLock.style.display = 'none';

        // Load Audio if exists
        const audioPlayback = document.getElementById('settingAudioPlayback');
        const noAudioMsg = document.getElementById('noAudioMsg');
        if (currentWorker.audioDescription && audioPlayback) {
            audioPlayback.src = currentWorker.audioDescription;
            audioPlayback.style.display = 'block';
            if (noAudioMsg) noAudioMsg.style.display = 'none';
        }

    } else if (currentWorker.plan === 'Essai') {
        if (planBadge) {
            planBadge.className = 'badge pro';
            planBadge.textContent = 'Formule Essai (Max 1 photo)';
        }
        if (premiumAudioSettings) premiumAudioSettings.style.display = 'none';
        if (standardAudioLock) standardAudioLock.style.display = 'block';
    } else {
        if (planBadge) {
            planBadge.className = 'badge standard';
            planBadge.textContent = 'Formule Standard (Max 3 photos)';
        }
        if (premiumAudioSettings) premiumAudioSettings.style.display = 'none';
        if (standardAudioLock) standardAudioLock.style.display = 'block';
    }

    // Update Initials or Profile Photo in Avatar
    const avatarImg = document.getElementById('artisanAvatar');
    if (avatarImg && currentWorker.name) {
        if (currentWorker.profilePhoto && currentWorker.profilePhoto.trim() !== '') {
            avatarImg.src = currentWorker.profilePhoto;
        } else {
            const nameUrl = encodeURIComponent(currentWorker.name);
            avatarImg.src = `https://ui-avatars.com/api/?name=${nameUrl}&background=0F5A4D&color=fff`;
        }
    }

    // --- Load Reviews Logic ---
    const allReviews = JSON.parse(localStorage.getItem('depanne_reviews')) || [];
    const myReviews = allReviews.filter(r => String(r.artisanId) === String(currentWorker.id));
    
    const artisanAverageRatingEl = document.getElementById('artisanAverageRating');
    const artisanTotalReviewsEl = document.getElementById('artisanTotalReviews');
    const artisanReviewsListEl = document.getElementById('artisanReviewsList');
    
    if (artisanAverageRatingEl && artisanTotalReviewsEl && artisanReviewsListEl) {
        artisanTotalReviewsEl.textContent = `${myReviews.length} avis reçu(s)`;
        
        if (myReviews.length === 0) {
            artisanAverageRatingEl.textContent = "- / 5";
            artisanReviewsListEl.innerHTML = `<p style="text-align:center; color: var(--color-text-light); padding: 20px;">Vous n'avez pas encore reçu d'avis.</p>`;
        } else {
            let totalScore = 0;
            let reviewsHtml = '';
            
            // Afficher du plus récent au plus ancien
            const sortedReviews = [...myReviews].reverse();
            
            sortedReviews.forEach(r => {
                totalScore += r.rating;
                let stars = '';
                for(let i=1; i<=5; i++) {
                    stars += i <= r.rating ? '<span style="color:#f1c40f;">★</span>' : '<span style="color:#bdc3c7;">★</span>';
                }
                
                let ratingLabel = '';
                if (r.rating >= 4) {
                    ratingLabel = '<span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem; margin-left: 10px;">(Satisfaisant)</span>';
                } else if (r.rating >= 2) {
                    ratingLabel = '<span style="color: #f39c12; font-weight: 600; font-size: 0.85rem; margin-left: 10px;">(Moyen)</span>';
                } else {
                    ratingLabel = '<span style="color: #e74c3c; font-weight: 600; font-size: 0.85rem; margin-left: 10px;">(Médiocre)</span>';
                }
                
                reviewsHtml += `
                    <div style="background: rgba(255,255,255,0.6); padding: 15px; border-radius: 12px; border: 1px solid rgba(26, 86, 123, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong style="color: var(--color-primary);">${escapeHTML(r.clientName)}</strong>
                            <span style="font-size: 0.85rem; color: var(--color-text-light);">${escapeHTML(r.date)}</span>
                        </div>
                        <div style="font-size: 1.2rem; margin-bottom: 10px; display: flex; align-items: center;">${stars} ${ratingLabel}</div>
                        <p style="color: var(--color-text); font-size: 0.95rem; margin: 0;">${escapeHTML(r.comment)}</p>
                    </div>
                `;
            });
            
            const avg = (totalScore / myReviews.length).toFixed(1);
            artisanAverageRatingEl.textContent = `${avg} / 5`;
            artisanReviewsListEl.innerHTML = reviewsHtml;
        }
    }

    // --- Audio Recording Logic (Settings) ---
    let settingMediaRecorder;
    let settingAudioChunks = [];
    let settingCurrentAudioBase64 = currentWorker.audioDescription || null;
    let settingRecordingTimerInterval;
    let settingSecondsRecorded = 0;

    const settingRecordBtn = document.getElementById('settingRecordBtn');
    const settingStopBtn = document.getElementById('settingStopBtn');
    const settingRecordingTimer = document.getElementById('settingRecordingTimer');
    const settingAudioPlayback = document.getElementById('settingAudioPlayback');
    const noAudioMsg = document.getElementById('noAudioMsg');

    if (settingRecordBtn && settingStopBtn) {
        settingRecordBtn.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                settingMediaRecorder = new MediaRecorder(stream);
                settingAudioChunks = [];

                settingMediaRecorder.addEventListener("dataavailable", event => {
                    settingAudioChunks.push(event.data);
                });

                settingMediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(settingAudioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    settingAudioPlayback.src = audioUrl;
                    settingAudioPlayback.style.display = 'block';
                    if (noAudioMsg) noAudioMsg.style.display = 'none';

                    // Convert to Base64 for localStorage
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        settingCurrentAudioBase64 = reader.result;
                    };

                    // Stop tracks to release mic
                    stream.getTracks().forEach(track => track.stop());
                });

                settingMediaRecorder.start();
                
                settingRecordBtn.style.display = 'none';
                settingStopBtn.style.display = 'inline-block';
                settingRecordingTimer.style.display = 'inline-block';
                
                settingSecondsRecorded = 0;
                settingRecordingTimer.textContent = "00:00";
                settingRecordingTimerInterval = setInterval(() => {
                    settingSecondsRecorded++;
                    let m = Math.floor(settingSecondsRecorded / 60).toString().padStart(2, '0');
                    let s = (settingSecondsRecorded % 60).toString().padStart(2, '0');
                    settingRecordingTimer.textContent = `${m}:${s}`;
                    
                    // Auto stop at 30 seconds
                    if (settingSecondsRecorded >= 30) {
                        settingStopBtn.click();
                    }
                }, 1000);

            } catch (err) {
                alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès.");
                console.error(err);
            }
        });

        settingStopBtn.addEventListener('click', () => {
            if (settingMediaRecorder && settingMediaRecorder.state !== "inactive") {
                settingMediaRecorder.stop();
            }
            clearInterval(settingRecordingTimerInterval);
            settingStopBtn.style.display = 'none';
            settingRecordBtn.style.display = 'inline-block';
            settingRecordBtn.textContent = "🔴 Réenregistrer";
            settingRecordingTimer.style.display = 'none';
        });
    }

    // 4. Formulaire des Paramètres
    const settingsForm = document.getElementById('artisanSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('settingName').value;
            const newDesc = document.getElementById('settingDescription') ? document.getElementById('settingDescription').value : '';
            const newPass = document.getElementById('settingPass').value;
            
            // Mettre à jour dans localStorage (si le worker existe)
            if (currentWorker.id) {
                const index = workers.findIndex(w => w.id === currentWorker.id);
                if (index !== -1) {
                    workers[index].name = newName;
                    workers[index].description = newDesc;
                    if (currentWorker.plan === 'Premium') {
                        workers[index].audioDescription = settingCurrentAudioBase64;
                    }
                    localStorage.setItem('depanne_workers', JSON.stringify(workers));
                }
            }
            
            // Update UI
            document.getElementById('artisanHeaderName').textContent = escapeHTML(newName);
            document.getElementById('welcomeName').textContent = escapeHTML(newName);
            
            if (avatarImg) {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=0F5A4D&color=fff`;
            }

            alert("Vos informations ont été mises à jour avec succès !");
            document.getElementById('settingPass').value = ""; // Clear password field
        });
    }

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

    // ---------------- CHARTS INITIALIZATION (ARTISAN) ----------------
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

    let chartArtisanRegion, chartArtisanJob, chartArtisanTraffic, chartArtisanConversion;

    // 1. Vues par Localisation (Bar Chart)
    const ctxRegion = document.getElementById('artisanRegionChart');
    if (ctxRegion) {
        chartArtisanRegion = new Chart(ctxRegion, {
            type: 'bar',
            data: {
                labels: ['Dakar', 'Thiès', 'Autres'],
                datasets: [{
                    label: 'Vues de mon profil',
                    data: [85, 20, 5],
                    backgroundColor: 'rgba(32, 153, 131, 0.7)',
                    borderColor: 'rgba(32, 153, 131, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: chartOptions
        });
    }

    // 2. Types d'interactions (Doughnut)
    const ctxJob = document.getElementById('artisanJobChart');
    if (ctxJob) {
        chartArtisanJob = new Chart(ctxJob, {
            type: 'doughnut',
            data: {
                labels: ['WhatsApp', 'Appels', 'Partages'],
                datasets: [{
                    data: [15, 8, 4],
                    backgroundColor: ['#2ecc71', '#3498db', '#f39c12'],
                    borderWidth: 0
                }]
            },
            options: pieOptions
        });
    }

    // 3. Trafic sur mon profil (Line Chart)
    const ctxTraffic = document.getElementById('artisanTrafficChart');
    if (ctxTraffic) {
        chartArtisanTraffic = new Chart(ctxTraffic, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Visites',
                    data: [12, 18, 15, 22, 20, 35, 42],
                    borderColor: '#209983',
                    backgroundColor: 'rgba(32, 153, 131, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });
    }

    // 4. Taux de Conversion (Horizontal Bar)
    const ctxConversion = document.getElementById('artisanConversionChart');
    if (ctxConversion) {
        const convOptions = JSON.parse(JSON.stringify(chartOptions));
        convOptions.indexAxis = 'y';
        
        chartArtisanConversion = new Chart(ctxConversion, {
            type: 'bar',
            data: {
                labels: ['Vues Simples', 'Prises de contact'],
                datasets: [{
                    label: 'Performances',
                    data: [124, 23],
                    backgroundColor: ['#8d99ae', '#209983'],
                    borderRadius: 4
                }]
            },
            options: convOptions
        });
    }

    // ---------------- FILTER LOGIC ----------------
    const timeFilter = document.getElementById('artisanTimeFilter');
    if (timeFilter) {
        timeFilter.addEventListener('change', (e) => {
            const filter = e.target.value;
            let multiplier = 1;
            
            if (filter === 'jour') multiplier = 0.15;
            if (filter === 'mois') multiplier = 4;
            if (filter === 'trimestre') multiplier = 12;
            if (filter === 'annee') multiplier = 48;

            if (chartArtisanRegion) {
                chartArtisanRegion.data.datasets[0].data = [85, 20, 5].map(v => Math.round(v * multiplier));
                chartArtisanRegion.update();
            }

            if (chartArtisanJob) {
                chartArtisanJob.data.datasets[0].data = [15, 8, 4].map(v => Math.round(v * multiplier + (Math.random() * 2 * multiplier)));
                chartArtisanJob.update();
            }

            if (chartArtisanTraffic) {
                if (filter === 'jour') {
                    chartArtisanTraffic.data.labels = ['8h', '12h', '16h', '20h'];
                    chartArtisanTraffic.data.datasets[0].data = [2, 5, 3, 6];
                } else if (filter === 'semaine') {
                    chartArtisanTraffic.data.labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                    chartArtisanTraffic.data.datasets[0].data = [12, 18, 15, 22, 20, 35, 42];
                } else if (filter === 'mois') {
                    chartArtisanTraffic.data.labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                    chartArtisanTraffic.data.datasets[0].data = [50, 65, 80, 95];
                } else if (filter === 'trimestre') {
                    chartArtisanTraffic.data.labels = ['Mois 1', 'Mois 2', 'Mois 3'];
                    chartArtisanTraffic.data.datasets[0].data = [250, 310, 420];
                } else {
                    chartArtisanTraffic.data.labels = ['T1', 'T2', 'T3', 'T4'];
                    chartArtisanTraffic.data.datasets[0].data = [800, 1100, 1450, 1600];
                }
                chartArtisanTraffic.update();
            }

            if (chartArtisanConversion) {
                chartArtisanConversion.data.datasets[0].data = [124, 23].map(v => Math.round(v * multiplier));
                chartArtisanConversion.update();
            }
        });
    }
    // ---------------- END CHARTS ----------------
});

// Fonctions Globales pour la gestion des photos (Portfolio)

window.deletePhoto = function(btnElement) {
    if(confirm("Êtes-vous sûr de vouloir supprimer cette réalisation ?")) {
        const item = btnElement.closest('.portfolio-item');
        if (item) {
            item.style.transform = 'scale(0.8)';
            item.style.opacity = '0';
            setTimeout(() => item.remove(), 300);
        }
    }
};

window.handlePhotoUpload = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const grid = document.getElementById('portfolioGrid');
            const addBtn = document.querySelector('.add-photo-btn');
            
            // Create new photo item
            const newDiv = document.createElement('div');
            newDiv.className = 'portfolio-item';
            newDiv.style.opacity = '0';
            newDiv.style.transform = 'scale(0.8)';
            newDiv.style.transition = 'all 0.4s ease';
            
            newDiv.innerHTML = `
                <img src="${e.target.result}" alt="Nouvelle réalisation">
                <button class="delete-photo-btn" onclick="deletePhoto(this)">×</button>
            `;
            
            // Insert before the "Add Photo" button
            grid.insertBefore(newDiv, addBtn);
            
            // Animate in
            setTimeout(() => {
                newDiv.style.opacity = '1';
                newDiv.style.transform = 'scale(1)';
            }, 50);
        };
        reader.readAsDataURL(file);
    }
    // Reset input so the same file can be uploaded again if needed
    event.target.value = '';
};

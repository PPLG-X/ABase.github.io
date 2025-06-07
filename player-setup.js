document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi popup petunjuk
    const tutorialButton = document.getElementById('tutorialButton');
    const tutorialHint = document.getElementById('tutorialHint');

    tutorialButton.addEventListener('mouseenter', () => {
        const buttonRect = tutorialButton.getBoundingClientRect();
        tutorialHint.style.display = 'block';
        tutorialHint.style.top = (buttonRect.bottom + 10) + 'px';
        tutorialHint.style.left = (buttonRect.left + (buttonRect.width/2) - 150) + 'px';
        tutorialHint.classList.add('active', 'bottom');
    });

    tutorialButton.addEventListener('mouseleave', () => {
        tutorialHint.classList.remove('active');
        setTimeout(() => {
            if (!tutorialHint.classList.contains('active')) {
                tutorialHint.style.display = 'none';
            }
        }, 500);
    });

    const buttonSound = new Audio('aset/Button effect.mp3');
    const formsContainer = document.getElementById('playerFormsContainer');
    const playerCountButtons = document.querySelectorAll('.player-count');
    const prevButton = document.getElementById('prevPlayer');
    const nextButton = document.getElementById('nextPlayer');
    let playerCount = 1;
    let currentPlayerIndex = 0;
    let playerData = Array(4).fill(null).map(() => ({ 
        nama: '', 
        sekolah: '', 
        target: null 
    }));

    // Navigation event listeners
    prevButton.addEventListener('click', () => {
        buttonSound.currentTime = 0;
        buttonSound.play();
        saveCurrentPlayerData();
        navigateToPlayer(currentPlayerIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        buttonSound.currentTime = 0;
        buttonSound.play();
        saveCurrentPlayerData();
        navigateToPlayer(currentPlayerIndex + 1);
    });

    // Handle player count selection
    playerCountButtons.forEach(button => {
        button.addEventListener('click', () => {
            buttonSound.currentTime = 0;
            buttonSound.play();
            
            // Update active state
            playerCountButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update player count and regenerate forms
            playerCount = parseInt(button.getAttribute('data-count'));
            currentPlayerIndex = 0;
            regenerateForms();
            updateNavigation();
        });
    });

    function navigateToPlayer(index) {
        if (index >= 0 && index < playerCount) {
            currentPlayerIndex = index;
            updateNavigation();
            showCurrentPlayerForm();
            restorePlayerData();
        }
    }

    function updateNavigation() {
        prevButton.classList.toggle('hidden', currentPlayerIndex === 0);
        nextButton.classList.toggle('hidden', currentPlayerIndex === playerCount - 1);
        
        if (playerCount <= 1) {
            prevButton.classList.add('hidden');
            nextButton.classList.add('hidden');
        }
    }

    function showCurrentPlayerForm() {
        document.querySelectorAll('.player-form').forEach((form, index) => {
            form.style.display = index === currentPlayerIndex ? 'block' : 'none';
        });
    }

    function saveCurrentPlayerData() {
        const currentForm = document.querySelector('.player-form:not([style*="none"])');
        if (currentForm) {
            playerData[currentPlayerIndex] = {
                nama: currentForm.querySelector('.input-nama').value.trim(),
                sekolah: currentForm.querySelector('.input-sekolah').value.trim(),
                target: currentForm.querySelector('.target-option.active')?.getAttribute('data-target') || null
            };
        }
    }

    function restorePlayerData() {
        const currentForm = document.querySelector('.player-form:not([style*="none"])');
        if (currentForm && playerData[currentPlayerIndex]) {
            const data = playerData[currentPlayerIndex];
            currentForm.querySelector('.input-nama').value = data.nama;
            currentForm.querySelector('.input-sekolah').value = data.sekolah;
            
            // Reset and restore target selection
            currentForm.querySelectorAll('.target-option').forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-target') === data.target) {
                    option.classList.add('active');
                }
            });
        }
    }

    function regenerateForms() {
        formsContainer.innerHTML = '';
        for (let i = 0; i < playerCount; i++) {
            createPlayerForm(i);
        }
        showCurrentPlayerForm();
        restorePlayerData();
    }

    function createPlayerForm(index) {
        const playerForm = document.createElement('div');
        playerForm.className = 'glass-container player-form';
        playerForm.style.display = index === currentPlayerIndex ? 'block' : 'none';
        playerForm.innerHTML = `
            <div class="section-icon">🎯</div>
            <h2>Pemain ${index + 1}</h2>
            <div class="form-group">
                <label>Nama Pemain</label>
                <input type="text" class="input-nama" placeholder="Masukkan nama pemain" required>
            </div>
            <div class="form-group">
                <label>Asal Sekolah/Tempat (Opsional)</label>
                <input type="text" class="input-sekolah" placeholder="Masukkan asal sekolah">
            </div>
            <div class="form-group">
                <div class="target-section">
                    <label>Target:</label>
                    <div class="target-options">
                        <button class="target-option" data-target="A">A</button>
                        <button class="target-option" data-target="B">B</button>
                        <button class="target-option" data-target="C">C</button>
                        <button class="target-option" data-target="D">D</button>
                    </div>
                </div>
            </div>
        `;
        formsContainer.appendChild(playerForm);

        // Event listeners untuk target options
        const targetOptions = playerForm.querySelectorAll('.target-option');
        targetOptions.forEach(option => {
            option.addEventListener('click', () => {
                buttonSound.currentTime = 0;
                buttonSound.play();

                const targetValue = option.getAttribute('data-target');

                // Check if this target is already selected by another player
                const isTargetTaken = playerData.some((player, idx) => 
                    idx !== currentPlayerIndex && player.target === targetValue
                );

                if (isTargetTaken) {
                    alert('Target ini sudah dipilih oleh pemain lain!');
                    return;
                }

                // Remove active state from all targets in current form
                targetOptions.forEach(opt => opt.classList.remove('active'));
                
                // Set active state for clicked target
                option.classList.add('active');
                
                // Save the current player's data
                saveCurrentPlayerData();
            });
        });
    }

    // Initialize first form and navigation
    createPlayerForm(0);
    updateNavigation();

    // Handle Mulai Pencatatan
    document.getElementById('tombolMulaiCatat').addEventListener('click', () => {
        buttonSound.currentTime = 0;
        buttonSound.play();

        saveCurrentPlayerData(); // Save current form data before validation

        const players = playerData.slice(0, playerCount);
        let isValid = players.every(player => 
            player && player.nama && player.target
        );

        if (!isValid) {
            alert('Pastikan semua nama pemain dan target telah diisi!');
            return;
        }

        // Check for duplicate targets
        const targets = players.map(p => p.target);
        if (new Set(targets).size !== targets.length) {
            alert('Setiap pemain harus memiliki target yang berbeda!');
            return;
        }

        const jarak = document.getElementById('jarakTembak').value;
        
        // Save data
        localStorage.setItem('playerData', JSON.stringify({
            jarak,
            players
        }));

        // Navigate to score sheet
        window.location.href = 'score-sheet.html';
    });

    // Handle Kembali button
    document.getElementById('tombolKembali').addEventListener('click', () => {
        buttonSound.currentTime = 0;
        buttonSound.play();
          // Tampilkan loading sebelum kembali ke halaman utama
        const globalLoading = document.getElementById('globalLoading');
        const videoLoadingGlobal = document.getElementById('videoLoadingGlobal');
        
        globalLoading.classList.remove('tersembunyi');
        globalLoading.classList.add('fade-in');
        videoLoadingGlobal.play();
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    });
});

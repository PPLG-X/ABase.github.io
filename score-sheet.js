document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi modal tutorial
    const tutorialModal = document.getElementById('tutorialModal');
    const continueButton = document.getElementById('continueButton');

    // Tampilkan tutorial modal setelah setup pemain
    setTimeout(() => {
        tutorialModal.style.display = 'flex';
    }, 1000);

    continueButton.addEventListener('click', () => {
        buttonSound.currentTime = 0;
        buttonSound.play();
        tutorialModal.style.display = 'none';
    });

    // Sound effects
    const buttonSound = document.getElementById('buttonSound');
    const goodShootSound = document.getElementById('goodShootSound');
    const missSound = document.getElementById('missSound');

    // Get player data from localStorage
    const playerData = JSON.parse(localStorage.getItem('playerData'));
    let currentPlayerIndex = 0;
    let scores = Array(playerData.players.length).fill().map(() => 
        Array(10).fill().map(() => Array(3).fill(''))
    );

    // Initialize UI
    initializeDateDisplay();
    initializeJarakDisplay();
    initializePlayerTabs();
    initializeScoreTable();
    initializeButtons();

    function initializeDateDisplay() {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const now = new Date();
        
        document.getElementById('currentDate').textContent = 
            `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        document.getElementById('currentDay').textContent = days[now.getDay()];
    }

    function initializeJarakDisplay() {
        document.getElementById('jarakValue').textContent = playerData.jarak;
    }    function initializePlayerTabs() {
        const playerSelector = document.getElementById('playerSelector');
        // Set data-count attribute based on number of players
        playerSelector.dataset.count = playerData.players.length;
        
        playerSelector.innerHTML = playerData.players.map((player, index) => `
            <button class="player-tab ${index === 0 ? 'active' : ''}" data-index="${index}">
                ${player.nama} (${player.target})
            </button>
        `).join('');

        playerSelector.addEventListener('click', (e) => {
            const tab = e.target.closest('.player-tab');
            if (tab) {
                buttonSound.currentTime = 0;
                buttonSound.play();
                currentPlayerIndex = parseInt(tab.dataset.index);
                updatePlayerTabs();
                updateScoreTable();
            }
        });
    }

    function updatePlayerTabs() {
        document.querySelectorAll('.player-tab').forEach((tab, index) => {
            tab.classList.toggle('active', index === currentPlayerIndex);
        });
    }

    function initializeScoreTable() {
        const tbody = document.getElementById('scoreTableBody');
        tbody.innerHTML = Array(10).fill().map((_, i) => `
            <tr>
                <td>${i + 1}</td>
                <td class="score-cell" data-row="${i}" data-col="0"></td>
                <td class="score-cell" data-row="${i}" data-col="1"></td>
                <td class="score-cell" data-row="${i}" data-col="2"></td>
                <td class="total-cell" data-row="${i}">0</td>
            </tr>
        `).join('');
        updateScoreTable();
    }

    function updateScoreTable() {
        const playerScores = scores[currentPlayerIndex];
        playerScores.forEach((rowScores, row) => {
            rowScores.forEach((score, col) => {
                const cell = document.querySelector(`.score-cell[data-row="${row}"][data-col="${col}"]`);
                cell.textContent = score;
                updateCellColor(cell, score);
            });
            updateRowTotal(row);
        });
        updateGrandTotal();
    }

    function updateCellColor(cell, score) {
        cell.classList.remove('gold', 'red', 'blue', 'black');
        if (score === 'X' || score === '10' || score === '9') {
            cell.classList.add('gold');
        } else if (score === '8' || score === '7') {
            cell.classList.add('red');
        } else if (['6', '5', '4', '3'].includes(score)) {
            cell.classList.add('blue');
        } else if (score) {
            cell.classList.add('black');
        }
    }

    function updateRowTotal(row) {
        const playerScores = scores[currentPlayerIndex][row];
        let total = 0;
        playerScores.forEach(score => {
            if (score === 'X') {
                total += 10;
            } else if (score === 'M') {
                total += 0;
            } else if (score !== '') {
                total += parseInt(score);
            }
        });
        document.querySelector(`.total-cell[data-row="${row}"]`).textContent = total;
    }

    function updateGrandTotal() {
        let grandTotal = 0;
        const playerScores = scores[currentPlayerIndex];
        playerScores.forEach((rowScores, row) => {
            let rowTotal = 0;
            rowScores.forEach(score => {
                if (score === 'X') {
                    rowTotal += 10;
                } else if (score === 'M') {
                    rowTotal += 0;
                } else if (score !== '') {
                    rowTotal += parseInt(score);
                }
            });
            grandTotal += rowTotal;
        });
        document.getElementById('grandTotal').textContent = grandTotal;
    }

    function findEmptyCell() {
        const playerScores = scores[currentPlayerIndex];
        for (let row = 0; row < playerScores.length; row++) {
            for (let col = 0; col < playerScores[row].length; col++) {
                if (playerScores[row][col] === '') {
                    return { row, col };
                }
            }
        }
        return null;
    }

    function findLastFilledCell() {
        const playerScores = scores[currentPlayerIndex];
        for (let row = playerScores.length - 1; row >= 0; row--) {
            for (let col = playerScores[row].length - 1; col >= 0; col--) {
                if (playerScores[row][col] !== '') {
                    return { row, col };
                }
            }
        }
        return null;
    }

    function updateScore(row, col, value) {
        scores[currentPlayerIndex][row][col] = value;
        updateScoreTable();
    }

    function playScoreSound(value) {
        if (value === 'M' || ['1', '2'].includes(value)) {
            missSound.currentTime = 0;
            missSound.play();
        } else if (['X', '10', '9'].includes(value)) {
            goodShootSound.currentTime = 0;
            goodShootSound.play();
        } else {
            buttonSound.currentTime = 0;
            buttonSound.play();
        }
    }

    function initializeButtons() {
        // Score buttons
        document.querySelectorAll('.score-button').forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                addScore(value);
            });
        });

        // Delete button
        document.getElementById('deleteButton').addEventListener('click', () => {
            deleteLastScore();
        });

        // Finish button
        document.getElementById('finishButton').addEventListener('click', () => {
            buttonSound.currentTime = 0;
            buttonSound.play();
            saveSessionToDatabase();
        });
    }

    function addScore(value) {
        const currentCell = findEmptyCell();
        if (currentCell) {
            updateScore(currentCell.row, currentCell.col, value);
            playScoreSound(value);
        }
    }

    function deleteLastScore() {
        const lastCell = findLastFilledCell();
        if (lastCell) {
            updateScore(lastCell.row, lastCell.col, '');
            buttonSound.currentTime = 0;
            buttonSound.play();
        }
    }

    function isScoreSheetComplete() {
        // Periksa setiap pemain
        for (let playerIndex = 0; playerIndex < scores.length; playerIndex++) {
            const playerScores = scores[playerIndex];
            
            // Periksa setiap baris skor
            for (let row = 0; row < playerScores.length; row++) {
                const rowScores = playerScores[row];
                
                // Periksa setiap kolom dalam baris
                for (let col = 0; col < rowScores.length; col++) {
                    if (rowScores[col] === '') {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Fungsi untuk mendapatkan semua skor
    function getAllScores() {
        return scores;
    }

    // Fungsi untuk menampilkan popup setelah score sheet selesai
    function showCompletionPopup() {
        // Hapus popup yang mungkin sudah ada
        const existingPopup = document.querySelector('.completion-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.className = 'completion-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h2>🎯 Score Sheet Selesai!</h2>
                <p>Semua skor telah lengkap. Apa yang ingin Anda lakukan selanjutnya?</p>
                <div class="popup-buttons">
                    <button onclick="navigateTo('player-setup.html')" class="popup-button rerecord-button">
                        🔄 Pencatatan Baru
                    </button>
                    <button onclick="navigateTo('home.html')" class="popup-button home-button">
                        🏠 Kembali ke Home
                    </button>
                </div>
            </div>
        `;

        // Tambahkan popup ke body
        document.body.appendChild(popup);

        // Mainkan suara
        const buttonSound = document.getElementById('buttonSound');
        buttonSound.currentTime = 0;
        buttonSound.play();

        // Log untuk debugging
        console.log('Popup displayed');
    }

    // Fungsi untuk navigasi dengan efek suara
    window.navigateTo = function(url) {
        const buttonSound = document.getElementById('buttonSound');
        buttonSound.currentTime = 0;
        buttonSound.play();
    
        // Tampilkan loading screen
        document.getElementById('globalLoading').classList.remove('tersembunyi');
        document.getElementById('videoLoadingGlobal').play();
    
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    };

    // Fungsi untuk menyimpan sesi ke database
    function saveSessionToDatabase() {
        try {
            if (!isScoreSheetComplete()) {
                alert('Mohon lengkapi semua skor sebelum menyimpan!');
                return;
            }

            if (!playerData || !playerData.players || playerData.players.length === 0) {
                alert('Data pemain tidak ditemukan!');
                return;
            }
        
            // Dapatkan data pemain dari playerData yang sudah ada
            const players = playerData.players.map((player, index) => {
                // Hitung total skor untuk pemain ini
                let totalScore = 0;
                const playerScores = scores[index];
                playerScores.forEach(rowScores => {
                    rowScores.forEach(score => {
                        if (score === 'X') {
                            totalScore += 10;
                        } else if (score === 'M') {
                            totalScore += 0;
                        } else if (score !== '') {
                            totalScore += parseInt(score);
                        }
                    });
                });

                return {
                    name: player.nama,
                    target: player.target,
                    school: player.sekolah || 'Tidak ada sekolah',
                    totalScore: totalScore
                };
            });
        
            // Buat ID unik untuk sesi
            const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
            // Dapatkan nomor sesi untuk pemain pertama
            const sessionNumber = getNextSessionNumber(players[0].name, players[0].school);

            // Simpan data sesi
            const sessionData = {
                id: sessionId,
                date: new Date().toISOString(),
                distance: playerData.jarak,
                players: players,
                sessionNumber: sessionNumber,
                scores: getAllScores()
            };
        
            // Simpan ke localStorage
            localStorage.setItem(`archery_session_${sessionId}`, JSON.stringify(sessionData));
            
            // Verifikasi penyimpanan
            const savedData = localStorage.getItem(`archery_session_${sessionId}`);
            if (!savedData) {
                throw new Error('Data gagal disimpan ke localStorage');
            }

            // Hapus data pemain sementara setelah berhasil disimpan
            localStorage.removeItem('playerData');
        
            // Tampilkan popup selesai
            showCompletionPopup();
        
            console.log('Session saved successfully:', sessionData);
        } catch (error) {
            console.error('Error saving session:', error);
            alert('Terjadi kesalahan saat menyimpan data: ' + error.message);
        }
    }
    
    // Fungsi untuk mendapatkan nomor sesi berikutnya
    function getNextSessionNumber(playerName, playerSchool) {
        let maxSession = 0;
        
        // Cek semua sesi yang ada
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('archery_session_')) {
                try {
                    const session = JSON.parse(localStorage.getItem(key));
                    const player = session.players.find(p => 
                        p.name === playerName && p.school === playerSchool
                    );
                    
                    if (player && session.sessionNumber) {
                        maxSession = Math.max(maxSession, session.sessionNumber);
                    }
                } catch (e) {
                    console.error('Error checking session:', e);
                }
            }
        }
        
        return maxSession + 1;
    }
});

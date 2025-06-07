// Inisialisasi popup petunjuk
document.addEventListener('DOMContentLoaded', () => {
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
});

// Fungsi untuk mendapatkan semua sesi dari local storage
function getAllSessions() {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('archery_session_')) {
            try {
                const session = JSON.parse(localStorage.getItem(key));
                sessions.push(session);
            } catch (e) {
                console.error('Error parsing session:', e);
            }
        }
    }
    return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Fungsi untuk membuat kartu sesi
function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    
    // Tambahkan checkbox untuk seleksi
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'session-checkbox';
    checkbox.dataset.sessionId = session.id;
    card.appendChild(checkbox);

    // Mainkan suara saat mengklik kartu (kecuali checkbox)
    card.onclick = (e) => {
        if (e.target === checkbox) return;
        
        const buttonSound = document.getElementById('buttonSound');
        buttonSound.currentTime = 0;
        buttonSound.play();
        
        window.location.href = `BoxPemain-Base.html?session=${encodeURIComponent(session.id)}`;
    };

    // Tambahkan informasi sesi
    const sessionInfo = document.createElement('div');
    sessionInfo.innerHTML = `
        <div class="session-header">
            <span class="session-date">${formatDate(session.date)}</span>
            <span class="session-distance">🎯 ${session.distance}m</span>
        </div>
        <div class="players-list">
            ${session.players.map(player => `
                <span class="player-tag">
                    👤 ${player.name} - ${player.school || 'Tidak ada sekolah'} (Sesi ${session.sessionNumber || 1})
                </span>
            `).join('')}
        </div>
    `;
    card.appendChild(sessionInfo);

    return card;
}

// Fungsi untuk menghapus sesi yang dipilih
function deleteSelectedSessions() {
    const selectedCheckboxes = document.querySelectorAll('.session-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Pilih sesi yang ingin dihapus');
        return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedCheckboxes.length} sesi terpilih?`)) {
        selectedCheckboxes.forEach(checkbox => {
            const sessionId = checkbox.dataset.sessionId;
            localStorage.removeItem(`archery_session_${sessionId}`);
        });

        // Refresh tampilan
        initializeDatabase();
    }
}

// Fungsi untuk menampilkan popup pengaturan ekspor
function showExportSettings() {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
        <div class="export-modal-content">
            <h2>Pengaturan Ekspor</h2>
            <div class="export-option">
                <label class="switch">
                    <input type="checkbox" id="sortirJuaraToggle" checked>
                    <span class="slider round"></span>
                </label>
                <span>Sortir Juara</span>
            </div>
            <div class="export-option">
                <label class="switch">
                    <input type="checkbox" id="bestMVPToggle">
                    <span class="slider round"></span>
                </label>
                <span>Best MVP</span>
            </div>
            <div class="export-buttons">
                <button onclick="exportSelectedToExcel(true)">Ekspor</button>
                <button onclick="document.querySelector('.export-modal').remove()">Batal</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Fungsi untuk mengurutkan pemain berdasarkan skor
function sortPlayersByScore(players) {
    return players.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
}

// Fungsi untuk mendapatkan juara berdasarkan jumlah pemain
function getWinners(players) {
    const sortedPlayers = sortPlayersByScore(players);
    const totalPlayers = players.length;
    const winners = [];

    for (let i = 0; i < Math.min(totalPlayers, 3); i++) {
        if (i < 2 || totalPlayers >= 4) { // Juara 3 hanya jika ada 4 pemain atau lebih
            winners.push({
                ...sortedPlayers[i],
                rank: i + 1
            });
        }
    }

    return winners;
}

// Fungsi untuk mengekspor sesi yang dipilih ke Excel
function exportSelectedToExcel() {
    const selectedCheckboxes = document.querySelectorAll('.session-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Pilih sesi yang ingin diekspor');
        return;
    }

    const sortirJuara = document.getElementById('sortirJuaraToggle').checked;
    const bestMVP = document.getElementById('bestMVPToggle').checked;

    const selectedSessions = Array.from(selectedCheckboxes).map(checkbox => {
        const sessionId = checkbox.dataset.sessionId;
        return JSON.parse(localStorage.getItem(`archery_session_${sessionId}`));
    });

    const workbook = XLSX.utils.book_new();

    // Sheet untuk data umum
    const generalData = selectedSessions.flatMap(session => {
        return session.players.map(player => ({
            'Tanggal': formatDate(session.date),
            'Jarak': `${session.distance}m`,
            'Nama Pemain': player.name,
            'Sekolah': player.school || 'Tidak ada sekolah',
            'Sesi': session.sessionNumber || 1,
            'Total Skor': player.totalScore || 0
        }));
    });
    const generalSheet = XLSX.utils.json_to_sheet(generalData);
    XLSX.utils.book_append_sheet(workbook, generalSheet, 'Data Umum');

    // Sheet untuk juara jika diaktifkan
    if (sortirJuara) {
        const winnersData = [];
        selectedSessions.forEach((session, groupIndex) => {
            const winners = getWinners(session.players);
            winners.forEach(winner => {
                winnersData.push({
                    'Kelompok': groupIndex + 1,
                    'Juara': winner.rank,
                    'Nama': winner.name,
                    'Sekolah': winner.school || 'Tidak ada sekolah',
                    'Total Skor': winner.totalScore || 0
                });
            });
        });
        const winnersSheet = XLSX.utils.json_to_sheet(winnersData);
        XLSX.utils.book_append_sheet(workbook, winnersSheet, 'Juara');
    }

    // Sheet untuk Best MVP jika diaktifkan
    if (bestMVP) {
        const allPlayers = selectedSessions.flatMap(session => session.players);
        const bestPlayer = sortPlayersByScore(allPlayers)[0];
        const mvpData = [{
            'Nama': bestPlayer.name,
            'Sekolah': bestPlayer.school || 'Tidak ada sekolah',
            'Total Skor': bestPlayer.totalScore || 0,
            'Prestasi': 'Best MVP'
        }];
        const mvpSheet = XLSX.utils.json_to_sheet(mvpData);
        XLSX.utils.book_append_sheet(workbook, mvpSheet, 'Best MVP');
    }

    // Ekspor file
    const fileName = `archery_sessions_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    document.querySelector('.export-modal').remove();
}


// Fungsi untuk menginisialisasi database
function initializeDatabase() {
    const sessionsList = document.getElementById('sessionsList');
    const sessions = getAllSessions();
    
    // Bersihkan daftar sesi
    sessionsList.innerHTML = '';
    
    // Tampilkan sesi yang valid
    sessions.forEach(session => {
        if (session && session.date && session.players && session.players.length > 0) {
            sessionsList.appendChild(createSessionCard(session));
        }
    });

    // Inisialisasi pencarian
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = sessionsList.getElementsByClassName('session-card');
        
        Array.from(cards).forEach(card => {
            const date = card.querySelector('.session-date').textContent.toLowerCase();
            const players = Array.from(card.getElementsByClassName('player-tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            const matchesSearch = date.includes(searchTerm) || 
                players.some(player => player.includes(searchTerm));
            
            card.style.display = matchesSearch || searchTerm === '' ? 'block' : 'none';
        });
    });

    // Inisialisasi tombol ekspor
    const exportButton = document.querySelector('.export-button');
    exportButton.addEventListener('click', exportToExcel);
}

// Fungsi untuk mengekspor ke Excel
function exportToExcel() {
    const sessions = getAllSessions();
    const workbook = XLSX.utils.book_new();
    
    // Format data untuk Excel
    const data = sessions.map(session => ({
        Tanggal: formatDate(session.date),
        Jarak: `${session.distance}m`,
        'Jumlah Pemain': session.players.length,
        'Nama Pemain': session.players.map(p => p.name).join(', ')
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesi Panahan');
    
    // Simpan file
    XLSX.writeFile(workbook, 'database-panahan.xlsx');
}

// Inisialisasi saat dokumen dimuat
document.addEventListener('DOMContentLoaded', initializeDatabase);

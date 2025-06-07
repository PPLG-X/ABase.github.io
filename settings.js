document.addEventListener('DOMContentLoaded', () => {
    // Default settings
    const defaultSettings = {
        theme: 'default',
        fontSize: 100,
        soundEffects: true,
        volume: 100,
        uiAnimations: true,
        language: 'id'
    };
    const globalLoading = document.getElementById('globalLoading');
    const videoLoadingGlobal = document.getElementById('videoLoadingGlobal');
    const layarUtama = document.getElementById('layarUtama');
    const buttonSound = new Audio('aset/Button effect.mp3');

    // Fungsi untuk memainkan efek suara tombol
    function playButtonSound() {
        if (localStorage.getItem('soundEffects') !== 'false') {
            buttonSound.volume = parseFloat(localStorage.getItem('volume')) || 1;
            buttonSound.currentTime = 0;
            buttonSound.play();
        }
    }

    // Fungsi untuk menampilkan layar dengan animasi fade
    function showScreen(screen) {
        screen.classList.remove('tersembunyi');
        setTimeout(() => {
            screen.classList.add('fade-in');
            screen.classList.remove('fade-out');
        }, 50);
    }

    // Fungsi untuk menyembunyikan layar dengan animasi fade
    function hideScreen(screen) {
        screen.classList.add('fade-out');
        screen.classList.remove('fade-in');
        setTimeout(() => {
            screen.classList.add('tersembunyi');
        }, 500);
    }

    // Fungsi untuk menampilkan loading screen
    function showLoading() {
        showScreen(globalLoading);
        return new Promise(resolve => {
            setTimeout(() => {
                hideScreen(globalLoading);
                resolve();
            }, 2000);
        });
    }

    // Event listener untuk video loading global
    videoLoadingGlobal.addEventListener('loadeddata', () => {
        setTimeout(() => {
            hideScreen(globalLoading);
            showScreen(layarUtama);
        }, 1000);
    });

    // Inisialisasi nilai-nilai dari localStorage
    function initializeSettings() {
        // Tema
        const currentTheme = localStorage.getItem('theme') || 'default';
        document.querySelectorAll('.theme-btn').forEach(btn => {
            if (btn.dataset.theme === currentTheme) {
                btn.classList.add('active');
            }
        });

        // Ukuran Font
        const fontSize = localStorage.getItem('fontSize') || '100';
        document.getElementById('currentFontSize').textContent = fontSize + '%';
        document.documentElement.style.fontSize = fontSize + '%';

        // Efek Suara
        const soundEffects = localStorage.getItem('soundEffects') !== 'false';
        document.getElementById('soundEffects').checked = soundEffects;

        // Volume
        const volume = localStorage.getItem('volume') || '1';
        document.getElementById('volumeSlider').value = volume * 100;
        document.getElementById('volumeValue').textContent = Math.round(volume * 100) + '%';

        // Animasi UI
        const uiAnimations = localStorage.getItem('uiAnimations') !== 'false';
        document.getElementById('uiAnimations').checked = uiAnimations;
        document.body.classList.toggle('no-animations', !uiAnimations);

        // Bahasa
        const language = localStorage.getItem('language') || 'id';
        document.getElementById('languageSelect').value = language;
    }

    // Event Listeners untuk pengaturan
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playButtonSound();
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('theme', btn.dataset.theme);
            applyTheme(btn.dataset.theme);
        });
    });

    document.getElementById('decreaseFontBtn').addEventListener('click', () => {
        playButtonSound();
        const currentSize = parseInt(document.getElementById('currentFontSize').textContent);
        if (currentSize > 50) {
            const newSize = currentSize - 10;
            document.getElementById('currentFontSize').textContent = newSize + '%';
            document.documentElement.style.fontSize = newSize + '%';
            localStorage.setItem('fontSize', newSize);
        }
    });

    document.getElementById('increaseFontBtn').addEventListener('click', () => {
        playButtonSound();
        const currentSize = parseInt(document.getElementById('currentFontSize').textContent);
        if (currentSize < 200) {
            const newSize = currentSize + 10;
            document.getElementById('currentFontSize').textContent = newSize + '%';
            document.documentElement.style.fontSize = newSize + '%';
            localStorage.setItem('fontSize', newSize);
        }
    });

    document.getElementById('soundEffects').addEventListener('change', (e) => {
        localStorage.setItem('soundEffects', e.target.checked);
        if (e.target.checked) playButtonSound();
    });

    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        document.getElementById('volumeValue').textContent = e.target.value + '%';
        localStorage.setItem('volume', value);
        buttonSound.volume = value;
        if (localStorage.getItem('soundEffects') !== 'false') playButtonSound();
    });

    document.getElementById('uiAnimations').addEventListener('change', (e) => {
        playButtonSound();
        localStorage.setItem('uiAnimations', e.target.checked);
        document.body.classList.toggle('no-animations', !e.target.checked);
    });

    document.getElementById('languageSelect').addEventListener('change', (e) => {
        playButtonSound();
        localStorage.setItem('language', e.target.value);
    });

    // Tombol Simpan dan Kembali
    document.getElementById('saveSettings').addEventListener('click', async () => {
        playButtonSound();
        await showLoading();
        window.location.href = 'home.html';
    });

    document.getElementById('backButton').addEventListener('click', async () => {
        playButtonSound();
        await showLoading();
        window.location.href = 'home.html';
    });

    // Fungsi untuk menerapkan tema
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Simpan tema ke localStorage
        localStorage.setItem('theme', theme);
    }
    

    // Inisialisasi pengaturan saat halaman dimuat
    initializeSettings();

    // Reset settings handler
    document.getElementById('resetSettings').addEventListener('click', function() {
        // Play button sound
        playButtonSound();

        // Reset all settings to default
        localStorage.setItem('settings', JSON.stringify(defaultSettings));

        // Apply default settings
        applyTheme(defaultSettings.theme);
        document.documentElement.style.fontSize = defaultSettings.fontSize + '%';
        document.getElementById('soundEffects').checked = defaultSettings.soundEffects;
        document.getElementById('volumeSlider').value = defaultSettings.volume;
        document.getElementById('volumeValue').textContent = defaultSettings.volume + '%';
        document.getElementById('uiAnimations').checked = defaultSettings.uiAnimations;
        document.getElementById('languageSelect').value = defaultSettings.language;

        // Update UI to reflect default settings
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === defaultSettings.theme) {
                btn.classList.add('active');
            }
        });

        // Show success message
        alert('Pengaturan berhasil direset ke default!');
    });
});
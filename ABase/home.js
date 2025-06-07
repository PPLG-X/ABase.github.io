document.addEventListener('DOMContentLoaded', () => {
    const globalLoading = document.getElementById('globalLoading');
    const videoLoadingGlobal = document.getElementById('videoLoadingGlobal');
    const layarUtama = document.getElementById('layarUtama');
    const tombolStartArchery = document.getElementById('tombolStartArchery');
    const tombolDatabase = document.getElementById('tombolDatabase');
    const tombolTutorial = document.getElementById('tombolTutorial');
    const tombolSettings = document.getElementById('tombolSettings');
    const buttonSound = new Audio('aset/Button effect.mp3');

    // Fungsi untuk memainkan efek suara tombol
    function playButtonSound() {
        buttonSound.currentTime = 0;
        buttonSound.play();
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

    // Event listeners untuk tombol-tombol
    tombolStartArchery.addEventListener('click', async () => {
        playButtonSound();
        await showLoading();
        window.location.href = 'player-setup.html';
    });

    tombolDatabase.addEventListener('click', async () => {
        playButtonSound();
        await showLoading();
        window.location.href = 'database.html';
    });

    const helpButton = document.getElementById('helpButton');
    const tutorialModal = document.getElementById('tutorialModal');
    const closeModal = document.getElementById('closeModal');

    helpButton.addEventListener('click', () => {
        playButtonSound();
        tutorialModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        playButtonSound();
        tutorialModal.style.display = 'none';
    });

    tutorialModal.addEventListener('click', (e) => {
        if (e.target === tutorialModal) {
            tutorialModal.style.display = 'none';
        }
    });

    tombolTutorial.addEventListener('click', () => {
        playButtonSound();
        let youtubeLink = 'https://youtube.com/shorts/SOR-BDg4zkI?si=-2UakAtlS2L8KJPb'; // Ganti dengan link YouTube yang sesuai
        window.open(youtubeLink, '_blank');
    });

    tombolSettings.addEventListener('click', async () => {
        playButtonSound();
        await showLoading();
        window.location.href = 'Settings.html';
    });
});
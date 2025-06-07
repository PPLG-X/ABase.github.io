document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah kita berada di halaman intro
    const startButton = document.querySelector('.start-button');
    const videoIntro = document.getElementById('videoIntro');

    if (startButton && videoIntro) {
        // Kode untuk halaman intro
        videoIntro.addEventListener('ended', () => {
            startButton.classList.add('visible');
        });

        // Jika video gagal dimuat, tampilkan pesan error dan tombol
        videoIntro.addEventListener('error', () => {
            document.querySelector('.video-error').style.display = 'block';
            startButton.classList.add('visible');
        });

        startButton.addEventListener('click', () => {
            const buttonSound = new Audio('aset/Button effect.mp3');
            buttonSound.play();
            
            // Tampilkan loading dan arahkan ke home.html
            const loading = document.createElement('div');
            loading.className = 'loading-overlay';
            loading.innerHTML = `
                <video autoplay loop muted playsinline>
                    <source src="aset/Loading.mp4" type="video/mp4">
                </video>
            `;
            document.body.appendChild(loading);
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        });
    } else {
        // Kode untuk halaman utama
        const videoLoadingGlobal = document.getElementById('videoLoadingGlobal');
        const globalLoading = document.getElementById('globalLoading');
        const layarUtama = document.getElementById('layarUtama');
        const buttonSound = new Audio('aset/Button effect.mp3');

        // Fungsi untuk mengganti layar dengan animasi
        function gantiLayar(sembunyikan, tampilkan) {
            sembunyikan.classList.add('fade-out');
            
            setTimeout(() => {
                sembunyikan.classList.add('tersembunyi');
                tampilkan.classList.remove('tersembunyi');
                
                void tampilkan.offsetWidth;
                
                tampilkan.classList.remove('fade-out');
                tampilkan.classList.add('fade-in');
            }, 300);
        }

        // Fungsi untuk menampilkan loading global
        function tampilkanLoading() {
            globalLoading.classList.remove('tersembunyi');
            globalLoading.classList.add('fade-in');
            videoLoadingGlobal.play();
        }

        // Fungsi untuk menyembunyikan loading global
        function sembunyikanLoading() {
            globalLoading.classList.add('fade-out');
            setTimeout(() => {
                globalLoading.classList.add('tersembunyi');
                videoLoadingGlobal.pause();
                videoLoadingGlobal.currentTime = 0;
            }, 300);
        }

        // Langsung tampilkan layar utama
        layarUtama.classList.remove('tersembunyi');
        layarUtama.classList.add('fade-in');
        sembunyikanLoading();

        // Menangani klik tombol ScoreSheet
        document.getElementById('tombolScoreSheet')?.addEventListener('click', () => {
            buttonSound.currentTime = 0;
            buttonSound.play();
            
            const tombol = document.getElementById('tombolScoreSheet');
            tombol.style.transform = 'scale(0.95)';
            tombol.style.transition = 'transform 0.3s ease';
            
            tampilkanLoading();
            
            setTimeout(() => {
                tombol.style.transform = '';
                window.location.href = 'player-setup.html';
            }, 300);
        });
        
        // Menangani klik tombol Database
        document.getElementById('tombolDatabase')?.addEventListener('click', () => {
            buttonSound.currentTime = 0;
            buttonSound.play();
            
            const tombol = document.getElementById('tombolDatabase');
            tombol.style.transform = 'scale(0.95)';
            tombol.style.transition = 'transform 0.3s ease';
            
            tampilkanLoading();
            
            setTimeout(() => {
                tombol.style.transform = '';
                window.location.href = 'database.html';
            }, 300);
        });
    }
});

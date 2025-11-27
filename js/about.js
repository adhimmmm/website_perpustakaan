// Ambil elemen-elemen yang diperlukan
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const header = document.querySelector('header');

        // --- Fungsi Toggle Menu ---
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // --- Logika Menutup Menu ---
        function closeMenu() {
            mobileMenu.classList.add('hidden');
        }

        // 1. Logika Menutup ketika Link di Dalam Menu Ditekan
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // 2. Logika Menutup ketika Ditekan di Luar Menu (Click Outside)
        document.addEventListener('click', (event) => {
            // Cek apakah klik berasal dari tombol menu itu sendiri
            const isClickInsideButton = mobileMenuBtn.contains(event.target);
            // Cek apakah klik berada di dalam area menu
            const isClickInsideMenu = mobileMenu.contains(event.target);

            // Jika menu terlihat (tidak memiliki class 'hidden')
            if (!mobileMenu.classList.contains('hidden') && !isClickInsideButton && !isClickInsideMenu) {
                closeMenu();
            }
        });

// Tambahan script untuk scroll effect
        $(document).ready(function() {
            const nav = $('nav');
            
            function handleScroll() {
                if ($(window).scrollTop() > 50) {
                    nav.addClass('scrolled');
                } else {
                    nav.removeClass('scrolled');
                }
            }
            
            $(window).on('scroll', handleScroll);
            handleScroll();
        });
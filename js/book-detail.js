$(document).ready(function () {
        // konfigurasi api
        const GOOGLE_BOOKS_API_KEY = "AIzaSyA0TZpGWq2V-MLq2yX9adtaX2RPf_JIVXY";
        const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

        const detailContainer = $("#detail-container");

        // 1. Ambil Book ID dari URL
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get("id");

        // Cek jika ID tidak ditemukan
        if (!bookId) {
          detailContainer.html(
            '<div class="py-20 text-center"><h2 class="text-3xl text-red-600">ID Buku Tidak Ditemukan.</h2><p class="text-gray-600 mt-2">Silakan kembali ke halaman katalog.</p></div>'
          );
          return;
        }

        // --- Fungsi ASYNC untuk Mengambil Detail Buku ---
        async function fetchBookDetail() {
          // Tampilkan loading state
          $("#loading-state").removeClass("hidden");

          const url = `${BASE_URL}/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`;

          try {
            const response = await fetch(url, { method: "GET" });

            if (!response.ok) {
              throw new Error(`Gagal memuat detail: Status ${response.status}`);
            }

            const book = await response.json();

            // Hilangkan loading state
            $("#loading-state").addClass("hidden");

            // Render Detail Buku
            renderDetail(book);
          } catch (error) {
            console.error("Kesalahan Fetch Detail Buku:", error);
            detailContainer.html(
              '<p class="py-20 text-red-600 text-center font-bold">Gagal memuat detail buku. Periksa koneksi atau API Key Anda.</p>'
            );
          }
        }

        // --- Fungsi Rendering Detail Buku ---
        function renderDetail(book) {
          const info = book.volumeInfo || {};
          const title = info.title || "Tidak Diketahui";
          const author = info.authors
            ? info.authors.join(", ")
            : "Penulis Anonim";
          const publisher = info.publisher || "-";
          const publishedDate = info.publishedDate || "-";
          const description =
            info.description || "Deskripsi lengkap tidak tersedia.";
          const coverUrl = info.imageLinks
            ? info.imageLinks.thumbnail
            : "https://via.placeholder.com/150x220?text=No+Cover";
          const categories = info.categories
            ? info.categories.join(", ")
            : "Umum";
          const previewLink = info.previewLink || "#";

          // Sanitasi deskripsi: ganti <p> atau <br> menjadi spasi jika ada di data API.
          const cleanDescription = description
            .replace(/<\/p>/g, "")
            .replace(/<br>/g, "")
            .replace(/\n/g, "<br>");

          const detailHTML = `
                    <div class="bg-white p-8 rounded-xl shadow-2xl flex flex-col lg:flex-row gap-10">
                        <div class="lg:w-1/3 text-center">
                            <img src="${coverUrl}" alt="${title} Cover" class="w-full max-w-xs mx-auto rounded-lg shadow-xl" style="height: auto;">
                            
                            <a href="${previewLink}" target="_blank" 
                               class="mt-8 block w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-700 transition ${
                                 previewLink === "#"
                                   ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                   : ""
                               }"
                               ${previewLink === "#" ? "disabled" : ""}>
                                ${
                                  previewLink === "#"
                                    ? "Preview Tidak Tersedia"
                                    : "Lihat Buku (Preview)"
                                }
                            </a>

                            <a href="library.html" class="mt-4 block w-full text-blue-600 bg-red-500 text-white rounded-md py-3 hover:bg-red-700 text-lg font-semibold">
                                &larr; Kembali ke Katalog
                            </a>
                        </div>
                        
                        <div class="lg:w-2/3">
                            <h2 class="text-4xl font-bold text-gray-900 mb-3">${title}</h2>
                            <p class="text-2xl text-blue-600 font-medium mb-6">Oleh: ${author}</p>
                            
                            <div class="space-y-3 text-gray-700 mb-8 p-4 bg-gray-50 rounded-lg">
                                <p><strong>Penerbit:</strong> ${publisher}</p>
                                <p><strong>Tahun Terbit:</strong> ${publishedDate}</p>
                                <p><strong>Kategori:</strong> ${categories}</p>
                            </div>
                            
                            <h3 class="text-2xl font-semibold text-gray-800 mb-3">Deskripsi</h3>
                            <div class="text-gray-700 leading-relaxed text-base">
                                ${cleanDescription}
                            </div>
                        </div>
                    </div>
                `;
          detailContainer.html(detailHTML);
        }

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
        
        fetchBookDetail();
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
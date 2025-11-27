$(document).ready(function () {
  // --- KONFIGURASI API ---
  const GOOGLE_BOOKS_API_KEY = "AIzaSyA0TZpGWq2V-MLq2yX9adtaX2RPf_JIVXY";
  const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
  const RESULTS_PER_PAGE = 12;

  // --- VARIABEL GLOBAL ---
  let selectedCategory = "Semua";
  let searchQuery = "";
  let currentPage = 0;
  let totalItems = 0;

  // --- HELPER FUNCTIONS ---

  // Menghasilkan Markup Card Buku
  function createBookCard(book) {
    const info = book.volumeInfo || {};
    const bookId = book.id;

    const title = info.title || "Judul Tidak Tersedia";
    const author = info.authors ? info.authors.join(", ") : "Penulis Anonim";
    const coverUrl = info.imageLinks
      ? info.imageLinks.thumbnail
      : "https://via.placeholder.com/150x220?text=No+Cover";
    const pageCount = info.pageCount || "-";
    const averageRating = info.averageRating || "N/A";
    const bookCategory = info.categories ? info.categories[0] : "Umum";

    const gradient =
      averageRating >= 4.0
        ? "from-green-400 to-blue-500"
        : "from-gray-300 to-gray-400";

    return `
            <div class="book-card bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md cursor-pointer">
                <div class="h-64 bg-gradient-to-br ${gradient} flex items-center justify-center relative">
                    <img src="${coverUrl}" alt="${title} Cover" class="h-full w-full object-contain p-4" 
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/150x220?text=No+Cover'; this.style.objectFit='contain';">
                </div>
                <div class="p-5">
                    <h3 class="text-xl font-bold text-gray-800 mb-2 line-clamp-2">${title}</h3>
                    <p class="text-gray-600 mb-3">${author}</p>
                    <div class="flex justify-between items-center mb-4 text-sm text-gray-500">
                        <span>⭐ ${averageRating}</span>
                        <span>📖 ${pageCount} hal</span>
                    </div>
                    <div class="mb-3">
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                            ${bookCategory}
                        </span>
                    </div>
                    <a href="book-detail.html?id=${bookId}" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
                        Lihat Detail
                    </a>
                </div>
            </div>
        `;
  }

  // Merender Tombol Pagination
  function renderPagination() {
    const paginationContainer = document.getElementById("pagination-container");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalItems <= RESULTS_PER_PAGE) return;

    const totalPages = Math.ceil(totalItems / RESULTS_PER_PAGE);
    let paginationHTML = "";

    // Tombol Sebelumnya
    paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" 
                    class="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition disabled:opacity-50" 
                    ${currentPage === 0 ? "disabled" : ""}>
                &larr; Sebelumnya
            </button>
        `;

    // Tampilkan nomor halaman (max 5 tombol)
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage < 2) endPage = Math.min(totalPages - 1, 4);
    if (currentPage > totalPages - 3) startPage = Math.max(0, totalPages - 5);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button onclick="changePage(${i})" 
                        class="px-4 py-2 mx-1 rounded-lg font-semibold transition ${
                          i === currentPage
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-blue-100"
                        }">
                    ${i + 1}
                </button>
            `;
    }

    // Tombol Selanjutnya
    paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" 
                    class="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition disabled:opacity-50" 
                    ${currentPage >= totalPages - 1 ? "disabled" : ""}>
                Selanjutnya &rarr;
            </button>
        `;

    paginationContainer.innerHTML = paginationHTML;
  }

  // --- FUNGSI ASYNC UTAMA: MENGAMBIL DAN MERENDER BUKU ---
  async function renderBooks(pageIndex = currentPage) {
    if (GOOGLE_BOOKS_API_KEY === "YOUR_GOOGLE_BOOKS_API_KEY") {
      $("#books-grid").html(
        '<p class="col-span-full text-red-500 font-bold text-center py-10">⚠️ Harap masukkan API Key Google Books Anda di file main.js!</p>'
      );
      $("#pagination-container").empty();
      return;
    }

    const booksGrid = document.getElementById("books-grid");
    const noResults = document.getElementById("no-results");

    currentPage = pageIndex;

    // 1. Tampilkan Loading State
    booksGrid.innerHTML = `
            <div class="col-span-full text-center py-20 bg-white rounded-lg shadow-xl border border-blue-100">
                <div class="flex flex-col items-center justify-center">
                    
                    <svg class="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>

                    <p class="text-blue-600 font-bold text-xl mb-2 animate-pulse">
                        Membuka Jendela Dunia...
                    </p>
                    
                    <p class="text-gray-500 text-sm">
                        Memuat koleksi halaman ${currentPage + 1}...
                    </p>
                </div>
            </div>
        `;
    noResults.classList.add("hidden");

    // 2. Siapkan URL dengan filter dan pagination
    let query = searchQuery.trim() || "programming";

    if (selectedCategory !== "Semua") {
      query += `+subject:${selectedCategory}`;
    }

    const startIndex = currentPage * RESULTS_PER_PAGE;

    const url = `${BASE_URL}?q=${query}&maxResults=${RESULTS_PER_PAGE}&startIndex=${startIndex}&key=${GOOGLE_BOOKS_API_KEY}`;

    try {
      // Gunakan AWAIT untuk Fetch Data
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(
          `Gagal memuat: Status ${response.status}. Cek API Key.`
        );
      }

      const data = await response.json();

      booksGrid.innerHTML = "";

      totalItems = data.totalItems || 0;

      // menampilkan total data yang ada
      $("#total-books-count").text(totalItems.toLocaleString("id-ID"));

      if (data.items && data.items.length > 0) {
        booksGrid.innerHTML = data.items.map(createBookCard).join("");
      } else {
        noResults.classList.remove("hidden");
      }

      renderPagination();
    } catch (error) {
      console.error("Kesalahan API Google Books:", error);
      booksGrid.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-red-600 font-bold">Terjadi kesalahan saat mengambil data. (${error.message})</p>
                </div>
            `;
      document.getElementById("pagination-container").innerHTML = "";
    }
  }

  // --- FUNGSI GLOBAL ---

  // Fungsi untuk mengubah halaman (dipanggil dari tombol HTML)
  function changePage(pageIndex) {
    if (pageIndex >= 0 && pageIndex * RESULTS_PER_PAGE < totalItems) {
      renderBooks(pageIndex);
      const catalogSection = document.getElementById('kategori');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // Fungsi Dummy untuk tombol Pinjam Buku (Di halaman detail)
  function borrowBook(title) {
    alert(`Anda ingin meminjam/melihat detail buku: "${title}".`);
  }

  // --- EVENT LISTENERS ---

  // Kategori
  $("#category-buttons").on("click", ".category-btn", function () {
    // Mengubah tampilan tombol yang aktif
    $(".category-btn")
      .removeClass("bg-blue-600 text-white shadow-lg")
      .addClass("bg-gray-100 text-gray-700");
    $(this)
      .removeClass("bg-gray-100 text-gray-700")
      .addClass("bg-blue-600 text-white shadow-lg");

    selectedCategory = $(this).data("category");
    renderBooks(0); // Selalu mulai dari halaman 0 setiap ganti kategori
  });

  // Search (Saat tombol Enter ditekan)
  $("#search-input").on("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    
    searchQuery = $(this).val();
    renderBooks(0); 
    
    // Temukan elemen katalog buku
    const catalogSection = document.getElementById('kategori');
    
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  }
});

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('header');

  //fungsi toggle menu
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  //logika menutup menu
  function closeMenu() {
    mobileMenu.classList.add('hidden');
  }

  //logika menutup ketika link dalam menu di tekan
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  //logika menutup ketika tombol menu ditekan
  document.addEventListener('click', (event) => {
    //cek apakah klik berasal dari tombol yang ada dalam menu
    const isClickInsideButton = mobileMenuBtn.contains(event.target);
    //cek apakah click berada dalam menu sendiri
    const isClickInsideMenu = mobileMenu.contains(event.target);

    //cek kondisi jika menu terlihat atau terbuka
    if(!mobileMenu.classList.contains('hidden') && !isClickInsideButton && !isClickInsideMenu ) {
      closeMenu();
    }
  });

  // Panggil fungsi global
  window.changePage = changePage;
  window.borrowBook = borrowBook;

  // Initial render saat halaman dimuat
  renderBooks(0);
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
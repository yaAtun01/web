document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                `;
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                `;
            }
        });

        // Close mobile menu on clicking any link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                `;
            });
        });
    }

    // 2. Navbar Background on Scroll
    const mainNav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            mainNav.classList.add('shadow-lg', 'shadow-black/20');
        } else {
            mainNav.classList.remove('shadow-lg', 'shadow-black/20');
        }
    });

    // 3. Hero Interactive Showcase: Switch between Anime Player & Manga Reader Preview
    const tabAnimeBtn = document.getElementById('hero-tab-anime');
    const tabMangaBtn = document.getElementById('hero-tab-manga');
    const animePreview = document.getElementById('hero-anime-preview');
    const mangaPreview = document.getElementById('hero-manga-preview');

    if (tabAnimeBtn && tabMangaBtn && animePreview && mangaPreview) {
        tabAnimeBtn.addEventListener('click', () => {
            tabAnimeBtn.classList.add('bg-pink-600', 'text-white', 'shadow-md', 'shadow-pink-600/30');
            tabAnimeBtn.classList.remove('text-gray-400', 'hover:text-white');
            
            tabMangaBtn.classList.remove('bg-purple-600', 'text-white', 'shadow-md', 'shadow-purple-600/30');
            tabMangaBtn.classList.add('text-gray-400', 'hover:text-white');

            animePreview.classList.remove('hidden');
            mangaPreview.classList.add('hidden');
        });

        tabMangaBtn.addEventListener('click', () => {
            tabMangaBtn.classList.add('bg-purple-600', 'text-white', 'shadow-md', 'shadow-purple-600/30');
            tabMangaBtn.classList.remove('text-gray-400', 'hover:text-white');
            
            tabAnimeBtn.classList.remove('bg-pink-600', 'text-white', 'shadow-md', 'shadow-pink-600/30');
            tabAnimeBtn.classList.add('text-gray-400', 'hover:text-white');

            animePreview.classList.add('hidden');
            mangaPreview.classList.remove('hidden');
        });
    }

    // Hero Mock Play/Pause Simulation
    const playPauseBtn = document.getElementById('hero-play-pause-btn');
    const playProgressBar = document.getElementById('hero-progress-bar');
    const playCurrentTime = document.getElementById('hero-current-time');
    let isPlaying = false;
    let playInterval = null;
    let currentSeconds = 872; // 14:32

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    if (playPauseBtn && playProgressBar) {
        playPauseBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                playPauseBtn.innerHTML = `
                    <svg class="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                `;
                playInterval = setInterval(() => {
                    if (currentSeconds < 1435) {
                        currentSeconds++;
                        if (playCurrentTime) playCurrentTime.textContent = formatTime(currentSeconds);
                        const pct = (currentSeconds / 1435) * 100;
                        playProgressBar.style.width = `${pct}%`;
                    } else {
                        clearInterval(playInterval);
                    }
                }, 1000);
            } else {
                playPauseBtn.innerHTML = `
                    <svg class="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
                if (playInterval) clearInterval(playInterval);
            }
        });
    }

    // 4. Content Catalog Category Filter
    const filterButtons = document.querySelectorAll('.catalog-filter-btn');
    const catalogCards = document.querySelectorAll('.catalog-card');
    const catalogCounter = document.getElementById('catalog-count');

    if (filterButtons.length > 0 && catalogCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button state
                filterButtons.forEach(b => {
                    b.classList.remove('active', 'bg-pink-600', 'text-white', 'shadow-md', 'shadow-pink-600/30');
                    b.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
                });
                btn.classList.add('active', 'bg-pink-600', 'text-white', 'shadow-md', 'shadow-pink-600/30');
                btn.classList.remove('bg-white/5', 'text-gray-300', 'border-white/10');

                const selectedCategory = btn.getAttribute('data-category');
                let visibleCount = 0;

                catalogCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                        card.classList.remove('hidden');
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.style.transition = 'all 0.3s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 20);
                        visibleCount++;
                    } else {
                        card.classList.add('hidden');
                    }
                });

                if (catalogCounter) {
                    catalogCounter.textContent = `${visibleCount} Judul Ditampilkan`;
                }
            });
        });
    }

    // 5. Pricing Plan Switcher (Bulanan vs Tahunan)
    const billingToggle = document.getElementById('billing-toggle');
    const pricePro = document.getElementById('price-pro');
    const priceUltimate = document.getElementById('price-ultimate');
    const periodPro = document.getElementById('period-pro');
    const periodUltimate = document.getElementById('period-ultimate');

    if (billingToggle && pricePro && priceUltimate) {
        billingToggle.addEventListener('change', (e) => {
            const isYearly = e.target.checked;
            if (isYearly) {
                // 20% discount on yearly plan
                pricePro.innerHTML = 'Rp 39.000<span class="text-xs text-emerald-400 font-semibold block">Hemat 20% (Ditagih tahunan)</span>';
                priceUltimate.innerHTML = 'Rp 69.000<span class="text-xs text-emerald-400 font-semibold block">Hemat 22% (Ditagih tahunan)</span>';
                if (periodPro) periodPro.textContent = '/bulan';
                if (periodUltimate) periodUltimate.textContent = '/bulan';
            } else {
                pricePro.textContent = 'Rp 49.000';
                priceUltimate.textContent = 'Rp 89.000';
                if (periodPro) periodPro.textContent = '/bulan';
                if (periodUltimate) periodUltimate.textContent = '/bulan';
            }
        });
    }

    // 6. Contact Form Interactive Submit & Feedback Modal/Toast
    const contactForm = document.getElementById('contact-form');
    const formToast = document.getElementById('form-feedback-toast');
    const toastMessage = document.getElementById('toast-message');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract form values
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const category = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value.trim();

            if (!name || !email || !message) {
                showToast('Mohon lengkapi semua kolom yang wajib diisi!', 'error');
                return;
            }

            // Button loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Mengirim Pesan...
            `;

            // Simulate server network call
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Reset form
                contactForm.reset();

                // Show success modal/toast
                showToast(`Terima kasih, <strong>${name}</strong>! Pesan Anda perihal "<strong>${category}</strong>" telah terkirim. Tim FlipPlay akan menghubungi ke <strong>${email}</strong> dalam 1x24 jam.`, 'success');
            }, 1200);
        });
    }

    function showToast(message, type = 'success') {
        if (!formToast || !toastMessage) return;

        toastMessage.innerHTML = message;
        formToast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
        formToast.classList.add('translate-y-0', 'opacity-100');

        if (type === 'error') {
            formToast.classList.add('border-red-500/50', 'bg-red-950/90');
            formToast.classList.remove('border-pink-500/50', 'bg-slate-900/95');
        } else {
            formToast.classList.remove('border-red-500/50', 'bg-red-950/90');
            formToast.classList.add('border-pink-500/50', 'bg-slate-900/95');
        }

        setTimeout(() => {
            formToast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => {
                formToast.classList.add('hidden');
            }, 300);
        }, 5000);
    }

    // 7. Scroll to Top Button
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-5');
                scrollTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
            } else {
                scrollTopBtn.classList.add('opacity-0', 'invisible', 'translate-y-5');
                scrollTopBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

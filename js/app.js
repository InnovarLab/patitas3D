// Force page to start at the top on reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ─── SPA NAVIGATION ───────────────────────
    const pages = ['home', 'roadmap', 'simulator', 'circuits', 'videos', 'programming', 'recursos', 'feedback', 'hidroponia', 'tuneles', 'aldea'];
    let currentPage = 'home';
    let simLoaded = false;
    let hidroLoaded = false;
    let tunelesLoaded = false;
    let aldeaLoaded = false;

    const navbar = document.getElementById('navbar');
    const hoverZone = document.getElementById('navHoverZone');
    const simPage = document.getElementById('page-simulator');
    let collapseTimeout = null;
    let isSimMode = false;
    // Páginas a pantalla completa que usan el auto-colapso del menú
    const fullscreenPages = ['simulator', 'hidroponia', 'tuneles', 'aldea'];
    let appPage = null; // elemento de la página a pantalla completa activa

    // ── Narratrónica: carga diferida de las apps + menú desplegable ──
    function lazyLoadAppFrame(frameId, loaderId, src) {
        const frame = document.getElementById(frameId);
        if (!frame) return;
        frame.addEventListener('load', () => {
            const loader = document.getElementById(loaderId);
            if (loader) loader.classList.add('hidden');
        });
        setTimeout(() => {
            const loader = document.getElementById(loaderId);
            if (loader && !loader.classList.contains('hidden')) loader.classList.add('hidden');
        }, 3500);
        frame.src = src + '?v=' + new Date().getTime();
    }

    function toggleNarra(e) {
        if (e) e.stopPropagation();
        const dd = document.getElementById('narraDropdown');
        if (dd) dd.classList.toggle('open');
    }
    window.toggleNarra = toggleNarra;
    document.addEventListener('click', (e) => {
        const dd = document.getElementById('narraDropdown');
        if (dd && !dd.contains(e.target)) dd.classList.remove('open');
    });

    function navigate(page) {
        if (!pages.includes(page)) return;

        // En celular, las apps Narratrónica se abren directo (sin iframe):
        // el viewport propio de cada app ajusta el lienzo a la pantalla y
        // habilita el pinch-zoom nativo.
        if ((page === 'tuneles' || page === 'hidroponia') && window.innerWidth < 900) {
            window.location.href = page === 'tuneles' ? 'html/tuneles-secretos.html' : 'html/hidroponia.html';
            return;
        }
        currentPage = page;

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
            // Reset animations so they play again when returning to the tab
            p.querySelectorAll('.reveal, .stagger').forEach(el => el.classList.remove('visible'));
        });
        document.getElementById('page-' + page).classList.add('active');

        // Re-trigger the observer for the newly visible page after a tiny delay
        setTimeout(() => {
            if (typeof observeReveals === 'function') observeReveals();
        }, 50);

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Close mobile menu
        document.getElementById('navLinks').classList.remove('open');
        const _nd = document.getElementById('narraDropdown');
        if (_nd) _nd.classList.remove('open');

        // Lazy-load simulator iframe
        if (page === 'simulator' && !simLoaded) {
            const simFrame = document.getElementById('simFrame');
            
            // 1. Agregar el listener ANTES de asignar el src
            simFrame.addEventListener('load', () => {
                const loader = document.getElementById('simLoader');
                if (loader) loader.classList.add('hidden');
            });

            // 2. Fallback: Forzar ocultar el loader a los 3 segundos por si el evento load falla
            setTimeout(() => {
                const loader = document.getElementById('simLoader');
                if (loader && !loader.classList.contains('hidden')) {
                    loader.classList.add('hidden');
                }
            }, 3000);

            // 3. Asignar el src original o el ofuscado ubicado en web/
            // Agregamos un timestamp para evitar que el navegador guarde la versión vieja en caché
            simFrame.src = 'simulador_final.html?v=' + new Date().getTime();

            simLoaded = true;
        }

        // Lazy-load de las apps de Narratrónica
        if (page === 'hidroponia' && !hidroLoaded) {
            lazyLoadAppFrame('hidroFrame', 'hidroLoader', 'html/hidroponia.html');
            hidroLoaded = true;
        }
        if (page === 'aldea' && !aldeaLoaded) {
            lazyLoadAppFrame('aldeaFrame', 'aldeaLoader', 'html/Aldea_Centella_libro_local.html');
            aldeaLoaded = true;
        }
        if (page === 'tuneles' && !tunelesLoaded) {
            lazyLoadAppFrame('tunelesFrame', 'tunelesLoader', 'html/tuneles-secretos.html');
            tunelesLoaded = true;
        }

        // ── NAVBAR AUTO-COLLAPSE en páginas a pantalla completa (simulador + Narratrónica) ──
        // Limpiar nav-hidden de todas las páginas a pantalla completa antes de decidir
        fullscreenPages.forEach(function (pg) {
            var el = document.getElementById('page-' + pg);
            if (el) el.classList.remove('nav-hidden');
        });
        if (fullscreenPages.indexOf(page) !== -1) {
            isSimMode = true;
            appPage = document.getElementById('page-' + page);
            // Small delay so user sees the page first
            setTimeout(() => collapseNavbar(), 600);
            hoverZone.classList.add('active');
        } else {
            isSimMode = false;
            appPage = null;
            expandNavbar(true); // permanent expand
            hoverZone.classList.remove('active');
        }

        // Inicializar Lazy Load con Intersection Observer para Iframes (Videos y Feedback)
        if (page === 'videos' || page === 'feedback') {
            const iframes = document.querySelectorAll(page === 'videos' ? '.video-embed[data-src]' : '#feedbackFrame[data-src]');
            
            const iframeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const iframe = entry.target;
                        if (iframe.getAttribute('src') !== iframe.dataset.src) {
                            iframe.src = iframe.dataset.src;
                        }
                        observer.unobserve(iframe); // Dejar de observar una vez cargado
                    }
                });
            }, { rootMargin: "200px 0px" }); // Cargar 200px antes de que aparezcan

            iframes.forEach(iframe => iframeObserver.observe(iframe));
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Show/hide global mascot
        const globalMascot = document.getElementById('globalMascot');
        if (globalMascot) {
            globalMascot.style.display = (page === 'home') ? 'block' : 'none';
        }

        // Re-trigger scroll reveals
        document.querySelectorAll('.reveal, .stagger').forEach(el => el.classList.remove('visible'));
        setTimeout(observeReveals, 100);
    }

    // ─── COLLAPSE / EXPAND NAVBAR ────────────
    function collapseNavbar() {
        if (!isSimMode || !appPage) return;
        clearTimeout(collapseTimeout);
        navbar.classList.add('sim-collapsed');
        navbar.classList.remove('sim-expanded');
        appPage.classList.add('nav-hidden');
    }

    function expandNavbar(permanent) {
        clearTimeout(collapseTimeout);
        navbar.classList.remove('sim-collapsed');
        navbar.classList.add('sim-expanded');
        if (appPage) appPage.classList.remove('nav-hidden');

        // Auto-collapse after delay unless permanent
        if (!permanent && isSimMode) {
            collapseTimeout = setTimeout(() => collapseNavbar(), 2000);
        }
    }

    // ── Hover zone: mouse enters near top → expand ──
    hoverZone.addEventListener('mouseenter', () => {
        if (isSimMode) expandNavbar(false);
    });

    // ── Navbar: mouse is on it → keep expanded, cancel timer ──
    navbar.addEventListener('mouseenter', () => {
        if (isSimMode) {
            clearTimeout(collapseTimeout);
            navbar.classList.remove('sim-collapsed');
            navbar.classList.add('sim-expanded');
            if (appPage) appPage.classList.remove('nav-hidden');
        }
    });

    // ── Navbar: mouse leaves → re-collapse ──
    navbar.addEventListener('mouseleave', () => {
        if (isSimMode) {
            collapseTimeout = setTimeout(() => collapseNavbar(), 800);
        }
    });

    // ── Touch support: tap near top to toggle ──
    hoverZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isSimMode) {
            if (navbar.classList.contains('sim-collapsed')) {
                expandNavbar(false);
                // Longer timeout on touch so user has time to interact
                clearTimeout(collapseTimeout);
                collapseTimeout = setTimeout(() => collapseNavbar(), 4000);
            } else {
                collapseNavbar();
            }
        }
    }, { passive: false });

    // ─── MOBILE MENU TOGGLE ──────────────────
    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('open');
    });

    // ─── NAVBAR SCROLL EFFECT ────────────────
    window.addEventListener('scroll', () => {
        if (!isSimMode) {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }
    });

    // ─── SCROLL REVEAL OBSERVER ──────────────
    function observeReveals() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal, .stagger').forEach(el => {
            if (!el.classList.contains('visible')) {
                observer.observe(el);
            }
        });
    }

    // ─── HERO VIDEO CAROUSEL ──────────────────
    // Agrega aquí las rutas de los videos que quieras incluir en el carrusel
    const heroVideos = [
        "Video_Project.mp4"
        // "Otro_Video.mp4",
        // "Un_Tercer_Video.mp4"
    ];
    
    let currentVideoIndex = 0;
    const videoElements = [
        document.getElementById('heroVideo1'),
        document.getElementById('heroVideo2')
    ];
    let activeVideoElIndex = 0;

    function playNextHeroVideo() {
        if (heroVideos.length <= 1) {
            // Si solo hay un video, volver a reproducirlo (comportamiento de loop)
            videoElements[activeVideoElIndex].play();
            return;
        }

        const nextVideoIndex = (currentVideoIndex + 1) % heroVideos.length;
        const nextVideoElIndex = (activeVideoElIndex + 1) % 2;
        
        const activeEl = videoElements[activeVideoElIndex];
        const nextEl = videoElements[nextVideoElIndex];

        // Preparar el siguiente video
        nextEl.src = heroVideos[nextVideoIndex];
        nextEl.load();
        
        nextEl.play().then(() => {
            // Transición de opacidad
            nextEl.classList.add('active');
            activeEl.classList.remove('active');
            
            // Actualizar índices
            currentVideoIndex = nextVideoIndex;
            activeVideoElIndex = nextVideoElIndex;
        }).catch(err => console.log("Error al reproducir video del carrusel:", err));
    }

    // Escuchar cuando el video activo termine
    videoElements.forEach(vid => {
        vid.addEventListener('ended', playNextHeroVideo);
    });

    // ─── MASCOT EYES FOLLOW MOUSE ────────────
    document.addEventListener('mousemove', (e) => {
        const eyes = document.querySelectorAll('.mascot-eye');
        if (!eyes.length) return;

        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const maxOffset = 6; // pixeles máximos de desplazamiento

        eyes.forEach(eye => {
            const rect = eye.getBoundingClientRect();
            const eyeX = rect.left + rect.width / 2;
            const eyeY = rect.top + rect.height / 2;
            
            const dx = mouseX - eyeX;
            const dy = mouseY - eyeY;
            const angle = Math.atan2(dy, dx);
            const dist = Math.min(maxOffset, Math.hypot(dx, dy) / 40);

            const offsetX = Math.cos(angle) * dist;
            const offsetY = Math.sin(angle) * dist;
            eye.style.setProperty('--eye-x', `${offsetX}px`);
            eye.style.setProperty('--eye-y', `${offsetY}px`);
        });
    });

    // Init
    observeReveals();

    // ─── LESSON MODAL ────────────
    window.openCircuitModal = function(event, templateId) {
        let originX = '50%';
        let originY = '50%';
        
        // Calculate the center of the clicked card to expand from there
        if (event && event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            originX = (rect.left + rect.width / 2) + 'px';
            originY = (rect.top + rect.height / 2) + 'px';
        }

        const modal = document.getElementById('lessonModal');
        const modalContainer = modal ? modal.querySelector('.modal-container') : null;
        const modalBody = document.getElementById('modalBody');
        const template = document.getElementById('tpl-' + templateId);
        
        if (modal && template && modalContainer) {
            // Set dynamic origin
            modalContainer.style.transformOrigin = `${originX} ${originY}`;
            
            // Set dynamic header content
            const titleElem = document.getElementById('modalTitle');
            const descElem = document.getElementById('modalDesc');
            
            if (titleElem && template.dataset.title) {
                titleElem.textContent = template.dataset.title;
            }
            if (descElem && template.dataset.desc) {
                descElem.textContent = template.dataset.desc;
                descElem.style.display = 'block';
            } else if (descElem) {
                descElem.style.display = 'none';
            }
            
            modalBody.innerHTML = template.innerHTML;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    };

    window.closeCircuitModal = function() {
        const modal = document.getElementById('lessonModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Stop videos when closing by clearing content after animation
            setTimeout(() => {
                document.getElementById('modalBody').innerHTML = '';
            }, 300);
        }
    };

// ═══════════════════════════════════════════════════════════════
// IMAGE ZOOM LOGIC
// ═══════════════════════════════════════════════════════════════
window.openImageZoom = function(imgSrc) {
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('imgZoomSrc');
    const zoomVid = document.getElementById('vidZoomSrc');
    const zoomHtml = document.getElementById('htmlZoomSrc');
    if (zoomModal && zoomImg && zoomVid) {
        zoomVid.style.display = 'none';
        zoomVid.pause();
        zoomVid.removeAttribute('src');
        if (zoomHtml) zoomHtml.style.display = 'none';
        
        zoomImg.src = imgSrc;
        zoomImg.style.display = 'block';
        
        zoomModal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
};

window.openVideoZoom = function(vidSrc) {
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('imgZoomSrc');
    const zoomVid = document.getElementById('vidZoomSrc');
    const zoomHtml = document.getElementById('htmlZoomSrc');
    if (zoomModal && zoomImg && zoomVid) {
        zoomImg.style.display = 'none';
        zoomImg.removeAttribute('src');
        if (zoomHtml) zoomHtml.style.display = 'none';
        
        zoomVid.src = vidSrc;
        zoomVid.style.display = 'block';
        zoomVid.play();
        
        zoomModal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
};

window.openHtmlZoom = function(templateId) {
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('imgZoomSrc');
    const zoomVid = document.getElementById('vidZoomSrc');
    const zoomHtml = document.getElementById('htmlZoomSrc');
    if (zoomModal && zoomHtml) {
        if (zoomImg) {
            zoomImg.style.display = 'none';
            zoomImg.removeAttribute('src');
        }
        if (zoomVid) {
            zoomVid.style.display = 'none';
            zoomVid.pause();
            zoomVid.removeAttribute('src');
        }
        
        const template = document.getElementById(templateId);
        if (template) {
            zoomHtml.innerHTML = template.innerHTML;
            zoomHtml.style.display = 'block';
            zoomModal.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        }
    }
};

window.closeImageZoom = function() {
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomVid = document.getElementById('vidZoomSrc');
    const zoomHtml = document.getElementById('htmlZoomSrc');
    
    if (zoomVid) {
        zoomVid.pause();
        zoomVid.removeAttribute('src');
    }
    
    if (zoomHtml) {
        zoomHtml.innerHTML = '';
        zoomHtml.style.display = 'none';
    }
    
    if (zoomModal) {
        zoomModal.classList.remove('active');
        // Restore background scrolling only if lessonModal isn't open
        const lessonModal = document.getElementById('lessonModal');
        if (!lessonModal || !lessonModal.classList.contains('active')) {
            document.body.style.overflow = ''; 
        }
    }
};

// Global click handler to close modals when clicking outside
window.onclick = function(event) {
    const lessonModal = document.getElementById('lessonModal');
    if (event.target == lessonModal) {
        window.closeCircuitModal();
    }
    const zoomModal = document.getElementById('imageZoomModal');
    if (event.target == zoomModal) {
        window.closeImageZoom();
    }
}

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeCircuitModal();
            if (window.closeImageZoom) window.closeImageZoom();
        }
    });

    // Close modal when clicking outside container
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('lessonModal');
        if (modal && e.target === modal) {
            window.closeCircuitModal();
        }
    });


// Feedback enviado desde contacto.html (iframe): subir la vista de la pagina
// para que se vea la pantalla de confirmacion "Gracias / Enviar otro".
window.addEventListener('message', function (ev) {
    if (ev && ev.data === 'patitas-feedback-sent') {
        var f = document.getElementById('feedbackFrame');
        var nav = document.getElementById('navbar');
        var navH = nav ? nav.offsetHeight : 0;
        if (f && f.getBoundingClientRect) {
            var y = f.getBoundingClientRect().top + window.pageYOffset - navH - 12;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

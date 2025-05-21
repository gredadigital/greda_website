// js/funciones.js

document.addEventListener('DOMContentLoaded', () => {
    // Preloader logic
    const preloader = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const wrapper = document.querySelector('.wrapper');
    document.body.style.overflow = 'hidden';
    wrapper.style.visibility = 'hidden';

    const preloadImages = [
        '../images/bg.jpg',
        '../images/bosque.webp',
        '../images/algas_largas.png',
        '../images/algas_bg.png',
        '../images/angel_rubi.png',
        '../images/toro.png',
        '../images/bahamut.png'
    ];
    let loadedCount = 0;
    const totalCount = preloadImages.length;

    function updateProgress() {
        const percent = Math.round((loadedCount / totalCount) * 100);
        preloaderText.textContent = `cargando ${percent}%...`;
    }

    updateProgress();

    preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
            loadedCount++;
            updateProgress();
            if (loadedCount === totalCount) {
                document.body.style.overflow = '';
                preloader.classList.add('hidden');
                wrapper.style.visibility = 'visible';
                initParallax();
            }
        };
    });
});

function initParallax() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, Flip);

    // Parallax mask on .home
    const home = document.querySelector('.home');
    const oval = document.querySelector('.angel-rubi .ovalo');
    const initialR = Math.hypot(window.innerWidth, window.innerHeight);
    const finalR = window.innerHeight * 0.2;
    const initialY = window.innerHeight / 2;
    ScrollTrigger.create({
        trigger: home,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        pinSpacing: false,
        onUpdate(self) {
            const p = self.progress;
            const rect = oval.getBoundingClientRect();
            const finalY = rect.top + rect.height / 2;
            const r = initialR + (finalR - initialR) * p;
            const y = initialY + (finalY - initialY) * p;
            home.style.setProperty('--maskR', `${r}px`);
            home.style.setProperty('--maskY', `${y}px`);
            const fadeStart = 0.5;
            home.style.opacity = p < fadeStart ? '1' : `${1 - ((p - fadeStart) / (1 - fadeStart))}`;
        }
    });

    // Layer parallax
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    gsap.utils.toArray('.parallax-layer').forEach(layer => {
        const speed = parseFloat(layer.dataset.speed) || 0;
        gsap.to(layer, {
            y: -totalScroll * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: '.wrapper',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true
            }
        });
    });

    // Eyes animation in .angel-rubi
    const angSec = document.querySelector('.angel-rubi');
    const eyesClosed = angSec.querySelector('.ojos_entrecerrados');
    const eyesOpen = angSec.querySelector('.ojos_abiertos');
    if (angSec && eyesClosed && eyesOpen) {
        eyesClosed.style.opacity = '0';
        eyesOpen.style.opacity = '0';
        ScrollTrigger.create({
            trigger: angSec,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate(self) {
                const p = self.progress;
                if (p < 0.02) {
                    eyesClosed.style.opacity = '0';
                    eyesOpen.style.opacity = '0';
                } else if (p < 0.05) {
                    eyesClosed.style.opacity = '1';
                    eyesOpen.style.opacity = '0';
                } else {
                    eyesClosed.style.opacity = '0';
                    eyesOpen.style.opacity = '1';
                }
            }
        });
    }

    // Slider scroll-on-hover (straight)
    const slider = document.querySelector('.angel-rubi .image-slider');
    if (slider) {
        let dir = 0, raf;
        function step() {
            slider.scrollLeft += dir * 5;
            raf = requestAnimationFrame(step);
        }
        function startScroll(val) {
            if (dir === val) return;
            dir = val;
            cancelAnimationFrame(raf);
            step();
        }
        function stopScroll() {
            dir = 0;
            cancelAnimationFrame(raf);
        }
        slider.addEventListener('mousemove', e => {
            const rect = slider.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x > rect.width - 100) startScroll(1);
            else if (x < 100) startScroll(-1);
            else stopScroll();
        });
        slider.addEventListener('mouseleave', stopScroll);
    }

    // Project detail Flip
    const detailEl = document.getElementById('project-detail');
    if (!detailEl) return;
    const titleEl = detailEl.querySelector('.detail-title');
    const clientEl = detailEl.querySelector('.detail_client');
    const descEl = detailEl.querySelector('.detail-description');
    const imgsEl = detailEl.querySelector('.detail-images');
    const closeBtn = detailEl.querySelector('.detail-close');

    fetch('data/proyectos.json')
        .then(res => res.json())
        .then(projects => {
            document.querySelectorAll('.slider-item').forEach(item => {
                item.addEventListener('click', () => {
                    const projectId = item.dataset.project;
                    const project = projects.find(p => p.id === projectId);
                    if (!project) return;

                    // Capture FLIP state
                    const state = Flip.getState([item, detailEl]);

                    // Populate detail
                    titleEl.textContent = project.title;
                    clientEl.textContent = project.client;
                    descEl.innerHTML = project.description;
                    imgsEl.innerHTML = project.images
                        .map(src => `<img src="${src}" alt="" style="max-width:100%;margin-bottom:1rem;display:block;">`)
                        .join('');

                    // Show detail panel
                    detailEl.classList.add('visible');
                    document.body.style.overflow = 'hidden';

                    // Animate FLIP after layout update
                    requestAnimationFrame(() => {
                        Flip.from(state, {
                            duration: 2,
                            ease: 'power2.inOut',
                            absolute: true
                        });
                    });
                });
            });
        })
        .catch(err => console.error('Error loading projects JSON:', err));

    // Close detail
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            detailEl.classList.remove('visible');
            document.body.style.overflow = '';
        });
    }
}

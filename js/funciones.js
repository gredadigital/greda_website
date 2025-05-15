// js/funciones.js

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const wrapper = document.querySelector('.wrapper');

    // Bloquear scroll hasta que acabe la precarga
    document.body.style.overflow = 'hidden';
    wrapper.style.visibility = 'hidden';

    // Lista de imágenes a precargar
    const images = [
        '../images/bg.jpg',
        '../images/bosque.webp',
        '../images/algas_largas.png',
        '../images/algas_bg.png',
        '../images/angel_rubi.png',
        '../images/toro.png',
        '../images/bahamut.png',
    ];
    let loadedCount = 0;
    const totalCount = images.length;

    // Actualiza texto de progreso
    function updateProgress() {
        const percentage = Math.round((loadedCount / totalCount) * 100);
        preloaderText.textContent = `cargando ${percentage}%...`;
    }

    updateProgress();

    // Precarga imágenes
    images.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
            loadedCount++;
            updateProgress();
            if (loadedCount === totalCount) {
                // Desbloquear scroll y mostrar contenido
                document.body.style.overflow = '';
                preloader.classList.add('hidden');
                wrapper.style.visibility = 'visible';
                initParallax();
            }
        };
    });
});

function initParallax() {
    gsap.registerPlugin(ScrollTrigger);

    // Sección home: animar máscara y opacidad
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
        onUpdate: self => {
            const progress = self.progress;
            const rect = oval.getBoundingClientRect();
            const finalY = rect.top + rect.height / 2;
            const r = initialR + (finalR - initialR) * progress;
            const y = initialY + (finalY - initialY) * progress;
            home.style.setProperty('--maskR', `${r}px`);
            home.style.setProperty('--maskY', `${y}px`);
            // Opacidad: permanece plena hasta mitad, luego hace fade out
            const fadeStart = 0.5;
            const opacity = progress < fadeStart ? 1 : 1 - ((progress - fadeStart) / (1 - fadeStart));
            home.style.opacity = opacity;
        }
    });

    // Parallax para capas con data-speed
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

    // Animación de ojos en sección angel-rubi
    const angelSection = document.querySelector('.angel-rubi');
    const entre = document.querySelector('.angel-rubi .ojos_entrecerrados');
    const abi = document.querySelector('.angel-rubi .ojos_abiertos');
    if (angelSection && entre && abi) {
        entre.style.opacity = '0';
        abi.style.opacity = '0';
        ScrollTrigger.create({
            trigger: angelSection,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: self => {
                const p = self.progress;
                if (p < 0.01) {
                    entre.style.opacity = '0';
                    abi.style.opacity = '0';
                } else if (p < 0.06) {
                    entre.style.opacity = '1';
                    abi.style.opacity = '0';
                } else {
                    entre.style.opacity = '0';
                    abi.style.opacity = '1';
                }
            }
        });
    }
}

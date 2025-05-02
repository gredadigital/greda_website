document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const wrapper = document.querySelector('.wrapper');

    // Bloquear scroll hasta que acabe precarga
    document.body.style.overflow = 'hidden';
    wrapper.style.visibility = 'hidden';

    const images = [
        '../images/bg.jpg',
        '../images/bosque.webp',
        '../images/algas_largas.png',
        '../images/algas_bg.png',
        '../images/angel_rubi.png',
        '../images/toro.png',
        '../images/bahamut.png'
    ];
    let loadedCount = 0;
    const totalCount = images.length;

    function updateProgress() {
        const percentage = Math.round((loadedCount / totalCount) * 100);
        preloaderText.textContent = `cargando ${percentage}%...`;
    }

    updateProgress();

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
    const home = document.querySelector('.home');
    const oval = document.querySelector('.angel-rubi .ovalo');

    const initialR = Math.hypot(window.innerWidth, window.innerHeight);
    const finalR = window.innerHeight * 0.2;
    const initialY = window.innerHeight / 2;

    // Mask animation on .home
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
            // Mantener opacidad hasta mitad, luego fade out
            const fadeStart = 0.5;
            let opacity = progress < fadeStart ? 1 : 1 - ((progress - fadeStart) / (1 - fadeStart));
            home.style.opacity = `${opacity}`;
        }
    });

    // Parallax layers animation
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    gsap.utils.toArray('.parallax-layer').forEach(layer => {
        const speed = parseFloat(layer.dataset.speed);
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
}

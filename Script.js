document.addEventListener('DOMContentLoaded', function() {
    // Animación de aparición de secciones al hacer scroll
    const sections = document.querySelectorAll('.section-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Mostrar botón flotante después de desplazarse
    const floatingBtn = document.getElementById('floatingBtn');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            floatingBtn.classList.add('visible');
        } else {
            floatingBtn.classList.remove('visible');
        }
    });
    
    // Contador regresivo
    const deadline = new Date('November 15, 2023 23:59:59').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = deadline - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.getElementById('countdown').innerHTML = '<div style="color: var(--accent); font-weight: bold;">¡La convocatoria ha cerrado!</div>';
        }
    }
    
    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);
    
    // Efecto hover mejorado para tarjetas
    sections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            const icon = this.querySelector('h2 i');
            if (icon) {
                icon.style.transform = 'rotate(10deg) scale(1.1)';
                icon.style.color = 'var(--accent)';
            }
        });
        
        section.addEventListener('mouseleave', function() {
            const icon = this.querySelector('h2 i');
            if (icon) {
                icon.style.transform = '';
                icon.style.color = '';
            }
        });
    });
    
    // Botón de aplicación
    const applyBtn = document.getElementById('applyBtn');
    const floatingApplyBtn = document.getElementById('floatingBtn');
    
    function applyAction() {
        // Aquí iría la lógica para abrir el formulario
        alert('¡Gracias por tu interés! Serás redirigido al formulario de aplicación.');
        // window.location.href = '#formulario';
    }
    
    applyBtn.addEventListener('click', applyAction);
    floatingApplyBtn.addEventListener('click', applyAction);
    
    // Efecto de partículas para el encabezado
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = 'rgba(255,255,255,' + (Math.random() * 0.3 + 0.1) + ')';
        particle.style.borderRadius = '50%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.pointerEvents = 'none';
        document.querySelector('header').appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translateY(0) translateX(0)', opacity: 1 },
            { transform: 'translateY(' + (Math.random() * 100 - 50) + 'px) translateX(' + (Math.random() * 100 - 50) + 'px)', opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        animation.onfinish = () => {
            particle.remove();
            createParticle();
        };
    }
    
    // Crear múltiples partículas
    for (let i = 0; i < 15; i++) {
        createParticle();
    }
});
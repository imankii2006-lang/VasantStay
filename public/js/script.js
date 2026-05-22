document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navLinks');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        // Bahar click karne par menu band ho jaye
        document.addEventListener('click', (event) => {
            if (!menuBtn.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
   
 });
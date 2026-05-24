/**
 * Lourdian Innovation Hub Web Experience Logic
 * Custom, premium Javascript interactions for an outstanding user experience.
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------
    // 1. Header & Navigation Drawer Controls
    // -------------------------------------------------------------------------
    const header = document.querySelector('.header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky header triggers on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile drawer toggle handler
    const toggleMobileMenu = () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
        mobileOverlay.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : 'auto';
    };

    mobileToggle.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });


    // -------------------------------------------------------------------------
    // 2. Active Section Highlighting on Scroll (IntersectionObserver)
    // -------------------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    
    const navObserverOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => navObserver.observe(section));


    // -------------------------------------------------------------------------
    // 3. Scroll Reveal Animations (IntersectionObserver)
    // -------------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animates only once
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(element => revealObserver.observe(element));


    // -------------------------------------------------------------------------
    // 4. Hero Counter Animation
    // -------------------------------------------------------------------------
    const stats = document.querySelectorAll('.stat-num');
    
    const startCounters = () => {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-val'), 10);
            let count = 0;
            const speed = target / 40; // control animation speed

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    stat.innerText = Math.floor(count) + '+';
                    setTimeout(updateCount, 25);
                } else {
                    stat.innerText = target + '+';
                }
            };
            updateCount();
        });
    };

    // Trigger counters when hero stats are in view
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsContainer = document.querySelector('.hero-stats');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }


    // -------------------------------------------------------------------------
    // 5. Idea Portal Form Submission & Dashboard Logic (localStorage)
    // -------------------------------------------------------------------------
    const ideaForm = document.getElementById('ideaForm');
    const formSuccess = document.getElementById('formSuccess');
    const ticketIdSpan = document.getElementById('ticketId');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const liveIdeasGrid = document.getElementById('liveIdeasGrid');

    // Load ideas from localstorage
    const getSavedIdeas = () => {
        const ideas = localStorage.getItem('iedc_ideas');
        return ideas ? JSON.parse(ideas) : [];
    };

    // Save ideas to localstorage
    const saveIdea = (idea) => {
        const ideas = getSavedIdeas();
        ideas.unshift(idea); // Add newest first
        localStorage.setItem('iedc_ideas', JSON.stringify(ideas));
    };

    // Render Ideas on dashboard
    const renderSavedIdeas = () => {
        const ideas = getSavedIdeas();
        if (ideas.length === 0) {
            liveIdeasGrid.innerHTML = `
                <div class="no-ideas">
                    No submissions registered in this browser yet. Submit the form above to see your concept live!
                </div>
            `;
            return;
        }

        liveIdeasGrid.innerHTML = ideas.map(idea => `
            <div class="idea-sub-card">
                <div class="idea-sub-header">
                    <span class="idea-sub-cat">${idea.category}</span>
                    <strong style="font-size: 11px; color: var(--text-muted);">${idea.ticket}</strong>
                </div>
                <h4>${escapeHTML(idea.title)}</h4>
                <p>${escapeHTML(idea.desc.substring(0, 100))}${idea.desc.length > 100 ? '...' : ''}</p>
                <div class="idea-sub-footer">
                    <span>By: ${escapeHTML(idea.name)}</span>
                    <span>${idea.date}</span>
                </div>
            </div>
        `).join('');
    };

    // Form Submitting Logic
    if (ideaForm) {
        ideaForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Input Fields
            const name = document.getElementById('studentName').value;
            const email = document.getElementById('studentEmail').value;
            const branch = document.getElementById('studentBranch').value;
            const categorySelect = document.getElementById('ideaCategory');
            const category = categorySelect.options[categorySelect.selectedIndex].text;
            const title = document.getElementById('ideaTitle').value;
            const desc = document.getElementById('ideaDesc').value;

            // Generate structured Ticket ID
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const ticketId = `#LIH-${randomCode}`;

            // Create date string
            const currentDate = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Idea object structure
            const newIdea = {
                ticket: ticketId,
                name,
                email,
                branch,
                category,
                title,
                desc,
                date: currentDate
            };

            // Save to state
            saveIdea(newIdea);

            // Update DOM views
            ticketIdSpan.innerText = ticketId;
            ideaForm.classList.add('hidden');
            formSuccess.classList.remove('hidden');

            // Refresh dynamic list
            renderSavedIdeas();
        });
    }

    // Reset Form button action
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            ideaForm.reset();
            formSuccess.classList.add('hidden');
            ideaForm.classList.remove('hidden');
        });
    }

    // Simple Helper to prevent HTML injections
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Initial render call
    renderSavedIdeas();

});

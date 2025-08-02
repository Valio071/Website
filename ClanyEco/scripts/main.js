/**
 * ClanyEco - Professional Cleaning Services Website
 * Modern JavaScript for enhanced user experience
 */

// Utility Functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const isElementInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Mobile Menu Class
class MobileMenu {
  constructor() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.menu = document.querySelector('.mobile-menu');
    this.closeBtn = document.querySelector('.mobile-menu-close');
    this.menuLinks = document.querySelectorAll('.mobile-nav-link');
    this.body = document.body;
    
    this.init();
  }

  init() {
    if (!this.menuBtn || !this.menu) return;

    this.menuBtn.addEventListener('click', () => this.toggleMenu());
    this.closeBtn?.addEventListener('click', () => this.closeMenu());
    
    // Close menu when clicking on links
    this.menuLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    this.menu.addEventListener('click', (e) => {
      if (e.target === this.menu) {
        this.closeMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menu?.classList.contains('active')) {
        this.closeMenu();
      }
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 768 && this.menu?.classList.contains('active')) {
        this.closeMenu();
      }
    }, 250));
  }

  toggleMenu() {
    if (this.menu?.classList.contains('active')) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.menu?.classList.add('active');
    this.menu?.setAttribute('aria-hidden', 'false');
    this.menuBtn?.setAttribute('aria-expanded', 'true');
    this.body.style.overflow = 'hidden';
    
    // Focus first menu item for accessibility
    const firstLink = this.menu?.querySelector('.mobile-nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  closeMenu() {
    this.menu?.classList.remove('active');
    this.menu?.setAttribute('aria-hidden', 'true');
    this.menuBtn?.setAttribute('aria-expanded', 'false');
    this.body.style.overflow = '';
    
    // Return focus to menu button
    this.menuBtn?.focus();
  }
}

// Header Scroll Effect Class
class HeaderScrollEffect {
  constructor() {
    this.header = document.querySelector('.header');
    this.scrollThreshold = 50;
    this.init();
  }

  init() {
    if (!this.header) return;

    const handleScroll = throttle(() => {
      const scrolled = window.pageYOffset > this.scrollThreshold;
      this.header?.classList.toggle('scrolled', scrolled);
    }, 16);

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
  }
}

// Smooth Scroll Navigation
class SmoothScrollNavigation {
  constructor() {
    this.navLinks = document.querySelectorAll('a[href^="#"]');
    this.init();
  }

  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update active nav link
          this.updateActiveNavLink(targetId);
        }
      });
    });
  }

  updateActiveNavLink(targetId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === targetId) {
        link.classList.add('active');
      }
    });
  }
}

// Contact Form Class
class ContactForm {
  constructor() {
    this.form = document.querySelector('.contact-form');
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', debounce(() => this.clearErrors(input), 300));
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.form) return;

    const formData = new FormData(this.form);
    const isValid = this.validateForm();
    
    if (!isValid) {
      this.focusFirstError();
      return;
    }

    await this.submitForm(formData);
  }

  validateForm() {
    let isValid = true;
    const requiredFields = this.form?.querySelectorAll('[required]');
    
    requiredFields?.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    // Clear previous errors
    this.clearErrors(field);

    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      errorMessage = 'Това поле е задължително';
      isValid = false;
    }
    // Email validation
    else if (field.type === 'email' && value && !this.isValidEmail(value)) {
      errorMessage = 'Моля въведете валиден имейл адрес';
      isValid = false;
    }
    // Phone validation
    else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
      errorMessage = 'Моля въведете валиден телефонен номер';
      isValid = false;
    }
    // Name validation (minimum 2 characters)
    else if (fieldName === 'name' && value && value.length < 2) {
      errorMessage = 'Името трябва да съдържа поне 2 символа';
      isValid = false;
    }

    if (!isValid) {
      this.showError(field, errorMessage);
    }

    return isValid;
  }

  showError(field, message) {
    const errorElement = document.getElementById(`${field.name}-error`);
    
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.setAttribute('aria-live', 'polite');
    }
  }

  clearErrors(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  focusFirstError() {
    const firstError = this.form?.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Bulgarian phone number patterns
    const phoneRegex = /^(\+359|359|0)?\s?[0-9]{8,9}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  async submitForm(formData) {
    const submitButton = this.form?.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || '';
    
    try {
      // Show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Изпращане...';
      }
      
      // Simulate form submission (replace with actual endpoint)
      await this.simulateSubmission(formData);
      
      this.showSuccess();
      this.form?.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showSubmissionError();
    } finally {
      // Restore button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Изпрати съобщение';
      }
    }
  }

  simulateSubmission(formData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data:', Object.fromEntries(formData));
        resolve();
      }, 2000);
    });
  }

  showSuccess() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
      <i class="fas fa-check-circle"></i>
      Благодарим ви! Ще се свържем с вас в най-скоро време.
    `;
    message.style.cssText = `
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      text-align: center;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    this.form?.insertBefore(message, this.form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  showSubmissionError() {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      Възникна грешка при изпращането. Моля опитайте отново или се обадете на телефона ни.
    `;
    message.style.cssText = `
      background: linear-gradient(135deg, #EF4444, #DC2626);
      color: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      text-align: center;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    this.form?.insertBefore(message, this.form.firstChild);
    
    // Remove message after 8 seconds
    setTimeout(() => {
      message.remove();
    }, 8000);
  }
}

// Portfolio Filter Class
class PortfolioFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.portfolioItems = document.querySelectorAll('.portfolio-item');
    this.init();
  }

  init() {
    if (!this.filterButtons.length || !this.portfolioItems.length) return;

    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target;
        const filter = target.dataset['filter'];
        if (filter) {
          this.filterPortfolio(filter);
          this.updateActiveFilter(target);
        }
      });
    });
  }

  filterPortfolio(filter) {
    this.portfolioItems.forEach(item => {
      const category = item.dataset['category'];
      
      if (filter === 'all' || category === filter) {
        item.classList.remove('hidden');
        item.classList.add('fade-in');
        
        // Remove animation class after animation completes
        setTimeout(() => {
          item.classList.remove('fade-in');
        }, 500);
      } else {
        item.classList.add('hidden');
      }
    });
  }

  updateActiveFilter(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }
}

// Back to Top Button Class
class BackToTop {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.init();
  }

  init() {
    if (!this.button) return;

    // Show/hide button based on scroll position
    const handleScroll = throttle(() => {
      if (window.pageYOffset > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Scroll to top when clicked
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Scroll Animations Class
class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('.service-card, .portfolio-item, .team-member, .feature-card');
    this.init();
  }

  init() {
    if (!this.animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Set initial state and observe elements
    this.animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(element);
    });
  }
}

// Counter Animation Class
class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll('.stat-number');
    this.init();
  }

  init() {
    if (!this.counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    this.counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  animateCounter(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const increment = target / 60; // Animate over ~1 second at 60fps
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = element.textContent.replace(/\d+/, target.toString());
        clearInterval(timer);
      } else {
        element.textContent = element.textContent.replace(/\d+/, Math.floor(current).toString());
      }
    }, 16);
  }
}

// Enhanced Background Effects
class BackgroundEffects {
  constructor() {
    this.createFloatingElements();
  }

  createFloatingElements() {
    const bubblesContainer = document.querySelector('.floating-bubbles');
    const leavesContainer = document.querySelector('.floating-leaves');

    if (bubblesContainer) {
      this.createBubbles(bubblesContainer);
    }

    if (leavesContainer) {
      this.createLeaves(leavesContainer);
    }
  }

  createBubbles(container) {
    for (let i = 0; i < 5; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'floating-bubble';
      bubble.style.cssText = `
        position: absolute;
        width: ${Math.random() * 80 + 40}px;
        height: ${Math.random() * 80 + 40}px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 15}s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
      `;
      container.appendChild(bubble);
    }
  }

  createLeaves(container) {
    for (let i = 0; i < 3; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'floating-leaf';
      leaf.style.cssText = `
        position: absolute;
        width: ${Math.random() * 40 + 30}px;
        height: ${Math.random() * 40 + 30}px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.15));
        border-radius: 50% 0;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 12 + 18}s infinite ease-in-out;
        animation-delay: ${Math.random() * 8}s;
      `;
      container.appendChild(leaf);
    }
  }
}

// Initialize Everything
function initializeWebsite() {
  try {
    // Initialize all components
    new MobileMenu();
    new HeaderScrollEffect();
    new SmoothScrollNavigation();
    new ContactForm();
    new PortfolioFilter();
    new BackToTop();
    new ScrollAnimations();
    new CounterAnimation();
    new BackgroundEffects();

    console.log('ClanyEco website initialized successfully');
  } catch (error) {
    console.error('Error initializing website:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
  initializeWebsite();
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
  // Recalculate any responsive elements if needed
}, 250));
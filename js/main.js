/**
 * Arkadi Clean - Modern JavaScript
 * Optimized for performance, accessibility, and user experience
 */

(function() {
  'use strict';

  // ====================================
  // Utility Functions
  // ====================================

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
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
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

  // ====================================
  // Mobile Menu Functionality
  // ====================================

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
        if (e.key === 'Escape' && this.menu.classList.contains('active')) {
          this.closeMenu();
        }
      });

      // Close menu on resize to desktop
      window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && this.menu.classList.contains('active')) {
          this.closeMenu();
        }
      }, 250));
    }

    toggleMenu() {
      if (this.menu.classList.contains('active')) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }

    openMenu() {
      this.menu.classList.add('active');
      this.menu.setAttribute('aria-hidden', 'false');
      this.menuBtn.setAttribute('aria-expanded', 'true');
      this.body.style.overflow = 'hidden';
      
      // Focus first menu item for accessibility
      const firstLink = this.menu.querySelector('.mobile-nav-link');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    }

    closeMenu() {
      this.menu.classList.remove('active');
      this.menu.setAttribute('aria-hidden', 'true');
      this.menuBtn.setAttribute('aria-expanded', 'false');
      this.body.style.overflow = '';
      
      // Return focus to menu button
      this.menuBtn.focus();
    }
  }

  // ====================================
  // Header Scroll Effect
  // ====================================

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
        this.header.classList.toggle('scrolled', scrolled);
      }, 16);

      window.addEventListener('scroll', handleScroll);
      
      // Initial check
      handleScroll();
    }
  }

  // ====================================
  // Smooth Scrolling for Anchor Links
  // ====================================

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      // Handle anchor links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      });
    }
  }

  // ====================================
  // Form Validation and Submission
  // ====================================

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

    handleSubmit(e) {
      e.preventDefault();
      
      const formData = new FormData(this.form);
      const isValid = this.validateForm();
      
      if (!isValid) {
        this.focusFirstError();
        return;
      }

      this.submitForm(formData);
    }

    validateForm() {
      let isValid = true;
      const requiredFields = this.form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    }

    validateField(field) {
      const fieldName = field.name;
      const value = field.value.trim();
      const errorElement = document.getElementById(`${fieldName}-error`);
      
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
      const firstError = this.form.querySelector('.error');
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
      const submitButton = this.form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Изпращане...';
        
        // Here you would typically send the form data to your server
        // For demo purposes, we'll simulate a successful submission
        await this.simulateSubmission(formData);
        
        this.showSuccess();
        this.form.reset();
        
      } catch (error) {
        console.error('Form submission error:', error);
        this.showSubmissionError();
      } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
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
      message.textContent = 'Благодарим ви! Ще се свържем с вас в най-скоро време.';
      message.style.cssText = `
        background: #10B981;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 600;
      `;
      
      this.form.insertBefore(message, this.form.firstChild);
      
      // Remove message after 5 seconds
      setTimeout(() => {
        message.remove();
      }, 5000);
    }

    showSubmissionError() {
      const message = document.createElement('div');
      message.className = 'error-message';
      message.textContent = 'Възникна грешка при изпращането. Моля опитайте отново или се обадете на телефона ни.';
      message.style.cssText = `
        background: #EF4444;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 600;
      `;
      
      this.form.insertBefore(message, this.form.firstChild);
      
      // Remove message after 8 seconds
      setTimeout(() => {
        message.remove();
      }, 8000);
    }
  }

  // ====================================
  // Scroll Animations
  // ====================================

  class ScrollAnimations {
    constructor() {
      this.observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      this.init();
    }

    init() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        this.fallbackAnimations();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            this.observer.unobserve(entry.target);
          }
        });
      }, this.observerOptions);

      // Observe elements that should animate on scroll
      const animatedElements = document.querySelectorAll(
        '.service-card, .feature, .testimonial, .section-header'
      );
      
      animatedElements.forEach(el => {
        this.observer.observe(el);
      });
    }

    fallbackAnimations() {
      // For browsers without IntersectionObserver, just add the animation class
      const animatedElements = document.querySelectorAll(
        '.service-card, .feature, .testimonial, .section-header'
      );
      
      animatedElements.forEach(el => {
        el.classList.add('animate-fade-in-up');
      });
    }
  }

  // ====================================
  // Performance Optimizations
  // ====================================

  class PerformanceOptimizer {
    constructor() {
      this.init();
    }

    init() {
      // Lazy load images when they become visible
      this.lazyLoadImages();
      
      // Preload critical resources
      this.preloadCriticalResources();
      
      // Clean up animations
      this.cleanupAnimations();
    }

    lazyLoadImages() {
      if (!('IntersectionObserver' in window)) return;

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }

    preloadCriticalResources() {
      // Preload next page resources when user hovers over navigation
      const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
      navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          // Here you could preload resources for the target page
        }, { once: true });
      });
    }

    cleanupAnimations() {
      // Remove will-change property after animations complete
      document.addEventListener('animationend', (e) => {
        e.target.style.willChange = 'auto';
      });
    }
  }

  // ====================================
  // Accessibility Enhancements
  // ====================================

  class AccessibilityEnhancements {
    constructor() {
      this.init();
    }

    init() {
      this.handleFocusTrapping();
      this.announcePageChanges();
      this.enhanceKeyboardNavigation();
    }

    handleFocusTrapping() {
      // Focus trapping for mobile menu
      const mobileMenu = document.querySelector('.mobile-menu');
      if (!mobileMenu) return;

      mobileMenu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        const focusableElements = mobileMenu.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      });
    }

    announcePageChanges() {
      // Create live region for announcements
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);

      // Announce section changes when navigating
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionTitle = entry.target.querySelector('h2, h3');
            if (sectionTitle) {
              liveRegion.textContent = `Навигирахте до секция: ${sectionTitle.textContent}`;
            }
          }
        });
      }, { threshold: 0.5 });

      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => observer.observe(section));
    }

    enhanceKeyboardNavigation() {
      // Improve focus visibility
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });

      // Skip link functionality
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector(skipLink.getAttribute('href'));
          if (target) {
            target.tabIndex = -1;
            target.focus();
          }
        });
      }
    }
  }

  // ====================================
  // Analytics and Tracking
  // ====================================

  class Analytics {
    constructor() {
      this.init();
    }

    init() {
      this.trackFormSubmissions();
      this.trackPhoneCalls();
      this.trackScrollDepth();
    }

    trackFormSubmissions() {
      document.addEventListener('submit', (e) => {
        if (e.target.matches('.contact-form')) {
          this.trackEvent('form', 'submit', 'contact_form');
        }
      });
    }

    trackPhoneCalls() {
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      phoneLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.trackEvent('contact', 'phone_click', link.href);
        });
      });
    }

    trackScrollDepth() {
      let maxScroll = 0;
      const milestones = [25, 50, 75, 90];
      
      const trackScroll = throttle(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          milestones.forEach(milestone => {
            if (scrollPercent >= milestone && !this[`tracked_${milestone}`]) {
              this.trackEvent('scroll', 'depth', `${milestone}%`);
              this[`tracked_${milestone}`] = true;
            }
          });
        }
      }, 250);

      window.addEventListener('scroll', trackScroll);
    }

    trackEvent(action, category, label) {
      // Google Analytics 4 event tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          event_category: category,
          event_label: label
        });
      }
      
      // Console log for development
      console.log('Analytics Event:', { action, category, label });
    }
  }

  // ====================================
  // Portfolio Gallery with Before/After Slider
  // ====================================

  class PortfolioGallery {
    constructor() {
      this.filterButtons = document.querySelectorAll('.filter-btn');
      this.portfolioItems = document.querySelectorAll('.portfolio-item');
      this.beforeAfterSliders = document.querySelectorAll('.image-container');
      this.init();
    }

    init() {
      this.initFilters();
      this.initBeforeAfterSliders();
    }

    initFilters() {
      this.filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const filter = e.target.dataset.filter;
          this.filterPortfolio(filter);
          this.updateActiveFilter(e.target);
        });
      });
    }

    filterPortfolio(filter) {
      this.portfolioItems.forEach(item => {
        const category = item.dataset.category;
        
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

    initBeforeAfterSliders() {
      this.beforeAfterSliders.forEach(container => {
        const afterImage = container.querySelector('.after-image');
        const sliderHandle = container.querySelector('.slider-handle');
        let isDragging = false;

        const updateSlider = (percentage) => {
          // Clamp percentage between 0 and 100
          percentage = Math.max(0, Math.min(100, percentage));
          
          // Update clip-path for after image
          afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
          
          // Update slider handle position
          sliderHandle.style.left = `${percentage}%`;
        };

        const getPercentageFromEvent = (e) => {
          const rect = container.getBoundingClientRect();
          const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
          return ((clientX - rect.left) / rect.width) * 100;
        };

        // Mouse events
        container.addEventListener('mousedown', (e) => {
          isDragging = true;
          container.style.cursor = 'ew-resize';
          updateSlider(getPercentageFromEvent(e));
        });

        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          e.preventDefault();
          updateSlider(getPercentageFromEvent(e));
        });

        document.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            container.style.cursor = 'ew-resize';
          }
        });

        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
          isDragging = true;
          updateSlider(getPercentageFromEvent(e));
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          e.preventDefault();
          updateSlider(getPercentageFromEvent(e));
        }, { passive: false });

        document.addEventListener('touchend', () => {
          isDragging = false;
        });

        // Handle click/tap on slider button
        sliderHandle.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        // Keyboard accessibility
        container.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentLeft = parseFloat(sliderHandle.style.left) || 50;
            updateSlider(currentLeft - 5);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentLeft = parseFloat(sliderHandle.style.left) || 50;
            updateSlider(currentLeft + 5);
          }
        });

        // Make container focusable for keyboard users
        container.setAttribute('tabindex', '0');
        container.setAttribute('role', 'slider');
        container.setAttribute('aria-label', 'Плъзнете за да видите преди и след');
        container.setAttribute('aria-valuemin', '0');
        container.setAttribute('aria-valuemax', '100');
        container.setAttribute('aria-valuenow', '50');
      });
    }
  }

  // ====================================
  // Initialize Everything
  // ====================================

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  function initializeApp() {
    try {
      // Initialize all components
      new MobileMenu();
      new HeaderScrollEffect();
      new SmoothScroll();
      new ContactForm();
      new ScrollAnimations();
      new PortfolioGallery();
      new PerformanceOptimizer();
      new AccessibilityEnhancements();
      new Analytics();

      console.log('Тоби Тобиас ЕООД website initialized successfully');
    } catch (error) {
      console.error('Error initializing website:', error);
    }
  }

  // Handle service worker registration for PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

})();
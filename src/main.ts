/**
 * Tobi Tobias EOOD - Modern TypeScript Application
 * Optimized for performance, accessibility, and user experience
 */

import { ImageOptimizer } from './utils/imageOptimizer.js';
import type {
  ContactFormData,
  ValidationError,
  AnalyticsEvent,
  FormState,
  BeforeAfterSliderEvent,
  EventHandler
} from './types/global.js';

// Utility Functions
const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const isElementInViewport = (el: Element): boolean => {
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
  private menuBtn: HTMLButtonElement | null;
  private menu: HTMLElement | null;
  private closeBtn: HTMLButtonElement | null;
  private menuLinks: NodeListOf<HTMLAnchorElement>;
  private body: HTMLElement;

  constructor() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.menu = document.querySelector('.mobile-menu');
    this.closeBtn = document.querySelector('.mobile-menu-close');
    this.menuLinks = document.querySelectorAll('.mobile-nav-link');
    this.body = document.body;
    
    this.init();
  }

  private init(): void {
    if (!this.menuBtn || !this.menu) return;

    this.menuBtn.addEventListener('click', () => this.toggleMenu());
    this.closeBtn?.addEventListener('click', () => this.closeMenu());
    
    // Close menu when clicking on links
    this.menuLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    this.menu.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.menu) {
        this.closeMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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

  private toggleMenu(): void {
    if (this.menu?.classList.contains('active')) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu(): void {
    this.menu?.classList.add('active');
    this.menu?.setAttribute('aria-hidden', 'false');
    this.menuBtn?.setAttribute('aria-expanded', 'true');
    this.body.style.overflow = 'hidden';
    
    // Focus first menu item for accessibility
    const firstLink = this.menu?.querySelector('.mobile-nav-link') as HTMLElement;
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  private closeMenu(): void {
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
  private header: HTMLElement | null;
  private readonly scrollThreshold = 50;

  constructor() {
    this.header = document.querySelector('.header');
    this.init();
  }

  private init(): void {
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

// Contact Form Class
class ContactForm {
  private form: HTMLFormElement | null;
  private formState: FormState;

  constructor() {
    this.form = document.querySelector('.contact-form');
    this.formState = {
      fields: {},
      errors: {},
      isSubmitting: false,
      isValid: false
    };
    this.init();
  }

  private init(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', debounce(() => this.clearErrors(input), 300));
    });
  }

  private async handleSubmit(e: Event): Promise<void> {
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

  private validateForm(): boolean {
    let isValid = true;
    const requiredFields = this.form?.querySelectorAll('[required]') as NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    
    requiredFields?.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  private validateField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
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

  private showError(field: HTMLElement, message: string): void {
    const errorElement = document.getElementById(`${(field as HTMLInputElement).name}-error`);
    
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.setAttribute('aria-live', 'polite');
    }
  }

  private clearErrors(field: HTMLElement): void {
    const errorElement = document.getElementById(`${(field as HTMLInputElement).name}-error`);
    
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  private focusFirstError(): void {
    const firstError = this.form?.querySelector('.error') as HTMLElement;
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Bulgarian phone number patterns
    const phoneRegex = /^(\+359|359|0)?\s?[0-9]{8,9}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  private async submitForm(formData: FormData): Promise<void> {
    const submitButton = this.form?.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton?.textContent || '';
    
    try {
      // Show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Изпращане...';
      }
      
      // Here you would typically send the form data to your server
      // For demo purposes, we'll simulate a successful submission
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
        submitButton.textContent = originalText;
      }
    }
  }

  private simulateSubmission(formData: FormData): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data:', Object.fromEntries(formData));
        resolve();
      }, 2000);
    });
  }

  private showSuccess(): void {
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
    
    this.form?.insertBefore(message, this.form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  private showSubmissionError(): void {
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
    
    this.form?.insertBefore(message, this.form.firstChild);
    
    // Remove message after 8 seconds
    setTimeout(() => {
      message.remove();
    }, 8000);
  }
}

// Portfolio Gallery Class
class PortfolioGallery {
  private filterButtons: NodeListOf<HTMLButtonElement>;
  private portfolioItems: NodeListOf<HTMLElement>;
  private beforeAfterSliders: NodeListOf<HTMLElement>;

  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.portfolioItems = document.querySelectorAll('.portfolio-item');
    this.beforeAfterSliders = document.querySelectorAll('.image-container');
    this.init();
  }

  private init(): void {
    this.initFilters();
    this.initBeforeAfterSliders();
  }

  private initFilters(): void {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLButtonElement;
        const filter = target.dataset['filter'];
        if (filter) {
          this.filterPortfolio(filter);
          this.updateActiveFilter(target);
        }
      });
    });
  }

  private filterPortfolio(filter: string): void {
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

  private updateActiveFilter(activeButton: HTMLButtonElement): void {
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  private initBeforeAfterSliders(): void {
    this.beforeAfterSliders.forEach(container => {
      const afterImage = container.querySelector('.after-image') as HTMLElement;
      const sliderHandle = container.querySelector('.slider-handle') as HTMLElement;
      let isDragging = false;

      const updateSlider = (percentage: number): void => {
        // Clamp percentage between 0 and 100
        percentage = Math.max(0, Math.min(100, percentage));
        
        // Update clip-path for after image
        if (afterImage) {
          afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
        }
        
        // Update slider handle position
        if (sliderHandle) {
          sliderHandle.style.left = `${percentage}%`;
        }
      };

      const getPercentageFromEvent = (e: BeforeAfterSliderEvent): number => {
        const rect = container.getBoundingClientRect();
        const clientX = e.type.includes('touch') && e.touches ? e.touches[0].clientX : (e.clientX || 0);
        return ((clientX - rect.left) / rect.width) * 100;
      };

      // Mouse events
      container.addEventListener('mousedown', (e: MouseEvent) => {
        isDragging = true;
        container.style.cursor = 'ew-resize';
        updateSlider(getPercentageFromEvent(e as BeforeAfterSliderEvent));
      });

      document.addEventListener('mousemove', (e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        updateSlider(getPercentageFromEvent(e as BeforeAfterSliderEvent));
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          container.style.cursor = 'ew-resize';
        }
      });

      // Keyboard accessibility
      container.addEventListener('keydown', (e: KeyboardEvent) => {
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

// Analytics Class
class Analytics {
  constructor() {
    this.init();
  }

  private init(): void {
    this.trackFormSubmissions();
    this.trackPhoneCalls();
    this.trackScrollDepth();
  }

  private trackFormSubmissions(): void {
    document.addEventListener('submit', (e: Event) => {
      if ((e.target as HTMLElement).matches('.contact-form')) {
        this.trackEvent('form', 'submit', 'contact_form');
      }
    });
  }

  private trackPhoneCalls(): void {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]') as NodeListOf<HTMLAnchorElement>;
    phoneLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('contact', 'phone_click', link.href);
      });
    });
  }

  private trackScrollDepth(): void {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90];
    const tracked: Record<number, boolean> = {};
    
    const trackScroll = throttle(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked[milestone]) {
            this.trackEvent('scroll', 'depth', `${milestone}%`);
            tracked[milestone] = true;
          }
        });
      }
    }, 250);

    window.addEventListener('scroll', trackScroll);
  }

  private trackEvent(action: string, category: string, label?: string): void {
    // Google Analytics 4 event tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label
      });
    }
    
    // Console log for development
    console.log('Analytics Event:', { action, category, label });
  }
}

// Initialize Everything
function initializeApp(): void {
  try {
    // Initialize all components
    new MobileMenu();
    new HeaderScrollEffect();
    new ContactForm();
    new PortfolioGallery();
    new ImageOptimizer();
    new Analytics();

    console.log('Тоби Тобиас ЕООД website initialized successfully');
  } catch (error) {
    console.error('Error initializing website:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
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
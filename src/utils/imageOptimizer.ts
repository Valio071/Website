/**
 * Image Optimization and Lazy Loading Utility
 * Handles responsive images, WebP/AVIF formats, and lazy loading
 */

import type { ResponsiveImageOptions, ImageSources } from '../types/global.js';

export class ImageOptimizer {
  private observer: IntersectionObserver | null;
  private supportsWebP: Promise<boolean>;
  private supportsAVIF: Promise<boolean>;

  constructor() {
    this.observer = null;
    this.supportsWebP = this.checkWebPSupport();
    this.supportsAVIF = this.checkAVIFSupport();
    this.init();
  }

  async init(): Promise<void> {
    await this.supportsWebP;
    await this.supportsAVIF;
    this.setupLazyLoading();
    this.preloadCriticalImages();
  }

  // Check browser support for modern image formats
  private checkWebPSupport(): Promise<boolean> {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  private checkAVIFSupport(): Promise<boolean> {
    return new Promise(resolve => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  // Generate responsive image sources
  generateSrcSet(basePath: string, sizes: number[] = [400, 800, 1200, 1600]): string {
    const extension = basePath.split('.').pop();
    const baseName = basePath.replace(`.${extension}`, '');
    
    return sizes.map(size => {
      const webp = `${baseName}-${size}w.webp ${size}w`;
      const avif = `${baseName}-${size}w.avif ${size}w`;
      const fallback = `${baseName}-${size}w.${extension} ${size}w`;
      
      if (this.supportsAVIF) return avif;
      if (this.supportsWebP) return webp;
      return fallback;
    }).join(', ');
  }

  // Setup intersection observer for lazy loading
  private setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadAllImages();
      return;
    }

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target as HTMLElement);
          this.observer?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all lazy images
    const lazyImages = document.querySelectorAll('img[data-src], picture[data-src]');
    lazyImages.forEach(img => this.observer?.observe(img));
  }

  // Load individual image
  private loadImage(element: HTMLElement): void {
    if (element.tagName === 'IMG') {
      this.loadImgElement(element as HTMLImageElement);
    } else if (element.tagName === 'PICTURE') {
      this.loadPictureElement(element as HTMLPictureElement);
    }

    // Add loading animation
    element.classList.add('loading');
    
    // Handle load event
    const img = element.tagName === 'IMG' ? element as HTMLImageElement : element.querySelector('img');
    if (img) {
      img.addEventListener('load', () => {
        element.classList.remove('loading');
        element.classList.add('loaded');
      }, { once: true });

      img.addEventListener('error', () => {
        element.classList.remove('loading');
        element.classList.add('error');
      }, { once: true });
    }
  }

  private loadImgElement(img: HTMLImageElement): void {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      img.removeAttribute('data-srcset');
    }
  }

  private loadPictureElement(picture: HTMLPictureElement): void {
    const sources = picture.querySelectorAll('source[data-srcset]') as NodeListOf<HTMLSourceElement>;
    sources.forEach(source => {
      if (source.dataset.srcset) {
        source.srcset = source.dataset.srcset;
        source.removeAttribute('data-srcset');
      }
    });

    const img = picture.querySelector('img[data-src]') as HTMLImageElement;
    if (img) {
      this.loadImgElement(img);
    }
  }

  // Preload critical above-the-fold images
  private preloadCriticalImages(): void {
    const criticalImages = document.querySelectorAll('img[data-critical="true"]') as NodeListOf<HTMLImageElement>;
    criticalImages.forEach(img => {
      this.loadImage(img);
    });
  }

  // Fallback for browsers without intersection observer
  private loadAllImages(): void {
    const lazyImages = document.querySelectorAll('img[data-src], picture[data-src]') as NodeListOf<HTMLElement>;
    lazyImages.forEach(img => this.loadImage(img));
  }

  // Create optimized picture element
  createPictureElement(src: string, alt: string, sizes: string, className = ''): HTMLPictureElement {
    const picture = document.createElement('picture');
    picture.className = className;

    // AVIF source
    if (this.supportsAVIF) {
      const avifSource = document.createElement('source');
      avifSource.setAttribute('data-srcset', this.generateAVIFSrcSet(src));
      avifSource.setAttribute('sizes', sizes);
      avifSource.type = 'image/avif';
      picture.appendChild(avifSource);
    }

    // WebP source
    if (this.supportsWebP) {
      const webpSource = document.createElement('source');
      webpSource.setAttribute('data-srcset', this.generateWebPSrcSet(src));
      webpSource.setAttribute('sizes', sizes);
      webpSource.type = 'image/webp';
      picture.appendChild(webpSource);
    }

    // Fallback image
    const img = document.createElement('img');
    img.setAttribute('data-src', src);
    img.setAttribute('data-srcset', this.generateSrcSet(src));
    img.setAttribute('sizes', sizes);
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    
    picture.appendChild(img);
    return picture;
  }

  private generateWebPSrcSet(basePath: string): string {
    return this.generateSrcSet(basePath).replace(/\.(jpg|jpeg|png)/g, '.webp');
  }

  private generateAVIFSrcSet(basePath: string): string {
    return this.generateSrcSet(basePath).replace(/\.(jpg|jpeg|png)/g, '.avif');
  }
}

// CSS for image loading states
export const imageLoadingCSS = `
  img, picture {
    transition: opacity 0.3s ease;
  }

  img.loading, picture.loading {
    opacity: 0.5;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading-shimmer 1.5s infinite;
  }

  img.loaded, picture.loaded {
    opacity: 1;
  }

  img.error, picture.error {
    opacity: 0.3;
    background: #f5f5f5;
  }

  @keyframes loading-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Responsive image utilities */
  .img-responsive {
    width: 100%;
    height: auto;
  }

  .img-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .img-contain {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
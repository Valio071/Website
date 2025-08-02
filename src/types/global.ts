// Global type definitions for the Tobi Tobias website

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  service?: 'office' | 'bathroom' | 'kitchen' | 'furniture' | 'other';
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  category: 'office' | 'bathroom' | 'kitchen' | 'furniture';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: 'office' | 'bathroom' | 'kitchen' | 'furniture';
  beforeImage: string;
  afterImage: string;
  alt: string;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export interface ImageSources {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

export interface ResponsiveImageOptions {
  sizes: number[];
  formats: ('webp' | 'avif' | 'jpg' | 'png')[];
  quality: number;
  lazy: boolean;
}

// DOM Event Types
export interface BeforeAfterSliderEvent extends Event {
  clientX: number;
  touches?: TouchList;
}

// Configuration Types
export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  phone: string;
  email: string;
  address: {
    city: string;
    country: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
}

// Form Validation Types
export interface FormField {
  name: string;
  value: string;
  required: boolean;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean;
  };
}

export interface FormState {
  fields: Record<string, FormField>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Performance Types
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// Accessibility Types
export interface A11yConfig {
  announcements: boolean;
  focusTrapping: boolean;
  keyboardNavigation: boolean;
  contrastRatio: 'AA' | 'AAA';
}

// Browser Support Detection
export interface BrowserSupport {
  webp: boolean;
  avif: boolean;
  intersectionObserver: boolean;
  serviceWorker: boolean;
  webGL: boolean;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  url?: string;
  userAgent?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface ContactSubmissionResponse {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  message: string;
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  structuredData: Record<string, unknown>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EventHandler<T = Event> = (event: T) => void;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  onClick?: EventHandler<MouseEvent>;
  onKeyDown?: EventHandler<KeyboardEvent>;
  onFocus?: EventHandler<FocusEvent>;
  onBlur?: EventHandler<FocusEvent>;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Global Window Extensions
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    __SITE_CONFIG__?: SiteConfig;
  }

  interface Navigator {
    connection?: {
      effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
      downlink: number;
      rtt: number;
      saveData: boolean;
    };
  }
}

export {};
/**
 * Animation utilities for the online exam platform
 * Handles reveal animations, intersection observer, and interactive effects
 */

/**
 * Initialize reveal animations using Intersection Observer
 * Automatically triggers reveal animation when elements come into view
 */
export const initializeRevealAnimations = () => {
  if (typeof window === 'undefined') return;

  // First, make all reveal elements visible immediately (no initial animation)
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el) => {
    el.classList.remove('animate-reveal');
  });

  // Create observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add the animate class to trigger animation
        entry.target.classList.add('animate-reveal');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });

  revealElements.forEach((el) => {
    observer.observe(el);
    // Trigger animation immediately if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      el.classList.add('animate-reveal');
      observer.unobserve(el);
    }
  });
};

/**
 * Add 3D tilt effect to cards on mouse move
 * @param {string} selector - CSS selector for elements to apply tilt effect to
 */
export const addTiltEffect = (selector = '.tilt-card') => {
  const cards = document.querySelectorAll(selector);

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * 10;
      const rotateY = ((x / rect.width) - 0.5) * -10;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      card.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.transition = 'transform 0.3s ease-out';
    });
  });
};

/**
 * Add ripple effect to buttons on click
 * @param {string} selector - CSS selector for button elements
 */
export const addRippleEffect = (selector = 'button, .btn') => {
  const buttons = document.querySelectorAll(selector);

  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');

      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
};

/**
 * Animate counter numbers from 0 to target value
 * @param {Element} element - The element containing the number
 * @param {number} target - Target number value
 * @param {number} duration - Animation duration in milliseconds (default: 1000)
 */
export const animateCounter = (element, target, duration = 1000) => {
  let current = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
};

/**
 * Initialize progress bar animation
 * @param {string} selector - CSS selector for progress bar
 * @param {number} duration - Animation duration in milliseconds
 */
export const animateProgressBar = (selector, duration = 1000) => {
  const bars = document.querySelectorAll(selector);

  bars.forEach((bar) => {
    const targetWidth = bar.dataset.width || 75;
    bar.style.animation = `none`;
    setTimeout(() => {
      bar.style.width = `${targetWidth}%`;
      bar.style.transition = `width ${duration}ms ease-out`;
    }, 10);
  });
};

/**
 * Stagger animations for child elements
 * @param {string} parentSelector - CSS selector for parent container
 * @param {number} delay - Delay between each animation in milliseconds
 */
export const staggerChildren = (parentSelector, delay = 100) => {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  const children = parent.children;
  Array.from(children).forEach((child, index) => {
    if (!child.classList.contains('reveal')) {
      child.classList.add('reveal');
    }
    child.style.animationDelay = `${index * delay}ms`;
  });
};

/**
 * Add scroll-triggered animations
 * Triggers animation when element scrolls into view
 * @param {string} selector - CSS selector for elements
 */
export const addScrollAnimation = (selector) => {
  const elements = document.querySelectorAll(selector);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
  });

  elements.forEach((element) => {
    observer.observe(element);
  });
};

/**
 * Cleanup all animations and observers
 */
export const cleanupAnimations = () => {
  const observers = document.querySelectorAll('[data-observer]');
  observers.forEach((el) => {
    el.removeAttribute('data-observer');
  });
};

export default {
  initializeRevealAnimations,
  addTiltEffect,
  addRippleEffect,
  animateCounter,
  animateProgressBar,
  staggerChildren,
  addScrollAnimation,
  cleanupAnimations,
};

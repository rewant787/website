window.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  app.use(express.static(path.join(__dirname, 'public')));


  // Lazy loading images
  const lazyImages = document.querySelectorAll('img[data-src');
  const lazyLoad = target => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('fade-in');
          observer.disconnect();
        }
      });
    });
    io.observe(target);
  };
  lazyImages.forEach(lazyLoad);

  // Debounce function for performance optimization
  function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // Use debounce for scroll events
  const scrollHandler = debounce(function() {
    revealSections();
    // ... other scroll-based functions ...
  }, 20);

  window.addEventListener('scroll', scrollHandler);

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  // ... rest of your existing code ...
});

// Cookie consent
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setDate(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

if (!getCookie('cookieconsent')) {
  const banner = document.createElement('div');
  banner.innerHTML = `
    <p>This website uses cookies to ensure you get the best experience on our website. 
    <a href="/privacy-policy">Learn more</a></p>
    <button id="acceptCookies">Got it!</button>
  `;
  banner.id = 'cookieConsentBanner';
  document.body.appendChild(banner);

  document.getElementById('acceptCookies').onclick = function() {
    setCookie('cookieconsent', 'accepted', 365);
    document.body.removeChild(banner);
  };
}
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const loader = document.querySelector(".loader");
    if (loader) loader.style.display = "none";
  }, 2000); // 2 seconds
});
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 2000); // 2 seconds
});

// Enhanced Form Handling with Backend Integration
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form handlers
  const bookingForm = document.getElementById('bookingForm');
  const astrologyForm = document.getElementById('astrologyForm');
  const contactForm = document.querySelector('.contact-form');

  if (bookingForm) {
    bookingForm.addEventListener('submit', handlePujaBooking);
  }

  if (astrologyForm) {
    astrologyForm.addEventListener('submit', handleAstrologyBooking);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }

  // Initialize other components
  initializeLoader();
  initializeAnimations();
  
  console.log('🕉️ Frontend connected to backend successfully! 🙏');
});

// Proper Form Submission with Backend
function initializeForms() {
  const bookingForm = document.getElementById('bookingForm');
  const astrologyForm = document.getElementById('astrologyForm');
  const contactForm = document.querySelector('.contact-form');

  if (bookingForm) {
    bookingForm.addEventListener('submit', handlePujaBooking);
  }

  if (astrologyForm) {
    astrologyForm.addEventListener('submit', handleAstrologyBooking);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }
}

async function handlePujaBooking(e) {
  e.preventDefault();
  
  if (!validateForm(this)) return;

  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    puja: document.getElementById('puja').value,
    date: document.getElementById('date').value,
    address: document.getElementById('address').value,
    details: document.getElementById('details').value
  };

  try {
    showLoader();
    
    const response = await fetch('http://localhost:3000/api/book-puja', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    
    if (result.success) {
      showSuccessModal('Puja booking request sent successfully!');
      this.reset();
      
      // Also send WhatsApp message as backup
      const whatsappMessage = createWhatsAppMessage(formData, 'puja');
      window.open(`https://wa.me/919339216754??=${whatsappMessage}`, '_blank');
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Booking error:', error);
    showErrorNotification('Booking failed. Please try WhatsApp booking.');
    
    // Fallback to WhatsApp
    const whatsappMessage = createWhatsAppMessage(formData, 'puja');
    window.open(`https://wa.me/919339216754?text=${whatsappMessage}`, '_blank');
  } finally {
    hideLoader();
  }
}

async function handleAstrologyBooking(e) {
  e.preventDefault();
  if (!validateForm(this)) return;

  const formData = {
    name: document.getElementById('astro-name').value,
    phone: document.getElementById('astro-phone').value,
    service: document.getElementById('astro-service').value,
    birthDate: document.getElementById('birth-date').value,
    birthTime: document.getElementById('birth-time').value,
    birthPlace: document.getElementById('birth-place').value,
    query: document.getElementById('astro-query').value
  };

  try {
    showLoader();
    
    const response = await fetch('http://localhost:3000/api/astrology-consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    
    if (result.success) {
      showSuccessModal('Astrology consultation request sent successfully!');
      this.reset();
      
      // Also send WhatsApp message
      const whatsappMessage = createWhatsAppMessage(formData, 'astrology');
      window.open(`https://wa.me/919339216754?text=${whatsappMessage}`, '_blank');
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Consultation error:', error);
    showErrorNotification('Request failed. Please try WhatsApp booking.');
    
    // Fallback to WhatsApp
    const whatsappMessage = createWhatsAppMessage(formData, 'astrology');
    window.open(`https://wa.me/919339216754?text=${whatsappMessage}`, '_blank');
  } finally {
    hideLoader();
  }
}

// Utility Functions
function showLoader() {
  let loader = document.getElementById('loadingOverlay');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loadingOverlay';
    loader.className = 'loading-overlay';
    loader.innerHTML = `
      <div class="loading-content">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Processing your request...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

function hideLoader() {
  const loader = document.getElementById('loadingOverlay');
  if (loader) {
    loader.style.display = 'none';
  }
}

function showSuccessModal(message) {
  let modal = document.getElementById('successModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'successModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 text-center">
            <div class="w-100">
              <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
              <h4 class="modal-title fw-bold">Success!</h4>
            </div>
          </div>
          <div class="modal-body text-center">
            <p class="mb-4">${message}</p>
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              Please keep your phone available for our call.
            </div>
          </div>
          <div class="modal-footer border-0 justify-content-center">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.querySelector('.modal-body p').textContent = message;
  }
  new bootstrap.Modal(modal).show();
}

function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'alert alert-danger alert-dismissible fade show position-fixed';
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    <i class="fas fa-exclamation-triangle me-2"></i> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 5000);
}

function createWhatsAppMessage(data, type) {
  if (type === 'puja') {
    return encodeURIComponent(`🙏 *New Puja Booking Request*

👤 *Name:* ${data.name}
📱 *Phone:* ${data.phone}
🕉️ *Puja Type:* ${data.puja}
📅 *Date:* ${data.date}
🏠 *Address:* ${data.address}
📝 *Details:* ${data.details}
Please confirm my booking. Thank you! 🙏`);
  } else {
    return encodeURIComponent(`🔮 *Astrology Consultation Request*

👤 *Name:* ${data.name}
📱 *Phone:* ${data.phone}
⭐ *Service:* ${data.service}
🎂 *Birth Date:* ${data.birthDate}
⏰ *Birth Time:* ${data.birthTime}
📍 *Birth Place:* ${data.birthPlace}
❓ *Query:* ${data.query}

Please schedule my consultation. Thank you! 🙏`);
  }
}

// Enhanced Validation
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      isValid = false;
    } else {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    }
  });

  // Phone validation
  const phoneFields = form.querySelectorAll('input[type="tel"]');
  phoneFields.forEach(phone => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
      phone.classList.add('is-invalid');
      isValid = false;
    }
  });

  // Email validation
  const emailFields = form.querySelectorAll('input[type="email"]');
  emailFields.forEach(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
      email.classList.add('is-invalid');
      isValid = false;
    }
  });

  return isValid;
}

// Enhanced Loader with proper timing
function initializeLoader() {
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('loadingLoad');
  
  if (loader) {
    console.log('🔄 Loader initialized - starting timer');
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20
      if (progress > 100) progress = 100;
      
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 100);
    
    // Force hide after exactly 2 seconds
    setTimeout(() => {
      console.log('⏰ 2 seconds elapsed - hiding loader');
      
      // Clear any running intervals
      clearInterval(progressInterval);
      
      // Add hide class for smooth transition
      loader.classList.add('hide');
      
      // Remove from DOM after transition completes
      setTimeout(() => {
        if (loader && loader.parentNode) {
          console.log('🗑️ Removing loader from DOM');
          loader.remove();
          
          // Enable body scrolling
          document.body.style.overflow = 'auto';
        }
      }, 800); // Match CSS transition duration
      
    }, 2000); // Exactly 2 seconds
  } else {
    console.error('❌ Loader element not found!');
  }
}

// Initialize loader immediately when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM loaded - initializing loader');
  
  // Disable body scrolling while loading
  document.body.style.overflow = 'hidden';
  
  initializeLoader();
  
  // Fallback: Force hide after 3 seconds maximum
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hide')) {
      console.log('⚠️ Fallback: Force hiding loader after 3 seconds');
      loader.classList.add('hide');
      setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.remove();
        }
        document.body.style.overflow = 'auto';
      }, 800);
    }
  }, 3000);
});

// Chat System
function initializeChat() {
  const chatToggle = document.querySelector('.chat-toggle-btn');
  const chatWidget = document.getElementById('chatWidget');
  
  if (chatToggle && chatWidget) {
    chatToggle.addEventListener('click', toggleChat);
    
    // Auto-show chat after 30 seconds
    setTimeout(() => {
      if (!localStorage.getItem('chatShown')) {
        showChatNotification();
      }
    }, 30000);
  }
}

function toggleChat() {
  const chatWidget = document.getElementById('chatWidget');
  const isVisible = chatWidget.style.display === 'block';
  chatWidget.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
    document.querySelector('.chat-notification').style.display = 'none';
    localStorage.setItem('chatShown', 'true');
  }
}

function showChatNotification() {
  const notification = document.querySelector('.chat-notification');
  if (notification) {
    notification.style.display = 'flex';
    notification.style.animation = 'pulse 1s infinite';
  }
}

// Animations
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .service-card, .testimonial-card').forEach(el => {
    observer.observe(el);
  });
}

// Back to Top
window.addEventListener('scroll', function() {
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    if (window.pageYOffset > 300) {
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Close mobile menu if open
      const navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
      }
    }
  });
});

// Enhanced Error Handling
window.addEventListener('error', function(e) {
  console.error('JavaScript Error:', e.error);
  // Log errors for debugging
});

// Performance Monitoring
window.addEventListener('load', function() {
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
    
    if (loadTime > 3000) {
      console.warn('Slow page load detected:', loadTime + 'ms');
    }
  }
});

// Service Worker for PWA (Progressive Web App)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}

// Cookie Consent
function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true');
  document.getElementById('cookieBanner').style.display = 'none';
}

function declineCookies() {
  document.getElementById('cookieBanner').style.display = 'none';
}

// Auto-hide cookie banner if already accepted
if (localStorage.getItem('cookiesAccepted')) {
  const cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) {
    cookieBanner.style.display = 'none';
  }
}

// Form Auto-save
function autoSaveForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Load saved data
  const savedData = localStorage.getItem(`form_${formId}`);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      Object.keys(data).forEach(key => {
        const input = form.querySelector(`#${key}`);
        if (input && input.type !== 'password') {
          input.value = data[key];
        }
      });
    } catch (e) {
      console.error('Error loading saved form data:', e);
    }
  }

  // Save data on input
  form.addEventListener('input', function(e) {
    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (input.id && input.type !== 'password') {
        formData[input.id] = input.value;
      }
    });
    
    localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
  });

  // Clear saved data on successful submission
  form.addEventListener('submit', function() {
    localStorage.removeItem(`form_${formId}`);
  });
}

// Initialize auto-save for forms
['bookingForm', 'astrologyForm'].forEach(autoSaveForm);

// Mobile Menu Enhancement
document.addEventListener('DOMContentLoaded', function() {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  if (navbarToggler && navbarCollapse) {
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
        if (navbarCollapse.classList.contains('show')) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }
      }
    });
  }
});

// Enhanced Date Picker for Booking
function initializeDatePicker() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  
  dateInputs.forEach(input => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    input.setAttribute('min', today);
    
    // Set maximum date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    input.setAttribute('max', maxDate.toISOString().split('T')[0]);
  });
}

// Initialize date picker
initializeDatePicker();

// Real-time Form Validation
function setupRealTimeValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
      
      input.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          validateField(this);
        }
      });
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    showFieldError(field, 'This field is required');
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      showFieldError(field, 'Please enter a valid email address');
    }
  }
  
  // Phone validation
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      isValid = false;
      showFieldError(field, 'Please enter a valid phone number');
    }
  }
  
  if (isValid) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    hideFieldError(field);
  }
}

function showFieldError(field, message) {
  field.classList.add('is-invalid');
  field.classList.remove('is-valid');
  
  let errorDiv = field.parentNode.querySelector('.invalid-feedback');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    field.parentNode.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
}

function hideFieldError(field) {
  const errorDiv = field.parentNode.querySelector('.invalid-feedback');
  if (errorDiv) {
    errorDiv.textContent = '';
  }
}

// Initialize real time validation
setupRealTimeValidation();

// Analytics Tracking (Google Analytics)
function trackEvent(eventName, parameters = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
}

// Track form submissions
document.addEventListener('submit', function(e) {
  const formId = e.target.id;
  if (formId) {
    trackEvent('form_submit', {
      form_id: formId,
      form_name: formId.replace(/([A-Z])/g, ' $1').trim()
    });
  }
});

// Track button clicks
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('btn')) {
    const buttonText = e.target.textContent.trim();
    trackEvent('button_click', {
      button_text: buttonText
    });
  }
});

// Temple Map Functions
function openGoogleMaps() {
  const mapUrl = "https://www.google.com/maps/search/Pashupatinath+Mandir+near+Vega+Circle+Siliguri/@26.7271,88.4294,15z";
  window.open(mapUrl, '_blank');
}

function openDirections() {
  const directionsUrl = "https://www.google.com/maps/dir//Pashupatinath+Mandir+near+Vega+Circle+Siliguri";
  window.open(directionsUrl, '_blank');
}

function shareLocation() {
  const locationText = "🏛️ Visit Pashupatinath Mandir\n📍 Near Vega Circle, Siliguri, West Bengal\n📞 Contact: +91-9339216754";
  
  if (navigator.share) {
    navigator.share({
      title: 'Pashupatinath Mandir Location',
      text: locationText,
      url: 'https://www.google.com/maps/search/Pashupatinath+Mandir+near+Vega+Circle+Siliguri'
    }).catch(console.error);
  } else {
    // Fallback for browsers that don't support Web Share API
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(locationText)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// Temple Gallery Lightbox
function initializeTempleGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item img');
  
  galleryItems.forEach(img => {
    img.addEventListener('click', function() {
      openImageModal(this.src, this.alt);
    });
  });
}

function openImageModal(src, alt) {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeImageModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <img src="${src}" alt="${alt}" class="img-fluid">
        <button class="close-btn" onclick="closeImageModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  const modal = document.querySelector('.image-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
}

// Initialize temple features when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  initializeTempleGallery();
  
  // Animate temple section on scroll
  const templeSection = document.querySelector('.temple-section');
  if (templeSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    });
    
    observer.observe(templeSection);
  }
});

console.log('🕉️ Enhanced Vaidik Anusthan website loaded successfully! 🙏');
(function() {
  'use strict';

  // Footer email obfuscation
  (function() {
    var u = 'hello';
    var d = 'localloop-merseyside.co.uk';
    var addr = u + '@' + d;
    var link = document.getElementById('footer-email-link');
    var text = document.getElementById('footer-email-text');
    var social = document.getElementById('footer-social-email');
    if (link) { link.href = 'mailto:' + addr; }
    if (text) { text.textContent = addr; }
    if (social) { social.href = 'mailto:' + addr; }
  })();

  // Header scroll effect
  var header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 20) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }, { passive: true });
  }

  // Smooth anchor scrolling
  document.querySelectorAll('[data-anchor]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (!href) return;
      var hash = '';
      if (href.startsWith('#')) {
        hash = href.substring(1);
      } else if (href.startsWith('/#')) {
        hash = href.substring(2);
      }
      if (hash) {
        var target = document.getElementById(hash);
        if (target) {
          e.preventDefault();
          closeMobileMenu();
          setTimeout(function() {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        } else if (window.location.pathname !== '/') {
          return;
        }
      }
    });
  });

  // Mobile menu
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var focusTrap = null;

  function openMobileMenu() {
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trapFocus(mobileMenu);
  }

  function closeMobileMenu() {
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    releaseFocus();
  }

  function trapFocus(el) {
    var focusable = el.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    focusTrap = function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape') {
        closeMobileMenu();
        menuBtn.focus();
      }
    };
    document.addEventListener('keydown', focusTrap);
    first.focus();
  }

  function releaseFocus() {
    if (focusTrap) {
      document.removeEventListener('keydown', focusTrap);
      focusTrap = null;
    }
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function(link) {
      link.addEventListener('click', function() {
        closeMobileMenu();
      });
    });
  }

  // Video dialog
  var videoTrigger = document.getElementById('video-dialog-trigger');
  var videoDialog = document.getElementById('video-dialog');
  var videoBackdrop = document.getElementById('video-dialog-backdrop');
  var videoClose = document.getElementById('video-dialog-close');
  var videoPlayer = document.getElementById('video-player');

  var videoSrc = videoPlayer ? videoPlayer.getAttribute('data-src') : '';

  function openVideoDialog() {
    videoDialog.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (videoPlayer && videoSrc) {
      videoPlayer.src = videoSrc + '?autoplay=1';
    }
  }

  function closeVideoDialog() {
    videoDialog.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (videoPlayer) videoPlayer.src = '';
  }

  if (videoTrigger && videoDialog) {
    videoTrigger.addEventListener('click', openVideoDialog);
    if (videoBackdrop) videoBackdrop.addEventListener('click', closeVideoDialog);
    if (videoClose) videoClose.addEventListener('click', closeVideoDialog);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && videoDialog.getAttribute('aria-hidden') === 'false') {
        closeVideoDialog();
      }
    });
  }

  // Lead magnet form with honeypot
  var leadForm = document.getElementById('lead-form');
  var leadSuccess = document.getElementById('lead-success');

  if (leadForm) {
    leadForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var honeypot = this.querySelector('[name="_t_email"]');
      if (honeypot && honeypot.value) return;

      var emailInput = document.getElementById('lead-email');
      var email = emailInput ? emailInput.value.trim() : '';
      if (!email || !email.includes('@')) return;

      var replyTo = this.querySelector('[name="_replyTo"]');
      if (replyTo) replyTo.value = email;

      var params = new URLSearchParams(new FormData(this));
      params.append('timestamp', new Date().toISOString());
      fetch(this.action, { method: 'POST', body: params }).catch(function() {});

      leadForm.style.display = 'none';
      leadSuccess.hidden = false;
      showToast('Thanks! Check your email for the guide.');
    });
  }

  // Marquee random start + pause/play
  var marqueeTrack = document.querySelector('.marquee__track');
  if (marqueeTrack) {
    var randomOffset = -Math.random() * 30;
    marqueeTrack.style.animationDelay = randomOffset + 's';
  }
  var marqueeToggle = document.getElementById('marquee-toggle');
  if (marqueeToggle) {
    var marquee = document.querySelector('.marquee');
    var pauseIcon = marqueeToggle.querySelector('.marquee__icon--pause');
    var playIcon = marqueeToggle.querySelector('.marquee__icon--play');
    marqueeToggle.addEventListener('click', function() {
      var paused = marquee.classList.toggle('marquee--paused');
      pauseIcon.style.display = paused ? 'none' : 'block';
      playIcon.style.display = paused ? 'block' : 'none';
      marqueeToggle.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
      marqueeToggle.setAttribute('title', paused ? 'Play carousel' : 'Pause carousel');
    });
  }

  // Toast system
  var toastEl = null;
  var toastTimeout = null;

  function showToast(message) {
    if (toastEl) toastEl.remove();

    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.innerHTML = '<span>' + message + '</span><button class="toast__close" aria-label="Dismiss"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';

    document.body.appendChild(toastEl);

    toastEl.querySelector('.toast__close').addEventListener('click', function() {
      dismissToast();
    });

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        toastEl.classList.add('toast--visible');
      });
    });

    toastTimeout = setTimeout(dismissToast, 5000);
  }

  function dismissToast() {
    if (!toastEl) return;
    clearTimeout(toastTimeout);
    toastEl.classList.remove('toast--visible');
    setTimeout(function() {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }, 300);
  }

  // Intersection Observer for scroll animations
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function() {
            el.classList.add('is-visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-animate]').forEach(function(el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.classList.add('is-visible');
    });
  }

  // Join page branching quiz (state machine)
  var joinScreens = document.querySelectorAll('.join-screen');
  if (joinScreens.length > 0) {
    var joinState = { inArea: null, buying: null, selling: null, stage2: null };
    var joinNotified = false;

    function joinShowScreen(name) {
      joinScreens.forEach(function(s) {
        s.classList.remove('join-screen--active');
      });
      var target = document.querySelector('[data-screen="' + name + '"]');
      if (target) {
        void target.offsetWidth;
        target.classList.add('join-screen--active');
        var firstBtn = target.querySelector('.btn--option, .btn--green, .join-newsletter__input');
        if (firstBtn) firstBtn.focus();
      }
    }

    function joinReset() {
      joinState = { inArea: null, buying: null, selling: null, stage2: null };
      joinNotified = false;
      joinScreens.forEach(function(s) { s.classList.remove('join-screen--active'); });
      document.querySelectorAll('.btn--option-selected').forEach(function(b) { b.classList.remove('btn--option-selected'); });
      document.querySelectorAll('.join-newsletter').forEach(function(f) { f.style.display = ''; });
      document.querySelectorAll('.join-newsletter__success').forEach(function(s) { s.hidden = true; });
      joinShowScreen('welcome');
    }

    function joinSendNotification(formName) {
      if (joinNotified) return;
      joinNotified = true;
      var actionEl = document.querySelector('[data-mailygo-action]');
      var actionURL = actionEl ? actionEl.getAttribute('data-mailygo-action') : '';
      if (!actionURL || actionURL === '#') return;
      var params = new URLSearchParams();
      params.append('_formName', formName);
      params.append('Pathway', formName === 'join-direct-fit' ? 'Direct Fit' : 'Stage 2 Fit');
      params.append('In Merseyside area', joinState.inArea || '');
      params.append('Buys locally', joinState.buying || '');
      params.append('Sells locally', joinState.selling || '');
      if (joinState.stage2 !== null) params.append('Interested in Stage 2', joinState.stage2);
      params.append('timestamp', new Date().toISOString());
      fetch(actionURL, { method: 'POST', body: params }).catch(function() {});
    }

    function joinTransition(currentScreen, answer) {
      if (currentScreen === 'inArea') {
        joinState.inArea = answer;
        if (answer === 'no') {
          joinShowScreen('outOfArea');
        } else {
          joinShowScreen('buying');
        }
      } else if (currentScreen === 'buying') {
        joinState.buying = answer;
        joinShowScreen('selling');
      } else if (currentScreen === 'selling') {
        joinState.selling = answer;
        if (joinState.buying === 'yes' && answer === 'yes') {
          joinShowScreen('wonderful');
          joinSendNotification('join-direct-fit');
        } else if (joinState.buying === 'yes' && answer === 'no') {
          joinShowScreen('stage2');
        } else if (joinState.buying === 'no' && answer === 'yes') {
          joinShowScreen('stage2');
        } else {
          joinShowScreen('additionalQs');
        }
      } else if (currentScreen === 'stage2') {
        joinState.stage2 = answer;
        if (answer === 'yes') {
          joinShowScreen('wonderful');
          joinSendNotification('join-stage2-fit');
        } else {
          joinShowScreen('additionalQs');
        }
      }
    }

    var beginBtn = document.getElementById('join-begin');
    if (beginBtn) {
      beginBtn.addEventListener('click', function() {
        joinShowScreen('inArea');
      });
    }

    document.querySelectorAll('.btn--option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var screen = this.closest('.join-screen');
        if (!screen) return;
        var screenName = screen.getAttribute('data-screen');
        var answer = this.getAttribute('data-answer');
        this.classList.add('btn--option-selected');
        setTimeout(function() {
          joinTransition(screenName, answer);
        }, 250);
      });
    });

    document.querySelectorAll('[data-restart]').forEach(function(btn) {
      btn.addEventListener('click', joinReset);
    });

    document.querySelectorAll('.join-newsletter').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var honeypot = this.querySelector('[name="_t_email"]');
        if (honeypot && honeypot.value) return;
        var emailInput = this.querySelector('[name="email"]');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email || !email.includes('@')) return;
        var replyTo = this.querySelector('[name="_replyTo"]');
        if (replyTo) replyTo.value = email;
        var subEmail = this.querySelector('[name="subscriberEmail"]');
        if (subEmail) subEmail.value = email;
        var params = new URLSearchParams(new FormData(this));
        params.append('timestamp', new Date().toISOString());
        fetch(this.action, { method: 'POST', body: params }).catch(function() {});
        this.style.display = 'none';
        var success = this.parentElement.querySelector('.join-newsletter__success');
        if (success) success.hidden = false;
      });
    });
  }

  // Contact & Enquire form submission
  document.querySelectorAll('[data-form]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var honeypot = this.querySelector('[name="_t_email"]');
      if (honeypot && honeypot.value) return;
      var emailInput = this.querySelector('[name="email"]');
      var email = emailInput ? emailInput.value.trim() : '';
      if (emailInput && (!email || !email.includes('@'))) return;
      var params = new URLSearchParams();
      this.querySelectorAll('input, textarea, select').forEach(function(el) {
        if (el.name && el.name !== '_replyTo' && el.name !== 'timestamp') {
          params.append(el.name, el.value);
        }
      });
      if (email) params.append('_replyTo', email);
      params.append('timestamp', new Date().toISOString());
      var submitBtn = this.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending\u2026';
      }
      fetch(this.action, { method: 'POST', body: params })
        .then(function() {
          form.style.display = 'none';
          var desc = form.parentElement.querySelector('.form-page__description');
          if (desc) desc.style.display = 'none';
          var success = form.parentElement.querySelector('.form-page__success');
          if (success) success.hidden = false;
        })
        .catch(function() {
          form.style.display = 'none';
          var desc = form.parentElement.querySelector('.form-page__description');
          if (desc) desc.style.display = 'none';
          var success = form.parentElement.querySelector('.form-page__success');
          if (success) success.hidden = false;
        });
    });
  });

  // Footer year
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

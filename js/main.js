// Main JS for interactions: mobile nav, modal gallery, animations, newsletter
document.addEventListener('DOMContentLoaded', function(){
  // Load optional vendor scripts (jQuery + Owl Carousel) dynamically so pages stay lightweight.
  (function loadVendors(){
    var hasJQ = typeof window.jQuery !== 'undefined';
    function loadScript(src, cb){
      var s = document.createElement('script'); s.src = src; s.onload = cb; s.defer = true; document.head.appendChild(s);
    }
    function loadCSS(href){
      var l = document.createElement('link'); l.rel='stylesheet'; l.href=href; document.head.appendChild(l);
    }
    // only load if there is an .owl-carousel element on the page
    if(document.querySelector('.owl-carousel')){
      if(!hasJQ){
        loadScript('https://code.jquery.com/jquery-3.6.0.min.js', function(){
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js', initOwl);
        });
        loadCSS('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css');
        loadCSS('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css');
      } else {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js', initOwl);
      }
    }
    function initOwl(){
      try{
        if(window.jQuery && jQuery.fn && jQuery.fn.owlCarousel){
          jQuery('.owl-carousel').each(function(){
            var $el = jQuery(this);
            $el.owlCarousel({items:1,loop:true,margin:10,autoplay:true,autoplayTimeout:5000,nav:true,dots:true,responsive:{600:{items:2},900:{items:3}}});
          });
        }
      }catch(e){ console.warn('Owl init failed',e); }
    }
  })();
  // Mobile nav toggle
  var toggle = document.querySelectorAll('.nav-toggle');
  toggle.forEach(function(btn){
    btn.addEventListener('click', function(){
      var nav = btn.closest('.header-inner').querySelector('.main-nav');
      nav.classList.toggle('open');
    });
  });

  // Dropdown removed — no-op (previous 'More' menu removed from markup)

  // Sticky header class on scroll
  var header = document.querySelector('.site-header');
  if(header){
    window.addEventListener('scroll', function(){
      if(window.scrollY>10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    });
  }

  // Accessible modal (gallery and bios) with focus-trap and Escape handling
  var modal = document.querySelector('.modal');
  if(modal){
    var modalBody = modal.querySelector('.modal-body');
    var modalClose = modal.querySelector('.modal-close');
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-hidden','true');
    var previousFocus = null;

    function openModal(html){
      previousFocus = document.activeElement;
      modalBody.innerHTML = html;
      // set labelledby if there's a heading
      var heading = modalBody.querySelector('h1,h2,h3');
      if(heading){ heading.id = 'modal-title'; modal.setAttribute('aria-labelledby','modal-title'); }
      modal.classList.add('open');
      modal.removeAttribute('aria-hidden');
      // focus close button
      setTimeout(function(){ modalClose.focus(); },50);
      document.addEventListener('keydown', trapKeys);
    }

    function closeModal(){
      modal.classList.remove('open');
      modalBody.innerHTML = '';
      modal.setAttribute('aria-hidden','true');
      document.removeEventListener('keydown', trapKeys);
      if(previousFocus && previousFocus.focus) previousFocus.focus();
    }

    function trapKeys(e){
      if(e.key === 'Escape') { closeModal(); return; }
      if(e.key === 'Tab'){
        var focusable = modal.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if(!focusable.length) return;
        focusable = Array.prototype.slice.call(focusable);
        var idx = focusable.indexOf(document.activeElement);
        if(e.shiftKey && idx===0){ focusable[focusable.length-1].focus(); e.preventDefault(); }
        else if(!e.shiftKey && idx===focusable.length-1){ focusable[0].focus(); e.preventDefault(); }
      }
    }

    // gallery items: data-media
    document.querySelectorAll('[data-media]').forEach(function(el){
      el.addEventListener('click', function(){
        var url = el.getAttribute('data-media');
        // Videos removed site-wide; always open images in the modal
        if(!url) return;
        openModal('<img src="'+url+'" alt="gallery image" />');
      });
    });

    modalClose.addEventListener('click', function(){ closeModal(); });
    modal.addEventListener('click', function(e){ if(e.target===modal) { closeModal(); } });

    // Team bio handlers: open modal with bio content
    document.querySelectorAll('[data-bio-name]').forEach(function(card){
      card.addEventListener('click', function(){
        var name = card.dataset.bioName || '';
        var role = card.dataset.bioRole || '';
        var img = card.dataset.bioImg || '';
        var text = card.dataset.bioText || '';
        var html = '';
        if(img) html += '<img src="'+img+'" alt="'+name+'" style="max-width:100%;border-radius:8px;margin-bottom:0.8rem" />';
        html += '<h3>'+name+'</h3>';
        if(role) html += '<p><em>'+role+'</em></p>';
        if(text) html += '<p>'+text+'</p>';
        openModal(html);
      });
    });
  }

  // Share buttons using Web Share API with fallback
  document.querySelectorAll('.share-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var title = document.title;
      var url = btn.getAttribute('data-url') || location.href;
      if(navigator.share){
        navigator.share({title:title,url:url}).catch(()=>{});
      } else {
        // fallback: copy to clipboard
        navigator.clipboard && navigator.clipboard.writeText(url).then(function(){ alert('Link copied to clipboard'); });
      }
    });
  });

  // Newsletter: store email in localStorage as placeholder
  var newsletter = document.querySelector('.newsletter-form');
  if(newsletter){
    newsletter.addEventListener('submit', function(e){
      e.preventDefault();
      var input = newsletter.querySelector('input[name="email"]');
      var email = input && input.value.trim();
      var formspreeId = newsletter.dataset.formspree;
      if(formspreeId && formspreeId !== 'YOUR_FORM_ID'){
        // Post to Formspree endpoint
        var endpoint = 'https://formspree.io/f/' + formspreeId;
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(newsletter)
        }).then(function(res){
          if(res.ok){
            input.value='';
            alert('Thanks — your subscription was received.');
          } else {
            return res.json().then(function(data){ throw data; });
          }
        }).catch(function(){
          // fallback to localStorage
          email && localStorage.setItem('ayha_newsletter', email);
          input.value='';
          alert('Subscription saved locally (fallback).');
        });
      } else {
        // Default placeholder behavior: store locally
        if(email){
          localStorage.setItem('ayha_newsletter', email);
          input.value='';
          alert('Thanks — you are subscribed (placeholder). To enable live signup, replace data-formspree in the form with your Formspree ID.');
        }
      }
    });
  }

  // Reveal on scroll
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  },{threshold:0.12});
  document.querySelectorAll('.slide').forEach(function(el){ observer.observe(el); });

  // Hero slider (simple)
  var sliders = document.querySelectorAll('.hero-slider');
  sliders.forEach(function(slider){
    var slides = slider.querySelectorAll('.hero-slide');
    var dotsContainer = slider.querySelector('.hero-dots');
    var current = 0; var auto;
    function go(i){
      slides[current].classList.remove('active');
      if(dotsContainer) dotsContainer.children[current].classList.remove('active');
      current = (i+slides.length)%slides.length;
      slides[current].classList.add('active');
      if(dotsContainer) dotsContainer.children[current].classList.add('active');
    }
    // dots
    if(dotsContainer){
      slides.forEach(function(_,idx){
        var d = document.createElement('button'); d.className='hero-dot';
        d.addEventListener('click',function(){ go(idx); reset(); });
        dotsContainer.appendChild(d);
      });
      dotsContainer.children[0].classList.add('active');
    }
    // controls
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    if(prev) prev.addEventListener('click',function(){ go(current-1); reset(); });
    if(next) next.addEventListener('click',function(){ go(current+1); reset(); });

    function start(){ auto = setInterval(function(){ go(current+1); }, 5000); }
    function reset(){ clearInterval(auto); start(); }
    slides[0] && slides[0].classList.add('active');
    start();
  });

  // Divider movement on scroll for Dual-Growth hero
  var heroSplit = document.querySelector('.hero-split');
  if(heroSplit){
    var divider = heroSplit.querySelector('.hero-divider');
    function updateDivider(){
      var sc = window.scrollY || window.pageYOffset;
      // small parallax: shift up to 36px left/right depending on scroll
      var offset = Math.max(Math.min(sc * 0.06, 36), -36);
      heroSplit.style.setProperty('--divider-offset', offset + 'px');
    }
    updateDivider();
    window.addEventListener('scroll', updateDivider);
  }

  // Objective carousel (simple, Sopot-style fallback)
  var objCarousel = document.querySelector('.objective-carousel');
  if(objCarousel){
    var objSlides = objCarousel.querySelectorAll('.obj-slide');
    var objIdx = 0; var objAuto;
    function objGo(i){
      // slide using transform on container for smooth sliding
      var slidesWrap = objCarousel.querySelector('.obj-slides');
      objIdx = (i + objSlides.length) % objSlides.length;
      slidesWrap.style.transform = 'translateX(' + (-objIdx * 100) + '%)';
      objSlides.forEach(function(s, idx){ s.classList.toggle('active', idx===objIdx); });
    }
    function objStart(){ objAuto = setInterval(function(){ objGo(objIdx+1); }, 3200); }
    objSlides[0] && objSlides[0].classList.add('active'); objStart();
    // allow manual controls
    objCarousel.querySelectorAll('.obj-prev, .obj-next').forEach(function(ctrl){
      ctrl.addEventListener('click', function(){ if(ctrl.classList.contains('obj-prev')) objGo(objIdx-1); else objGo(objIdx+1); clearInterval(objAuto); objStart(); });
    });
  }

  // Filterable masonry for Wall of Hope
  var filterBtns = document.querySelectorAll('.filter-btn');
  if(filterBtns && filterBtns.length){
    var wallItems = Array.from(document.querySelectorAll('.success-masonry .m-item'));
    function applyFilter(cat){
      wallItems.forEach(function(it){
        var c = it.dataset.category || '';
        if(cat === 'all' || c === cat){ it.style.display = 'inline-block'; }
        else { it.style.display = 'none'; }
      });
    }
    filterBtns.forEach(function(b){ b.addEventListener('click', function(){ filterBtns.forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); applyFilter(b.dataset.filter); }); });
    // initial
    applyFilter('all');
  }

  // Simple accordion for FAQs
  document.querySelectorAll('.qa-item').forEach(function(item){
    var btn = item.querySelector('.qa-toggle');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var expanded = item.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });

  // Contact page: Smart contact form behavior, floating labels and map button
  var smartForm = document.getElementById('smart-contact-form');
  if(smartForm){
    var whoSel = smartForm.querySelector('#who');
    var youthGroup = document.getElementById('youth-fields');
    var partnerGroup = document.getElementById('partner-fields');

    function updateConditional(){
      if(!whoSel) return;
      var v = whoSel.value;
      if(youthGroup) { youthGroup.classList.toggle('active', v === 'youth'); youthGroup.setAttribute('aria-hidden', v!=='youth'); }
      if(partnerGroup) { partnerGroup.classList.toggle('active', v === 'partner'); partnerGroup.setAttribute('aria-hidden', v!=='partner'); }
    }
    if(whoSel){ whoSel.addEventListener('change', updateConditional); updateConditional(); }

    // Floating label helpers: add .has-val when inputs have content
    function setupFloating(el){
      var input = el.querySelector('input,textarea,select');
      if(!input) return;
      function toggle(){ if(input.value && input.value.trim() !== '') input.classList.add('has-val'); else input.classList.remove('has-val'); }
      input.addEventListener('input', toggle); input.addEventListener('change', toggle); toggle();
    }
    document.querySelectorAll('.floating').forEach(setupFloating);

    // Set math challenge (simple eco-friendly text math)
    var mathQuestion = smartForm.querySelector('.math-question');
    var mathAnswerInput = smartForm.querySelector('#math-answer');
    var mathA = 5, mathB = 2; // simple constant challenge to save compute
    if(mathQuestion){ mathQuestion.textContent = 'What is ' + mathA + ' + ' + mathB + '?'; mathQuestion.dataset.answer = (mathA+mathB); }

    // Inline error helpers
    function showError(el, msg){ if(!el) return; var p = el.parentNode.querySelector('.field-error'); if(!p){ p = document.createElement('div'); p.className='field-error'; el.parentNode.appendChild(p); } p.textContent = msg; el.classList.add('invalid'); }
    function clearError(el){ if(!el) return; var p = el.parentNode.querySelector('.field-error'); if(p) p.textContent = ''; el.classList.remove('invalid'); }

    smartForm.addEventListener('submit', function(e){
      e.preventDefault();
      clearError(mathAnswerInput);
      var ans = parseInt(mathAnswerInput.value,10);
      if(isNaN(ans) || ans !== (mathA+mathB)){
        showError(mathAnswerInput, 'Please solve the anti-spam question correctly.'); mathAnswerInput.focus(); return;
      }

      // Build payload
      var payload = new FormData(smartForm);
      var endpoint = smartForm.getAttribute('data-endpoint') || 'https://formspree.io/f/mayvlkqd';
      fetch(endpoint, { method: 'POST', body: payload, headers: { 'Accept':'application/json' } })
        .then(function(res){ if(res.ok) return res.json(); return res.json().then(function(err){ throw err; }); })
        .then(function(){
          var success = document.createElement('div'); success.className = 'notice success'; success.textContent = 'Thanks — your message was sent.'; smartForm.appendChild(success);
          smartForm.reset(); updateConditional(); document.querySelectorAll('.floating input, .floating textarea').forEach(function(i){ i.classList.remove('has-val'); });
        })
        .catch(function(){
          var fallback = document.createElement('div'); fallback.className = 'notice muted'; fallback.innerHTML = 'Unable to send via network. Please email <a href="mailto:africayouthhopealiveproject@gmail.com">africayouthhopealiveproject@gmail.com</a>'; smartForm.appendChild(fallback);
        });
    });
  }

  // Parallax for narrative hero (subtle, performant)
  (function(){
    var hero = document.querySelector('.narrative-hero');
    if(!hero) return;
    var bg = hero.querySelector('.parallax-bg');
    function onScroll(){
      var rect = hero.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      // only update when in view
      if(rect.bottom > 0 && rect.top < h){
        var pct = (rect.top / h);
        // map pct to translate range -30px .. 30px (slower than scroll)
        var offset = Math.round(pct * 40);
        if(bg) bg.style.transform = 'translateY(' + (offset * 0.6) + 'px)';
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
  })();

  // Timeline vine effect: add `.vine` when timeline is in view
  (function(){
    var tl = document.getElementById('timeline-line');
    if(!tl) return;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(ent){
        if(ent.isIntersecting) tl.classList.add('vine'); else tl.classList.remove('vine');
      });
    }, {threshold:0.15});
    obs.observe(tl);
  })();
});

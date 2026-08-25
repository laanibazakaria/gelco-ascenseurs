// GELCO Ascenseurs — interactions communes

// Menu mobile
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mainNav.classList.remove('open'))
  );
}

// Filtres du catalogue de pièces
const filterBar = document.querySelector('.filter-bar');
if (filterBar) {
  const buttons = filterBar.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.part-card[data-cat]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

// Formulaire de devis : ouvre WhatsApp avec un message pré-rempli (FR ou AR selon la page)
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const get = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    const isArabic = document.documentElement.lang === 'ar';
    const L = isArabic ? {
      intro: 'مرحباً جيلكو للمصاعد، أرغب في الحصول على عرض سعر.',
      type: '— نوع الطلب: ', brand: '— ماركة المصعد: ', brandNone: 'غير محددة',
      building: '— نوع المبنى: ', floors: '— عدد الطوابق: ', floorsNone: 'غير محدد',
      city: '— المدينة: ', name: '— الاسم: ', phone: '— الهاتف: ', details: '— تفاصيل: ', mail: '— البريد الإلكتروني: '
    } : {
      intro: 'Bonjour Gelco Ascenseurs, je souhaite un devis.',
      type: '— Type de demande : ', brand: '— Marque de l’ascenseur : ', brandNone: 'Non précisée',
      building: '— Type de bâtiment : ', floors: '— Nombre de niveaux : ', floorsNone: 'Non précisé',
      city: '— Ville : ', name: '— Nom : ', phone: '— Téléphone : ', details: '— Détails : ', mail: '— E-mail : '
    };
    const lines = [
      L.intro,
      L.type + get('qType'),
      L.brand + (get('qBrand') || L.brandNone),
      L.building + get('qBuilding'),
      L.floors + (get('qFloors') || L.floorsNone),
      L.city + get('qCity'),
      L.name + get('qName'),
      L.phone + get('qPhone')
    ];
    const details = get('qMessage');
    if (details) lines.push(L.details + details);

    const mail = get('qEmail');
    if (mail) lines.push(L.mail + mail);
    const corps = lines.join(String.fromCharCode(10));

    // Le bouton cliqué détermine le canal d'envoi
    const parEmail = quoteForm.dataset.canal === 'email';
    quoteForm.dataset.canal = '';

    if (parEmail) {
      const sujet = isArabic ? 'طلب عرض سعر — جيلكو للمصاعد' : 'Demande de devis — Site GELCO';
      window.location.href = 'mailto:grand.elevators.company@gmail.com'
        + '?subject=' + encodeURIComponent(sujet)
        + '&body=' + encodeURIComponent(corps);
    } else {
      window.open('https://wa.me/212661896033?text=' + encodeURIComponent(corps), '_blank');
    }

    const success = document.getElementById('formSuccess');
    if (success) {
      success.textContent = parEmail
        ? (isArabic
            ? 'فُتحت رسالتكم في برنامج البريد — لم يبقَ سوى الضغط على « إرسال ». شكراً لكم!'
            : 'Votre demande est ouverte dans votre messagerie — il ne reste plus qu\u2019à appuyer sur « Envoyer ». Merci !')
        : (isArabic
            ? 'طلبكم جاهز في واتساب — لم يبقَ سوى الضغط على « إرسال ». شكراً لكم!'
            : 'Votre demande est prête dans WhatsApp — il ne reste plus qu\u2019à appuyer sur « Envoyer ». Merci !');
      success.classList.add('visible');
    }
  });

  // Mémorise le canal choisi avant la validation
  document.querySelectorAll('[data-canal]').forEach(btn => {
    btn.addEventListener('click', () => { quoteForm.dataset.canal = btn.dataset.canal; });
  });
}


// ---- Animations ----

// Barre de progression de défilement
const progress = document.createElement('div');
progress.id = 'scrollProgress';
document.body.appendChild(progress);
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}, { passive: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Apparition au défilement
if (!reduceMotion && 'IntersectionObserver' in window) {
  let ioAlive = false;
  const io = new IntersectionObserver(entries => {
    ioAlive = true;
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  // Sécurité : si l'observateur ne répond pas, tout afficher
  setTimeout(() => {
    if (!ioAlive) document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }, 2000);
  document.querySelectorAll('.card, .project-card, .step, .persona-card, .cert-card, .section-head, .why-item, .brand-chip')
    .forEach((el, i) => {
      el.classList.add('reveal');
      el.style.animationDelay = (i % 3) * 0.09 + 's';
      io.observe(el);
    });
}

// Compteurs des statistiques (montée progressive, comme un ascenseur)
if ('IntersectionObserver' in window) {
  const fmt = (n, spaced) => spaced ? n.toLocaleString('fr-FR') : String(n);
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      statIO.unobserve(e.target);
      const el = e.target;
      const original = el.textContent;
      const m = original.match(/\d[\d\s ]*/);
      if (!m) return;
      const target = parseInt(m[0].replace(/[\s ]/g, ''), 10);
      if (!target || reduceMotion) return;
      const spaced = /[\s ]/.test(m[0].trim());
      const t0 = performance.now();
      const dur = 1400;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = original.replace(m[0], fmt(Math.round(target * eased), spaced || target >= 1000));
        if (p < 1) requestAnimationFrame(tick); else el.textContent = original;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => statIO.observe(el));
}


// ---- Galerie lightbox du catalogue de pièces ----
const galleryCards = document.querySelectorAll('.part-card[data-imgs]');
if (galleryCards.length) {
  const isAr = document.documentElement.lang === 'ar';
  const prefix = isAr ? '../assets/img/' : 'assets/img/';
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<div class="lb-box">' +
    '<button class="lb-close" aria-label="Fermer">✕</button>' +
    '<div class="lb-main">' +
    '<img id="lbImg" alt="">' +
    '<button class="lb-arrow lb-prev">‹</button>' +
    '<button class="lb-arrow lb-next">›</button>' +
    '</div>' +
    '<div class="lb-thumbs" id="lbThumbs"></div>' +
    '<div class="lb-body"><h3 id="lbTitle"></h3><p id="lbDesc"></p>' +
    '<a class="btn btn-accent" id="lbCta" href="contact.html">' + (isAr ? 'اطلب عرض سعر لهذه القطعة' : 'Demander un devis pour cette pièce') + '</a></div>' +
    '</div>';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('#lbImg');
  const lbThumbs = lb.querySelector('#lbThumbs');
  let imgs = [], idx = 0;

  const show = i => {
    idx = (i + imgs.length) % imgs.length;
    lbImg.src = prefix + imgs[idx];
    lbThumbs.querySelectorAll('img').forEach((t, k) => t.classList.toggle('active', k === idx));
  };

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      imgs = card.dataset.imgs.split(',');
      lb.querySelector('#lbTitle').textContent = card.querySelector('h3').textContent;
      lb.querySelector('#lbDesc').textContent = card.querySelector('.part-body p').textContent;
      lbThumbs.innerHTML = '';
      imgs.forEach((src, k) => {
        const t = document.createElement('img');
        t.src = prefix + src;
        t.alt = '';
        t.addEventListener('click', e => { e.stopPropagation(); show(k); });
        lbThumbs.appendChild(t);
      });
      show(0);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}


// ---- Fond flouté derrière chaque photo : rien n'est coupé, plus de bandes vides ----
document.querySelectorAll('.part-visual img, .project-visual img').forEach(img => {
  const src = img.getAttribute('src');
  if (src) img.parentElement.style.setProperty('--ph', 'url("' + src + '")');
});

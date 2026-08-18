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
      city: '— المدينة: ', name: '— الاسم: ', phone: '— الهاتف: ', details: '— تفاصيل: '
    } : {
      intro: 'Bonjour Gelco Ascenseurs, je souhaite un devis.',
      type: '— Type de demande : ', brand: '— Marque de l’ascenseur : ', brandNone: 'Non précisée',
      building: '— Type de bâtiment : ', floors: '— Nombre de niveaux : ', floorsNone: 'Non précisé',
      city: '— Ville : ', name: '— Nom : ', phone: '— Téléphone : ', details: '— Détails : '
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

    // Numéro WhatsApp de Gelco (à remplacer par le vrai numéro)
    const waNumber = '212661214264';
    const url = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank');

    const success = document.getElementById('formSuccess');
    if (success) success.classList.add('visible');
  });
}

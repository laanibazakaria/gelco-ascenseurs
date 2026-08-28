/**
 * Réception des demandes de devis du site GELCO.
 *
 * Le visiteur envoie sa demande sur WhatsApp comme avant ; en parallèle,
 * cette fonction expédie la même demande, mise en page, aux trois fondateurs.
 * Rien n'est perdu si le visiteur ferme la page avant d'appuyer sur « Envoyer ».
 *
 * Variables d'environnement à renseigner dans Vercel :
 *   BREVO_API_KEY        clé d'API Brevo (gratuit, 300 envois par jour)
 *   DEVIS_DESTINATAIRES  adresses séparées par des virgules, au format
 *                        « Ayoub Laaniba <ayoub@exemple.ma>, Said Morchid <...> »
 *   DEVIS_EXPEDITEUR     adresse vérifiée dans Brevo
 *                        (par défaut grand.elevators.company@gmail.com)
 *
 * Aucune dépendance : l'API Brevo est appelée en HTTP.
 */

const EXPEDITEUR_PAR_DEFAUT = 'grand.elevators.company@gmail.com';
const SITE = 'https://gelco-ascenseurs.vercel.app';

/* ------------------------------------------------------------------ *
 * Outils
 * ------------------------------------------------------------------ */

// Une valeur venue du formulaire ne doit jamais pouvoir injecter de balise
function proteger(valeur) {
  return String(valeur == null ? '' : valeur)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 06 61 89 60 33 → 212661896033, pour les liens d'appel et WhatsApp
function numeroInternational(brut) {
  const chiffres = String(brut || '').replace(/\D/g, '');
  if (!chiffres) return '';
  if (chiffres.startsWith('212')) return chiffres;
  if (chiffres.startsWith('0')) return '212' + chiffres.slice(1);
  return chiffres;
}

// « Ayoub Laaniba <a@x.ma>, b@y.ma » → [{name, email}, {email}]
function listeDestinataires(brut) {
  return String(brut || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const m = part.match(/^(.*?)\s*<\s*([^>]+)\s*>$/);
      return m ? { name: m[1].trim(), email: m[2].trim() } : { email: part };
    })
    .filter(d => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email));
}

function horodatageMaroc() {
  const f = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Casablanca', dateStyle: 'full', timeStyle: 'short'
  });
  return f.format(new Date());
}

function reference() {
  const d = new Date();
  const jour = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Africa/Casablanca', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d).replace(/-/g, '');
  const suffixe = String(d.getTime() % 10000).padStart(4, '0');
  return 'GEL-' + jour + '-' + suffixe;
}

/* ------------------------------------------------------------------ *
 * Mise en page du message
 * Les couleurs reprennent les jetons de la charte : navy-600 #0A3D62,
 * red-600 #C8102E, navy-50 #F4F7FA, ink-900 #1F2937, ink-600 #5B6B7C.
 * Tout est en tableaux et en styles en ligne : c'est la seule mise en
 * page que les logiciels de messagerie affichent de façon fiable.
 * ------------------------------------------------------------------ */

function courriel(d) {
  const ar = d.langue === 'ar';
  const dir = ar ? 'rtl' : 'ltr';
  const police = ar
    ? "'Segoe UI', Tahoma, Arial, sans-serif"
    : "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const T = ar ? {
    titre: 'طلب عرض سعر جديد', depuis: 'من موقع جيلكو',
    recu: 'وصل يوم', ref: 'المرجع',
    client: 'العميل', appeler: 'اتصال', whatsapp: 'واتساب',
    demande: 'تفاصيل الطلب', message: 'رسالة العميل',
    type: 'نوع الطلب', marque: 'ماركة المصعد', batiment: 'نوع المبنى',
    niveaux: 'عدد الطوابق', ville: 'المدينة', tel: 'الهاتف', mail: 'البريد الإلكتروني',
    rien: 'غير محدد',
    pied: 'رسالة أُرسلت تلقائياً من موقع جيلكو. للرد، اتصل بالعميل مباشرة عبر الأزرار أعلاه.'
  } : {
    titre: 'Nouvelle demande de devis', depuis: 'depuis le site GELCO',
    recu: 'Reçue le', ref: 'Référence',
    client: 'Le client', appeler: 'Appeler', whatsapp: 'WhatsApp',
    demande: 'Sa demande', message: 'Son message',
    type: 'Type de demande', marque: 'Marque de l’ascenseur', batiment: 'Type de bâtiment',
    niveaux: 'Nombre de niveaux', ville: 'Ville', tel: 'Téléphone', mail: 'E-mail',
    rien: 'Non précisé',
    pied: 'Message envoyé automatiquement par le site GELCO. Pour répondre, appelez directement le client avec les boutons ci-dessus.'
  };

  const tel = numeroInternational(d.telephone);
  const nom = proteger(d.nom) || (ar ? 'عميل' : 'Client');

  // Une ligne du tableau récapitulatif ; les champs vides sont omis
  const ligne = (etiquette, valeur) => {
    if (!valeur) return '';
    return '<tr>'
      + '<td style="padding:11px 0;border-bottom:1px solid #E9F0F6;color:#5B6B7C;font-size:14px;width:42%;vertical-align:top;">'
      + proteger(etiquette) + '</td>'
      + '<td style="padding:11px 0;border-bottom:1px solid #E9F0F6;color:#1F2937;font-size:15px;font-weight:600;vertical-align:top;">'
      + proteger(valeur) + '</td></tr>';
  };

  const bouton = (lien, texte, fond) =>
    '<a href="' + lien + '" style="display:inline-block;background:' + fond + ';color:#ffffff;'
    + 'text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:8px;'
    + 'margin:0 6px 8px 0;">' + texte + '</a>';

  const actions = tel
    ? bouton('tel:+' + tel, '&#9742; ' + T.appeler + ' ' + proteger(d.telephone), '#0A3D62')
      + bouton('https://wa.me/' + tel, T.whatsapp, '#25D366')
    : '';

  const messageClient = d.message
    ? '<tr><td style="padding:26px 30px 0;">'
      + '<div style="color:#5B6B7C;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">'
      + T.message + '</div>'
      + '<div style="background:#F4F7FA;border-inline-start:4px solid #C8102E;border-radius:0 8px 8px 0;'
      + 'padding:16px 18px;color:#1F2937;font-size:15px;line-height:1.6;white-space:pre-wrap;">'
      + proteger(d.message) + '</div></td></tr>'
    : '';

  return '<!doctype html><html dir="' + dir + '"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"></head>'
    + '<body style="margin:0;padding:0;background:#E9F0F6;font-family:' + police + ';">'
    // Ligne d'aperçu, masquée dans le corps mais lue par la boîte de réception
    + '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'
    + nom + ' · ' + proteger(d.ville || '') + ' · ' + proteger(d.type || '') + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9F0F6;padding:24px 12px;">'
    + '<tr><td align="center">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="' + dir + '" '
    + 'style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;'
    + 'box-shadow:0 2px 4px rgba(4,30,51,.05),0 10px 28px rgba(4,30,51,.11);">'

    // En-tête
    + '<tr><td style="background:#0A3D62;padding:26px 30px;">'
    + '<div style="color:#B9CBD8;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">'
    + 'GELCO &middot; ' + T.depuis + '</div>'
    + '<div style="color:#ffffff;font-size:23px;font-weight:800;margin-top:6px;">' + T.titre + '</div>'
    + '<div style="color:#B9CBD8;font-size:13px;margin-top:10px;">'
    + T.recu + ' ' + proteger(d.date) + ' &middot; ' + T.ref + ' <span style="color:#F2A9B0;font-weight:700;">'
    + proteger(d.reference) + '</span></div></td></tr>'

    // Le client et les moyens de le rappeler
    + '<tr><td style="padding:28px 30px 0;">'
    + '<div style="color:#5B6B7C;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">'
    + T.client + '</div>'
    + '<div style="color:#1F2937;font-size:26px;font-weight:800;margin:6px 0 16px;">' + nom + '</div>'
    + actions + '</td></tr>'

    // Le détail de la demande
    + '<tr><td style="padding:24px 30px 0;">'
    + '<div style="color:#5B6B7C;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">'
    + T.demande + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
    + ligne(T.type, d.type)
    + ligne(T.marque, d.marque || T.rien)
    + ligne(T.batiment, d.batiment)
    + ligne(T.niveaux, d.niveaux || T.rien)
    + ligne(T.ville, d.ville)
    + ligne(T.tel, d.telephone)
    + ligne(T.mail, d.email)
    + '</table></td></tr>'

    + messageClient

    // Pied
    + '<tr><td style="padding:28px 30px 30px;">'
    + '<div style="border-top:1px solid #DDE5EC;padding-top:18px;color:#5B6B7C;font-size:12px;line-height:1.7;">'
    + T.pied + '<br>'
    + '<a href="' + SITE + '" style="color:#0A3D62;font-weight:700;text-decoration:none;">gelco-ascenseurs.vercel.app</a>'
    + '</div></td></tr>'

    + '</table></td></tr></table></body></html>';
}

/* ------------------------------------------------------------------ *
 * Alerte SMS aux trois responsables
 *
 * Un SMS coûte de l'argent à chaque envoi : trois numéros, c'est trois
 * fois le prix par demande. Deux précautions en découlent.
 *
 * 1. L'ENCODAGE. Un SMS tient en 160 caractères tant qu'il reste dans
 *    l'alphabet GSM. Un seul caractère hors de cet alphabet — un « â »,
 *    une lettre arabe — le fait basculer en UCS-2, où la limite tombe à
 *    70 caractères : le même message est alors facturé deux ou trois
 *    fois. On ramène donc tout à l'ASCII, sans exception.
 * 2. L'ACTIVATION. Sans la variable DEVIS_SMS, aucun SMS n'est envoyé.
 *    Le service ne se met à coûter que le jour où on le décide.
 * ------------------------------------------------------------------ */

const ACCENTS = { 'à':'a','á':'a','â':'a','ä':'a','ã':'a','å':'a','ç':'c','è':'e','é':'e',
  'ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ñ':'n','ò':'o','ó':'o','ô':'o','ö':'o',
  'õ':'o','ø':'o','ù':'u','ú':'u','û':'u','ü':'u','ý':'y','ÿ':'y','œ':'oe','æ':'ae' };

// Tout ce qui n'est pas ASCII imprimable sort : c'est le prix d'un SMS unique
function versAscii(texte) {
  return String(texte || '')
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/[·•]/g, '-').replace(/ /g, ' ')
    .split('').map(c => ACCENTS[c] || ACCENTS[c.toLowerCase()] && ACCENTS[c.toLowerCase()].toUpperCase() || c).join('')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function texteSms(d) {
  const nom = versAscii(d.nom) || 'Client';
  const lignes = ['GELCO - nouvelle demande', nom, d.telephone];
  const situation = [versAscii(d.ville), versAscii(d.type)].filter(Boolean).join(' - ');
  if (situation) lignes.push(situation);
  // Une demande rédigée en arabe ne se transcrit pas : on le signale,
  // le détail complet est de toute façon dans le courriel.
  if (d.langue === 'ar') lignes.push('(demande en arabe)');
  lignes.push('Ref ' + d.reference);

  let texte = lignes.join('\n');
  if (texte.length > 160) texte = texte.slice(0, 157) + '...';
  return texte;
}

async function envoyerSms(cle, donnees) {
  const numeros = String(process.env.DEVIS_SMS || '')
    .split(',').map(n => numeroInternational(n.trim())).filter(n => n.length >= 11);

  // Le SMS passe par Brevo : sans clé, il ne peut pas partir
  if (!numeros.length || !cle) return { actif: false, partis: 0, total: 0 };

  const contenu = texteSms(donnees);
  const expediteur = (process.env.DEVIS_SMS_EXPEDITEUR || 'GELCO').slice(0, 11);

  const envois = await Promise.allSettled(numeros.map(numero =>
    fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: { 'api-key': cle, 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ sender: expediteur, recipient: numero, content: contenu, type: 'transactional' })
    }).then(async r => {
      if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 200));
      return numero;
    })
  ));

  const partis = envois.filter(e => e.status === 'fulfilled').length;
  envois.forEach((e, i) => {
    if (e.status === 'rejected') console.error('SMS refuse pour', numeros[i], e.reason && e.reason.message);
  });

  return {
    actif: true,
    partis,
    total: numeros.length,
    caracteres: contenu.length,
    // Au-delà de 160 caractères ASCII, l'opérateur facture plusieurs SMS
    segments: Math.max(1, Math.ceil(contenu.length / 160))
  };
}

/* ------------------------------------------------------------------ *
 * Le courriel
 * ------------------------------------------------------------------ */

async function envoyerCourriel(cle, destinataires, d) {
  if (!cle) return { actif: false, partis: 0, total: 0 };

  const envoi = {
    sender: { name: 'Site GELCO', email: process.env.DEVIS_EXPEDITEUR || EXPEDITEUR_PAR_DEFAUT },
    to: destinataires,
    subject: (d.langue === 'ar' ? 'طلب عرض سعر — ' : 'Demande de devis — ')
      + d.nom + (d.ville ? ' · ' + d.ville : '') + ' [' + d.reference + ']',
    htmlContent: courriel(d),
    tags: ['devis-site']
  };

  // Répondre au message écrit directement au client, quand il a laissé un e-mail
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    envoi.replyTo = { email: d.email, name: d.nom };
  }

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': cle, 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(envoi)
    });
    if (!r.ok) {
      console.error('Brevo a refuse le courriel', r.status, (await r.text()).slice(0, 200));
      return { actif: true, partis: 0, total: destinataires.length, statut: r.status };
    }
    return { actif: true, partis: destinataires.length, total: destinataires.length };
  } catch (e) {
    console.error('Echec de l appel courriel', e && e.message);
    return { actif: true, partis: 0, total: destinataires.length, erreur: 'reseau' };
  }
}

/* ------------------------------------------------------------------ *
 * Alerte WhatsApp aux trois responsables, via CallMeBot
 *
 * CallMeBot est un pont gratuit mais NON OFFICIEL vers WhatsApp. Deux
 * conséquences dont il faut avoir conscience :
 *   — il peut cesser de fonctionner sans préavis ; c'est pourquoi son
 *     échec ne fait jamais échouer les autres voies ;
 *   — le nom et le numéro du client transitent par ses serveurs, ce qui
 *     est signalé dans les mentions légales du site.
 *
 * Chaque responsable doit l'autoriser une fois, depuis son WhatsApp, en
 * écrivant « I allow callmebot to send me messages » au +34 623 76 13 63
 * (numéro à vérifier sur callmebot.com : il change au fil des années).
 * Il reçoit en retour une clé personnelle, à reporter dans DEVIS_WHATSAPP
 * au format  numero:cle,numero:cle,numero:cle
 * ------------------------------------------------------------------ */

function texteWhatsapp(d) {
  const l = [];
  l.push('*GELCO — nouvelle demande*');
  l.push('');
  l.push('*Client :* ' + d.nom);
  l.push('*Téléphone :* ' + d.telephone);
  if (d.ville)    l.push('*Ville :* ' + d.ville);
  if (d.type)     l.push('*Demande :* ' + d.type);
  if (d.marque)   l.push('*Marque :* ' + d.marque);
  if (d.batiment) l.push('*Bâtiment :* ' + d.batiment + (d.niveaux ? ' — ' + d.niveaux + ' niveaux' : ''));
  if (d.email)    l.push('*E-mail :* ' + d.email);
  if (d.message) {
    l.push('');
    // CallMeBot passe le message dans l'adresse : on le borne pour ne pas
    // dépasser la longueur qu'un serveur accepte.
    l.push('_' + (d.message.length > 600 ? d.message.slice(0, 597) + '…' : d.message) + '_');
  }
  l.push('');
  l.push('Rappeler : wa.me/' + numeroInternational(d.telephone));
  l.push('Réf. ' + d.reference);
  return l.join('\n');
}

async function envoyerWhatsapp(d) {
  // Format attendu :  212661896033:1234567,212661214264:2345678
  const comptes = String(process.env.DEVIS_WHATSAPP || '')
    .split(',')
    .map(part => {
      const [numero, cle] = part.split(':').map(x => (x || '').trim());
      return { numero: numeroInternational(numero), cle };
    })
    .filter(c => c.numero.length >= 11 && c.cle);

  if (!comptes.length) return { actif: false, partis: 0, total: 0 };

  const texte = encodeURIComponent(texteWhatsapp(d));

  const envois = await Promise.allSettled(comptes.map(c => {
    const url = 'https://api.callmebot.com/whatsapp.php?phone=' + c.numero
      + '&apikey=' + encodeURIComponent(c.cle) + '&text=' + texte;
    return fetch(url, { method: 'GET' }).then(async r => {
      const corps = (await r.text()).slice(0, 300);
      // CallMeBot répond 200 même sur erreur : il faut lire la réponse
      if (!r.ok || /error|invalid|not.*allowed|APIKey/i.test(corps)) {
        throw new Error(r.status + ' ' + corps.replace(/<[^>]*>/g, ' ').trim().slice(0, 160));
      }
      return c.numero;
    });
  }));

  envois.forEach((e, i) => {
    if (e.status === 'rejected') {
      console.error('WhatsApp refuse pour', comptes[i].numero, e.reason && e.reason.message);
    }
  });

  return {
    actif: true,
    partis: envois.filter(e => e.status === 'fulfilled').length,
    total: comptes.length
  };
}

/* ------------------------------------------------------------------ *
 * La fonction
 * ------------------------------------------------------------------ */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erreur: 'methode' });
  }

  let corps = req.body;
  if (typeof corps === 'string') {
    try { corps = JSON.parse(corps); } catch (e) { corps = {}; }
  }
  corps = corps || {};

  // Piège à robots : un champ que seul un automate remplit
  if (corps.societe) return res.status(200).json({ ok: true });

  // Le nom et le téléphone suffisent à rappeler quelqu'un ; le reste est un plus
  const nom = String(corps.nom || '').trim().slice(0, 120);
  const telephone = String(corps.telephone || '').trim().slice(0, 40);
  if (!nom || !telephone) {
    return res.status(400).json({ ok: false, erreur: 'nom et telephone requis' });
  }

  // Tant que les trois responsables n'ont pas d'adresse propre, la demande
  // part sur la boîte de l'entreprise, que tous les trois consultent.
  // Le jour où ils ont chacun la leur, il suffit de renseigner
  // DEVIS_DESTINATAIRES dans Vercel : rien d'autre à changer ici.
  const destinataires = listeDestinataires(
    process.env.DEVIS_DESTINATAIRES || EXPEDITEUR_PAR_DEFAUT
  );
  const cle = process.env.BREVO_API_KEY;

  const donnees = {
    langue: corps.langue === 'ar' ? 'ar' : 'fr',
    nom, telephone,
    email: String(corps.email || '').trim().slice(0, 160),
    ville: String(corps.ville || '').trim().slice(0, 120),
    type: String(corps.type || '').trim().slice(0, 120),
    marque: String(corps.marque || '').trim().slice(0, 120),
    batiment: String(corps.batiment || '').trim().slice(0, 120),
    niveaux: String(corps.niveaux || '').trim().slice(0, 40),
    message: String(corps.message || '').trim().slice(0, 4000),
    date: horodatageMaroc(),
    reference: reference()
  };

  // Les trois voies partent ensemble et ne dépendent pas les unes des autres :
  // le WhatsApp doit fonctionner même sans compte Brevo, et le courriel doit
  // partir même si CallMeBot est en panne.
  const [whatsapp, sms, email] = await Promise.all([
    envoyerWhatsapp(donnees),
    envoyerSms(cle, donnees),
    envoyerCourriel(cle, destinataires, donnees)
  ]);

  const voies = [whatsapp, sms, email];
  const actives = voies.filter(v => v.actif);

  // Aucune voie configurée : on le dit clairement plutôt que d'échouer en
  // silence. Le visiteur, lui, est déjà passé par WhatsApp de son côté.
  if (!actives.length) {
    return res.status(503).json({
      ok: false, erreur: 'non configure',
      details: 'aucune voie active — renseigner DEVIS_WHATSAPP ou BREVO_API_KEY'
    });
  }

  const aboutie = actives.some(v => v.partis > 0);
  return res.status(aboutie ? 200 : 502).json({
    ok: aboutie,
    reference: donnees.reference,
    whatsapp, sms, email
  });
};

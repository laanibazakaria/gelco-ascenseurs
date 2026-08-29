# ZONES PROTÉGÉES — site GELCO

Méthode reprise du `PROTECTED.md` de Propulsez Coach, adaptée à un site
statique bilingue avec une fonction serveur.

**À quoi sert ce document.** Certains fichiers cassent en silence : le site
continue de s'afficher, mais les demandes des clients ne partent plus, ou
Google déréférence les pages. Rien ne le signale. Cette liste dit où il faut
réfléchir avant de modifier.

---

## 🔴 ZONE ROUGE — ne jamais modifier sans avoir compris l'effet

### `api/devis.js` — l'acheminement des demandes
La seule fonction serveur du site. Elle envoie chaque demande de devis à
Ayoub, Said et Mohamed. **Une erreur ici fait perdre des clients sans que
personne s'en aperçoive** : le visiteur voit sa confirmation, le formulaire
paraît fonctionner, et rien n'arrive.

- Les trois voies (WhatsApp, e-mail, SMS) sont **indépendantes par
  construction**. Ne jamais les enchaîner : une panne de l'une ferait tomber
  les autres.
- CallMeBot répond `200` **même quand il échoue**. Le contrôle du corps de
  la réponse (`error`, `invalid`, `APIKey`) n'est pas décoratif : sans lui,
  un envoi raté passe pour un succès.
- La limite de cadence protège d'une facture SMS en rafale. Elle vit en
  mémoire, donc imparfaite — mais la retirer, c'est ouvrir la porte.
- Après toute modification : `node --check api/devis.js` puis le jeu
  d'essais (52 contrôles, voir `SKILLS.md` skill 6).

### Le bloc `<!-- SEO GELCO -->` de chaque page
`canonical`, `hreflang`, Open Graph, JSON-LD. Une erreur ici et Google
indexe la mauvaise page, ou considère les versions française et arabe comme
du contenu dupliqué.

- Le `canonical` pointe toujours vers **Vercel**, jamais vers GitHub Pages.
- Chaque page déclare sa jumelle dans l'autre langue — jamais l'accueil.
- Titre ≤ 70 caractères, description ≤ 165, sinon Google tronque.
- Le titre existe à **trois endroits** (`title`, `og:title`, `twitter:title`) :
  les trois doivent rester identiques.

### `google6a51ccad6ec2753d.html` — la preuve de propriete Google
Fichier d'une seule ligne, a la racine. Google revient le lire regulierement :
**le supprimer fait perdre la propriete du site dans Search Console**, et avec
elle les statistiques de recherche et la soumission du plan du site.

### `vercel.json`, `sitemap.xml`, `robots.txt`
En-têtes de cache et déclaration des pages aux moteurs. Une erreur de
syntaxe dans `vercel.json` fait échouer le déploiement entier.

### Le bloc `:root` de `assets/css/style.css`
Toute la charte : rampes de couleurs, échelle typographique, ombres.
Un jeton qui se référence lui-même rend la déclaration invalide et fait
disparaître des fonds entiers — c'est déjà arrivé sur le héros.
Contrôle : aucun `--x: var(--x)`.

### Les numéros de version `style.css?v=` et `main.js?v=`
Si la feuille de style ou le script change **sans** que le numéro monte, les
téléphones gardent l'ancienne version en cache et le correctif n'arrive
jamais chez le client. Monter le numéro sur les **17 pages** à la fois.

---

## 🟠 ZONE ORANGE — vérifier les effets de bord

### `assets/js/main.js`
Un seul fichier porte le formulaire de devis, la galerie photo, le filtre du
catalogue, le fond flouté et le menu mobile.

- L'appel réseau doit rester **avant** `window.open` : ouvrir un onglet exige
  le geste de l'utilisateur, qu'une attente ferait perdre.
- Les boutons du formulaire se sélectionnent par
  `quoteForm.querySelectorAll('button[data-canal]')`. Un sélecteur global
  ramasserait le `<form>`, qui porte le même attribut après le premier clic.
- Le fond flouté se pose sur l'événement `load` de chaque image. Le poser
  autrement annule le chargement différé et fait télécharger 1,5 Mo d'un coup.

### Le bloc `[dir="rtl"]` de `assets/css/style.css`
Une seule règle y a déjà décroché **cinq composants** des pages arabes en
mélangeant deux intentions. Une règle RTL ne doit porter que ce qui concerne
le sens de lecture.

### Les liens `lang-switch`
Chaque page doit pointer vers **sa jumelle**, pas vers l'accueil. 17 liens,
17 destinations différentes.

### `mentions-legales.html` et `ar/mentions-legales.html`
Obligations légales. Tout nouveau service par lequel transitent des données
client doit y être déclaré (loi 09-08).

---

## 🟢 ZONE LIBRE

Textes, photos, cartes de réalisations, marques citées, `README`, `SKILLS.md`,
ce document. Aucun risque au-delà du visuel — à condition de respecter les
règles de contenu ci-dessous.

---

## RÈGLES PERMANENTES

| Règle | Pourquoi |
|---|---|
| **Aucune clé d'API dans le dépôt** | Le dépôt est public. Les clés vivent dans les variables d'environnement Vercel. |
| **Aucun avis client inventé** | Uniquement les vrais avis Google. |
| **Aucun chiffre non vérifié** | Pas d'années d'expérience ni de nombre de chantiers tant que la direction ne les a pas confirmés. |
| **Aucun logo de marque concurrente** | Otis, Schindler, KONE… en texte seul, avec la mention de non-affiliation. |
| **Aucune image d'illustration présentée comme un chantier GELCO** | La description doit dire ce que la photo est vraiment. |
| **`Gelcoinfo/` ne se publie pas** | Documents internes, exclus par `.gitignore`. |

---

## CONTRÔLE AVANT DE LIVRER

```bash
cd "C:\Users\laani\Desktop\GELCO"

node --check assets/js/main.js && node --check api/devis.js
python -c "import json;json.load(open('vercel.json',encoding='utf-8'));print('vercel.json OK')"

# Une seule version sur les 17 pages
grep -ho 'style\.css?v=[0-9]*\|main\.js?v=[0-9]*' *.html ar/*.html | sort | uniq -c

# Aucun jeton auto-referent
python -c "
import io,re
s=io.open('assets/css/style.css',encoding='utf-8').read()
print('jetons auto-referents :', [m for m in re.findall(r'(--[\w-]+): var\((--[\w-]+)\)',s) if m[0]==m[1]] or 'aucun')
"

# Aucune cle d'API partie dans le depot
grep -rn 'xkeysib\|api-key.*[A-Za-z0-9]\{20,\}' api/ assets/ *.html || echo "aucune cle"
```

Les audits complets — français, arabe, design, publication — sont dans
`SKILLS.md`.

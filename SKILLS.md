# SKILLS GELCO — commandes réutilisables

Méthode inspirée du `SKILLS.md` de Propulsez Coach, adaptée à un site statique
bilingue publié sur Vercel + GitHub Pages.

Usage : dire à Claude Code « **Lance l'audit-site** » (ou le nom du skill).

---

## SKILL 1 : audit-site

À lancer en début de session, ou avant de livrer quoi que ce soit au client.

```bash
cd "C:\Users\laani\Desktop\GELCO"

# 1. Pages : toutes doivent répondre 200
B=https://gelco-ascenseurs.vercel.app
for f in "" pieces-detachees.html capteurs.html services.html realisations.html \
         a-propos.html contact.html mentions-legales.html \
         ar/index.html ar/pieces-detachees.html ar/capteurs.html ar/services.html \
         ar/realisations.html ar/a-propos.html ar/contact.html ar/mentions-legales.html \
         sitemap.xml robots.txt; do
  printf "%-30s %s\n" "/$f" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$B/$f")"
done

# 2. Versions CSS/JS : une seule valeur attendue sur les 16 pages
grep -ho 'style\.css?v=[0-9]*\|main\.js?v=[0-9]*' *.html ar/*.html | sort | uniq -c

# 3. Images : dimensions et descriptions obligatoires
echo "img sans width : $(grep -o '<img[^>]*>' *.html ar/*.html | grep -vc 'width=')"
echo "img sans alt   : $(grep -o '<img[^>]*>' *.html ar/*.html | grep -vc 'alt=')"

# 4. Cohérence des coordonnées (aucune valeur périmée ne doit apparaître)
echo "ancien mobile  : $(grep -o '212661214264' *.html ar/*.html | wc -l)  (attendu 0 hors listes des 3 associés)"
echo "adresse        : $(grep -o 'Tikiwine\|Assais' *.html ar/*.html | wc -l)  (attendu 0)"

# 5. Contenu inventé : rien ne doit revenir
echo "faux avis      : $(grep -c 'card testimonial' index.html ar/index.html | grep -v ':0' | wc -l)  (attendu 0)"
echo "images IA      : $(grep -o 'pose-capteur\|technicien-armoire\|associes-gelco\|equipe-portrait' *.html ar/*.html | wc -l)  (attendu 0)"

# 6. Fiche entreprise Google : le JSON doit rester valide
python -c "
import io,re,json,glob
ok=err=0
for p in glob.glob('*.html')+glob.glob('ar/*.html'):
    s=io.open(p,'r',encoding='utf-8').read()
    m=re.search(r'<script type=\"application/ld\+json\">(.*?)</script>',s,re.S)
    if not m: continue
    try: json.loads(m.group(1)); ok+=1
    except Exception as e: err+=1; print('INVALIDE',p,e)
print(f'JSON-LD : {ok} valides, {err} invalides')
"
```

**Zones sensibles** — si l'une est modifiée, le signaler avant de continuer :
`assets/js/main.js` (formulaire de devis, galerie), le bloc `<!-- SEO GELCO -->`
de chaque page (canonical, hreflang, JSON-LD), `vercel.json`, `sitemap.xml`.

---

## SKILL 2 : checklist-publication

Avant chaque `git push`.

```bash
cd "C:\Users\laani\Desktop\GELCO"

node --check assets/js/main.js          # 1. le script compile
python -c "import json;json.load(open('vercel.json',encoding='utf-8'));print('vercel.json OK')"
grep -ho 'style\.css?v=[0-9]*\|main\.js?v=[0-9]*' *.html ar/*.html | sort | uniq -c
git status --short                       # 4. rien d'oublié
git diff --cached --name-only            # 5. ce qui part réellement
grep -rn "TODO\|FIXME\|lorem" --include="*.html" . | grep -v node_modules | head || echo "aucun texte provisoire"
```

**Règle** : si `assets/css/style.css` ou `assets/js/main.js` change, **monter leur
numéro de version** dans les 16 pages, sinon les téléphones gardent l'ancienne
version en cache.

```bash
python -c "
import io,glob
AV,AP='v=9','v=10'   # adapter
for p in glob.glob('*.html')+glob.glob('ar/*.html'):
    s=io.open(p,'r',encoding='utf-8').read()
    io.open(p,'w',encoding='utf-8',newline='').write(s.replace('style.css?'+AV,'style.css?'+AP))
print('versions montees')
"
```

---

## SKILL 3 : audit-design

Audit de l'interface contre les 100+ règles Vercel (accessibilité, formulaires,
images, animations, typographie, langues).

La compétence est déjà installée dans `.agents/skills/web-design-guidelines`.

Usage : dire « **vérifie le site avec les règles Vercel** ».

Claude récupère les règles à jour depuis
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
puis rend les constats au format `fichier:ligne`.

Réinstallation si besoin :
```bash
npx -y skills@latest add vercel-labs/agent-skills --skill web-design-guidelines
```

---

## SKILL 4 : ajouter-photos

Quand la direction envoie de nouvelles photos (dossier `Gelcoinfo/`).

```bash
cd "C:\Users\laani\Desktop\GELCO"

# 1. Redimensionner et compresser pour le web (max 1400 px, qualité 80)
python -c "
from PIL import Image; import os,sys
src,dst=sys.argv[1],sys.argv[2]
im=Image.open(src); w,h=im.size
if max(w,h)>1400:
    r=1400/max(w,h); im=im.resize((int(w*r),int(h*r)),Image.LANCZOS)
im.convert('RGB').save(dst,'JPEG',quality=80,optimize=True,progressive=True)
print(dst,im.size,os.path.getsize(dst)//1024,'Ko')
" "Gelcoinfo/PHOTO.jpg" "assets/img/nom-parlant.jpg"
```

**Règles pour chaque photo ajoutée :**
- nom de fichier explicite en français (`cabine-bois-granit.jpg`, pas `IMG_2843.jpg`)
- attributs `width` et `height` réels (évite le décalage de mise en page)
- `alt` décrivant la photo, en français **et** en arabe
- `loading="lazy"` sauf pour le logo
- une description honnête : ne jamais présenter une image d'illustration comme un chantier GELCO

---

## Points de vigilance permanents

| Sujet | Règle |
|---|---|
| Adresse | Résidence El Youmn, RDC imm. 16 n° 60, Dcheira El Jihadia — Agadir. Identique sur le site, les mentions légales, le JSON-LD et la fiche Google. |
| Téléphones | Fixe 05 28 32 32 58 · WhatsApp 06 61 89 60 33 · les 3 mobiles dans les listes complètes |
| Avis clients | Uniquement les vrais avis Google. Ne jamais réintroduire de témoignages rédigés. |
| Chiffres | Seulement des données vérifiables tant que la direction n'a pas confirmé les chiffres réels d'expérience et de stock. |
| Marques | Otis, Schindler, KONE… en texte uniquement, jamais leurs logos, avec la mention de non-affiliation. |
| Publication | `git push origin main` suffit : Vercel et GitHub Pages se mettent à jour seuls en ~30 s. |

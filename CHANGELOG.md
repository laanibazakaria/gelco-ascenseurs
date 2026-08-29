# Journal du site GELCO

Ce que le site fait, et depuis quand. Écrit pour la direction, pas pour un
développeur : l'historique technique complet est dans `git log`.

**Adresse principale** : https://gelcoascenseur.com
**Ancienne adresse** : https://gelco-ascenseurs.vercel.app (fonctionne toujours)
**Copie de secours** : https://laanibazakaria.github.io/gelco-ascenseurs

---

## 29 août 2026 — GELCO a son propre nom de domaine

Le site vit désormais à l'adresse **gelcoascenseur.com**, achetée pour un an
(~110 DH, renouvellement automatique activé). Le nom reprend exactement
l'adresse e-mail de l'entreprise — une seule identité partout.

L'ancienne adresse `gelco-ascenseurs.vercel.app` continue de fonctionner :
aucun lien déjà partagé n'est perdu. Mais toutes les pages désignent
maintenant le domaine propre comme adresse de référence, ce qui indique à
Google laquelle indexer.

234 emplacements repris : adresses de référence des 17 pages, 48 déclarations
de correspondance français/arabe, aperçus de partage WhatsApp et Facebook,
fiche entreprise, plan du site, et le QR code — **l'ancien QR code imprimé
est à jeter**.

Nouvelle propriété déclarée à Search Console, plan du site resoumis.

> ⚠️ **Le domaine est un abonnement annuel.** Si personne ne renouvelle,
> le site devient inaccessible du jour au lendemain. Vérifiez que l'adresse
> de facturation est complète dans Vercel et que les rappels partent bien
> sur `gelcoascenseur@gmail.com`.

---

## 29 août 2026 — Le site devient mesurable

**Nouvelle adresse de l'entreprise.** `gelcoascenseur@gmail.com` remplace
l'ancienne, partout : pied de page, contact, mentions légales, formulaire,
fiche Google et fonction serveur — 66 emplacements.

> ⚠️ L'ancienne adresse figure sans doute encore sur la fiche Google Business,
> les factures et les cartes de visite. **Gardez l'ancienne boîte ouverte et
> surveillée** tant que ces supports n'ont pas été repris, sinon des demandes
> se perdront sans que personne le sache.

**Mesure d'audience activée.** Vercel Web Analytics compte désormais les
visiteurs, les pages consultées, les villes et les appareils. Sans cookie,
gratuit. À consulter dans l'onglet *Analytics* du projet Vercel. La mesure de
vitesse d'affichage fonctionne également.

**Site déclaré à Google Search Console.** Propriété validée par un fichier de
preuve à la racine, plan du site soumis avec ses 16 adresses. Les premières
données apparaissent sous quelques jours dans *Performances* : les recherches
qui amènent des visiteurs, la position moyenne, le nombre de clics.

> ⚠️ Le fichier `google6a51ccad6ec2753d.html` à la racine du site **ne doit
> jamais être supprimé** : Google revient le vérifier, et sa disparition ferait
> perdre la propriété du site dans Search Console.

**Photos allégées.** Les 61 photos sont servies en WebP — 35 % de moins à
télécharger — avec repli automatique en JPEG pour les téléphones anciens.

---

## 29 août 2026 — Reprise complète des deux langues

**Version arabe.** Huit composants étaient décrochés de la mise en page sur
toutes les pages arabes : les logos des huit marques s'empilaient au même
endroit, illisibles. Une règle de style mélangeait deux intentions. Corrigé.

Le texte arabe respire mieux : l'interligne était réglé sur une valeur pensée
pour le français, trop serrée pour un alphabet à signes diacritiques.

**Version française.** Cinq pages avaient des titres ou descriptions que
Google tronquait dans ses résultats. Sur l'accueil, le titre s'arrêtait au
milieu de « pièces détachées » — le mot le plus recherché disparaissait.
Reformulés, aux trois endroits de chaque page.

**Vérifié :** les 17 pages, dans les deux langues — structure, liens, images,
référencement, catalogue, galerie, formulaire.

---

## 28 août 2026 — Les demandes arrivent aux trois responsables

**Le formulaire.** Le visiteur choisit désormais à qui il envoie sa demande :
trois boutons nommés — Ayoub, Said, Mohamed. WhatsApp s'ouvre sur le numéro
de la personne choisie, avec le message déjà rédigé. Les trois boutons sont
présents sur **les 17 pages**, avec un message adapté au sujet de la page.

**Envoi automatique.** Une fonction serveur peut en parallèle expédier la
même demande, mise en page, par e-mail et par SMS. Trois voies indépendantes :
si l'une tombe, les autres passent. *Aucune n'est active à ce jour* — chacune
attend une clé de configuration. Le site ne coûte rien tant qu'elles sont
éteintes.

**Page contact.** Un bloc « Vos interlocuteurs » présente les trois
responsables par leur nom, chacun joignable par appel ou WhatsApp.

**Apparence.** La barre bleu foncé du haut a été supprimée ; le bouton
العربية est remonté dans le menu. Toutes les couleurs et tailles du site
passent maintenant par une charte unique — on change l'identité à un seul
endroit.

**Page d'erreur.** Une page 404 bilingue remplace l'écran blanc quand un lien
est incomplet.

---

## 26 août 2026 — Mise à niveau professionnelle

- Audit complet du site : 11 points corrigés
- Conformité aux règles d'interface de Vercel (deux passages)
- Mise en cache adaptée : pages toujours fraîches, photos servies vite
- 21 nouvelles photos envoyées par la direction, intégrées au catalogue et
  aux réalisations
- Chargement différé des images : le site s'affiche plus vite sur mobile
- `SKILLS.md` : les commandes d'entretien du site, réutilisables

---

## 21 août 2026 — Les photos affichées en entier

Les photos étaient rognées et n'en montraient que la moitié. Elles
s'affichent désormais entières, sur un fond flouté tiré de la photo
elle-même, sans bande grise.

---

## 18 août 2026 — Ouverture du site

Site vitrine bilingue français / arabe, 16 pages.

- Accueil, Pièces détachées, Capteurs, Services, Réalisations, À propos,
  Contact, Mentions légales — chacune dans les deux langues
- Catalogue de pièces avec filtre par catégorie et galerie photo
- Formulaire de devis relié à WhatsApp
- Photos et vidéos réelles des chantiers GELCO (vidéos sans son)
- Carte Google Maps et fiche entreprise déclarée aux moteurs de recherche
- Numéro principal et WhatsApp : 06 61 89 60 33

---

## Ce qui reste à faire — côté GELCO

Ces points ne dépendent pas du site mais de démarches de l'entreprise :

| À faire | Pourquoi |
|---|---|
| **Récupérer la fiche Google Business — à partir du 1er septembre 2026** | Voir l'encadré ci-dessous |
| Reprendre factures et cartes de visite | Elles portent l'ancienne adresse e-mail |
| Confirmer les chiffres réels (années, chantiers, stock) | Rien d'invérifiable n'a été publié |
| Recueillir de vrais avis Google | Aucun témoignage n'a été inventé |
| Refaire le marquage de la camionnette | Elle porte une adresse périmée |
| Transférer les comptes GitHub et Vercel à GELCO | Ils sont aujourd'hui au nom de Zakaria |

---

## La fiche Google Business — où on en est

**Situation.** La fiche `GELCO ASCENSEUR` existe, affiche la bonne adresse et
porte déjà **3 avis clients notés 5,0 sur 5**. Mais elle est gérée par un
compte `da…@gmail.com` que la direction ne connaît pas — vraisemblablement la
personne qui avait réalisé l'ancien site `wix-vibe.com`. Le chef indique que
cette adresse ne fonctionne plus.

C'est pourquoi les demandes de correction envoyées par le passé n'ont jamais
abouti : elles partaient à ce compte, qui ne répond pas.

**Ce qui a été fait.** Une demande d'accès en **propriété** a été déposée le
**29 août 2026** depuis `gelcoascenseur@gmail.com`, sur `business.google.com`.
Google a répondu : si le titulaire ne réagit pas **avant le 1er septembre
2026**, l'accès pourra être obtenu. Cette étape est
obligatoire : Google exige une demande restée sans réponse avant de
transférer une fiche.

**Ce qu'il reste à faire — à partir du 1er septembre 2026** (date annoncée par
Google au moment de l'envoi) **:**

1. retourner sur `business.google.com`, connecté avec `gelcoascenseur@gmail.com`
2. chercher `GELCO ASCENSEUR`
3. le bouton devrait afficher **« Revendiquer cet établissement »** au lieu de
   « Demander l'accès » — le titulaire n'ayant pas répondu
4. suivre la validation (probablement une vidéo continue du local, de
   l'enseigne, du stock et d'un justificatif au nom de GELCO)

**Une fois la fiche récupérée, corriger :**

| Champ | Actuel | À mettre |
|---|---|---|
| Site Web | `wix-vibe.com` | `https://gelcoascenseur.com` |
| Téléphone | 06 61 93 95 41 | 05 28 32 32 58 (le fixe) |
| E-mail | ancienne adresse | `gelcoascenseur@gmail.com` |

> ⚠️ **Ne jamais créer une seconde fiche** pendant l'attente. Google suspend
> les doublons, et les 3 avis 5 étoiles seraient perdus avec.

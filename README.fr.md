<p align="right"><a href="README.md">Read in English</a></p>

# Shopify Shop the Look — image shoppable pilotée par metaobjects

Une photo lifestyle pleine largeur avec des points cliquables ("+"). Un
clic ouvre une petite carte produit (photo, titre, prix, ajout rapide
natif) directement sur l'image — pas de rechargement de page, pas de
popup séparée. Les points viennent d'un metaobject **Look**, donc un
marchand construit un Look réutilisable (une photo + ses points) une seule
fois, et le réutilise sur autant de sections ou de pages qu'il veut, sans
aucun changement de code.

Conçu pour le thème **Shopify Horizon**. Réutilise délibérément le
mécanisme natif "Product Hotspots" d'Horizon — interaction, accessibilité,
repli mobile — plutôt que de le reconstruire, et l'étend avec une couche
metaobject pour la réutilisabilité.

![Shop the Look — points cliquables sur une photo lifestyle, une carte produit ouverte](reference/Capture%20d%E2%80%99%C3%A9cran%2C%20le%202026-08-21%20%C3%A0%2001.33.28.png)

## Fonctionnalités

- **Metaobject "Look" réutilisable** : une photo + ses points, défini une
  fois, référencé depuis n'importe quelle section via un simple sélecteur
  dans l'éditeur de thème — aucun code à toucher pour ajouter une nouvelle
  image shoppable
- Sur desktop, le survol ouvre une petite carte produit sur place ; un
  court délai de grâce la garde ouverte pendant que la souris se déplace
  entre le "+" et la carte
- Les produits multi-variantes utilisent le flux natif "Choisir" (ouvre la
  modale complète de sélection de variante) ; les produits à variante
  unique s'ajoutent directement au panier
- **Aucune popover sur mobile** — toucher un point ouvre directement la
  modale native d'ajout rapide du thème, exactement comme n'importe quel
  autre déclencheur d'ajout rapide du site
- Diamètre du cercle, épaisseur de l'icône "+" (valeurs desktop/mobile
  indépendantes), taille de la zone cliquable (avec un plancher
  d'accessibilité intégré), couleurs du point et de la carte — tout est
  éditable depuis l'éditeur de thème
- Partage 100% de son code d'interaction avec la section native "Product
  Hotspots" d'Horizon via des snippets communs — aucune logique dupliquée,
  et tout futur correctif sur l'un s'applique automatiquement à l'autre

## Contenu du dépôt

Ce dépôt contient **uniquement le code custom de cette fonctionnalité** —
pas le thème Horizon complet, qui appartient à Shopify. Plusieurs fichiers
ici remplacent des fichiers natifs d'Horizon plutôt que de s'ajouter à côté
(voir `docs/integration-guide.md` pour savoir lesquels précisément et
pourquoi).

| Chemin | Ce que c'est |
|---|---|
| `sections/section-shop-the-look.liquid` | La nouvelle section pilotée par metaobject |
| `sections/product-hotspots.liquid` | La section native d'Horizon — CSS extrait dans un snippet partagé, nouveaux réglages de taille/couleur |
| `blocks/_hotspot-product.liquid` | Le bloc natif d'Horizon — devenu un wrapper fin autour du snippet partagé ci-dessous |
| `snippets/hotspot-styles.liquid` | CSS partagé pour les points et cartes popover des deux sections |
| `snippets/hotspot-product-content.liquid` | Markup partagé pour un point ("+" + carte produit) |
| `assets/product-hotspot.js` | Le `<product-hotspot-component>` natif d'Horizon — logique d'ouverture/fermeture au survol revue |
| `locales/*.json`, `locales/*.schema.json` | Traductions anglais + français (texte boutique et libellés d'éditeur) — additifs uniquement |
| `docs/integration-guide.md` | Configuration des metaobjects, installation, et comment tout s'assemble |
| `docs/gotchas.md` | Pièges techniques rencontrés en construisant ceci — subtilités admin des metaobjects, un piège de syntaxe Liquid, et deux bugs natifs d'Horizon |
| `reference/` | Captures d'écran |

## Démarrage rapide

1. Créer les définitions de metaobjects **Look** et **Look Hotspot**
   (champs exacts dans `docs/integration-guide.md`).
2. Copier `sections/`, `blocks/`, `snippets/` et `assets/` dans ton thème
   (certains remplacent des fichiers natifs d'Horizon — voir le guide), et
   fusionner les clés de traduction de `locales/` dans les tiennes.
3. Créer une entrée Look dans l'admin (photo + points), puis ajouter la
   section **Shop the Look** à un template et la sélectionner depuis
   l'éditeur de thème.

Voir `docs/integration-guide.md` pour le détail complet.

## Pourquoi celle-ci était plus difficile qu'il n'y paraît

C'est la première fonctionnalité de ce projet construite autour des
metaobjects Shopify, et la première qui étend délibérément un mécanisme
natif du thème plutôt que de construire en autonome. Le vrai temps est
parti dans des subtilités de l'admin metaobjects (le choix Liste/référence
unique d'un champ ne peut plus être changé une fois créé), un piège de
syntaxe Liquid spécifique aux tags multi-lignes dans les blocs
`{% liquid %}`, et deux bugs natifs d'Horizon découverts en cours de route
(un badge qui débordait dans la modale d'ajout rapide mobile, et une
condition de course sur les minuteurs de survol). Liste complète, avec le
raisonnement et le correctif pour chacun, dans `docs/gotchas.md`.

## Licence

MIT — voir `LICENSE`.

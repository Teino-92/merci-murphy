# Guide Resend — merci murphy®

Resend est le service d'envoi d'emails du site. Il gère deux types d'emails automatiques (newsletter bienvenue, création de compte) et peut être utilisé pour envoyer des campagnes manuelles à la liste d'abonnés.

---

## 1. Se connecter

👉 **[resend.com](https://resend.com)**

Identifiants partagés par Matteo/notions.

---

## 2. Ce qui est déjà en place

### Emails automatiques (envoyés par le site)

Ces emails partent automatiquement, sans aucune action de votre part.

| Déclencheur                 | Sujet                                           |
| --------------------------- | ----------------------------------------------- |
| Inscription à la newsletter | _Bienvenue dans la communauté merci murphy® 🐾_ |
| Création d'un compte client | _Bienvenue chez merci murphy®, [Prénom] 🐾_     |

### Adresse d'expédition

hello@mercimurphy.com
Pour changer l'adresse d'expédition, demander à Matteo.

---

## 3. Modifier le contenu des emails automatiques

Les templates sont des fichiers HTML dans le dossier :

```
src/lib/emails/
├── newsletter-welcome.ts   → email de bienvenue newsletter
└── account-welcome.ts      → email de bienvenue nouveau compte
```

Ce sont des fichiers texte simples. Pour modifier le contenu : demander à Matteo

---

## 4. Voir les emails envoyés (logs)

Dans Resend → **Emails** (menu de gauche) : liste de tous les emails envoyés, avec statut (delivered, bounced, etc.), date, destinataire et aperçu du contenu.

---

## 5. Envoyer une campagne newsletter manuelle

1. Aller dans **Broadcasts** dans le menu Resend
2. Cliquer **Create broadcast**
3. Choisir l'audience (ou coller les emails manuellement)
4. Écrire le contenu en texte rajouter des photos, etc...
5. Envoyer ou planifier

---

## 6. Gérer les désabonnements

La liste des abonnés est visible dans le **dashboard merci murphy®** → **Newsletter**.

- **Toggle actif/inactif** : cliquer sur le toggle dans la colonne "Abonnement" pour désabonner manuellement un·e abonné·e
- Les personnes désabonnées restent dans la liste avec le statut "Désabonné·e" (pour garder l'historique)
- Le filtre en haut de la page permet de voir uniquement les actifs ou les désabonnés

---

## 7. Domaine d'envoi

Le domaine `mercimurphy.com` est vérifié dans Resend → **Domains**. Si des emails arrivent en spam ou si le domaine expire, vérifier que les enregistrements DNS sont toujours valides dans Resend → Domains → mercimurphy.com → Status ✅.

---

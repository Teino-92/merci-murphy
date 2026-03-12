# Guide Resend — merci murphy®

Resend est le service d'envoi d'emails du site. Il gère deux types d'emails automatiques (newsletter bienvenue, création de compte) et peut être utilisé pour envoyer des campagnes manuelles à la liste d'abonnés.

---

## 1. Se connecter

👉 **[resend.com](https://resend.com)**

Identifiants partagés dans le coffre-fort de l'équipe (Notion / 1Password).

---

## 2. Ce qui est déjà en place

### Emails automatiques (envoyés par le site)

Ces emails partent automatiquement, sans aucune action de votre part.

| Déclencheur                 | Sujet                                           | Fichier source                         |
| --------------------------- | ----------------------------------------------- | -------------------------------------- |
| Inscription à la newsletter | _Bienvenue dans la communauté merci murphy® 🐾_ | `src/lib/emails/newsletter-welcome.ts` |
| Création d'un compte client | _Bienvenue chez merci murphy®, [Prénom] 🐾_     | `src/lib/emails/account-welcome.ts`    |

### Adresse d'expédition

Tous les emails sont envoyés depuis l'adresse configurée dans la variable `RESEND_NEWSLETTER_FROM` (sur Vercel). Pour changer l'adresse d'expédition, modifier cette variable dans **Vercel → Settings → Environment Variables**.

---

## 3. Modifier le contenu des emails automatiques

Les templates sont des fichiers HTML dans le dossier :

```
src/lib/emails/
├── newsletter-welcome.ts   → email de bienvenue newsletter
└── account-welcome.ts      → email de bienvenue nouveau compte
```

Ce sont des fichiers texte simples. Pour modifier le contenu :

1. Ouvrir le fichier dans l'éditeur de code (VS Code)
2. Chercher le texte à modifier entre les balises HTML (ex: `<p>`, `<h1>`)
3. Modifier le texte **en gardant les balises HTML intactes**
4. Sauvegarder et faire un commit → le site se met à jour automatiquement sur Vercel

**Exemple** — pour changer le texte d'introduction de la newsletter, dans `newsletter-welcome.ts`, chercher :

```
Merci de nous rejoindre. Vous serez parmi les premiers à recevoir...
```

et le remplacer par votre nouveau texte.

> ⚠️ Ne pas modifier les parties `style="..."` ni les balises `<table>`, `<tr>`, `<td>` — elles gèrent la mise en page.

---

## 4. Voir les emails envoyés (logs)

Dans Resend → **Emails** (menu de gauche) : liste de tous les emails envoyés, avec statut (delivered, bounced, etc.), date, destinataire et aperçu du contenu.

---

## 5. Envoyer une campagne newsletter manuelle

Resend n'est pas un outil de campagne en soi (pas d'éditeur drag-and-drop). Pour envoyer une newsletter à vos abonnés, deux options :

### Option A — Via Resend (technique)

1. Aller dans **Broadcasts** dans le menu Resend
2. Cliquer **Create broadcast**
3. Choisir l'audience (ou coller les emails manuellement)
4. Écrire le contenu en HTML ou texte
5. Envoyer ou planifier

### Option B — Exporter la liste et utiliser un autre outil

1. Aller dans le **dashboard merci murphy®** → **Newsletter**
2. Filtrer les abonnés actifs
3. Copier les emails ou demander à un développeur d'exporter la liste depuis Supabase
4. Importer dans **Brevo**, **Mailchimp** ou tout autre outil d'envoi avec éditeur visuel

> 💡 Si vous envoyez régulièrement des newsletters, nous recommandons de connecter **Brevo** (ex-Sendinblue) pour bénéficier d'un éditeur visuel — Resend reste pour les emails transactionnels automatiques.

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

## Résumé des liens utiles

|                                |                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Dashboard Resend               | [app.resend.com](https://app.resend.com)                                             |
| Logs emails                    | Resend → Emails                                                                      |
| Campagnes                      | Resend → Broadcasts                                                                  |
| Dashboard newsletter (abonnés) | [mercimurphy.com/dashboard/newsletter](https://mercimurphy.com/dashboard/newsletter) |
| Templates code                 | `src/lib/emails/` dans le repo GitHub                                                |

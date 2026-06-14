import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  fields: [
    defineField({
      name: 'adresse',
      title: 'Adresse',
      type: 'string',
    }),
    defineField({
      name: 'ville',
      title: 'Ville',
      type: 'string',
    }),
    defineField({
      name: 'codePostal',
      title: 'Code postal',
      type: 'string',
    }),
    defineField({
      name: 'telephone',
      title: 'Téléphone',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'horairesGroupes',
      title: "Horaires d'ouverture",
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'horaireGroupe',
          title: "Section d'horaires",
          fields: [
            defineField({
              name: 'titre',
              title: 'Titre de la section',
              type: 'string',
              description: 'Ex: Boutique et les bains, La crèche, Toilettage…',
            }),
            defineField({
              name: 'lignes',
              title: 'Lignes horaires',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'jour',
                      title: 'Jour(s)',
                      type: 'string',
                      description: 'Ex: Lundi, Mardi – Vendredi',
                    }),
                    defineField({
                      name: 'heures',
                      title: 'Heures',
                      type: 'string',
                      description: 'Ex: 10:30 – 19:30',
                    }),
                  ],
                  preview: { select: { title: 'jour', subtitle: 'heures' } },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'titre' },
          },
        },
      ],
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram (URL)',
      type: 'url',
    }),
    defineField({
      name: 'google_maps_url',
      title: 'Google Maps (URL)',
      type: 'url',
    }),
    defineField({
      name: 'promoBanner',
      title: 'Bandeau promo (haut de site)',
      type: 'object',
      description:
        'Affiche un bandeau défilant en haut de toutes les pages. Désactive-le quand aucune promo n’est active.',
      fields: [
        defineField({
          name: 'active',
          title: 'Activer le bandeau',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'startDate',
          title: 'Date de début (optionnel)',
          type: 'datetime',
          description:
            'Si renseignée, le bandeau et les remises produits ne s’affichent qu’à partir de cette date.',
        }),
        defineField({
          name: 'endDate',
          title: 'Date de fin (optionnel)',
          type: 'datetime',
          description:
            'Si renseignée, tout se désactive automatiquement après cette date. Sécurité au cas où on oublie.',
          validation: (Rule) =>
            Rule.custom((endDate, context) => {
              const start = (context.parent as { startDate?: string } | undefined)?.startDate
              if (!endDate || !start) return true
              return (
                new Date(endDate) > new Date(start) ||
                'La date de fin doit être après la date de début.'
              )
            }),
        }),
        defineField({
          name: 'message',
          title: 'Message',
          type: 'string',
          description:
            'Ex: -15% pour la fête des pères sur une sélection d’articles avec le tag « Fête des pères ».',
          validation: (Rule) => Rule.max(140),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Libellé du lien (optionnel)',
          type: 'string',
          description: 'Ex: Voir la sélection',
        }),
        defineField({
          name: 'ctaHref',
          title: 'URL du lien (optionnel)',
          type: 'string',
          description: 'Ex: /shop?tag=fete-des-peres',
        }),
        defineField({
          name: 'productTag',
          title: 'Tag produit concerné (optionnel)',
          type: 'string',
          description:
            'Tag exact défini dans Shopify (ex: Fête des pères). Les produits avec ce tag afficheront le badge ci-dessous.',
        }),
        defineField({
          name: 'badgeLabel',
          title: 'Libellé du badge produit (optionnel)',
          type: 'string',
          description: 'Ex: -15% Fête des pères. Apparait sur la fiche et la grille shop.',
          validation: (Rule) => Rule.max(40),
        }),
        defineField({
          name: 'discountPercent',
          title: 'Pourcentage de remise (optionnel)',
          type: 'number',
          description:
            'Doit correspondre à la remise Shopify (ex: 15 pour -15%). Affiche un prix barré sur la fiche et la grille des produits taggés.',
          validation: (Rule) => Rule.min(0).max(99),
        }),
        defineField({
          name: 'theme',
          title: 'Couleur',
          type: 'string',
          options: {
            list: [
              { title: 'Terracotta (défaut)', value: 'terracotta' },
              { title: 'Charcoal', value: 'charcoal' },
              { title: 'Rose poudré', value: 'rose' },
            ],
            layout: 'radio',
          },
          initialValue: 'terracotta',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'adresse' },
    prepare: () => ({ title: 'Paramètres du site' }),
  },
})

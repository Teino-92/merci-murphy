import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'ordre',
      title: "Ordre d'affichage",
      description:
        'Nombre entier — le SPA parent doit être 1, ses enfants 2, 3, 4, 5… Les autres services suivent.',
      type: 'number',
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Accroche courte',
      type: 'string',
      validation: (r) => r.required().max(160),
    }),
    defineField({
      name: 'image',
      title: 'Image principale',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'approche',
      title: 'Notre approche',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'deroule',
      title: 'Déroulé du rendez-vous',
      description: 'Optionnel — pour toilettage et crèche uniquement',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'tarifs',
      title: 'Tarifs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Prestation', type: 'string' }),
            defineField({ name: 'prix', title: 'Prix', type: 'string' }),
            defineField({ name: 'disclaimer', title: 'Précision', type: 'string' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'prix' },
          },
        },
      ],
    }),
    defineField({
      name: 'tarifsToilettage',
      title: 'Tarifs toilettage (tableau par gabarit)',
      description: 'Uniquement pour le service toilettage — remplace la liste de tarifs standard.',
      type: 'object',
      fields: [
        defineField({
          name: 'note',
          title: 'Note tarifaire',
          description: "Ex : Les tarifs varient en fonction du gabarit, de l'état du pelage…",
          type: 'string',
        }),
        defineField({
          name: 'surDevis',
          title: 'Mention « Sur devis »',
          description: 'Ex : Sur devis : protocole Spitz, Cocker, et tous les Doodles.',
          type: 'string',
        }),
        defineField({
          name: 'gabarits',
          title: 'Gabarits',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'gabarit',
              title: 'Gabarit',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Gabarit (ex : Très petits chiens < 5kg)',
                  type: 'string',
                }),
                defineField({
                  name: 'lignes',
                  title: 'Lignes de tarif',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      name: 'ligneTarif',
                      title: 'Ligne',
                      fields: [
                        defineField({
                          name: 'type',
                          title: 'Type de poil (ex : Poils ras ou courts)',
                          type: 'string',
                        }),
                        defineField({ name: 'bain', title: 'Bain', type: 'string' }),
                        defineField({ name: 'bainCoupe', title: 'Bain + Coupe', type: 'string' }),
                        defineField({
                          name: 'bainEpilation',
                          title: 'Bain + Épilation',
                          type: 'string',
                        }),
                      ],
                      preview: { select: { title: 'type', subtitle: 'bain' } },
                    },
                  ],
                }),
              ],
              preview: { select: { title: 'label' } },
            },
          ],
        }),
        defineField({
          name: 'patticure',
          title: 'Soin Patticure',
          description:
            'Bloc tarifaire indépendant affiché entre le tableau principal et les suppléments.',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'patticureLigne',
              title: 'Ligne Patticure',
              fields: [
                defineField({ name: 'label', title: 'Prestation', type: 'string' }),
                defineField({ name: 'prix', title: 'Prix (ex : 20€)', type: 'string' }),
              ],
              preview: { select: { title: 'label', subtitle: 'prix' } },
            },
          ],
        }),
        defineField({
          name: 'supplements',
          title: 'Suppléments & soins spécifiques',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'supplement',
              title: 'Supplément',
              fields: [
                defineField({ name: 'label', title: 'Prestation', type: 'string' }),
                defineField({ name: 'prix', title: 'Prix (ex : 20€ / 15min)', type: 'string' }),
              ],
              preview: { select: { title: 'label', subtitle: 'prix' } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({
              name: 'reponse',
              title: 'Réponse',
              type: 'array',
              of: [{ type: 'block' }],
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
    }),
    defineField({
      name: 'calendlyUrl',
      title: 'Lien Calendly',
      description:
        'URL de réservation Calendly pour ce service (laisser vide si pas encore disponible)',
      type: 'url',
    }),
    defineField({
      name: 'cta',
      title: "Appel à l'action",
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Texte du bouton', type: 'string' }),
        defineField({
          name: 'type',
          title: 'Action',
          type: 'string',
          options: {
            list: [
              { title: 'Réservation', value: 'reservation' },
              { title: 'Téléphone', value: 'telephone' },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
  },
})

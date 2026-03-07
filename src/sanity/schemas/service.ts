import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
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

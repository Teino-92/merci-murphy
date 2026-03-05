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
      name: 'horaires',
      title: 'Horaires',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'jour', title: 'Jour(s)', type: 'string' }),
            defineField({ name: 'heures', title: 'Heures', type: 'string' }),
          ],
          preview: {
            select: { title: 'jour', subtitle: 'heures' },
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
      name: 'calendly_url',
      title: 'Calendly (URL)',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'adresse' },
    prepare: () => ({ title: 'Paramètres du site' }),
  },
})

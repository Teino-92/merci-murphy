import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Article de blog',
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
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Conseils', value: 'Conseils' },
          { title: 'Bien-être', value: 'Bien-être' },
          { title: 'Produits', value: 'Produits' },
          { title: 'Éducation', value: 'Éducation' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extrait',
      description: '1–2 phrases, utilisé dans les cards et la meta description.',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Temps de lecture (minutes)',
      type: 'number',
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'category' },
  },
})

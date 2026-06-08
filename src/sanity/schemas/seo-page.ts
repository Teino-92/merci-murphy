import { defineField, defineType } from 'sanity'

export const seoPage = defineType({
  name: 'seoPage',
  title: 'Page SEO Race',
  type: 'document',
  fields: [
    defineField({
      name: 'race',
      title: 'Race',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slugRace',
      title: 'Slug race',
      type: 'string',
      description: "Slug court de la race (ex: 'golden-retriever')",
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre H1',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'string',
      validation: (r) => r.required().max(160),
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'approche',
      title: 'Notre approche',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'frequence',
      title: 'Fréquence recommandée',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'reponse',
              title: 'Réponse',
              type: 'array',
              of: [{ type: 'block' }],
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    }),
    defineField({
      name: 'typePoil',
      title: 'Type de poil',
      type: 'string',
      options: {
        list: ['ras', 'court', 'mi-long', 'long', 'bouclé', 'frisé', 'double', 'dur'],
      },
    }),
    defineField({
      name: 'gabarit',
      title: 'Gabarit',
      type: 'string',
      options: {
        list: ['très petit', 'petit', 'moyen', 'grand', 'très grand'],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'Brouillon', value: 'draft' },
          { title: 'Publié', value: 'published' },
          { title: 'Archivé', value: 'archived' },
        ],
      },
      initialValue: 'draft',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'seoScore',
      title: 'Score SEO (monitoring)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'googlePosition',
      title: 'Position Google (monitoring)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'lastChecked',
      title: 'Dernier contrôle',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'race', subtitle: 'status', pos: 'googlePosition' },
    prepare: ({ title, subtitle, pos }) => ({
      title: `🐕 ${title}`,
      subtitle: pos ? `${subtitle} — pos #${pos}` : subtitle,
    }),
  },
  orderings: [
    {
      title: 'Publication récente',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Position Google',
      name: 'googlePositionAsc',
      by: [{ field: 'googlePosition', direction: 'asc' }],
    },
  ],
})

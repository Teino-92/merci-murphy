import { defineArrayMember, defineField, defineType } from 'sanity'

export const POST_CATEGORIES = [
  'Conseils',
  'Bien-être',
  'Produits',
  'Éducation',
  'Races',
  'Vie à Paris',
] as const

export const POST_ANIMALS = ['chien', 'chat', 'les-deux'] as const

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
        defineField({
          name: 'creditName',
          title: 'Crédit photo (auteur)',
          description: 'Obligatoire pour les photos Unsplash.',
          type: 'string',
        }),
        defineField({
          name: 'creditUrl',
          title: 'Crédit photo (lien)',
          type: 'url',
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: { list: POST_CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'animal',
      title: 'Animal',
      type: 'string',
      options: {
        list: [
          { title: 'Chien', value: 'chien' },
          { title: 'Chat', value: 'chat' },
          { title: 'Les deux', value: 'les-deux' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'race',
      title: 'Race (slug)',
      description: 'Slug de la page /toilettage/[race] liée (articles « Vivre avec un… à Paris »).',
      type: 'string',
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
      name: 'metaTitle',
      title: 'Meta title',
      description: "Optionnel. Sinon le titre de l'article est utilisé.",
      type: 'string',
      validation: (r) => r.max(60),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      description: "Optionnel. Sinon l'extrait est utilisé.",
      type: 'string',
      validation: (r) => r.max(160),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraphe', value: 'normal' },
            { title: 'Titre H2', value: 'h2' },
            { title: 'Titre H3', value: 'h3' },
          ],
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Lien',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (r) =>
                      r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                  },
                ],
              },
            ],
          },
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'postFaqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Réponse',
              type: 'text',
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
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
    defineField({
      name: 'aiGenerated',
      title: 'Généré automatiquement',
      type: 'boolean',
      readOnly: true,
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Points bloquants (brouillon auto)',
      description: "Raisons pour lesquelles l'article n'a pas été publié automatiquement.",
      type: 'text',
      rows: 4,
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'category' },
  },
})

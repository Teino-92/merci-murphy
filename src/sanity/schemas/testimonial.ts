import { defineField, defineType } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Témoignage',
  type: 'document',
  fields: [
    defineField({
      name: 'auteur',
      title: 'Auteur',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'number',
      validation: (r) => r.required().min(1).max(5),
    }),
    defineField({
      name: 'texte',
      title: 'Témoignage',
      type: 'text',
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service concerné',
      type: 'reference',
      to: [{ type: 'service' }],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
  ],
  preview: {
    select: { title: 'auteur', subtitle: 'texte' },
  },
})

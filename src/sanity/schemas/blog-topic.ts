import { defineField, defineType } from 'sanity'
import { POST_CATEGORIES } from './post'

/**
 * File d'attente des sujets thématiques du blog (créneau du jeudi).
 * Le cron prend d'abord un sujet "à faire" dont le mois courant est dans `months`,
 * sinon le plus ancien sujet sans saison.
 */
export const blogTopic = defineType({
  name: 'blogTopic',
  title: 'Sujet de blog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Sujet (titre de travail)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'angle',
      title: 'Angle / brief',
      description: 'Ce que l’article doit couvrir, en 2–3 phrases.',
      type: 'text',
      rows: 3,
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: { list: POST_CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'months',
      title: 'Mois de publication (saison)',
      description: 'Vide = toute l’année. 1 = janvier … 12 = décembre.',
      type: 'array',
      of: [{ type: 'number' }],
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'À faire', value: 'todo' },
          { title: 'Brouillon à relire', value: 'draft' },
          { title: 'Publié', value: 'published' },
          { title: 'Ignoré', value: 'skipped' },
        ],
        layout: 'radio',
      },
      initialValue: 'todo',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'post',
      title: 'Article généré',
      type: 'reference',
      to: [{ type: 'post' }],
      weak: true,
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'title', status: 'status', animal: 'animal' },
    prepare: ({ title, status, animal }) => ({
      title,
      subtitle: `${status ?? 'todo'} · ${animal ?? ''}`,
    }),
  },
})

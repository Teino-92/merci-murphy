import { defineField, defineType } from 'sanity'

/**
 * Singleton — state global du pipeline SEO programmatique.
 * Permet aux cron jobs Vercel de tracker la queue et les timestamps.
 */
export const seoState = defineType({
  name: 'seoState',
  title: 'SEO Programmatique — State',
  type: 'document',
  fields: [
    defineField({
      name: 'queue',
      title: 'Queue races (priorité)',
      description: 'Liste ordonnée des slug_race à publier (FIFO)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'publishedRaces',
      title: 'Races déjà publiées',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'lastPublishedAt',
      title: 'Dernier publish réussi',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'lastRunAt',
      title: 'Dernière exécution cron',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'lastRunStatus',
      title: 'Statut dernier run',
      type: 'text',
      readOnly: true,
    }),
  ],
  preview: {
    select: { last: 'lastRunAt', pub: 'lastPublishedAt' },
    prepare: ({ last, pub }) => ({
      title: 'SEO State',
      subtitle: `Run: ${last ?? '—'} · Publish: ${pub ?? '—'}`,
    }),
  },
})

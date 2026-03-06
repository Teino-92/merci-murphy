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

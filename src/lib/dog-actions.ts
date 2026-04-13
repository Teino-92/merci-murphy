'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const DogSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis'),
  breed: z.string().optional(),
  age: z.string().optional(),
  poids: z.string().optional(),
  etat_poil: z.string().optional(),
  photo_url: z.string().optional(),
})

// ─── Add dog ──────────────────────────────────────────────────────────────────

export async function addDog(data: z.infer<typeof DogSchema>) {
  const parsed = DogSchema.safeParse(data)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const { error } = await supabase.from('dogs').insert({
    owner_id: user.id,
    name: parsed.data.name,
    breed: parsed.data.breed ?? null,
    age: parsed.data.age ?? null,
    poids: parsed.data.poids ?? null,
    etat_poil: parsed.data.etat_poil ?? null,
    photo_url: parsed.data.photo_url || null,
  })

  if (error) return { success: false, error: "Erreur lors de l'ajout." }

  revalidatePath('/compte')
  return { success: true }
}

// ─── Update dog ───────────────────────────────────────────────────────────────

export async function updateDog(dogId: string, data: z.infer<typeof DogSchema>) {
  const parsed = DogSchema.safeParse(data)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const { error } = await supabase
    .from('dogs')
    .update({
      name: parsed.data.name,
      breed: parsed.data.breed ?? null,
      age: parsed.data.age ?? null,
      poids: parsed.data.poids ?? null,
      etat_poil: parsed.data.etat_poil ?? null,
      photo_url: parsed.data.photo_url || null,
    })
    .eq('id', dogId)
    .eq('owner_id', user.id)

  if (error) return { success: false, error: 'Erreur lors de la mise à jour.' }

  revalidatePath('/compte')
  return { success: true }
}

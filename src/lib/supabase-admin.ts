import { createClient } from '@supabase/supabase-js'

// Service role client — server-side only, never expose to browser
// global.fetch is patched by Next.js; passing cache: 'no-store' prevents
// Vercel's Data Cache from serving stale responses across requests.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
  }
)

export interface Profile {
  id: string
  created_at: string
  nom: string
  telephone: string
  notes: string | null
  can_book: boolean
  admission_passed: boolean
  newsletter_subscribed: boolean
}

export interface Dog {
  id: string
  owner_id: string
  name: string
  breed: string | null
  age: string | null
  poids: string | null
  etat_poil: string | null
  photo_url: string | null
  grooming_duration: number | null
  numero_puce: string | null
  notes: string | null
}

export interface Visit {
  id: string
  created_at: string
  profile_id: string
  service: string
  date: string
  time: string | null
  duration: number | null
  notes: string | null
  staff: string | null
  price: number | null
  // payment flow: pending_deposit → (sumup pays) → confirmed
  status: 'confirmed' | 'pending_deposit' | 'cancelled'
  sumup_checkout_id: string | null
  deposit_paid_at: string | null
  deposit_amount: number | null
  visit_notes: string | null
}

export interface Lead {
  id: string
  created_at: string
  nom: string
  email: string
  telephone: string
  service: string
  nom_chien: string | null
  race_chien: string | null
  poids_chien: string | null
  etat_poil: string | null
  message: string | null
  source: string
  status: string
  user_id: string | null
}

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProfileWithVisits(
  id: string
): Promise<{ profile: Profile; visits: Visit[] } | null> {
  const [profileRes, visitsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('visits')
      .select('*')
      .eq('profile_id', id)
      .order('date', { ascending: false }),
  ])
  if (profileRes.error || !profileRes.data) return null
  return { profile: profileRes.data, visits: visitsRes.data ?? [] }
}

export async function getLeads(): Promise<(Lead & { has_account: boolean })[]> {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  const leads = data ?? []

  // Cross-reference emails against auth users
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const accountEmailsArr = (users?.users ?? []).map((u) => u.email)

  return leads.map((l) => ({ ...l, has_account: accountEmailsArr.includes(l.email) }))
}

export async function updateLeadStatus(id: string, status: string) {
  const { error } = await supabaseAdmin.from('leads').update({ status }).eq('id', id)
  if (error) throw error
}

export async function updateProfileNotes(id: string, notes: string) {
  const { error } = await supabaseAdmin.from('profiles').update({ notes }).eq('id', id)
  if (error) throw error
}

export async function addVisit(visit: Omit<Visit, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabaseAdmin.from('visits').insert(visit)
  if (error) throw error
}

export async function updateProfile(
  id: string,
  data: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabaseAdmin.from('profiles').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id)
  if (error) throw error
}

export async function deleteVisit(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('visits').delete().eq('id', id)
  if (error) throw error
}

export interface NewsletterSubscriber {
  id: string
  created_at: string
  email: string
  active: boolean
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function setNewsletterActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ active })
    .eq('id', id)
  if (error) throw error
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  // Search profiles by name or phone directly
  const { data: directMatches, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .or(`nom.ilike.%${query}%,telephone.ilike.%${query}%`)
    .order('nom', { ascending: true })
    .limit(10)
  if (error) throw error

  // Also search by dog name and collect matching owner_ids
  const { data: dogMatches } = await supabaseAdmin
    .from('dogs')
    .select('owner_id')
    .ilike('name', `%${query}%`)
    .limit(10)

  const dogOwnerIds = (dogMatches ?? []).map((d) => d.owner_id as string)
  const directIds = new Set((directMatches ?? []).map((p) => p.id))
  const missingOwnerIds = dogOwnerIds.filter((id) => !directIds.has(id))

  if (missingOwnerIds.length === 0) return directMatches ?? []

  const { data: dogOwnerProfiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('id', missingOwnerIds)

  return [...(directMatches ?? []), ...(dogOwnerProfiles ?? [])]
}

export interface CreateProfileInput {
  email: string
  nom: string
  telephone: string
  notes?: string | null
  // Dog data — written to dogs table only
  nom_chien: string
  race_chien?: string
  age_chien?: string
  poids_chien?: string
  etat_poil?: string
  grooming_duration?: number | null
}

export async function createProfileWithAuth(input: CreateProfileInput): Promise<Profile> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    email_confirm: false,
  })
  if (authError || !authData.user) {
    throw new Error(authError?.message ?? 'Erreur création compte')
  }

  const userId = authData.user.id

  const { data, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      nom: input.nom,
      telephone: input.telephone,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    throw new Error(profileError.message)
  }

  const { error: dogError } = await supabaseAdmin.from('dogs').insert({
    owner_id: userId,
    name: input.nom_chien,
    breed: input.race_chien ?? null,
    age: input.age_chien ?? null,
    poids: input.poids_chien ?? null,
    etat_poil: input.etat_poil ?? null,
    grooming_duration: input.grooming_duration ?? null,
  })

  if (dogError) {
    await supabaseAdmin.from('profiles').delete().eq('id', userId)
    await supabaseAdmin.auth.admin.deleteUser(userId)
    throw new Error(dogError.message)
  }

  return data
}

// --- Staff ---

export interface Staff {
  id: string
  name: string
  role: string
  color: string
  active: boolean
}

export interface Availability {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface TimeOff {
  id: string
  staff_id: string
  date: string
  note: string | null
}

export async function getStaff(): Promise<Staff[]> {
  const { data } = await supabaseAdmin.from('staff').select('*').order('name')
  return (data ?? []) as Staff[]
}

export async function createStaff(name: string, role: string, color: string): Promise<Staff> {
  const { data, error } = await supabaseAdmin
    .from('staff')
    .insert({ name, role, color })
    .select()
    .single()
  if (error) throw error
  return data as Staff
}

export async function updateStaff(
  id: string,
  updates: Partial<Pick<Staff, 'name' | 'role' | 'color' | 'active'>>
): Promise<void> {
  const { error } = await supabaseAdmin.from('staff').update(updates).eq('id', id)
  if (error) throw error
}

// --- Availabilities ---

export async function getAvailabilities(staffId: string): Promise<Availability[]> {
  const { data } = await supabaseAdmin
    .from('availabilities')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week')
  return (data ?? []) as Availability[]
}

export async function upsertAvailability(
  staffId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
): Promise<void> {
  const { error } = await supabaseAdmin.from('availabilities').upsert(
    {
      staff_id: staffId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    },
    { onConflict: 'staff_id,day_of_week' }
  )
  if (error) throw error
}

export async function deleteAvailability(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('availabilities').delete().eq('id', id)
  if (error) throw error
}

// --- Time Off ---

export async function getTimeOff(staffId: string, from: string, to: string): Promise<TimeOff[]> {
  const { data } = await supabaseAdmin
    .from('time_off')
    .select('*')
    .eq('staff_id', staffId)
    .gte('date', from)
    .lte('date', to)
    .order('date')
  return (data ?? []) as TimeOff[]
}

export async function addTimeOff(staffId: string, date: string, note?: string): Promise<TimeOff> {
  const { data, error } = await supabaseAdmin
    .from('time_off')
    .insert({ staff_id: staffId, date, note: note ?? null })
    .select()
    .single()
  if (error) throw error
  return data as TimeOff
}

export async function deleteTimeOff(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('time_off').delete().eq('id', id)
  if (error) throw error
}

// --- Visits for staff ---

export async function getVisitsForStaff(
  staffName: string,
  from: string,
  to: string
): Promise<{ date: string; time: string | null; duration: number | null }[]> {
  const { data } = await supabaseAdmin
    .from('visits')
    .select('date, time, duration')
    .eq('staff', staffName)
    .gte('date', from)
    .lte('date', to)
    .in('status', ['confirmed', 'pending_deposit', 'new'])
  return (data ?? []) as { date: string; time: string | null; duration: number | null }[]
}

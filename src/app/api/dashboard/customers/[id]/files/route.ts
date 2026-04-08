// src/app/api/dashboard/customers/[id]/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BUCKET = 'client-files'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(params.id, {
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Generate signed URLs (valid 1h)
  const files = await Promise.all(
    (data ?? []).map(async (file) => {
      const path = `${params.id}/${file.name}`
      const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 3600)
      return {
        name: file.name,
        path,
        url: signed?.signedUrl ?? null,
        createdAt: file.created_at,
      }
    })
  )

  return NextResponse.json(files)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `${params.id}/${safeName}`

  const bytes = await file.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type || `application/${ext}`, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 3600)

  return NextResponse.json({ name: safeName, path, url: signed?.signedUrl ?? null })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  const path = `${params.id}/${name}`
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

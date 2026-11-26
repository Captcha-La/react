'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { captchala } from './captchala'

export async function signup(formData: FormData) {
  const token = String(formData.get('captchala_token') ?? '')
  if (!token) redirect('/?result=missing')

  const h = await headers()
  const clientIp = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined

  const result = await captchala.validate(token, { clientIp, expectedAction: 'signup' })
  if (!result.valid) redirect(`/?result=failed&error=${encodeURIComponent(result.error ?? '')}`)

  // Verification passed: create the account here.
  redirect('/?result=ok')
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    const { data: configs } = await supabase
      .from('module_configs')
      .select('classroom_id, settings_json')
      .eq('module_name', 'investment')
      .eq('is_enabled', true)

    if (!configs || configs.length === 0) {
      return res.json({ message: 'No classrooms with investment module', processed: 0 })
    }

    const currentHour = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false }).format(new Date()),
    )
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date())

    let processed = 0

    for (const config of configs) {
      const settings = config.settings_json as Record<string, unknown> | null
      if (!settings) continue

      const autoCloseEnabled = settings.autoCloseEnabled === true
      const autoCloseHour = typeof settings.autoCloseHour === 'number' ? settings.autoCloseHour : null
      if (!autoCloseEnabled || autoCloseHour === null) continue
      if (currentHour < autoCloseHour) continue

      const lastClosedAt = (settings.lastAutoClosedAt as string) ?? null
      if (lastClosedAt && lastClosedAt >= todayStr) continue

      const { data: stocks } = await supabase
        .from('stocks')
        .select('id, current_price')
        .eq('classroom_id', config.classroom_id)
        .eq('is_active', true)

      if (stocks && stocks.length > 0) {
        await Promise.all(
          stocks.map((s) =>
            supabase.from('stocks').update({ previous_price: s.current_price }).eq('id', s.id),
          ),
        )
      }

      const merged = { ...settings, lastAutoClosedAt: todayStr }
      await supabase
        .from('module_configs')
        .upsert(
          { classroom_id: config.classroom_id, module_name: 'investment', settings_json: merged, updated_at: new Date().toISOString() },
          { onConflict: 'classroom_id,module_name' },
        )

      processed++
    }

    return res.json({ ok: true, processed, date: todayStr, hour: currentHour })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('close-market cron error:', message)
    return res.status(500).json({ error: message })
  }
}

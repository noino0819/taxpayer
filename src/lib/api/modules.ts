import { supabase } from '@/lib/supabase'
import type { ModuleConfig, ModuleName } from '@/types/database'

export async function getModuleConfigs(classroomId: string): Promise<ModuleConfig[]> {
  const { data, error } = await supabase
    .from('module_configs')
    .select('*')
    .eq('classroom_id', classroomId)
  if (error) throw error
  return data as ModuleConfig[]
}

export async function toggleModule(classroomId: string, moduleName: ModuleName, enabled: boolean, userId: string): Promise<void> {
  await supabase
    .from('module_configs')
    .upsert(
      { classroom_id: classroomId, module_name: moduleName, is_enabled: enabled, updated_at: new Date().toISOString() },
      { onConflict: 'classroom_id,module_name' },
    )

  await supabase.from('module_change_logs').insert({
    classroom_id: classroomId,
    module_name: moduleName,
    action: enabled ? 'on' : 'off',
    changed_by: userId,
  })
}

export async function batchSetModules(classroomId: string, modules: Record<ModuleName, boolean>, userId: string): Promise<void> {
  const configs = Object.entries(modules).map(([name, enabled]) => ({
    classroom_id: classroomId,
    module_name: name,
    is_enabled: enabled,
    updated_at: new Date().toISOString(),
  }))

  await supabase
    .from('module_configs')
    .upsert(configs, { onConflict: 'classroom_id,module_name' })

  const logs = Object.entries(modules).map(([name, enabled]) => ({
    classroom_id: classroomId,
    module_name: name,
    action: enabled ? 'on' : 'off',
    changed_by: userId,
  }))
  await supabase.from('module_change_logs').insert(logs)
}

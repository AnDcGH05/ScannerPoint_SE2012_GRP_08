export const STAGES = ['INSPECTION', 'DIAGNOSIS', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'QUALITY_CHECK', 'READY']

export const STAGE_LABELS = {
  INSPECTION: 'Inspection', DIAGNOSIS: 'Diagnosis', AWAITING_APPROVAL: 'Awaiting Approval',
  IN_PROGRESS: 'Repair In Progress', QUALITY_CHECK: 'Quality Check', READY: 'Ready', COLLECTED: 'Collected',
}

export const STAGE_ICONS = {
  INSPECTION: 'search', DIAGNOSIS: 'troubleshoot', AWAITING_APPROVAL: 'hourglass_top',
  IN_PROGRESS: 'build', QUALITY_CHECK: 'fact_check', READY: 'task_alt', COLLECTED: 'key',
}

/** "1 h 45 m in stage" */
export function inStage(hours) {
  if (hours < 1) return 'under 1 h in stage'
  if (hours < 24) return `${hours} h in stage`
  return `${Math.floor(hours / 24)} d ${hours % 24} h in stage`
}

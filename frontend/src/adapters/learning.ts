export type StudentId = 'A' | 'B'
export type EvidenceTag = 'concept_overfit' | 'evidence_gap' | 'action_plan'
export type EvidenceRecord = { id:string; student:StudentId; answer:string; feedback:string; diagnosis:string; tags:EvidenceTag[]; hits:string[]; source:'current_local_session'; mode:'rule_baseline'; createdAt:string }
const KEY='mindtrace-demo-evidence-v1'
export const MAX_ANSWER_LENGTH=2000
export const prompt='猫狗分类模型训练准确率 99%，验证准确率 78%。你认为发生了什么？如何确认并改进？'
const RULES:{ tag:EvidenceTag; pattern:RegExp }[]=[
  { tag:'concept_overfit', pattern:/过拟合|overfit/i },
  { tag:'evidence_gap', pattern:/训练|验证|数据|泛化|差距|99|78/ },
  { tag:'action_plan', pattern:/增强|正则|早停|交叉验证|更多数据|简化|dropout|检查/ },
]
export function classify(text:string):{ tags:EvidenceTag[]; hits:string[] } {
  const tags:EvidenceTag[]=[]; const hits:string[]=[]
  for(const rule of RULES){ const matched=text.match(rule.pattern); if(matched){ tags.push(rule.tag); hits.push(matched[0]) } }
  return { tags, hits }
}
export function analyse(student:StudentId, answer:string):EvidenceRecord {
  const text=answer.trim(); if(!text) throw new Error('请先填写回答')
  if(text.length>MAX_ANSWER_LENGTH) throw new Error(`回答过长，请控制在 ${MAX_ANSWER_LENGTH} 字以内`)
  const { tags, hits }=classify(text)
  const overfit=tags.includes('concept_overfit')
  const evidence=tags.includes('evidence_gap')
  const action=tags.includes('action_plan')
  const diagnosis=overfit ? '已识别过拟合概念' : evidence ? '已注意到训练与验证的差距' : '尚未指出训练与验证差距'
  const feedback=overfit && action ? '你指出了过拟合并提出改进方向。下一步请说明如何用独立验证集比较干预前后表现。' : overfit ? '你识别了过拟合。请再提出至少一项可检验的干预，并说明验证方式。' : evidence ? '你观察到了表现差异。试着用“过拟合”和“泛化”解释这两个数字，再提出验证办法。' : '先比较训练 99% 与验证 78%：模型在未见数据上表现如何？请说明可能原因。'
  return {id:crypto.randomUUID(),student,answer:text,feedback,diagnosis,tags,hits,source:'current_local_session',mode:'rule_baseline',createdAt:new Date().toISOString()}
}
export function getEvidence():EvidenceRecord[] {try{return JSON.parse(localStorage.getItem(KEY)??'[]') as EvidenceRecord[]}catch{return []}}
export function saveEvidence(record:EvidenceRecord) {localStorage.setItem(KEY,JSON.stringify([record,...getEvidence()].slice(0,100)))}
export function clearEvidence(){localStorage.removeItem(KEY)}

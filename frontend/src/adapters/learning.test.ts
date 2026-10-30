import {expect,it} from 'vitest'
import {analyse,classify,MAX_ANSWER_LENGTH} from './learning'
it('gives distinct, sourced feedback for distinct answers',()=>{const a=analyse('A','这是过拟合，我会正则化并检查验证集');const b=analyse('B','训练和验证结果不同');expect(a.feedback).not.toBe(b.feedback);expect(a.source).toBe('current_local_session');expect(b.mode).toBe('rule_baseline')})
it('rejects empty evidence',()=>{expect(()=>analyse('A',' ')).toThrow('请先填写回答')})
it('exposes traceable tags and hits for each answer',()=>{const record=analyse('A','这是过拟合，我会正则化并检查验证集');expect(record.tags).toEqual(['concept_overfit','evidence_gap','action_plan']);expect(record.hits.length).toBe(record.tags.length);expect(classify('我不知道').tags).toEqual([])})
it('rejects overlong answers',()=>{expect(()=>analyse('A','很'.repeat(MAX_ANSWER_LENGTH+1))).toThrow('回答过长')})

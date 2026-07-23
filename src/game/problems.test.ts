import { describe, it, expect } from 'vitest'
import { generateProblems, TOTAL_QUESTIONS, padMaxForOp } from './problems'
import { ITEMS, WORD_TEMPLATES } from './wordTemplates'

const edibleNames = new Set(ITEMS.filter((i) => i.edible).map((i) => i.name))

describe('generateProblems', () => {
  it('足し算: 20問・重複なし・a,b 1〜9・答え 2〜18', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('addition')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      for (const p of ps) {
        expect(p.op).toBe('addition')
        expect(padMaxForOp(p.op)).toBe(18)
        if (p.display.type === 'equation') {
          expect(p.display.a).toBeGreaterThanOrEqual(1)
          expect(p.display.a).toBeLessThanOrEqual(9)
          expect(p.display.b).toBeGreaterThanOrEqual(1)
          expect(p.display.b).toBeLessThanOrEqual(9)
          expect(p.answer).toBe(p.display.a + p.display.b)
        }
        expect(p.answer).toBeGreaterThanOrEqual(2)
        expect(p.answer).toBeLessThanOrEqual(18)
      }
    }
  })

  it('引き算: 20問・重複なし・答え 0〜9・a≧b', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('subtraction')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      for (const p of ps) {
        expect(p.op).toBe('subtraction')
        expect(padMaxForOp(p.op)).toBe(9)
        if (p.display.type === 'equation') {
          expect(p.display.a).toBeGreaterThanOrEqual(p.display.b)
          expect(p.answer).toBe(p.display.a - p.display.b)
        }
        expect(p.answer).toBeGreaterThanOrEqual(0)
        expect(p.answer).toBeLessThanOrEqual(9)
      }
    }
  })

  it('文章題: 20問・足し算系10/引き算系10・重複なし・プレースホルダ残なし', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('word-problem')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      expect(ps.filter((p) => p.op === 'addition')).toHaveLength(10)
      expect(ps.filter((p) => p.op === 'subtraction')).toHaveLength(10)
      for (const p of ps) {
        expect(p.display.type).toBe('text')
        if (p.display.type === 'text') {
          // 差し込み後にプレースホルダが残っていない
          expect(p.display.text).not.toMatch(/\{(item|a|b|c)\}/)
        }
      }
    }
  })

  it('文章題: requiresEdible なテンプレートは食べられる題材のみ', () => {
    // requiresEdible テンプレートに対応する非食べ物の題材名を検出しないことを確認。
    const edibleTemplateIds = new Set(WORD_TEMPLATES.filter((t) => t.requiresEdible).map((t) => t.id))
    for (let t = 0; t < 100; t++) {
      const ps = generateProblems('word-problem')
      for (const p of ps) {
        if (p.display.type !== 'text') continue
        const tplId = p.key.split(':')[0]
        if (!edibleTemplateIds.has(tplId)) continue
        // このテンプレートの文には食べられる題材名のいずれかが含まれるはず。
        const hasEdible = [...edibleNames].some((n) => p.display.type === 'text' && p.display.text.includes(n))
        expect(hasEdible).toBe(true)
      }
    }
  })

  it('テンプレートは足し算50・引き算50', () => {
    expect(WORD_TEMPLATES.filter((t) => t.op === 'addition')).toHaveLength(50)
    expect(WORD_TEMPLATES.filter((t) => t.op === 'subtraction')).toHaveLength(50)
    expect(new Set(WORD_TEMPLATES.map((t) => t.id)).size).toBe(100)
  })
})

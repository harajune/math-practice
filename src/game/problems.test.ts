import { describe, it, expect } from 'vitest'
import { generateProblems, TOTAL_QUESTIONS, padMaxForOp } from './problems'
import { ITEMS, WORD_TEMPLATES } from './wordTemplates'

describe('generateProblems', () => {
  it('足し算(9までのかず): 20問・重複なし・a,b 1〜9・答え 2〜18', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('addition', 'single-digit')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      for (const p of ps) {
        expect(p.op).toBe('addition')
        expect(padMaxForOp(p.op, 'single-digit')).toBe(18)
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

  it('引き算(9までのかず): 20問・重複なし・答え 0〜9・a≧b', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('subtraction', 'single-digit')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      for (const p of ps) {
        expect(p.op).toBe('subtraction')
        expect(padMaxForOp(p.op, 'single-digit')).toBe(9)
        if (p.display.type === 'equation') {
          expect(p.display.a).toBeGreaterThanOrEqual(p.display.b)
          expect(p.answer).toBe(p.display.a - p.display.b)
        }
        expect(p.answer).toBeGreaterThanOrEqual(0)
        expect(p.answer).toBeLessThanOrEqual(9)
      }
    }
  })

  it('文章題(9までのかず): 20問・足し算系10/引き算系10・重複なし・プレースホルダ残なし', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('word-problem', 'single-digit')
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
        // 「0こ たべました」のような不自然な文を避けるため b は 1 以上(key は `id:a:b`)。
        const b = Number(p.key.split(':')[2])
        expect(b).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('文章題: requires ありのテンプレートには条件を満たす題材のみ差し込まれる', () => {
    const templateById = new Map(WORD_TEMPLATES.map((t) => [t.id, t]))
    for (let t = 0; t < 100; t++) {
      const ps = generateProblems('word-problem', 'single-digit')
      for (const p of ps) {
        if (p.display.type !== 'text') continue
        const tpl = templateById.get(p.key.split(':')[0])
        if (!tpl?.requires?.length) continue
        // このテンプレートの文には要求タグをすべて満たす題材名のいずれかが含まれるはず。
        const validNames = ITEMS.filter((i) => tpl.requires!.every((tag) => i.tags.includes(tag))).map((i) => i.name)
        const text = p.display.text
        expect(validNames.some((n) => text.includes(n))).toBe(true)
      }
    }
  })

  it('すべてのテンプレートに差し込める題材が1つ以上ある', () => {
    for (const tpl of WORD_TEMPLATES) {
      const required = tpl.requires ?? []
      const candidates = ITEMS.filter((i) => required.every((tag) => i.tags.includes(tag)))
      expect(candidates.length, tpl.id).toBeGreaterThan(0)
    }
  })

  it('テンプレートは足し算50・引き算50', () => {
    expect(WORD_TEMPLATES.filter((t) => t.op === 'addition')).toHaveLength(50)
    expect(WORD_TEMPLATES.filter((t) => t.op === 'subtraction')).toHaveLength(50)
    expect(new Set(WORD_TEMPLATES.map((t) => t.id)).size).toBe(100)
  })

  it('回答選択肢: 4つ・重複なし・正解を含む', () => {
    for (const mode of ['addition', 'subtraction', 'word-problem'] as const) {
      for (const level of ['single-digit', 'up-to-19'] as const) {
        for (let t = 0; t < 50; t++) {
          const ps = generateProblems(mode, level)
          for (const p of ps) {
            expect(p.choices).toHaveLength(4)
            expect(new Set(p.choices).size).toBe(4)
            expect(p.choices).toContain(p.answer)
          }
        }
      }
    }
  })

  it('足し算(19までのかず): 20問・重複なし・答え 2〜19・二桁の数を含みうる', () => {
    let sawTwoDigitOperand = false
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('addition', 'up-to-19')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      for (const p of ps) {
        expect(p.op).toBe('addition')
        expect(padMaxForOp(p.op, 'up-to-19')).toBe(19)
        if (p.display.type === 'equation') {
          expect(p.display.a).toBeGreaterThanOrEqual(1)
          expect(p.display.a).toBeLessThanOrEqual(18)
          expect(p.display.b).toBeGreaterThanOrEqual(1)
          expect(p.answer).toBe(p.display.a + p.display.b)
          if (p.display.a >= 10 || p.display.b >= 10) sawTwoDigitOperand = true
        }
        expect(p.answer).toBeGreaterThanOrEqual(2)
        expect(p.answer).toBeLessThanOrEqual(19)
      }
    }
    // 十分な試行回数の中で、二桁の数(10〜18)を含む問題が出題される。
    expect(sawTwoDigitOperand).toBe(true)
  })

  it('引き算(19までのかず): 20問・重複なし・答え 0〜19・a≧b・繰り下がりを含みうる', () => {
    let sawBorrowing = false
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('subtraction', 'up-to-19')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      for (const p of ps) {
        expect(p.op).toBe('subtraction')
        expect(padMaxForOp(p.op, 'up-to-19')).toBe(19)
        if (p.display.type === 'equation') {
          expect(p.display.a).toBeGreaterThanOrEqual(p.display.b)
          expect(p.display.a).toBeLessThanOrEqual(19)
          expect(p.answer).toBe(p.display.a - p.display.b)
          // 一の位の繰り下がり(例: 15-8)が発生しているかどうか
          if (p.display.a % 10 < p.display.b % 10) sawBorrowing = true
        }
        expect(p.answer).toBeGreaterThanOrEqual(0)
        expect(p.answer).toBeLessThanOrEqual(19)
      }
    }
    expect(sawBorrowing).toBe(true)
  })

  it('文章題(19までのかず): 20問・足し算系10/引き算系10・重複なし・プレースホルダ残なし', () => {
    for (let t = 0; t < 50; t++) {
      const ps = generateProblems('word-problem', 'up-to-19')
      expect(ps).toHaveLength(TOTAL_QUESTIONS)
      expect(new Set(ps.map((p) => p.key)).size).toBe(TOTAL_QUESTIONS)
      expect(ps.filter((p) => p.op === 'addition')).toHaveLength(10)
      expect(ps.filter((p) => p.op === 'subtraction')).toHaveLength(10)
      for (const p of ps) {
        expect(p.display.type).toBe('text')
        if (p.display.type === 'text') {
          expect(p.display.text).not.toMatch(/\{(item|a|b|c)\}/)
        }
        const b = Number(p.key.split(':')[2])
        expect(b).toBeGreaterThanOrEqual(1)
        expect(p.answer).toBeGreaterThanOrEqual(0)
        expect(p.answer).toBeLessThanOrEqual(19)
      }
    }
  })
})

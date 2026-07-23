import type { Mode, Op, Problem } from '../types'
import { randInt, pick, shuffle } from './rng'
import { ITEMS, WORD_TEMPLATES, type WordTemplate } from './wordTemplates'

export const TOTAL_QUESTIONS = 20

export const CHOICE_COUNT = 4

// 数字パッドに表示する範囲。仕様4:
// 足し算(答え 2〜18)は 0〜18、引き算(答え 0〜9)は 0〜9。
export function padMaxForOp(op: Op): number {
  return op === 'addition' ? 18 : 9
}

// 正解を含む回答選択肢を生成する。0〜max の範囲から正解以外を重複なく選び、
// 正解と合わせてシャッフルする。
function generateChoices(answer: number, max: number, count: number): number[] {
  const pool: number[] = []
  for (let n = 0; n <= max; n++) {
    if (n !== answer) pool.push(n)
  }
  const wrongs = shuffle(pool).slice(0, count - 1)
  return shuffle([answer, ...wrongs])
}

// --- 単純計算の数値生成(仕様3.1 / 3.2) ---

// 足し算: a,b は 1〜9。答え 2〜18。
function makeAdditionNumbers(): { a: number; b: number } {
  return { a: randInt(1, 9), b: randInt(1, 9) }
}

// 引き算: a は 1〜9、b は 0〜a。答え 0〜9(常に0以上)。
function makeSubtractionNumbers(): { a: number; b: number } {
  const a = randInt(1, 9)
  const b = randInt(0, a)
  return { a, b }
}

// 文章題の引き算: 「0こ たべました」のような不自然な文を避けるため b は 1〜a。
function makeWordSubtractionNumbers(): { a: number; b: number } {
  const a = randInt(1, 9)
  const b = randInt(1, a)
  return { a, b }
}

// --- 単純計算モードの出題生成 ---

function generateEquationProblems(op: Op): Problem[] {
  const problems: Problem[] = []
  const seen = new Set<string>()
  // 一桁計算の組み合わせは十分多いので、重複を引いたら引き直す。
  while (problems.length < TOTAL_QUESTIONS) {
    const { a, b } = op === 'addition' ? makeAdditionNumbers() : makeSubtractionNumbers()
    const operator = op === 'addition' ? '+' : '-'
    const key = `${a}${operator}${b}`
    if (seen.has(key)) continue
    seen.add(key)
    const answer = op === 'addition' ? a + b : a - b
    problems.push({
      key,
      op,
      display: { type: 'equation', a, b, operator },
      answer,
      choices: generateChoices(answer, padMaxForOp(op), CHOICE_COUNT),
    })
  }
  return problems
}

// --- 文章題モードの出題生成(仕様3.3) ---

// テンプレートに数値・題材を差し込んで文を作る。
function fillTemplate(tpl: WordTemplate, item: { name: string; counter: string }, a: number, b: number): string {
  return tpl.text
    .replaceAll('{item}', item.name)
    .replaceAll('{a}', String(a))
    .replaceAll('{b}', String(b))
    .replaceAll('{c}', item.counter)
}

// op に対応するテンプレート一覧から、まだ使っていないものを引く。
function generateWordProblemsForOp(op: Op, count: number, usedTemplateKeys: Set<string>): Problem[] {
  const templates = WORD_TEMPLATES.filter((t) => t.op === op)
  const problems: Problem[] = []
  let guard = 0
  while (problems.length < count && guard < 10000) {
    guard++
    const tpl = pick(templates)
    const { a, b } = op === 'addition' ? makeAdditionNumbers() : makeWordSubtractionNumbers()
    // 仕様3.4: 同一の「テンプレート×数値の組」は出さない。
    const key = `${tpl.id}:${a}:${b}`
    if (usedTemplateKeys.has(key)) continue
    usedTemplateKeys.add(key)

    const required = tpl.requires ?? []
    const candidateItems = ITEMS.filter((i) => required.every((tag) => i.tags.includes(tag)))
    const item = pick(candidateItems)
    const answer = op === 'addition' ? a + b : a - b

    problems.push({
      key,
      op,
      display: { type: 'text', text: fillTemplate(tpl, item, a, b) },
      answer,
      choices: generateChoices(answer, padMaxForOp(op), CHOICE_COUNT),
    })
  }
  return problems
}

function generateWordProblems(): Problem[] {
  const used = new Set<string>()
  // 仕様3.3: 足し算系・引き算系を各10問、混合してランダム順で出題。
  const half = TOTAL_QUESTIONS / 2
  const add = generateWordProblemsForOp('addition', half, used)
  const sub = generateWordProblemsForOp('subtraction', half, used)
  return shuffle([...add, ...sub])
}

// モードに応じた20問を生成する(仕様3.4: 20問生成してからセッション開始)。
export function generateProblems(mode: Mode): Problem[] {
  switch (mode) {
    case 'addition':
      return generateEquationProblems('addition')
    case 'subtraction':
      return generateEquationProblems('subtraction')
    case 'word-problem':
      return generateWordProblems()
  }
}

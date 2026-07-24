import type { Level, Mode, Op, Problem } from '../types'
import { randInt, pick, shuffle } from './rng'
import { ITEMS, WORD_TEMPLATES, type WordTemplate } from './wordTemplates'

export const TOTAL_QUESTIONS = 20

export const CHOICE_COUNT = 4

// 数字パッドに表示する範囲。仕様4:
// single-digit: 足し算(答え 2〜18)は 0〜18、引き算(答え 0〜9)は 0〜9。
// up-to-19: 足し算・引き算ともに答えが 0〜19 に収まるため 0〜19。
export function padMaxForOp(op: Op, level: Level): number {
  if (level === 'up-to-19') return 19
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

// --- 単純計算の数値生成(仕様3.1 / 3.2 / 3.5) ---

// 足し算(single-digit): a,b は 1〜9。答え 2〜18(繰り上がりを含む)。
// 足し算(up-to-19): a+b が 19 以下になるよう生成。二桁の数(10〜18)を
// 片方の数に含めつつ、一桁同士の繰り上がり(例: 8+7)も引き続き出題される。
function makeAdditionNumbers(level: Level): { a: number; b: number } {
  if (level === 'up-to-19') {
    const a = randInt(1, 18)
    const b = randInt(1, 19 - a)
    return { a, b }
  }
  return { a: randInt(1, 9), b: randInt(1, 9) }
}

// 引き算(single-digit): a は 1〜9、b は 0〜a。答え 0〜9(常に0以上)。
// 引き算(up-to-19): a は 1〜19、b は 0〜a。答え 0〜19(繰り下がりを含む、例: 15-8)。
function makeSubtractionNumbers(level: Level): { a: number; b: number } {
  const a = level === 'up-to-19' ? randInt(1, 19) : randInt(1, 9)
  const b = randInt(0, a)
  return { a, b }
}

// 文章題の引き算: 「0こ たべました」のような不自然な文を避けるため b は 1〜a。
function makeWordSubtractionNumbers(level: Level): { a: number; b: number } {
  const a = level === 'up-to-19' ? randInt(1, 19) : randInt(1, 9)
  const b = randInt(1, a)
  return { a, b }
}

// --- 単純計算モードの出題生成 ---

function generateEquationProblems(op: Op, level: Level): Problem[] {
  const problems: Problem[] = []
  const seen = new Set<string>()
  // 出題の組み合わせは十分多いので、重複を引いたら引き直す。
  while (problems.length < TOTAL_QUESTIONS) {
    const { a, b } = op === 'addition' ? makeAdditionNumbers(level) : makeSubtractionNumbers(level)
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
      choices: generateChoices(answer, padMaxForOp(op, level), CHOICE_COUNT),
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
function generateWordProblemsForOp(
  op: Op,
  count: number,
  usedTemplateKeys: Set<string>,
  level: Level,
): Problem[] {
  const templates = WORD_TEMPLATES.filter((t) => t.op === op)
  const problems: Problem[] = []
  let guard = 0
  while (problems.length < count && guard < 10000) {
    guard++
    const tpl = pick(templates)
    const { a, b } = op === 'addition' ? makeAdditionNumbers(level) : makeWordSubtractionNumbers(level)
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
      choices: generateChoices(answer, padMaxForOp(op, level), CHOICE_COUNT),
    })
  }
  return problems
}

function generateWordProblems(level: Level): Problem[] {
  const used = new Set<string>()
  // 仕様3.3: 足し算系・引き算系を各10問、混合してランダム順で出題。
  const half = TOTAL_QUESTIONS / 2
  const add = generateWordProblemsForOp('addition', half, used, level)
  const sub = generateWordProblemsForOp('subtraction', half, used, level)
  return shuffle([...add, ...sub])
}

// モード・レベルに応じた20問を生成する(仕様3.4: 20問生成してからセッション開始)。
export function generateProblems(mode: Mode, level: Level): Problem[] {
  switch (mode) {
    case 'addition':
      return generateEquationProblems('addition', level)
    case 'subtraction':
      return generateEquationProblems('subtraction', level)
    case 'word-problem':
      return generateWordProblems(level)
  }
}

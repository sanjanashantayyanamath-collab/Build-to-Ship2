import { formatRaw } from './engine.js'

const percentage = (value) => `${Math.round(value)}%`

export function generateExplanation(decision, results, sensitivity, stability) {
  const winner = results.winner
  const runnerUp = results.runnerUp
  if (!winner) {
    return {
      summary: 'Add alternatives to generate an evidence-based recommendation.',
      strengths: [],
      weaknesses: [],
      tradeoffs: [],
      risks: [],
      change: [],
    }
  }

  const ordered = [...winner.breakdown].sort((a, b) => b.contribution - a.contribution)
  const strengths = ordered.slice(0, 3).map((item) =>
    `${item.criterion.name} contributes ${item.contribution.toFixed(1)} points at ${percentage(item.criterion.weight)} weight.`,
  )
  const weaknesses = ordered
    .filter((item) => item.normalized < 70)
    .slice(0, 2)
    .map((item) =>
      `${item.criterion.name} is a relative weakness (${Math.round(item.normalized)}/100 normalized).`,
    )

  const tradeoffs = []
  if (runnerUp) {
    winner.breakdown.forEach((item) => {
      const other = runnerUp.breakdown.find((candidate) => candidate.criterion.id === item.criterion.id)
      if (other && item.normalized + 8 < other.normalized) {
        tradeoffs.push(
          `${runnerUp.name} is stronger on ${item.criterion.name}; ${winner.name} gives up ${Math.round(other.normalized - item.normalized)} normalized points there.`,
        )
      }
    })
  }

  const riskCriterion = winner.breakdown.find((item) => item.criterion.type === 'risk')
  const risks = []
  if (riskCriterion?.normalized < 80) {
    risks.push(`${riskCriterion.criterion.name} is assessed at ${formatRaw(riskCriterion.raw, riskCriterion.criterion)}.`)
  }
  if (runnerUp && winner.score - runnerUp.score < 5) {
    risks.push(`Only ${(winner.score - runnerUp.score).toFixed(1)} points separate the top two options.`)
  }
  if (stability.label === 'Sensitive') {
    risks.push(`The winner holds in ${percentage(stability.ratio * 100)} of tested weight variations.`)
  }

  const change = sensitivity.slice(0, 3).map((item) =>
    item.changeAt === null
      ? `${winner.name} remains first across the full ${item.name} weight range tested.`
      : `${winner.name} changes when ${item.name} weight ${item.direction} ~${item.changeAt}%; ${item.newWinner} moves to #1.`,
  )

  const top = ordered[0]
  return {
    summary: `${winner.name} ranks first at ${winner.score.toFixed(1)}/100, led by ${top.criterion.name} and a ${(winner.score - (runnerUp?.score ?? 0)).toFixed(1)}-point lead.`,
    strengths,
    weaknesses: weaknesses.length ? weaknesses : ['No major normalized score falls below 70/100.'],
    tradeoffs: tradeoffs.length ? tradeoffs : [`No material disadvantage versus ${runnerUp?.name ?? 'the next option'} exceeds 8 normalized points.`],
    risks: risks.length ? risks : ['No high-severity decision risks are visible in the current inputs.'],
    change,
    insight: `${top.criterion.name} is the largest score contributor. The ranking is ${stability.label.toLowerCase()} across ${stability.samples} systematic weight tests.`,
    tradeoffHighlight: tradeoffs[0] ?? `${winner.name} leads without a large single-criterion sacrifice against ${runnerUp?.name ?? 'other options'}.`,
  }
}

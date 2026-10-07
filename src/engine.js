const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function normalizeValue(value, criterion, alternatives) {
  if (criterion.type === 'risk') {
    if (typeof value === 'number') return clamp(100 - value * 10, 0, 100)
    return { low: 100, medium: 60, high: 20 }[String(value).toLowerCase()] ?? 60
  }

  const numbers = alternatives
    .map((option) => Number(option.values[criterion.id]))
    .filter((item) => Number.isFinite(item) && item >= 0)
  const numericValue = Number(value) || 0

  if (criterion.type === 'cost') {
    const positive = numbers.filter((item) => item > 0)
    const lowest = positive.length ? Math.min(...positive) : 0
    return numericValue > 0 ? clamp((lowest / numericValue) * 100, 0, 100) : 0
  }

  const maximum = Math.max(...numbers, 0)
  if (criterion.scale === 10) return clamp(numericValue * 10, 0, 100)
  return maximum > 0 ? clamp((numericValue / maximum) * 100, 0, 100) : 0
}

export function calculateResults(decision, weightsOverride) {
  const criteria = decision.criteria.map((criterion) => ({
    ...criterion,
    weight: weightsOverride?.[criterion.id] ?? criterion.weight,
  }))

  const ranked = decision.alternatives
    .map((option) => {
      const breakdown = criteria.map((criterion) => {
        const raw = option.values[criterion.id]
        const normalized = normalizeValue(raw, criterion, decision.alternatives)
        const contribution = normalized * (criterion.weight / 100)
        return { criterion, raw, normalized, contribution }
      })
      return {
        ...option,
        score: breakdown.reduce((sum, item) => sum + item.contribution, 0),
        breakdown,
      }
    })
    .sort((a, b) => b.score - a.score)
    .map((option, index) => ({ ...option, rank: index + 1 }))

  return { ranked, criteria, winner: ranked[0], runnerUp: ranked[1] }
}

export function redistributeWeights(criteria, changedId, nextWeight) {
  const changed = clamp(Math.round(nextWeight), 0, 100)
  const others = criteria.filter((item) => item.id !== changedId)
  const otherTotal = others.reduce((sum, item) => sum + item.weight, 0)
  const remaining = 100 - changed
  let used = 0

  return criteria.map((item) => {
    if (item.id === changedId) return { ...item, weight: changed }
    const isLast = item.id === others.at(-1)?.id
    const weight = isLast
      ? remaining - used
      : Math.round(otherTotal ? (item.weight / otherTotal) * remaining : remaining / others.length)
    used += weight
    return { ...item, weight }
  })
}

function weightsAt(criteria, changedId, changedWeight) {
  return Object.fromEntries(
    redistributeWeights(criteria, changedId, changedWeight).map((item) => [item.id, item.weight]),
  )
}

export function calculateSensitivity(decision) {
  const baseline = calculateResults(decision)
  if (!baseline.winner) return []

  return decision.criteria.map((criterion) => {
    const changes = []
    for (let weight = 0; weight <= 100; weight += 1) {
      const result = calculateResults(decision, weightsAt(decision.criteria, criterion.id, weight))
      if (result.winner?.id !== baseline.winner.id) {
        changes.push({ weight, winner: result.winner?.name })
      }
    }
    const nearestChange = changes.sort(
      (a, b) => Math.abs(a.weight - criterion.weight) - Math.abs(b.weight - criterion.weight),
    )[0]
    const changeAt = nearestChange?.weight ?? null
    const newWinner = nearestChange?.winner ?? null

    const winnerItem = baseline.winner.breakdown.find((item) => item.criterion.id === criterion.id)
    const runnerItem = baseline.runnerUp?.breakdown.find((item) => item.criterion.id === criterion.id)
    const spread = Math.abs((winnerItem?.normalized ?? 0) - (runnerItem?.normalized ?? 0))
    const influence = spread * (criterion.weight / 100)
    return {
      id: criterion.id,
      name: criterion.name,
      influence,
      level: influence >= 12 ? 'High' : influence >= 5 ? 'Medium' : 'Low',
      changeAt,
      newWinner,
      direction: changeAt === null ? null : changeAt > criterion.weight ? 'exceeds' : 'falls below',
    }
  }).sort((a, b) => b.influence - a.influence)
}

export function calculateStability(decision) {
  const baseline = calculateResults(decision)
  if (!baseline.winner || decision.criteria.length < 2) {
    return { label: 'Insufficient data', ratio: 0, samples: 0 }
  }

  let unchanged = 0
  let samples = 0
  const criteriaCount = decision.criteria.length
  for (let focus = 0; focus < criteriaCount; focus += 1) {
    for (let weight = 0; weight <= 100; weight += 5) {
      const weights = weightsAt(decision.criteria, decision.criteria[focus].id, weight)
      const result = calculateResults(decision, weights)
      unchanged += result.winner?.id === baseline.winner.id ? 1 : 0
      samples += 1
    }
  }
  const ratio = unchanged / samples
  return {
    label: ratio >= 0.72 ? 'Stable' : 'Sensitive',
    ratio,
    samples,
  }
}

export function formatRaw(value, criterion) {
  if (criterion.format === 'currency') {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`
  }
  if (criterion.format === 'percent') return `${value}%`
  if (criterion.scale === 10) return `${value}/10`
  return String(value ?? '—')
}

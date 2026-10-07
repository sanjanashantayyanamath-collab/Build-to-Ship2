// @ts-nocheck
import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness,
  Building2, Check, ChevronRight, CircleDollarSign, Clock3, Compass, FileText,
  Gauge, GraduationCap, History, LayoutDashboard, Lightbulb, Plus, Scale,
  ShieldCheck, Sparkles, Star, Target, Trash2, TrendingUp, Triangle, Users,
  X, Zap,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { categoryOrder, createDecision, customTemplate, templateLibrary } from './data.js'
import {
  calculateResults, calculateSensitivity, calculateStability, formatRaw, redistributeWeights,
} from './engine.js'
import { generateExplanation } from './explain.js'

const iconMap = {
  Business: BriefcaseBusiness,
  People: Users,
  Finance: CircleDollarSign,
  Operations: Gauge,
  Personal: Compass,
}

const typeLabel = { benefit: 'Benefit', cost: 'Cost', risk: 'Risk' }
const stored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function Logo({ large = false }) {
  return (
    <div className={`logo ${large ? 'logo--large' : ''}`}>
      <span className="logo-mark"><Triangle fill="currentColor" /></span>
      <span>PRISM</span>
    </div>
  )
}

function Button({ children, variant = 'primary', icon: Icon, className = '', ...props }) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {Icon && <Icon size={17} />}
      {children}
    </button>
  )
}

function Header({ screen, navigate, onNew }) {
  const items = [
    ['home', 'Dashboard'],
    ['create', 'New Decision'],
    ['history', 'Decisions'],
    ['templates', 'Templates'],
    ['history', 'History'],
  ]
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => navigate('home')} aria-label="PRISM home"><Logo /></button>
      <nav className="main-nav">
        {items.map(([route, label]) => (
          <button key={label} className={screen === route ? 'active' : ''} onClick={() => route === 'create' ? onNew() : navigate(route)}>
            {label}
          </button>
        ))}
      </nav>
      <Button icon={Plus} onClick={onNew}>New Decision</Button>
    </header>
  )
}

function Home({ onUse, navigate }) {
  const featured = templateLibrary.find((item) => item.id === 'supplier-selection')
  return (
    <main>
      <section className="hero">
        <div className="hero-glow hero-glow--one" />
        <div className="hero-glow hero-glow--two" />
        <div className="eyebrow"><Sparkles size={14} /> Decision Intelligence Platform</div>
        <Logo large />
        <h1>Don’t just get an answer.<br /><span>Understand the decision.</span></h1>
        <p className="hero-copy">Make complex choices with a transparent system that shows its work, tests assumptions, and reveals what could change the outcome.</p>
        <div className="hero-actions">
          <Button onClick={() => navigate('templates')} icon={ArrowRight}>Start a Decision</Button>
          <span>Understand. Challenge. Simulate. Decide.</span>
        </div>
      </section>

      <section className="page-section home-templates">
        <div className="section-heading">
          <div><span className="kicker">START WITH A FRAMEWORK</span><h2>What do you want to decide?</h2></div>
          <button className="text-button" onClick={() => navigate('templates')}>View all templates <ArrowRight size={15} /></button>
        </div>
        <div className="template-mini-grid">
          {templateLibrary.slice(0, 6).map((template) => {
            const Icon = iconMap[template.category]
            return (
              <button className="template-mini" key={template.id} onClick={() => onUse(template, false)}>
                <span className="icon-box"><Icon size={20} /></span>
                <strong>{template.name}</strong>
                <span>{template.description}</span>
                <ChevronRight size={17} />
              </button>
            )
          })}
        </div>
        <article className="featured-card">
          <div>
            <span className="featured-label"><Star size={13} fill="currentColor" /> Featured demo</span>
            <h3>Supplier Selection</h3>
            <p>Compare suppliers across price, quality, delivery, reliability and risk.</p>
            <div className="chip-row">{featured.criteria.map((item) => <span className="chip" key={item.id}>{item.name}</span>)}</div>
          </div>
          <div className="featured-visual">
            {[72, 89, 61].map((value, index) => <span key={value} style={{ '--value': `${value}%` }}><i /> <b>{String.fromCharCode(65 + index)}</b></span>)}
          </div>
          <Button onClick={() => onUse(featured, true)}>Try Demo <ArrowRight size={16} /></Button>
        </article>
      </section>
      <section className="closing">
        <ShieldCheck size={28} />
        <p>PRISM doesn’t make decisions for you. It makes the reasoning behind decisions visible, testable, and explainable.</p>
      </section>
    </main>
  )
}

function TemplateLibrary({ onUse }) {
  const [active, setActive] = useState('All')
  const shown = active === 'All' ? templateLibrary : templateLibrary.filter((item) => item.category === active)
  return (
    <main className="page">
      <div className="page-title">
        <div><span className="kicker">DECISION FRAMEWORKS</span><h1>Template Library</h1><p>Start with proven criteria, then adapt every detail to your context.</p></div>
        <Button variant="secondary" icon={Plus} onClick={() => onUse(customTemplate, false)}>Create Custom Decision</Button>
      </div>
      <div className="filter-tabs">
        {['All', ...categoryOrder].map((category) => <button className={active === category ? 'active' : ''} onClick={() => setActive(category)} key={category}>{category}</button>)}
      </div>
      <div className="template-grid">
        {shown.map((template) => {
          const Icon = iconMap[template.category]
          return (
            <article className="template-card" key={template.id}>
              <div className="template-card-top"><span className="icon-box"><Icon size={20} /></span><span className="category">{template.category}</span></div>
              <h3>{template.name}</h3><p>{template.description}</p>
              <div className="criteria-preview">{template.criteria.slice(0, 4).map((item) => <span key={item.id}>{item.name}</span>)}</div>
              <Button variant="ghost" onClick={() => onUse(template, false)}>Use Template <ArrowRight size={15} /></Button>
            </article>
          )
        })}
        <button className="custom-card" onClick={() => onUse(customTemplate, false)}>
          <span><Plus /></span><strong>Create Custom Decision</strong><small>Build a framework from scratch</small>
        </button>
      </div>
    </main>
  )
}

function Progress({ step }) {
  return (
    <div className="progress">
      {['Define', 'Criteria', 'Alternatives', 'Analyze'].map((label, index) => (
        <div className={index + 1 <= step ? 'active' : ''} key={label}>
          <span>{index + 1 < step ? <Check size={14} /> : index + 1}</span><b>{label}</b>
        </div>
      ))}
    </div>
  )
}

function CreateDecision({ decision, setDecision, onTemplateChange, onContinue, onBack }) {
  const total = decision.criteria.reduce((sum, item) => sum + Number(item.weight), 0)
  const changeWeight = (id, value) => setDecision({ ...decision, criteria: redistributeWeights(decision.criteria, id, Number(value)) })
  const updateCriterion = (id, key, value) => setDecision({
    ...decision,
    criteria: decision.criteria.map((item) => item.id === id ? { ...item, [key]: value } : item),
  })
  const addCriterion = () => {
    const id = `criterion-${Date.now()}`
    const withNew = [...decision.criteria, { id, name: 'New criterion', weight: 0, type: 'benefit', scale: 10 }]
    setDecision({ ...decision, criteria: redistributeWeights(withNew, id, 10) })
  }
  const removeCriterion = (id) => {
    if (decision.criteria.length <= 2) return
    const next = decision.criteria.filter((item) => item.id !== id)
    const first = next[0]
    setDecision({ ...decision, criteria: redistributeWeights(next, first.id, first.weight) })
  }
  return (
    <main className="page workflow-page">
      <Progress step={2} />
      <div className="workflow-header"><button className="back" onClick={onBack}><ArrowLeft size={16} /> Back</button><span>STEP 1 OF 3</span></div>
      <div className="page-title compact">
        <div><span className="kicker">DEFINE THE DECISION</span><h1>Set your priorities</h1><p>Name the decision, then tune how much each criterion matters.</p></div>
      </div>
      <section className="form-card">
        <div className="form-grid">
          <label>Decision type<select value={decision.templateId} onChange={(event) => onTemplateChange(event.target.value)}>
            <option value="custom">Custom Decision</option>
            {templateLibrary.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}
          </select></label>
          <label>Decision name<input value={decision.name} onChange={(event) => setDecision({ ...decision, name: event.target.value })} /></label>
          <label className="full">Description <span>Optional</span><textarea value={decision.description} onChange={(event) => setDecision({ ...decision, description: event.target.value })} /></label>
        </div>
      </section>
      <section className="form-card criteria-card">
        <div className="card-heading"><div><h2>Decision criteria</h2><p>Moving one weight proportionally balances the others.</p></div><div className={total === 100 ? 'total valid' : 'total invalid'}>Total: {total}% {total === 100 ? <Check size={15} /> : <AlertTriangle size={15} />}</div></div>
        <div className="criteria-list">
          {decision.criteria.map((criterion) => (
            <div className="criterion-row" key={criterion.id}>
              <input className="criterion-name" value={criterion.name} onChange={(event) => updateCriterion(criterion.id, 'name', event.target.value)} aria-label="Criterion name" />
              <select className={`type type--${criterion.type}`} value={criterion.type} onChange={(event) => updateCriterion(criterion.id, 'type', event.target.value)}>
                <option value="benefit">Benefit</option><option value="cost">Cost</option><option value="risk">Risk</option>
              </select>
              <input className="range" type="range" min="0" max="100" value={criterion.weight} onChange={(event) => changeWeight(criterion.id, event.target.value)} style={{ '--progress': `${criterion.weight}%` }} />
              <output>{criterion.weight}%</output>
              <button className="icon-button danger" onClick={() => removeCriterion(criterion.id)} aria-label="Remove criterion"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <Button variant="secondary" icon={Plus} onClick={addCriterion}>Add criterion</Button>
      </section>
      <div className="workflow-actions"><span>Your weights are saved automatically.</span><Button onClick={onContinue}>Continue to Alternatives <ArrowRight size={16} /></Button></div>
    </main>
  )
}

function Alternatives({ decision, setDecision, onAnalyze, onBack }) {
  const updateName = (id, name) => setDecision({ ...decision, alternatives: decision.alternatives.map((item) => item.id === id ? { ...item, name } : item) })
  const updateValue = (optionId, criterionId, value) => setDecision({
    ...decision,
    alternatives: decision.alternatives.map((item) => item.id === optionId ? { ...item, values: { ...item.values, [criterionId]: value } } : item),
  })
  const add = () => setDecision({
    ...decision,
    alternatives: [...decision.alternatives, {
      id: `option-${Date.now()}`,
      name: `${decision.alternativeLabel} ${decision.alternatives.length + 1}`,
      values: Object.fromEntries(decision.criteria.map((item) => [item.id, item.type === 'risk' ? 'Medium' : item.scale === 10 ? 5 : 0])),
    }],
  })
  const remove = (id) => setDecision({ ...decision, alternatives: decision.alternatives.filter((item) => item.id !== id) })
  return (
    <main className="page wide-page">
      <Progress step={3} />
      <div className="workflow-header"><button className="back" onClick={onBack}><ArrowLeft size={16} /> Back</button><span>STEP 2 OF 3</span></div>
      <div className="page-title compact">
        <div><span className="kicker">OPTIONS TO COMPARE</span><h1>Add your alternatives</h1><p>Enter the available evidence. Every value remains editable.</p></div>
        <Button variant="secondary" icon={Plus} onClick={add}>Add {decision.alternativeLabel}</Button>
      </div>
      <section className="table-card">
        <div className="table-scroll">
          <table className="data-table alternatives-table">
            <thead><tr><th>{decision.alternativeLabel}</th>{decision.criteria.map((item) => <th key={item.id}>{item.name}<small>{typeLabel[item.type]}</small></th>)}<th /></tr></thead>
            <tbody>
              {decision.alternatives.map((option) => (
                <tr key={option.id}>
                  <td><input value={option.name} onChange={(event) => updateName(option.id, event.target.value)} /></td>
                  {decision.criteria.map((criterion) => (
                    <td key={criterion.id}>
                      {criterion.type === 'risk'
                        ? <select value={option.values[criterion.id] ?? 'Medium'} onChange={(event) => updateValue(option.id, criterion.id, event.target.value)}><option>Low</option><option>Medium</option><option>High</option></select>
                        : <input type="number" min="0" max={criterion.scale === 10 ? 10 : undefined} value={option.values[criterion.id] ?? ''} onChange={(event) => updateValue(option.id, criterion.id, Number(event.target.value))} />}
                    </td>
                  ))}
                  <td><button className="icon-button danger" onClick={() => remove(option.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!decision.alternatives.length && <div className="empty"><Target /><h3>No alternatives yet</h3><p>Add at least two options to produce a useful comparison.</p><Button icon={Plus} onClick={add}>Add first option</Button></div>}
      </section>
      <div className="workflow-actions"><span>{decision.alternatives.length} alternatives · {decision.criteria.length} criteria</span><Button disabled={decision.alternatives.length < 2} onClick={onAnalyze}>Analyze Decision <Activity size={17} /></Button></div>
    </main>
  )
}

function ScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><b>{payload[0].payload.name}</b><span>{payload[0].value.toFixed(1)} / 100</span></div>
}

function Results({ decision, history, onWhy, onChallenge, navigate, onEdit }) {
  const results = useMemo(() => calculateResults(decision), [decision])
  const sensitivity = useMemo(() => calculateSensitivity(decision), [decision])
  const stability = useMemo(() => calculateStability(decision), [decision])
  const explanation = useMemo(() => generateExplanation(decision, results, sensitivity, stability), [decision, results, sensitivity, stability])
  const [view, setView] = useState('overview')
  const winner = results.winner
  if (!winner) return null
  return (
    <main className="page results-page">
      <Progress step={4} />
      <div className="results-toolbar">
        <div><span className="kicker">DECISION ANALYSIS</span><h1>{decision.name}</h1><p>Updated just now · {decision.alternatives.length} options · {decision.criteria.length} criteria</p></div>
        <div><Button variant="secondary" onClick={onEdit}>Edit inputs</Button><Button icon={Zap} onClick={onChallenge}>Challenge decision</Button></div>
      </div>
      <div className="subnav">
        {['overview', 'compare', 'sensitivity'].map((item) => <button className={view === item ? 'active' : ''} onClick={() => setView(item)} key={item}>{item}</button>)}
      </div>
      {view === 'overview' && (
        <div className="results-layout">
          <div className="results-main">
            <section className="winner-card">
              <div className="winner-shine" />
              <div><span className="recommendation"><Star size={14} fill="currentColor" /> Recommended · Top-ranked option</span><h2>{winner.name}</h2><p>{explanation.summary}</p><div className="winner-actions"><Button onClick={onWhy} variant="light">Why this decision? <ArrowRight size={15} /></Button><Button onClick={onChallenge} variant="outline" icon={Zap}>Challenge this decision</Button></div></div>
              <div className="score-orb"><strong>{winner.score.toFixed(1)}</strong><span>/ 100</span><small>Decision score</small></div>
            </section>
            <section className="two-column">
              <article className="panel">
                <div className="panel-title"><div><span className="kicker">RANKING</span><h3>Overall scores</h3></div><BarChart3 size={19} /></div>
                <div className="rank-list">
                  {results.ranked.map((item, index) => <div className={index === 0 ? 'winner' : ''} key={item.id}><b>#{item.rank}</b><span>{item.name}<i><em style={{ width: `${item.score}%` }} /></i></span><strong>{item.score.toFixed(1)}</strong></div>)}
                </div>
              </article>
              <article className="panel chart-panel">
                <div className="panel-title"><div><span className="kicker">COMPARISON</span><h3>Score distribution</h3></div></div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={results.ranked} margin={{ left: -24, right: 4, top: 8 }}>
                    <defs><linearGradient id="winnerGradient"><stop offset="0%" stopColor="#22D3EE" /><stop offset="52%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#F472B6" /></linearGradient></defs>
                    <CartesianGrid stroke="#26304c" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#8E9AB8', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: '#64708d', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip content={<ScoreTooltip />} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="score" radius={[5, 5, 0, 0]}>{results.ranked.map((item, index) => <Cell key={item.id} fill={index === 0 ? 'url(#winnerGradient)' : '#34415f'} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </article>
            </section>
            <section className="panel breakdown-panel">
              <div className="panel-title"><div><span className="kicker">TRANSPARENT CALCULATION</span><h3>Score breakdown · {winner.name}</h3></div><span className="formula">Normalized score × weight</span></div>
              <div className="table-scroll"><table className="data-table"><thead><tr><th>Criterion</th><th>Raw value</th><th>Normalized</th><th>Weight</th><th>Contribution</th></tr></thead><tbody>
                {winner.breakdown.map((item) => <tr key={item.criterion.id}><td><strong>{item.criterion.name}</strong><small className={`type-text ${item.criterion.type}`}>{typeLabel[item.criterion.type]}</small></td><td>{formatRaw(item.raw, item.criterion)}</td><td><span className="microbar"><i style={{ width: `${item.normalized}%` }} /></span>{item.normalized.toFixed(0)}</td><td>{item.criterion.weight}%</td><td><b>{item.contribution.toFixed(1)}</b></td></tr>)}
              </tbody></table></div>
            </section>
            <section className="two-column">
              <article className="panel insight-card"><Lightbulb /><div><span className="kicker">DECISION INSIGHT</span><h3>{explanation.insight}</h3><button className="text-button" onClick={onWhy}>Explore the reasoning <ArrowRight size={14} /></button></div></article>
              <article className={`panel stability-card ${stability.label.toLowerCase()}`}><div className="stability-gauge"><ShieldCheck /><strong>{Math.round(stability.ratio * 100)}%</strong></div><div><span className="kicker">DECISION STABILITY</span><h3>{stability.label}</h3><p>{winner.name} stays #1 in {Math.round(stability.ratio * 100)}% of tested priority shifts.</p></div></article>
            </section>
            <section className="panel risk-panel">
              <div className="panel-title"><div><span className="kicker">RISK & WARNING</span><h3>What deserves attention</h3></div><AlertTriangle size={20} /></div>
              <div className="risk-grid"><div><b className="positive">Positives</b>{explanation.strengths.slice(0, 2).map((item) => <p key={item}><Check size={14} />{item}</p>)}</div><div><b className="tradeoff">Trade-offs</b>{explanation.tradeoffs.slice(0, 2).map((item) => <p key={item}><Scale size={14} />{item}</p>)}</div><div><b className="warning">Potential risks</b>{explanation.risks.slice(0, 2).map((item) => <p key={item}><AlertTriangle size={14} />{item}</p>)}</div></div>
            </section>
          </div>
          <aside className="history-sidebar">
            <div className="panel-title"><div><span className="kicker">AUDIT TRAIL</span><h3>Decision history</h3></div><History size={18} /></div>
            <div className="timeline">
              <div><i /><b>Analysis completed</b><span>Just now</span><p>{winner.name} ranked first at {winner.score.toFixed(1)}.</p></div>
              <div><i /><b>Alternatives added</b><span>Today</span><p>{decision.alternatives.length} options evaluated.</p></div>
              <div><i /><b>Criteria weighted</b><span>Today</span><p>{decision.criteria.length} priorities total 100%.</p></div>
              <div><i /><b>Decision created</b><span>Today</span><p>Started from {decision.templateId.replaceAll('-', ' ')}.</p></div>
            </div>
            <button className="text-button" onClick={() => navigate('history')}>View all decisions <ArrowRight size={14} /></button>
          </aside>
        </div>
      )}
      {view === 'compare' && <CompareView results={results} criteria={decision.criteria} />}
      {view === 'sensitivity' && <SensitivityView sensitivity={sensitivity} winner={winner} stability={stability} />}
    </main>
  )
}

function CompareView({ results, criteria }) {
  return (
    <section className="panel compare-view">
      <div className="page-title compact"><div><span className="kicker">SIDE-BY-SIDE</span><h2>Compare every option</h2><p>Raw values with overall rank and score.</p></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Option</th><th>Rank</th><th>Score</th>{criteria.map((item) => <th key={item.id}>{item.name}</th>)}</tr></thead><tbody>
        {results.ranked.map((option) => <tr key={option.id}><td><strong>{option.name}</strong></td><td><span className={option.rank === 1 ? 'rank-badge first' : 'rank-badge'}>#{option.rank}</span></td><td><b>{option.score.toFixed(1)}</b></td>{criteria.map((criterion) => <td key={criterion.id}>{formatRaw(option.values[criterion.id], criterion)}</td>)}</tr>)}
      </tbody></table></div>
    </section>
  )
}

function SensitivityView({ sensitivity, winner, stability }) {
  return (
    <div className="sensitivity-layout">
      <section className="panel">
        <div className="panel-title"><div><span className="kicker">INFLUENCE ANALYSIS</span><h3>What drives the ranking?</h3></div><TrendingUp /></div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={sensitivity} layout="vertical" margin={{ left: 30, right: 20 }}>
            <CartesianGrid stroke="#26304c" horizontal={false} /><XAxis type="number" tick={{ fill: '#64708d' }} axisLine={false} /><YAxis type="category" dataKey="name" width={110} tick={{ fill: '#bac3d9', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ScoreTooltip />} /><Bar dataKey="influence" fill="#8B5CF6" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel sensitivity-notes">
        <div className={`stability-pill ${stability.label.toLowerCase()}`}><ShieldCheck size={16} /> {stability.label} · {Math.round(stability.ratio * 100)}%</div>
        <h3>Ranking thresholds</h3>
        {sensitivity.map((item) => <div key={item.id}><span className={`influence ${item.level.toLowerCase()}`}>{item.level} influence</span><p>{item.changeAt === null ? `${winner.name} remains #1 across all tested ${item.name} weights.` : `${winner.name} remains #1 until ${item.name} weight ${item.direction} ~${item.changeAt}%.`}</p></div>)}
      </section>
    </div>
  )
}

function WhyPanel({ decision, onClose }) {
  const results = calculateResults(decision)
  const sensitivity = calculateSensitivity(decision)
  const stability = calculateStability(decision)
  const explanation = generateExplanation(decision, results, sensitivity, stability)
  const sections = [
    ['Strongest factors', 'positive', Check, explanation.strengths],
    ['Weaknesses', 'warning', AlertTriangle, explanation.weaknesses],
    ['Trade-offs', 'tradeoff', Scale, explanation.tradeoffs],
    ['Key risks', 'risk', ShieldCheck, explanation.risks],
  ]
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header"><div><span className="kicker">EXPLAINABLE DECISION</span><h2>Why {results.winner.name}?</h2></div><button className="icon-button" onClick={onClose}><X /></button></div>
        <p className="drawer-lead">{explanation.summary}</p>
        {sections.map(([title, tone, Icon, items]) => <section className="reason-section" key={title}><h3 className={tone}><Icon size={17} />{title}</h3>{items.map((item) => <p key={item}>{item}</p>)}</section>)}
        <div className="tradeoff-box"><span>THE CENTRAL TRADE-OFF</span><strong>{explanation.tradeoffHighlight}</strong></div>
        <section className="reason-section"><h3><Activity size={17} />What would change the decision?</h3>{explanation.change.map((item) => <p key={item}>{item}</p>)}</section>
        <Button onClick={onClose}>Got it</Button>
      </aside>
    </div>
  )
}

function ChallengePanel({ decision, onClose }) {
  const [criteria, setCriteria] = useState(decision.criteria.map((item) => ({ ...item })))
  const baseline = calculateResults(decision)
  const challenged = calculateResults({ ...decision, criteria })
  const changed = challenged.winner?.id !== baseline.winner?.id
  const applyPreset = (preset) => {
    if (preset === 'balanced') {
      const base = Math.floor(100 / criteria.length)
      setCriteria(criteria.map((item, index) => ({ ...item, weight: index === criteria.length - 1 ? 100 - base * (criteria.length - 1) : base })))
      return
    }
    const target = criteria.find((item) => preset === 'cost' ? item.type === 'cost' : item.type === 'benefit')
    if (target) setCriteria(redistributeWeights(criteria, target.id, 50))
  }
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="drawer drawer--wide" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header"><div><span className="kicker"><Zap size={13} /> CHALLENGE THE DECISION</span><h2>What happens if your priorities change?</h2></div><button className="icon-button" onClick={onClose}><X /></button></div>
        <p className="drawer-lead">Stress-test the recommendation. Move any priority and PRISM recalculates the ranking instantly.</p>
        <div className="scenario-row"><span>Quick scenarios</span><button onClick={() => applyPreset('balanced')}>Balanced</button><button onClick={() => applyPreset('cost')}>Cost focused</button><button onClick={() => applyPreset('quality')}>Performance focused</button><button onClick={() => setCriteria(decision.criteria.map((item) => ({ ...item })))}>Reset</button></div>
        <div className="challenge-layout">
          <section className="challenge-sliders">
            {criteria.map((criterion) => <label key={criterion.id}><span><b>{criterion.name}</b><output>{criterion.weight}%</output></span><input className="range" type="range" min="0" max="100" value={criterion.weight} style={{ '--progress': `${criterion.weight}%` }} onChange={(event) => setCriteria(redistributeWeights(criteria, criterion.id, Number(event.target.value)))} /></label>)}
            <div className="total valid">Total: 100% <Check size={14} /></div>
          </section>
          <section className="before-after">
            <div><span>BEFORE</span><small>Original priorities</small><strong>{baseline.winner.name}</strong><b>{baseline.winner.score.toFixed(1)}</b></div>
            <ArrowRight />
            <div className={changed ? 'changed' : ''}><span>AFTER</span><small>Live scenario</small><strong>{challenged.winner.name}</strong><b>{challenged.winner.score.toFixed(1)}</b></div>
          </section>
        </div>
        <div className={`scenario-result ${changed ? 'changed' : ''}`}><Activity /><div><b>{changed ? 'The recommendation changed.' : 'The recommendation holds.'}</b><p>{changed ? `${challenged.winner.name} moves to #1 under these priorities.` : `${baseline.winner.name} remains #1, though the margin may have shifted.`}</p></div></div>
        <section className="panel mini-ranking">{challenged.ranked.map((item) => <div key={item.id}><span>#{item.rank} {item.name}</span><i><em style={{ width: `${item.score}%` }} /></i><b>{item.score.toFixed(1)}</b></div>)}</section>
      </aside>
    </div>
  )
}

function HistoryScreen({ history, onOpen, onNew }) {
  return (
    <main className="page">
      <div className="page-title"><div><span className="kicker">SAVED LOCALLY</span><h1>Decision History</h1><p>Reopen previous analyses and preserve a transparent record.</p></div><Button icon={Plus} onClick={onNew}>New Decision</Button></div>
      {history.length ? <div className="history-grid">{history.map((item) => <button key={item.savedAt} className="history-card" onClick={() => onOpen(item.decision)}><span className="icon-box"><FileText /></span><div><h3>{item.decision.name}</h3><p>{item.decision.alternatives.length} alternatives · {item.decision.criteria.length} criteria</p><span><Clock3 size={13} /> {new Date(item.savedAt).toLocaleString()}</span></div><div className="history-result"><small>Top option</small><strong>{item.winner}</strong><b>{item.score.toFixed(1)}</b></div><ChevronRight /></button>)}</div>
      : <div className="empty large"><History /><h2>No decisions analyzed yet</h2><p>Your completed decisions will appear here.</p><Button onClick={onNew}>Start your first decision</Button></div>}
    </main>
  )
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [decision, setDecision] = useState(() => stored('prism-current', null))
  const [history, setHistory] = useState(() => stored('prism-history', []))
  const [panel, setPanel] = useState(null)

  useEffect(() => {
    if (decision) localStorage.setItem('prism-current', JSON.stringify(decision))
  }, [decision])
  useEffect(() => localStorage.setItem('prism-history', JSON.stringify(history)), [history])

  const useTemplate = (template, analyze) => {
    const next = createDecision(template)
    setDecision(next)
    setScreen(analyze && next.alternatives.length >= 2 ? 'results' : 'create')
    window.scrollTo(0, 0)
  }
  const newCustom = () => useTemplate(customTemplate, false)
  const navigate = (next) => {
    if (next === 'create' && !decision) return newCustom()
    setScreen(next)
    window.scrollTo(0, 0)
  }
  const analyze = () => {
    const results = calculateResults(decision)
    setHistory((items) => [{ decision, winner: results.winner.name, score: results.winner.score, savedAt: new Date().toISOString() }, ...items].slice(0, 12))
    setScreen('results')
    window.scrollTo(0, 0)
  }
  const openHistory = (savedDecision) => { setDecision(savedDecision); setScreen('results'); window.scrollTo(0, 0) }

  return (
    <div className="app-shell">
      <Header screen={screen} navigate={navigate} onNew={newCustom} />
      {screen === 'home' && <Home onUse={useTemplate} navigate={navigate} />}
      {screen === 'templates' && <TemplateLibrary onUse={useTemplate} />}
      {screen === 'create' && decision && <CreateDecision decision={decision} setDecision={setDecision} onTemplateChange={(id) => setDecision(createDecision(id === 'custom' ? customTemplate : templateLibrary.find((item) => item.id === id)))} onContinue={() => setScreen('alternatives')} onBack={() => setScreen('templates')} />}
      {screen === 'alternatives' && decision && <Alternatives decision={decision} setDecision={setDecision} onAnalyze={analyze} onBack={() => setScreen('create')} />}
      {screen === 'results' && decision && <Results decision={decision} history={history} onWhy={() => setPanel('why')} onChallenge={() => setPanel('challenge')} navigate={navigate} onEdit={() => setScreen('create')} />}
      {screen === 'history' && <HistoryScreen history={history} onOpen={openHistory} onNew={newCustom} />}
      {panel === 'why' && <WhyPanel decision={decision} onClose={() => setPanel(null)} />}
      {panel === 'challenge' && <ChallengePanel decision={decision} onClose={() => setPanel(null)} />}
    </div>
  )
}

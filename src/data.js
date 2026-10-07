export const categoryOrder = ['Business', 'People', 'Finance', 'Operations', 'Personal']

const c = (id, name, weight, type = 'benefit', extra = {}) => ({ id, name, weight, type, ...extra })

const supplierCriteria = [
  c('price', 'Price', 30, 'cost', { format: 'currency' }),
  c('quality', 'Quality', 25, 'benefit', { scale: 10 }),
  c('delivery', 'Delivery', 20, 'benefit', { scale: 10 }),
  c('reliability', 'Reliability', 15, 'benefit', { scale: 10 }),
  c('risk', 'Risk', 10, 'risk'),
]

const supplierAlternatives = [
  { id: 'a', name: 'Supplier A', values: { price: 700000, quality: 8, delivery: 7, reliability: 8, risk: 'Low' } },
  { id: 'b', name: 'Supplier B', values: { price: 840000, quality: 9, delivery: 9, reliability: 9, risk: 'Low' } },
  { id: 'c', name: 'Supplier C', values: { price: 750000, quality: 7, delivery: 6, reliability: 6, risk: 'Medium' } },
]

const templates = [
  ['Supplier Selection', 'Business', 'Compare suppliers across price, quality, delivery, reliability and risk', supplierCriteria, supplierAlternatives, 'Supplier'],
  ['Procurement', 'Business', 'Balance total cost, service quality and supply resilience', [
    c('cost', 'Cost', 25, 'cost', { format: 'currency' }), c('quality', 'Quality', 25, 'benefit', { scale: 10 }),
    c('delivery', 'Delivery', 20, 'benefit', { scale: 10 }), c('reliability', 'Reliability', 15, 'benefit', { scale: 10 }), c('risk', 'Risk', 15, 'risk'),
  ], [
    { id: 'p1', name: 'Northstar Materials', values: { cost: 560000, quality: 8, delivery: 7, reliability: 9, risk: 'Low' } },
    { id: 'p2', name: 'Atlas Procurement', values: { cost: 495000, quality: 7, delivery: 8, reliability: 7, risk: 'Medium' } },
    { id: 'p3', name: 'Vertex Supply', values: { cost: 610000, quality: 9, delivery: 9, reliability: 8, risk: 'Low' } },
  ], 'Vendor'],
  ['Vendor Evaluation', 'Business', 'Evaluate strategic vendors consistently'], ['Project Prioritization', 'Business', 'Rank initiatives by impact, effort and risk'],
  ['Investment Comparison', 'Business', 'Compare opportunities across return and risk'], ['Location Selection', 'Business', 'Choose sites using operating and market factors'],
  ['Product Selection', 'Business', 'Assess product fit, cost and quality'],
  ['Candidate Evaluation', 'People', 'Compare candidates with a transparent scorecard', [
    c('technical', 'Technical Skills', 30, 'benefit', { scale: 10 }), c('experience', 'Experience', 25, 'benefit', { scale: 10 }),
    c('problem', 'Problem Solving', 20, 'benefit', { scale: 10 }), c('communication', 'Communication', 15, 'benefit', { scale: 10 }), c('fit', 'Role Fit', 10, 'benefit', { scale: 10 }),
  ], [
    { id: 'ca', name: 'Maya Chen', values: { technical: 9, experience: 8, problem: 9, communication: 7, fit: 8 } },
    { id: 'cb', name: 'Jordan Lee', values: { technical: 8, experience: 9, problem: 8, communication: 9, fit: 9 } },
    { id: 'cc', name: 'Sam Rivera', values: { technical: 7, experience: 7, problem: 9, communication: 8, fit: 8 } },
  ], 'Candidate'],
  ['Hiring', 'People', 'Make structured, fair hiring decisions'], ['Team Selection', 'People', 'Assemble balanced, capable teams'],
  ['Resource Allocation', 'People', 'Direct limited capacity to highest value'], ['Promotion Review', 'People', 'Review readiness with consistent criteria'],
  ['Loan Application Analysis', 'Finance', 'Assess affordability, history and repayment capacity', [
    c('income', 'Income Stability', 25, 'benefit', { scale: 10 }), c('dti', 'Debt-to-Income', 25, 'cost', { format: 'percent' }),
    c('credit', 'Credit History', 20, 'benefit', { scale: 10 }), c('repayment', 'Repayment Capacity', 15, 'benefit', { scale: 10 }),
    c('employment', 'Employment Stability', 10, 'benefit', { scale: 10 }), c('amount', 'Loan Amount', 5, 'cost', { format: 'currency' }),
  ], [
    { id: 'la', name: 'Application 1042', values: { income: 9, dti: 28, credit: 8, repayment: 9, employment: 8, amount: 900000 } },
    { id: 'lb', name: 'Application 1048', values: { income: 7, dti: 22, credit: 9, repayment: 8, employment: 9, amount: 1100000 } },
    { id: 'lc', name: 'Application 1051', values: { income: 8, dti: 36, credit: 7, repayment: 7, employment: 8, amount: 750000 } },
  ], 'Applicant'],
  ['Credit Risk', 'Finance', 'Surface credit strengths and exposure'], ['Investment Options', 'Finance', 'Compare return, horizon and downside'],
  ['Budget Allocation', 'Finance', 'Prioritize spend against strategic value'],
  ['Supplier Risk', 'Operations', 'Map supply continuity and concentration risk'], ['Inventory', 'Operations', 'Balance service levels and holding costs'],
  ['Logistics', 'Operations', 'Choose routes and partners transparently'], ['Project Risk', 'Operations', 'Prioritize mitigations by exposure'],
  ['College Selection', 'Personal', 'Compare cost, outcomes and campus fit', [
    c('tuition', 'Tuition Cost', 20, 'cost', { format: 'currency' }), c('reputation', 'Academic Reputation', 20, 'benefit', { scale: 10 }),
    c('placement', 'Placement Rate', 20, 'benefit', { format: 'percent' }), c('location', 'Location', 10, 'benefit', { scale: 10 }),
    c('scholarships', 'Scholarships', 15, 'benefit', { format: 'currency' }), c('career', 'Career Opportunities', 15, 'benefit', { scale: 10 }),
  ], [
    { id: 'co1', name: 'Lakeview University', values: { tuition: 1400000, reputation: 9, placement: 92, location: 7, scholarships: 250000, career: 9 } },
    { id: 'co2', name: 'Northbridge College', values: { tuition: 1050000, reputation: 8, placement: 86, location: 9, scholarships: 300000, career: 8 } },
    { id: 'co3', name: 'Creston Institute', values: { tuition: 850000, reputation: 7, placement: 81, location: 8, scholarships: 180000, career: 7 } },
  ], 'College'],
  ['Job Offer Comparison', 'Personal', 'Balance compensation, growth and quality of life', [
    c('salary', 'Salary', 25, 'benefit', { format: 'currency' }), c('growth', 'Career Growth', 20, 'benefit', { scale: 10 }),
    c('stability', 'Company Stability', 15, 'benefit', { scale: 10 }), c('location', 'Location', 10, 'benefit', { scale: 10 }),
    c('balance', 'Work-Life Balance', 20, 'benefit', { scale: 10 }), c('benefits', 'Benefits', 10, 'benefit', { scale: 10 }),
  ], [
    { id: 'j1', name: 'Helio Labs', values: { salary: 2400000, growth: 9, stability: 7, location: 8, balance: 7, benefits: 8 } },
    { id: 'j2', name: 'Northstar Group', values: { salary: 2100000, growth: 8, stability: 9, location: 7, balance: 9, benefits: 9 } },
    { id: 'j3', name: 'Aperture Systems', values: { salary: 2600000, growth: 7, stability: 8, location: 6, balance: 6, benefits: 7 } },
  ], 'Company'],
  ['Car', 'Personal', 'Compare ownership cost, safety and utility'], ['Apartment', 'Personal', 'Balance rent, commute and livability'],
  ['Travel', 'Personal', 'Choose destinations by value and experience'],
]

const fallbackCriteria = [
  c('cost', 'Cost', 30, 'cost', { format: 'currency' }),
  c('quality', 'Quality', 25, 'benefit', { scale: 10 }),
  c('fit', 'Strategic Fit', 20, 'benefit', { scale: 10 }),
  c('reliability', 'Reliability', 15, 'benefit', { scale: 10 }),
  c('risk', 'Risk', 10, 'risk'),
]

export const templateLibrary = templates.map(([name, category, description, criteria, alternatives, label]) => ({
  id: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name, category, description,
  criteria: criteria || fallbackCriteria,
  alternatives: alternatives || [],
  alternativeLabel: label || (category === 'People' ? 'Candidate' : 'Option'),
}))

export const customTemplate = {
  id: 'custom',
  name: 'Custom Decision',
  category: 'Custom',
  description: 'Start with a flexible scorecard and make it your own.',
  alternativeLabel: 'Option',
  criteria: [
    c('criterion-1', 'Impact', 40, 'benefit', { scale: 10 }),
    c('criterion-2', 'Feasibility', 35, 'benefit', { scale: 10 }),
    c('criterion-3', 'Cost', 25, 'cost', { format: 'currency' }),
  ],
  alternatives: [],
}

export function createDecision(template) {
  return {
    id: `decision-${Date.now()}`,
    templateId: template.id,
    name: template.id === 'supplier-selection' ? 'Select a Supplier' : template.name,
    description: template.description,
    alternativeLabel: template.alternativeLabel,
    criteria: template.criteria.map((item) => ({ ...item })),
    alternatives: template.alternatives.map((item) => ({ ...item, values: { ...item.values } })),
    createdAt: new Date().toISOString(),
  }
}

# PRISM — Decision Intelligence Platform

> **Transparent, testable, explainable decisions.**
> PRISM doesn't make decisions for you. It makes the reasoning behind decisions visible, so you can inspect it, challenge it, and trust it.

PRISM is a multi-criteria decision analysis (MCDA) web app. You define what matters (criteria and weights), add the options you are comparing, and PRISM ranks them with a fully transparent weighted-scoring model, then explains *why* the winner won and *what would change the result*.

The demo problem is **Supplier Selection** (Supplier A vs B vs C across price, quality, delivery, reliability and risk), but the engine is domain-agnostic and ships with 25+ templates.

---

## Table of Contents

1. [Features](#features)
2. [Screenshots / App Flow](#app-flow)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [How the Scoring Works](#how-the-scoring-works)
7. [Templates](#templates)
8. [Data Persistence](#data-persistence)
9. [Roadmap](#roadmap)
10. [Scripts](#scripts)

---

## Features

| Feature | What it does |
| --- | --- |
| **Weighted scoring** | Ranks alternatives using normalized scores and criterion weights that always total 100%. |
| **Template library** | 25+ ready-made decision templates across Business, People, Finance, Operations and Personal categories, plus a fully custom decision. |
| **"Why" explanation** | Generates a plain-language summary: strengths, weaknesses, trade-offs versus the runner-up, risks, and what would change the outcome. |
| **Challenge the decision (what-if simulator)** | Move any priority slider and watch the ranking recalculate live, with a Before / After comparison. Quick scenarios: Balanced, Cost focused, Quality focused. |
| **Sensitivity analysis** | For each criterion, finds the weight at which the winner would change and who would take #1. Ranks criteria by influence (High / Medium / Low). |
| **Decision stability score** | Tests the ranking across systematic weight shifts and labels it **Stable** or **Sensitive**. |
| **Compare view** | Side-by-side table of every option, rank, score and raw criterion values. |
| **Score breakdown** | Per-criterion raw value, normalized value, weight and point contribution for every option. |
| **Decision history** | Previous analyses are saved locally and can be reopened at any time, giving a transparent record. |

---

## App Flow

```
Dashboard ──► Choose a template (or Custom)
                    │
                    ▼
            Create Decision  ── name, description, criteria & weights
                    │
                    ▼
            Add Alternatives ── enter the evidence for each option
                    │
                    ▼
                 Results ──┬── Overview (ranking, chart, breakdown, stability)
                           ├── Compare
                           ├── Sensitivity
                           ├── "Why?" explanation panel
                           └── "Challenge" what-if panel
```

Top navigation: **Dashboard · New Decision · Decisions · Templates · History**

---

## Tech Stack

**Frontend (current)**

- [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/) (UI) with plain JS modules for the decision engine
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`, plus custom CSS in `src/index.css`
- [Recharts](https://recharts.org/) for score charts
- [Lucide React](https://lucide.dev/) for icons
- [oxfmt](https://www.npmjs.com/package/oxfmt) for formatting
- Package manager: **pnpm**, Node.js **22** (pinned in `.mise.toml`)

**Planned**

- Python **FastAPI** backend
- **Supabase** for persistence and auth
- **LLM API** for richer natural-language explanations
- Deployment on **Vercel** (frontend) and **Render** (backend)

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+ (`npm install -g pnpm`)

> Tip: if you use [mise](https://mise.jdx.dev/), run `mise install` to get the exact toolchain from `.mise.toml`.

### Install and run

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <your-repo-folder>

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
```

The app will be available at the URL Vite prints (typically `http://localhost:5173`).

### Production build

```bash
pnpm build      # outputs to dist/
pnpm preview    # serve the production build locally
```

---

## Project Structure

```
.
├── index.html              # Vite HTML shell
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml
├── vite.config.ts          # Vite + React + Tailwind v4 config, "@" alias → src
├── tsconfig.json
├── .mise.toml              # Node 22 + pnpm toolchain versions
├── .figma/make/            # Figma Make platform scripts (dev/install/deploy)
└── src/
    ├── main.tsx            # React entrypoint
    ├── App.tsx             # All screens, navigation and state
    ├── data.js             # Template library and decision factory
    ├── engine.js           # Scoring, normalization, sensitivity, stability
    ├── explain.js          # Explanation generator ("Why this decision?")
    ├── index.css           # Global styles + Tailwind import
    └── vite-env.d.ts
```

**Key modules**

- `engine.js` is the heart of PRISM: `normalizeValue`, `calculateResults`, `redistributeWeights`, `calculateSensitivity`, `calculateStability`, `formatRaw`.
- `explain.js` turns engine output into a structured explanation (`summary`, `strengths`, `weaknesses`, `tradeoffs`, `risks`, `change`, `insight`).
- `data.js` defines the `templateLibrary`, the `customTemplate`, and `createDecision()`.

---

## How the Scoring Works

PRISM uses a **weighted sum model**. Every criterion value is first normalized to a 0–100 scale so different units (rupees, ratings, percentages, risk levels) can be compared fairly.

### 1. Normalization

| Criterion type | Rule |
| --- | --- |
| **Benefit** (1–10 scale) | `score = value × 10` |
| **Benefit** (other, e.g. percent or currency) | `score = value ÷ highest value among options × 100` |
| **Cost** (lower is better) | `score = lowest value among options ÷ this value × 100` |
| **Risk** (Low / Medium / High) | Low = 100, Medium = 60, High = 20 (numeric risk: `100 − value × 10`) |

### 2. Weighted contribution

```
contribution = normalized score × (weight ÷ 100)
total score  = sum of contributions across all criteria   (0–100)
```

Options are sorted by total score; the highest is the recommendation.

### 3. Weights always total 100%

When one weight is changed, `redistributeWeights` rescales the others proportionally so the total stays at exactly 100%.

### 4. Sensitivity analysis

For each criterion, PRISM sweeps its weight from 0% to 100% (in 1% steps, redistributing the rest) and records the nearest weight at which a different option takes #1. A criterion's **influence** is the normalized gap between the winner and runner-up on that criterion multiplied by its weight:

- **High** influence ≥ 12
- **Medium** influence ≥ 5
- **Low** otherwise

### 5. Decision stability

PRISM shifts each criterion's weight from 0% to 100% in 5% steps and counts how often the original winner stays #1. If the winner holds in **72% or more** of the tests, the decision is labelled **Stable**; otherwise **Sensitive**.

### Worked example (Supplier Selection demo)

| Criterion | Weight | Type |
| --- | --- | --- |
| Price | 30% | Cost |
| Quality | 25% | Benefit |
| Delivery | 20% | Benefit |
| Reliability | 15% | Benefit |
| Risk | 10% | Risk |

| Supplier | Price (₹) | Quality | Delivery | Reliability | Risk |
| --- | --- | --- | --- | --- | --- |
| Supplier A | 7,00,000 | 8 | 7 | 8 | Low |
| Supplier B | 8,40,000 | 9 | 9 | 9 | Low |
| Supplier C | 7,50,000 | 7 | 6 | 6 | Medium |

PRISM scores each supplier, shows exactly how many points each criterion contributed, and uses the Challenge panel to show how the ranking shifts if, for example, price becomes the top priority.

---

## Templates

| Category | Templates |
| --- | --- |
| **Business** | Supplier Selection, Procurement, Vendor Evaluation, Project Prioritization, Investment Comparison, Location Selection, Product Selection |
| **People** | Candidate Evaluation, Hiring, Team Selection, Resource Allocation, Promotion Review |
| **Finance** | Loan Application Analysis, Credit Risk, Investment Options, Budget Allocation |
| **Operations** | Supplier Risk, Inventory, Logistics, Project Risk |
| **Personal** | College Selection, Job Offer Comparison, Car, Apartment, Travel |

Templates with fully pre-filled criteria and sample alternatives: **Supplier Selection, Procurement, Candidate Evaluation, Loan Application Analysis, College Selection, Job Offer Comparison**. The rest start with a sensible default scorecard (Cost, Quality, Strategic Fit, Reliability, Risk) that you can fully edit.

To add your own template, add an entry to the `templates` array in `src/data.js`.

---

## Data Persistence

Currently PRISM runs entirely in the browser:

- The active decision is stored in `localStorage` under `prism-current`.
- The last 12 analyzed decisions are stored under `prism-history`.

No data leaves your device. Clearing browser storage resets the app.

---

## Roadmap

- [ ] FastAPI backend for decision storage and analysis endpoints
- [ ] Supabase database and user authentication
- [ ] LLM-generated explanations (on top of the current rule-based explainer)
- [ ] Persistent, exportable audit trail for every decision and weight change
- [ ] Export results as PDF / CSV
- [ ] Shareable decision links
- [ ] Deployment to Vercel + Render

---

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite dev server with hot reload |
| `pnpm build` | Create a production build in `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm format` | Format the codebase with oxfmt |

---

## License

Add your license here (e.g. MIT).

---

<p align="center"><b>PRISM</b> — see the reasoning, test the decision, trust the outcome.</p>#   B u i l d - t o - S h i p 2  
 
# Blackjack Basic Strategy & Counting Trainer

A sleek, fast web app for drilling **perfect basic strategy** while keeping a
**Hi-Lo running count** — just like a real table.

Pick a round length, set the deal speed, and play. Every hand the app grades
your decision (Hit / Stand / Double / Split / Surrender) against the
mathematically optimal play and tells you _why_. Meanwhile every card that hits
the felt feeds the running count, and the app periodically quizzes you on it.

## Rules modeled

The optimal-play engine is built for the common Las Vegas Strip configuration:

- 6 decks
- Dealer **hits** soft 17 (H17)
- Double after split allowed (DAS)
- Late surrender allowed (LS)

## Features

- **Round lengths:** 20 cards, 40 cards, full deck (52), or a full-shoe run (156).
- **Deal-speed slider:** from leisurely practice to casino speed.
- **Instant feedback:** correct play + a one-line rationale on every hand.
- **Hi-Lo count checks:** optional mid-session prompts plus a final count check.
- **Session summary:** strategy accuracy, count accuracy, best streak, and your
  weakest scenarios (e.g. "Soft 18 vs 9").
- **Lifetime stats** saved locally in your browser.
- **Keyboard shortcuts:** `H` hit, `S` stand, `D` double, `P` split, `R`
  surrender, `Space` to continue.

## Hi-Lo counting

| Cards | Value |
| ----- | ----- |
| 2–6   | +1    |
| 7–9   | 0     |
| 10–A  | −1    |

True count = running count ÷ decks remaining.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run test     # verify the basic-strategy engine
```

## Deploy (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds and publishes on every push
to `main`. To enable it:

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.

The Vite `base` is set to `./` so the build works from any repo/path.

## Tech

React + TypeScript + Vite + Tailwind CSS v4. No backend — everything runs
client-side.

> Built for practice and entertainment. No app can guarantee a win; the house
> edge is real. Play responsibly.

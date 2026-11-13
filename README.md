# HONEYPOT, PLEASE

> The world's most valuable man. The world's least reliable dating pool.

A browser game of document inspection and romantic paranoia. You staff Romantic Perimeter Checkpoint 7 during GTC week. Applicants arrive one at a time. Inspect their documents, compare facts, interrogate them, search the security database, spend a scan, then stamp ACCEPT or REJECT.

- Accept one spy and the run ends: **HONEYPOTTED**.
- Reject too many genuine people and Romantic Stability hits zero: **romantically bankrupt**.
- Survive five days to win.

A work of parody. Every applicant is fictional. Not affiliated with or endorsed by NVIDIA or any real person.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # vitest: rules, content validation, share text, card layout
pnpm build
```

No login, no database, no required environment variables. Progress, achievements and settings live in `localStorage`.

## Deploy to Vercel

Import the repository in Vercel and deploy. Framework preset: Next.js. Nothing else is required.

Optional environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_GAME_URL` | Public URL used in share posts and cards. Inferred from the browser origin when unset. |
| `NEXT_PUBLIC_LAUNCH_TWEET_URL` | When set, share posts link to the launch tweet instead of the game URL. |
| `MEME_ART_API_KEY`, `MEME_ART_BASE_URL`, `MEME_ART_MODEL` | OpenAI-images-compatible provider for stylized card art. |
| `MEME_ART_RUNTIME=1` | Enables the runtime `/api/meme-art` route ("Enhance art" button). Off by default so a public deploy cannot spend credits. |

## Share cards

Cards are drawn on a canvas in the browser (1200×675 and 1080×1080) in five styles: security report, tabloid, classified dossier, board memo, propaganda poster. Art comes from the first source that answers:

1. **Static art** in `public/art/` (already generated and committed). Regenerate with `pnpm art` after putting `MEME_ART_API_KEY` in `.env.local`. Prompts live in `src/share/art/prompts.json`. The script skips keys that already have a file.
2. **Runtime provider** at `/api/meme-art`, only when `MEME_ART_RUNTIME=1`. It accepts a fixed set of art keys, never free text.
3. **Built-in** procedural illustration from the pixel portraits. Always works.

Sharing uses the X web intent, copy to clipboard, image download, and the native share sheet where supported. Nothing posts automatically.

## Layout of the code

| Path | What lives there |
|---|---|
| `src/game/types.ts` | The domain model: cases, documents, facts, discrepancies, events, achievements. |
| `src/game/engine/` | Pure reducer and selectors. Lineup draw, verdicts, discrepancy tool, database search, scan, suspicion, easter eggs. |
| `src/game/config.ts` | Every balance number in one table. |
| `src/game/cases/day1..day5/` | 28 applicants, one file each, plus the day's briefing and directives. |
| `src/game/validate.ts` | Structural rules every case must pass (clues, red herrings, resolvable references). |
| `src/game/content/` | Achievements, ranks, Jensen's lines, headlines, global records and easter eggs. |
| `src/game/achievements/`, `src/game/persistence.ts` | Unlock evaluation and `localStorage`. |
| `src/share/` | Share text templates, X intent, card layout and canvas renderer, art pipeline, share panel. |
| `src/art/` | Procedural pixel art: portraits, Jensen, desk props. |
| `src/ui/`, `src/app/` | The game screens and the Next.js shell. |

## Writing a new case

Add a file exporting a `CaseDef` and list it in the day's `index.ts`. `pnpm test` runs `validateDays`, which rejects a case with fewer than three clues, no red herring, unresolved fact references, or a spy with no contradiction to find. Any pair of facts not listed in `discrepancies` prints "no conflict", so list every pair a sharp player would try.

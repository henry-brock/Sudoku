# Sudoku

A fully-featured Sudoku generator and player built from scratch in vanilla JavaScript — no frameworks, no build step, no dependencies. Every puzzle is generated in-browser and mathematically guaranteed to have a single unique solution.

> A portfolio project demonstrating algorithm design (constraint-satisfaction backtracking), clean separation of concerns, and thoughtful, user-centred interface design — all in ~600 lines of dependency-free code.

## Highlights

- **Custom puzzle-generation engine** — fills a grid with randomized backtracking (MRV heuristic) and carves it down to a puzzle, verifying uniqueness after every removal so no board is ever ambiguous or unsolvable.
- **Four difficulty tiers** — Easy, Medium, Hard, and Very Hard, driven by target clue counts.
- **Zero dependencies** — hand-written HTML, CSS, and JavaScript. Opens straight from the filesystem; runs anywhere a browser does.
- **Separation of concerns** — the solving/generation engine (`sudoku.js`) is completely decoupled from the UI layer (`app.js`) and independently testable in Node.
- **Polished UX** — self-pruning notes, mistake feedback that explains the conflict, live per-digit counters, hints, timer, and full keyboard control.

## Tech stack

| Layer | Technology |
|---|---|
| Logic | Vanilla JavaScript (ES6+), no libraries |
| UI | Semantic HTML + CSS Grid, responsive, dark theme |
| Tooling | None required — static files only |

## Demo

```
./start.sh
```

Starts a local server and opens the app in your browser. (Optional port: `./start.sh 9000`.)

Or open `index.html` directly, or serve the folder with `python3 -m http.server 8765` and visit `http://localhost:8765`.

## Engineering notes

### Guaranteeing a unique solution

Naive generators often produce boards with multiple solutions. This one builds a puzzle by:

1. **Filling** a complete, valid 9×9 grid using randomized backtracking. A minimum-remaining-values (MRV) heuristic always expands the most-constrained cell first, which prunes the search tree dramatically and keeps generation near-instant.
2. **Carving** cells out in random order. After each removal, a solution counter re-solves the board but **short-circuits as soon as it finds a second solution** — all that's needed to prove non-uniqueness. If the puzzle becomes ambiguous, the digit is restored.
3. **Stopping** at the target clue count for the chosen difficulty.

This makes correctness a property of the generator itself rather than something hoped for.

### Difficulty model

Difficulty maps to clue count (Easy 40 → Very Hard ~23). Fewer clues force more advanced logical techniques, but because uniqueness is enforced, every level stays solvable by deduction without guessing.

### UX decisions

- **Notes prune themselves** — placing a correct number removes that candidate from every peer cell's notes (same row, column, and box), mirroring how a person would erase pencil marks.
- **Mistakes teach** — a wrong entry doesn't just turn red; it names the conflict ("5 already appears in this row") before clearing, so the feedback is instructive.
- **Candidate counters** — the number pad shows how many of each digit remain, fading out when a digit is fully placed.

## Project structure

| File | Responsibility |
|---|---|
| `sudoku.js` | Pure logic: grid model, solver, generator, uniqueness check |
| `app.js` | UI state, rendering, input handling, game flow |
| `index.html` | Markup |
| `style.css` | Styling and responsive layout |
| `start.sh` | Convenience launcher |

## Possible extensions

- Persist in-progress games to `localStorage`
- Undo/redo history
- Auto-candidate ("fill all notes") mode
- Shareable puzzle seeds

## License

[MIT](LICENSE) — free to use, modify, and distribute.

# Sudoku

A locally-hosted Sudoku generator and player. Pure HTML/CSS/JS — no build step, no dependencies, no server, and no network connection required. Open one file and play.

## Purpose

This is a complete, self-contained Sudoku game that runs entirely in your browser. Every puzzle is generated on the fly and is guaranteed to have exactly one solution, so you never hit an unsolvable or ambiguous board. It is meant to be something you can drop onto any machine — or host on a tiny static server — and immediately have an endless supply of fair puzzles across four difficulty levels.

## Why it was made

Most free Sudoku sites are cluttered with ads, trackers, and accounts, and many "random" puzzle generators quietly produce boards with multiple solutions. The goals here were:

- **Offline and private** — no accounts, no ads, no analytics, nothing leaves your machine.
- **Correct by construction** — puzzles are verified for a unique solution at generation time rather than pulled from a fixed bank.
- **Zero friction** — a single folder of static files with no toolchain, so it works anywhere a browser does and is easy to read, fork, and modify.
- **Genuinely helpful assists** — notes that prune themselves, mistake feedback that explains *why* an entry is wrong, and per-digit counters, so it supports learning rather than just testing.

## Running it

Easiest way — run the launcher script, which starts a local server and opens the app in your default browser:

```
./start.sh
```

(Optionally pass a port: `./start.sh 9000`.)

Or do it manually: open `index.html` directly in a browser, or serve the folder locally:

```
python3 -m http.server 8765
```

Then visit `http://localhost:8765`.

## Features

- **Four difficulties** — Easy (40 clues), Medium (32), Hard (27), Very Hard (~23).
- **Unique solutions** — every generated puzzle is verified to have exactly one solution.
- **Smart notes** — pencil-mark mode; placing a correct number automatically removes that candidate from the notes of every cell in the same row, column, and box.
- **Explained mistakes** — an incorrect entry flashes, tells you why it's wrong (row / column / box conflict), then clears itself.
- **Per-digit counters** — the number pad shows how many of each digit are still left to place, fading out once a digit is fully used.
- **Hints** — reveal a single correct cell when you're stuck.
- **Check** — highlights incorrect entries without revealing the answers.
- **Solve** — reveals the full solution.
- **Timer and mistake tracking.**
- **Keyboard support** — arrow keys to move, `1`–`9` to fill, `Backspace`/`Delete` to erase.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Styling |
| `sudoku.js` | Puzzle generation and solving engine |
| `app.js` | UI logic and event handling |
| `start.sh` | Launcher: starts a local server and opens the app in your browser |

## How generation works

1. Fill a full 9×9 grid via randomized backtracking, using a minimum-remaining-values (MRV) heuristic to keep it fast.
2. Remove cells one at a time in random order; after each removal, run a solution counter capped at 2. If more than one solution exists, put the digit back. This guarantees every puzzle has exactly one solution.
3. Removal stops once the target clue count for the chosen difficulty is reached (or no more cells can be removed without breaking uniqueness).

Because clue count alone is an approximation of difficulty, the lower-clue levels tend to require more advanced solving techniques, but all levels remain solvable by logic without guessing.

## Browser support

Works in any modern browser (Chrome, Firefox, Safari, Edge). Uses only standard HTML, CSS, and vanilla JavaScript — no frameworks.

## License

Released under the [MIT License](LICENSE) — free to use, modify, and distribute.

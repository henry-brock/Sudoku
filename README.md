# Sudoku

A locally-hosted Sudoku generator and player. Pure HTML/CSS/JS — no build step, no dependencies, no server required.

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

- Four difficulties: Easy (40 clues), Medium (32), Hard (27), Very Hard (~23)
- Every generated puzzle has a unique solution (verified at generation time)
- Pencil-mark notes mode
- Hints, mistake tracking, and a timer
- Check button to highlight incorrect entries without revealing answers
- Solve button to reveal the full solution
- Keyboard support: arrow keys to move, 1-9 to fill, Backspace/Delete to erase

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Styling |
| `sudoku.js` | Puzzle generation and solving engine |
| `app.js` | UI logic and event handling |
| `start.sh` | Launcher: starts a local server and opens the app in your browser |

## How generation works

1. Fill a full 9x9 grid via randomized backtracking (MRV heuristic for speed).
2. Remove cells one at a time in random order; after each removal, run a solution counter capped at 2. If more than one solution exists, put the digit back. This guarantees every puzzle has exactly one solution.
3. Removal stops once the target clue count for the chosen difficulty is reached (or no more cells can be removed without breaking uniqueness).

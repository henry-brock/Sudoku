/* Core Sudoku engine: generation, solving, uniqueness checking.
   Grids are flat arrays of 81 numbers (0 = empty). */

const Sudoku = (() => {
  const SIZE = 9;
  const BOX = 3;

  function emptyGrid() {
    return new Array(81).fill(0);
  }

  function rowOf(i) { return Math.floor(i / SIZE); }
  function colOf(i) { return i % SIZE; }
  function boxOf(i) {
    const r = rowOf(i), c = colOf(i);
    return Math.floor(r / BOX) * BOX + Math.floor(c / BOX);
  }

  function peers(i) {
    const r = rowOf(i), c = colOf(i);
    const result = [];
    for (let k = 0; k < SIZE; k++) {
      if (k !== c) result.push(r * SIZE + k);
      if (k !== r) result.push(k * SIZE + c);
    }
    const br = Math.floor(r / BOX) * BOX, bc = Math.floor(c / BOX) * BOX;
    for (let dr = 0; dr < BOX; dr++) {
      for (let dc = 0; dc < BOX; dc++) {
        const idx = (br + dr) * SIZE + (bc + dc);
        if (idx !== i) result.push(idx);
      }
    }
    return [...new Set(result)];
  }

  const PEER_CACHE = Array.from({ length: 81 }, (_, i) => peers(i));

  function isValidPlacement(grid, i, val) {
    for (const p of PEER_CACHE[i]) {
      if (grid[p] === val) return false;
    }
    return true;
  }

  function shuffledDigits() {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Find the empty cell with fewest legal candidates (MRV heuristic) for speed.
  function findBestEmptyCell(grid) {
    let best = -1;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (grid[i] !== 0) continue;
      let count = 0;
      for (let v = 1; v <= 9; v++) {
        if (isValidPlacement(grid, i, v)) count++;
      }
      if (count < bestCount) {
        bestCount = count;
        best = i;
        if (count === 0) return { index: i, count: 0 };
      }
    }
    return best === -1 ? null : { index: best, count: bestCount };
  }

  function fillGridRandomly(grid) {
    const cell = findBestEmptyCell(grid);
    if (!cell) return true;
    if (cell.count === 0) return false;
    const digits = shuffledDigits();
    for (const val of digits) {
      if (isValidPlacement(grid, cell.index, val)) {
        grid[cell.index] = val;
        if (fillGridRandomly(grid)) return true;
        grid[cell.index] = 0;
      }
    }
    return false;
  }

  function generateSolvedGrid() {
    const grid = emptyGrid();
    fillGridRandomly(grid);
    return grid;
  }

  // Counts solutions up to `limit` (default 2, enough to prove uniqueness).
  function countSolutions(grid, limit = 2) {
    const g = grid.slice();
    let count = 0;

    function backtrack() {
      if (count >= limit) return;
      const cell = findBestEmptyCell(g);
      if (!cell) {
        count++;
        return;
      }
      if (cell.count === 0) return;
      for (let val = 1; val <= 9; val++) {
        if (count >= limit) return;
        if (isValidPlacement(g, cell.index, val)) {
          g[cell.index] = val;
          backtrack();
          g[cell.index] = 0;
        }
      }
    }
    backtrack();
    return count;
  }

  function solve(grid) {
    const g = grid.slice();
    function backtrack() {
      const cell = findBestEmptyCell(g);
      if (!cell) return true;
      if (cell.count === 0) return false;
      for (let val = 1; val <= 9; val++) {
        if (isValidPlacement(g, cell.index, val)) {
          g[cell.index] = val;
          if (backtrack()) return true;
          g[cell.index] = 0;
        }
      }
      return false;
    }
    if (backtrack()) return g;
    return null;
  }

  const DIFFICULTY_CLUES = {
    easy: 40,
    medium: 32,
    hard: 27,
    veryhard: 23,
  };

  // Removes cells from a solved grid while preserving a unique solution,
  // stopping near the target clue count for the requested difficulty.
  function generatePuzzle(difficulty = "medium") {
    const targetClues = DIFFICULTY_CLUES[difficulty] ?? DIFFICULTY_CLUES.medium;
    const solution = generateSolvedGrid();
    const puzzle = solution.slice();

    const order = [...Array(81).keys()];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    let clues = 81;
    for (const idx of order) {
      if (clues <= targetClues) break;
      if (puzzle[idx] === 0) continue;

      const backup = puzzle[idx];
      puzzle[idx] = 0;

      if (countSolutions(puzzle, 2) === 1) {
        clues--;
      } else {
        puzzle[idx] = backup;
      }
    }

    return { puzzle, solution, clues, difficulty };
  }

  return {
    SIZE,
    emptyGrid,
    rowOf,
    colOf,
    boxOf,
    peers: (i) => PEER_CACHE[i],
    isValidPlacement,
    generateSolvedGrid,
    countSolutions,
    solve,
    generatePuzzle,
    DIFFICULTY_CLUES,
  };
})();

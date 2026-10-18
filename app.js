(() => {
  const boardEl = document.getElementById("board");
  const numpadEl = document.getElementById("numpad");
  const difficultySelect = document.getElementById("difficulty");
  const newGameBtn = document.getElementById("newGameBtn");
  const notesBtn = document.getElementById("notesBtn");
  const eraseBtn = document.getElementById("eraseBtn");
  const hintBtn = document.getElementById("hintBtn");
  const checkBtn = document.getElementById("checkBtn");
  const solveBtn = document.getElementById("solveBtn");
  const timerEl = document.getElementById("timer");
  const mistakesEl = document.getElementById("mistakes");
  const currentDifficultyEl = document.getElementById("currentDifficulty");
  const messageEl = document.getElementById("message");
  const winOverlay = document.getElementById("winOverlay");
  const winSummary = document.getElementById("winSummary");
  const winCloseBtn = document.getElementById("winCloseBtn");

  const DIFFICULTY_LABELS = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    veryhard: "Very Hard",
  };

  let state = {
    puzzle: null,
    solution: null,
    given: null,
    values: null,
    notes: null,
    selected: null,
    notesMode: false,
    mistakes: 0,
    startTime: null,
    timerHandle: null,
    solved: false,
    difficulty: "medium",
  };

  function buildBoardDom() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 81; i++) {
      const r = Sudoku.rowOf(i);
      const c = Sudoku.colOf(i);
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = i;
      if (Math.floor(r / 3) % 2 === Math.floor(c / 3) % 2) {
        cell.classList.add("alt-block");
      }
      if (r === 2 || r === 5) cell.classList.add("row-thick-bottom");
      cell.addEventListener("click", () => selectCell(i));
      boardEl.appendChild(cell);
    }
  }

  function buildNumpadDom() {
    numpadEl.innerHTML = "";
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement("button");
      btn.dataset.digit = n;

      const num = document.createElement("span");
      num.className = "num";
      num.textContent = n;

      const count = document.createElement("span");
      count.className = "count";
      count.textContent = "9 left";

      btn.appendChild(num);
      btn.appendChild(count);
      btn.addEventListener("click", () => inputNumber(n));
      numpadEl.appendChild(btn);
    }
  }

  function startTimer() {
    stopTimer();
    state.startTime = Date.now();
    state.timerHandle = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
  }

  function stopTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function updateTimerDisplay() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    timerEl.textContent = `${mm}:${ss}`;
  }

  function newGame(difficulty) {
    setMessage("Generating puzzle...");
    newGameBtn.disabled = true;
    solveBtn.disabled = true;
    // Defer so the message paints before the (synchronous) generation work.
    setTimeout(() => {
      const { puzzle, solution, clues } = Sudoku.generatePuzzle(difficulty);
      state.puzzle = puzzle;
      state.solution = solution;
      state.given = puzzle.map((v) => v !== 0);
      state.values = puzzle.slice();
      state.notes = Array.from({ length: 81 }, () => new Set());
      state.selected = null;
      state.notesMode = false;
      state.mistakes = 0;
      state.solved = false;
      state.difficulty = difficulty;

      notesBtn.classList.remove("active");
      notesBtn.textContent = "Notes: Off";
      mistakesEl.textContent = "0";
      currentDifficultyEl.textContent = DIFFICULTY_LABELS[difficulty];
      setMessage(`New ${DIFFICULTY_LABELS[difficulty]} puzzle — ${clues} clues given.`);

      render();
      startTimer();
      newGameBtn.disabled = false;
      solveBtn.disabled = false;
    }, 30);
  }

  function selectCell(i) {
    if (state.solved) return;
    state.selected = i;
    render();
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function inputNumber(n) {
    if (state.solved || state.selected === null) return;
    const i = state.selected;
    if (state.given[i]) return;

    if (state.notesMode) {
      const set = state.notes[i];
      if (set.has(n)) set.delete(n);
      else set.add(n);
      render();
      return;
    }

    if (n === state.solution[i]) {
      state.values[i] = n;
      state.notes[i].clear();
      clearPeerNotes(i, n);
      render();
      checkWin();
      return;
    }

    // Wrong entry: explain why, flash it, then clear the square.
    state.mistakes++;
    mistakesEl.textContent = state.mistakes;
    state.notes[i].clear();

    const conflict = findConflictType(i, n);
    const reason = conflict
      ? `${n} already appears in this ${conflict}.`
      : `${n} isn't the right number for this square.`;
    setMessage(`Incorrect — ${reason} Square cleared.`);

    state.values[i] = n;
    render();
    const cellEl = boardEl.querySelector(`[data-index="${i}"]`);
    if (cellEl) cellEl.classList.add("error");

    setTimeout(() => {
      if (state.values[i] === n) {
        state.values[i] = 0;
        render();
      }
    }, 600);
  }

  function clearPeerNotes(i, n) {
    for (const p of Sudoku.peers(i)) state.notes[p].delete(n);
  }

  function findConflictType(i, n) {
    const r = Sudoku.rowOf(i);
    const c = Sudoku.colOf(i);
    for (const p of Sudoku.peers(i)) {
      if (state.values[p] === n) {
        if (Sudoku.rowOf(p) === r) return "row";
        if (Sudoku.colOf(p) === c) return "column";
        return "3x3 box";
      }
    }
    return null;
  }

  function eraseCell() {
    if (state.solved || state.selected === null) return;
    const i = state.selected;
    if (state.given[i]) return;
    state.values[i] = 0;
    state.notes[i].clear();
    render();
  }

  function giveHint() {
    if (state.solved) return;
    let target = state.selected;
    if (target === null || state.given[target] || state.values[target] === state.solution[target]) {
      target = null;
      for (let i = 0; i < 81; i++) {
        if (!state.given[i] && state.values[i] !== state.solution[i]) {
          target = i;
          break;
        }
      }
    }
    if (target === null) {
      setMessage("No cells left to hint — you're almost done!");
      return;
    }
    state.values[target] = state.solution[target];
    state.notes[target].clear();
    clearPeerNotes(target, state.solution[target]);
    state.selected = target;
    render();
    const cellEl = boardEl.querySelector(`[data-index="${target}"]`);
    if (cellEl) {
      cellEl.classList.add("hint-flash");
      setTimeout(() => cellEl.classList.remove("hint-flash"), 900);
    }
    checkWin();
  }

  function checkPuzzle() {
    let wrong = 0;
    let empty = 0;
    for (let i = 0; i < 81; i++) {
      if (state.given[i]) continue;
      if (state.values[i] === 0) empty++;
      else if (state.values[i] !== state.solution[i]) wrong++;
    }
    if (wrong === 0 && empty === 0) {
      setMessage("Looks correct — nicely done!");
    } else if (wrong === 0) {
      setMessage(`No mistakes so far. ${empty} cell(s) left to fill.`);
    } else {
      setMessage(`Found ${wrong} mistake(s). Keep going!`);
    }
    render(true);
  }

  function solvePuzzle() {
    state.values = state.solution.slice();
    state.notes.forEach((s) => s.clear());
    state.solved = true;
    stopTimer();
    setMessage("Solved for you. Start a new game to play again.");
    render();
  }

  function checkWin() {
    for (let i = 0; i < 81; i++) {
      if (state.values[i] !== state.solution[i]) return;
    }
    state.solved = true;
    stopTimer();
    winSummary.textContent = `${DIFFICULTY_LABELS[state.difficulty]} solved in ${timerEl.textContent} with ${state.mistakes} mistake(s).`;
    winOverlay.classList.remove("hidden");
    setMessage("Solved!");
  }

  function render(showErrors = false) {
    const cells = boardEl.children;
    const selectedIdx = state.selected;
    const selectedVal = selectedIdx !== null ? state.values[selectedIdx] : 0;

    for (let i = 0; i < 81; i++) {
      const cellEl = cells[i];
      cellEl.classList.remove("selected", "peer", "same-value", "given", "user-value", "error");
      const notesGrid = cellEl.querySelector(".notes-grid");
      if (notesGrid) notesGrid.remove();

      const val = state.values[i];
      const isGiven = state.given[i];

      if (selectedIdx !== null) {
        if (i === selectedIdx) cellEl.classList.add("selected");
        else if (Sudoku.peers(selectedIdx).includes(i)) cellEl.classList.add("peer");
        if (selectedVal !== 0 && val === selectedVal) cellEl.classList.add("same-value");
      }

      if (val !== 0) {
        cellEl.textContent = val;
        cellEl.classList.add(isGiven ? "given" : "user-value");
        if (showErrors && !isGiven && val !== state.solution[i]) {
          cellEl.classList.add("error");
        }
      } else {
        cellEl.textContent = "";
        const notesSet = state.notes[i];
        if (notesSet && notesSet.size > 0) {
          const grid = document.createElement("div");
          grid.className = "notes-grid";
          for (let n = 1; n <= 9; n++) {
            const span = document.createElement("span");
            span.textContent = notesSet.has(n) ? n : "";
            grid.appendChild(span);
          }
          cellEl.appendChild(grid);
        }
      }
    }

    updateNumpadState();
  }

  function updateNumpadState() {
    const counts = new Array(10).fill(0);
    for (const v of state.values) if (v) counts[v]++;
    const buttons = numpadEl.children;
    for (let n = 1; n <= 9; n++) {
      const btn = buttons[n - 1];
      const remaining = 9 - counts[n];
      btn.disabled = remaining <= 0;
      btn.querySelector(".count").textContent = remaining > 0 ? `${remaining} left` : "";
    }
  }

  function toggleNotesMode() {
    state.notesMode = !state.notesMode;
    notesBtn.classList.toggle("active", state.notesMode);
    notesBtn.textContent = `Notes: ${state.notesMode ? "On" : "Off"}`;
  }

  document.addEventListener("keydown", (e) => {
    if (state.selected === null) return;
    if (e.key >= "1" && e.key <= "9") {
      inputNumber(Number(e.key));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      eraseCell();
    } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const r = Sudoku.rowOf(state.selected);
      const c = Sudoku.colOf(state.selected);
      let nr = r, nc = c;
      if (e.key === "ArrowUp") nr = (r + 8) % 9;
      if (e.key === "ArrowDown") nr = (r + 1) % 9;
      if (e.key === "ArrowLeft") nc = (c + 8) % 9;
      if (e.key === "ArrowRight") nc = (c + 1) % 9;
      selectCell(nr * 9 + nc);
    }
  });

  newGameBtn.addEventListener("click", () => newGame(difficultySelect.value));
  difficultySelect.addEventListener("change", () => newGame(difficultySelect.value));
  notesBtn.addEventListener("click", toggleNotesMode);
  eraseBtn.addEventListener("click", eraseCell);
  hintBtn.addEventListener("click", giveHint);
  checkBtn.addEventListener("click", checkPuzzle);
  solveBtn.addEventListener("click", solvePuzzle);
  winCloseBtn.addEventListener("click", () => {
    winOverlay.classList.add("hidden");
    newGame(difficultySelect.value);
  });

  buildBoardDom();
  buildNumpadDom();
  newGame(difficultySelect.value);
})();

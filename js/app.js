import { getQuestions, excludeAnswers, answers, getScoreInPercentage } from "./helper.js";

const categories = [
  { id: 9, name: "General Knowledge" },
  { id: 10, name: "Books" },
  { id: 11, name: "Film" },
  { id: 12, name: "Music" },
  { id: 13, name: "Musicals & Theatres"},
  { id: 14, name: "Television"},
  { id: 15, name: "Video Games"},
  { id: 16, name: "Board Games"},
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Computers" },
  { id: 19, name: "Mathematics" },
  { id: 20, name: "Mythology" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 24, name: "Politics" },
  { id: 25, name: "Art" },
  { id: 26, name: "Celebrities" },
  { id: 27, name: "Animals" },
  { id: 28, name: "Vehicles" },
  { id: 29, name: "Comics" },
  { id: 30, name: "Gadgets" },
  { id: 31, name: "Japanese Anime & Manga" },
  { id: 32, name: "Cartoon & Animations" },
  { id: 23, name: "History" }
];


// DOM
const quizScreen = document.getElementById("quiz-screen");
const startScreen = document.getElementById("start-screen");
const resultScreen = document.getElementById("result-screen");

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const progress = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");

const amountInput = document.getElementById("amount");
const amountValue = document.getElementById("amount-value");

const categorySelect = document.getElementById("category");
const startBtn = document.getElementById("start-btn");

const prevBtn = document.getElementById("prev-btn");
const nextPageBtn = document.getElementById("next-page-btn");

// Populate categories
categories.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.id;
  opt.textContent = c.name;
  categorySelect.appendChild(opt);
});

// STATE
let questions = [];
let current = 0;
let timer;
let selectedAnswer = null;
let userAnswers = [];
let reviewIndex = 0;

// Difficulty buttons
const difficultyButtons = document.querySelectorAll(".difficulty-options button");
let selectedDifficulty = "";

difficultyButtons.forEach(btn => {
  btn.onclick = () => {
    difficultyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.dataset.value;
  };
});

// Slider UI
amountInput.oninput = () => {
  amountValue.textContent = amountInput.value;
};

// 🚀 START QUIZ
startBtn.onclick = async () => {
  const amount = amountInput.value;
  const category = categorySelect.value;
  const difficulty = selectedDifficulty || "";

  if (!amount || amount < 1) {
    alert("Please select a valid number of questions");
    return;
  }

  startBtn.disabled = true;
  startBtn.textContent = "Loading...";

  try {
    const data = await getQuestions(amount, difficulty, category);
    questions = excludeAnswers(data);

    // reset state
    current = 0;
    userAnswers = [];

    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    loadQuestion();
  } catch (err) {
    console.error(err);
    alert("Failed to load questions.");
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = "🚀 Start Quiz";
  }
};

// 📌 LOAD QUESTION
function loadQuestion() {
  resetState();

  const q = questions[current];

  questionEl.innerHTML = q.question;
  progress.textContent = `Q ${current + 1}/${questions.length}`;

  // animation
  quizScreen.classList.add("fade");
  setTimeout(() => quizScreen.classList.remove("fade"), 300);

  q.incorrect_answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.innerHTML = ans;

    btn.onclick = () => selectAnswer(btn, ans);
    answersEl.appendChild(btn);
  });

  startTimer();
}

// 🎯 SELECT ANSWER
function selectAnswer(button, selected) {
  selectedAnswer = selected;

  document.querySelectorAll(".answers button").forEach(btn => {
    btn.classList.remove("selected");
  });

  button.classList.add("selected");

  nextBtn.disabled = false;
}

// 💾 SAVE ANSWER
function saveAnswer() {
  userAnswers.push({
    questionId: questions[current].id,
    selected: selectedAnswer
  });
}

// ⏭ NEXT BUTTON
nextBtn.onclick = () => {
  clearInterval(timer);
  saveAnswer();
  nextQuestion();
};

// 🔁 NEXT FLOW
function nextQuestion() {
  current++;
  selectedAnswer = null;

  if (current < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

// ⏱ TIMER
function startTimer() {
  let time = 30;
  timerEl.textContent = `⏱ ${time}`;

  timer = setInterval(() => {
    time--;
    timerEl.textContent = `⏱ ${time}`;

    if (time === 0) {
      clearInterval(timer);
      saveAnswer();
      nextQuestion();
    }
  }, 1000);
}

// 🔄 RESET UI
function resetState() {
  nextBtn.disabled = true;
  answersEl.innerHTML = "";
}

// 🏁 RESULT + REVIEW
function showResult() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  let finalScore = 0;

  userAnswers.forEach(ans => {
    const correct = answers.find(a => a.id === ans.questionId).answer;
    if (ans.selected === correct) finalScore++;
  });

  const percent = getScoreInPercentage(questions.length, finalScore);

  scoreEl.textContent = `${finalScore}/${questions.length} (${percent}%)`;
  document.getElementById("summary").textContent =
    `You answered ${finalScore} out of ${questions.length} correctly`;

  reviewIndex = 0;
  renderReview();
}

// 📄 RENDER REVIEW (ONE PER PAGE)
function renderReview() {
  const container = document.getElementById("review-container");
  const pageInfo = document.getElementById("page-info");

  container.innerHTML = "";

  const ans = userAnswers[reviewIndex];
  const question = questions[reviewIndex];
  const correct = answers.find(a => a.id === ans.questionId).answer;

  const isCorrect = ans.selected === correct;

  const div = document.createElement("div");
  div.className = `review-item ${isCorrect ? "correct" : "wrong"}`;

  div.innerHTML = `
    <p><strong>Q${reviewIndex + 1}: ${question.question}</strong></p>
    <p>Your Answer: <span>${ans.selected || "No Answer"}</span></p>
    <p>Correct Answer: <span>${correct}</span></p>
  `;

  container.appendChild(div);

  pageInfo.textContent = `Question ${reviewIndex + 1} of ${questions.length}`;

  prevBtn.disabled = reviewIndex === 0;
  nextPageBtn.disabled = reviewIndex === questions.length - 1;
}

// ⬅️➡️ NAVIGATION
prevBtn.onclick = () => {
  if (reviewIndex > 0) {
    reviewIndex--;
    renderReview();
  }
};

nextPageBtn.onclick = () => {
  if (reviewIndex < questions.length - 1) {
    reviewIndex++;
    renderReview();
  }
};

// ⌨️ Keyboard navigation (bonus)
document.addEventListener("keydown", (e) => {
  if (resultScreen.classList.contains("hidden")) return;

  if (e.key === "ArrowRight") nextPageBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
});

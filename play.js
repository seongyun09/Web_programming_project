// 이상형 월드컵: 후보 목록에서 무작위로 뽑아 토너먼트를 진행한다.
// 이미지가 준비되면 각 후보에 image 경로를 넣으면 된다.
const candidates = Array.from({ length: 16 }, (_, i) => ({
  name: `공명자 ${i + 1}`,
  image: "",
  hue: (i * 360) / 16,
}));

const setup = document.getElementById("wc-setup");
const sizeSelect = document.getElementById("wc-size");
const startBtn = document.getElementById("wc-start");
const game = document.getElementById("wc-game");
const roundLabel = document.getElementById("wc-round");
const countLabel = document.getElementById("wc-count");
const progressBar = document.getElementById("wc-progress");
const leftBtn = document.getElementById("wc-left");
const rightBtn = document.getElementById("wc-right");
const result = document.getElementById("wc-result");
const winnerLabel = document.getElementById("wc-winner");
const restartBtn = document.getElementById("wc-restart");

let current = []; // 이번 라운드 참가자
let next = []; // 다음 라운드 진출자
let matchIndex = 0;
let totalMatches = 0;
let playedMatches = 0;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function roundName(size) {
  return size === 2 ? "결승" : `${size}강`;
}

function fillPick(button, candidate) {
  const img = button.querySelector(".wc-img");
  if (candidate.image) {
    img.style.background = `center / cover no-repeat url("${candidate.image}")`;
    img.textContent = "";
  } else {
    img.style.background = `linear-gradient(160deg, hsl(${candidate.hue} 70% 35%), #0a0e17)`;
    img.textContent = candidate.name.slice(-2).trim();
  }
  button.querySelector(".wc-name").textContent = candidate.name;
}

function showMatch() {
  const matchesInRound = current.length / 2;
  roundLabel.textContent = roundName(current.length);
  countLabel.textContent = `${matchIndex + 1} / ${matchesInRound}`;
  progressBar.style.width = `${(playedMatches / totalMatches) * 100}%`;

  fillPick(leftBtn, current[matchIndex * 2]);
  fillPick(rightBtn, current[matchIndex * 2 + 1]);
}

function pick(side) {
  next.push(current[matchIndex * 2 + side]);
  matchIndex++;
  playedMatches++;

  if (matchIndex * 2 < current.length) {
    showMatch();
    return;
  }

  if (next.length === 1) {
    progressBar.style.width = "100%";
    game.hidden = true;
    result.hidden = false;
    winnerLabel.textContent = next[0].name;
    return;
  }

  current = next;
  next = [];
  matchIndex = 0;
  showMatch();
}

function start() {
  const size = Number(sizeSelect.value);
  current = shuffle(candidates).slice(0, size);
  next = [];
  matchIndex = 0;
  playedMatches = 0;
  totalMatches = size - 1;

  setup.hidden = true;
  result.hidden = true;
  game.hidden = false;
  showMatch();
}

startBtn.addEventListener("click", start);
leftBtn.addEventListener("click", () => pick(0));
rightBtn.addEventListener("click", () => pick(1));
restartBtn.addEventListener("click", () => {
  result.hidden = true;
  setup.hidden = false;
});

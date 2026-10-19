// 이상형 월드컵: 후보 중 무작위로 뽑아 토너먼트를 진행한다.
// id는 char.html의 공명자 항목 id와 같아서, 결과 화면에서 소개로 바로 이동할 수 있다.
const candidates = [
  { id: "rover", name: "방랑자", el: "spectro", weapon: "직검" },
  { id: "jinhsi", name: "금희", el: "spectro", weapon: "대검" },
  { id: "changli", name: "장리", el: "fusion", weapon: "직검" },
  { id: "jiyan", name: "기염", el: "aero", weapon: "대검" },
  { id: "yinlin", name: "음림", el: "electro", weapon: "증폭기" },
  { id: "calcharo", name: "카카루", el: "electro", weapon: "대검" },
  { id: "encore", name: "앙코", el: "fusion", weapon: "증폭기" },
  { id: "verina", name: "벨리나", el: "spectro", weapon: "증폭기" },
  { id: "lingyang", name: "능양", el: "glacio", weapon: "권갑" },
  { id: "jianxin", name: "감심", el: "aero", weapon: "권갑" },
  { id: "camellya", name: "카멜리아", el: "havoc", weapon: "직검" },
  { id: "carlotta", name: "카를로타", el: "glacio", weapon: "권총" },
  { id: "shorekeeper", name: "파수인", el: "spectro", weapon: "증폭기" },
  { id: "xiangliyao", name: "상리요", el: "electro", weapon: "권갑" },
  { id: "zhezhi", name: "절지", el: "glacio", weapon: "증폭기" },
  { id: "phoebe", name: "페비", el: "spectro", weapon: "증폭기" },
];

const ELEMENT_NAMES = {
  spectro: "회절",
  fusion: "용융",
  glacio: "응결",
  aero: "기류",
  electro: "전도",
  havoc: "인멸",
};

// 카드 그림: 기본은 images/emblems/<id>.svg 문장 카드.
// images/characters/<id>.png 사진이 있으면 그 사진을 대신 쓴다.
candidates.forEach((candidate) => {
  candidate.art = `images/emblems/${candidate.id}.svg`;
  const img = new Image();
  img.onload = () => (candidate.art = img.src);
  img.src = `images/characters/${candidate.id}.png`;
});

// 고른 쪽을 잠깐 보여 준 뒤 다음 대결로 넘어가는 시간
const PICK_DELAY = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;

const setup = document.getElementById("wc-setup");
const sizeSelect = document.getElementById("wc-size");
const startBtn = document.getElementById("wc-start");
const game = document.getElementById("wc-game");
const roundLabel = document.getElementById("wc-round");
const countLabel = document.getElementById("wc-count");
const progressBar = document.getElementById("wc-progress");
const picks = [document.getElementById("wc-left"), document.getElementById("wc-right")];
const result = document.getElementById("wc-result");
const resultTitle = document.getElementById("wc-result-title");
const winnerLabel = document.getElementById("wc-winner");
const winnerArt = document.getElementById("wc-art");
const profileLink = document.getElementById("wc-profile");
const restartBtn = document.getElementById("wc-restart");

let current = []; // 이번 라운드 참가자
let next = []; // 다음 라운드 진출자
let matchIndex = 0;
let totalMatches = 0;
let playedMatches = 0;
let busy = false;

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
  button.dataset.el = candidate.el;
  button.classList.remove("is-picked", "is-dropped");
  button.disabled = false;
  button.querySelector(".wc-face").style.backgroundImage = `url("${candidate.art}")`;

  const name = button.querySelector(".wc-name");
  name.textContent = candidate.name;
  const sub = document.createElement("small");
  sub.textContent = `${ELEMENT_NAMES[candidate.el]} ${candidate.weapon}`;
  name.appendChild(sub);

  button.setAttribute("aria-label", `${candidate.name} 고르기`);
}

function showMatch() {
  const matchesInRound = current.length / 2;
  roundLabel.textContent = roundName(current.length);
  countLabel.textContent = `${matchIndex + 1} / ${matchesInRound}`;
  progressBar.style.width = `${(playedMatches / totalMatches) * 100}%`;

  fillPick(picks[0], current[matchIndex * 2]);
  fillPick(picks[1], current[matchIndex * 2 + 1]);
}

function showResult(winner) {
  progressBar.style.width = "100%";
  game.hidden = true;
  result.hidden = false;

  winnerLabel.textContent = winner.name;
  winnerArt.dataset.el = winner.el;
  winnerArt.style.backgroundImage = `url("${winner.art}")`;
  profileLink.href = `char.html#${winner.id}`;
  // 고정 헤더에 가리지 않게 먼저 스크롤한 뒤 포커스를 옮긴다.
  result.scrollIntoView({ block: "start" });
  resultTitle.focus({ preventScroll: true });
}

function advance(side) {
  next.push(current[matchIndex * 2 + side]);
  matchIndex++;
  playedMatches++;

  if (matchIndex * 2 < current.length) {
    showMatch();
    return;
  }

  if (next.length === 1) {
    showResult(next[0]);
    return;
  }

  current = next;
  next = [];
  matchIndex = 0;
  showMatch();
}

function pick(side) {
  if (busy) return;
  busy = true;

  picks[side].classList.add("is-picked");
  picks[1 - side].classList.add("is-dropped");
  picks.forEach((button) => (button.disabled = true));

  setTimeout(() => {
    busy = false;
    advance(side);
    if (!game.hidden) picks[side].focus();
  }, PICK_DELAY);
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
  picks[0].focus();
}

startBtn.addEventListener("click", start);
picks.forEach((button, side) => button.addEventListener("click", () => pick(side)));
restartBtn.addEventListener("click", () => {
  result.hidden = true;
  setup.hidden = false;
  startBtn.focus();
});

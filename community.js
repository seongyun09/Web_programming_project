// 커뮤니티 게시판: 글은 브라우저(localStorage)에만 저장된다.
const STORAGE_KEY = "wuwa-community-posts";

const samplePosts = [
  {
    id: 1,
    category: "리뷰",
    author: "제작자",
    title: "명조 첫 플레이 후기",
    content: "제작자 플레이 리뷰를 작성할 자리입니다.",
    date: "2026-10-12",
  },
];

const form = document.getElementById("post-form");
const list = document.getElementById("post-list");
const filterBar = document.getElementById("filter-bar");
let currentFilter = "전체";

function loadPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : samplePosts;
  } catch (e) {
    return samplePosts;
  }
}

function savePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    // 저장이 막힌 환경(시크릿 모드 등)에서는 화면에만 표시한다.
  }
}

let posts = loadPosts();

function render() {
  list.innerHTML = "";
  const visible = posts.filter(
    (post) => currentFilter === "전체" || post.category === currentFilter
  );

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "아직 글이 없습니다. 첫 글을 남겨 주세요!";
    list.appendChild(empty);
    return;
  }

  visible.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.dataset.cat = post.category;
    tag.textContent = post.category;

    const info = document.createElement("span");
    info.textContent = `${post.author} · ${post.date}`;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "post-delete";
    del.textContent = "삭제";
    del.addEventListener("click", () => {
      posts = posts.filter((p) => p.id !== post.id);
      savePosts(posts);
      render();
    });

    meta.append(tag, info, del);

    const title = document.createElement("h3");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.textContent = post.content;

    article.append(meta, title, content);
    list.appendChild(article);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  posts.unshift({
    id: Date.now(),
    category: data.get("category"),
    author: data.get("author").trim(),
    title: data.get("title").trim(),
    content: data.get("content").trim(),
    date: new Date().toISOString().slice(0, 10),
  });

  savePosts(posts);
  form.reset();
  render();
});

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  currentFilter = button.dataset.filter;
  filterBar.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b === button);
  });
  render();
});

render();

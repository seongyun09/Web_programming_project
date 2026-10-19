// 커뮤니티 게시판: 글은 브라우저(localStorage)에만 저장된다.
const STORAGE_KEY = "wuwa-community-posts";

const samplePosts = [
  {
    id: 1,
    category: "리뷰",
    author: "제작자",
    title: "명조 첫 플레이 후기",
    content: "회피 반격이 손에 붙기 시작하니까 전투가 확 재밌어졌어요. 금주 메인 스토리도 생각보다 몰입감 있었고요.",
    date: "2026-10-12",
  },
];

const form = document.getElementById("post-form");
const list = document.getElementById("post-list");
const filterBar = document.getElementById("filter-bar");
const status = document.getElementById("post-status");
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

function render(newId) {
  list.innerHTML = "";
  const visible = posts.filter(
    (post) => currentFilter === "전체" || post.category === currentFilter
  );

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent =
      currentFilter === "전체"
        ? "아직 글이 없어요. 위에서 첫 글을 올려 보세요."
        : `${currentFilter} 글이 아직 없어요. 위에서 첫 글을 올려 보세요.`;
    list.appendChild(empty);
    return;
  }

  visible.forEach((post) => {
    const item = document.createElement("li");
    item.className = post.id === newId ? "post is-new" : "post";

    const head = document.createElement("div");
    head.className = "post-head";

    const cat = document.createElement("span");
    cat.className = "post-cat";
    cat.dataset.cat = post.category;
    cat.textContent = post.category;

    const author = document.createElement("span");
    author.textContent = post.author;

    const date = document.createElement("time");
    date.dateTime = post.date;
    date.textContent = post.date;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "post-delete";
    del.textContent = "삭제";
    del.setAttribute("aria-label", `"${post.title}" 글 삭제`);
    del.addEventListener("click", () => {
      if (!confirm("이 글을 삭제할까요? 삭제한 글은 되돌릴 수 없어요.")) return;
      posts = posts.filter((p) => p.id !== post.id);
      savePosts(posts);
      render();
      status.textContent = "글을 삭제했어요.";
    });

    head.append(cat, author, date, del);

    const title = document.createElement("h3");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.textContent = post.content;

    item.append(head, title, content);
    list.appendChild(item);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const post = {
    id: Date.now(),
    category: data.get("category"),
    author: data.get("author").trim(),
    title: data.get("title").trim(),
    content: data.get("content").trim(),
    date: new Date().toISOString().slice(0, 10),
  };
  posts.unshift(post);

  savePosts(posts);
  form.reset();

  // 새 글이 보이도록 거르기를 '전체'로 되돌린다.
  currentFilter = "전체";
  filterBar.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.filter === "전체"));
  });
  render(post.id);
  status.textContent = "글을 올렸어요.";
});

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  currentFilter = button.dataset.filter;
  filterBar.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b === button));
  });
  render();
});

render();

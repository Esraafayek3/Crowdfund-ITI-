let posts = [];
let currentPage = 1;
let rowsPerPage = 10; 


async function loadData() {
  let res = await fetch("https://jsonplaceholder.typicode.com/posts");
  posts = await res.json();
  displayTable();
}

function displayTable() {
  let tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  let searchinput = searchBox.value.toLowerCase();
  let filtered = posts.filter(p => p.title.toLowerCase().includes(searchinput))


  let start = (currentPage - 1) * rowsPerPage;
  let pageItems = filtered.slice(start, start + rowsPerPage);

  
  for (let p of pageItems) {
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.title}</td>
        <td>${p.body}</td>
        <td>
          <button onclick="readPost(${p.id})">Read</button>
          <button onclick="editPost(${p.id})">Edit</button>
          <button onclick="deletePost(${p.id})">Delete</button>
        </td>
      </tr>`;
  }

  setupPagination(filtered);
}


function setupPagination(data) {
  let div = document.getElementById("pagination");
  div.innerHTML = "";
  let pages = Math.ceil(data.length / rowsPerPage);

  for (let i = 1; i <= pages; i++) {
    let btn = document.createElement("button");
    btn.innerText = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => { currentPage = i; displayTable(); }
    div.appendChild(btn);
  }
}

function showCreateForm() {
  document.getElementById("formContainer").style.display = "block";
  document.getElementById("formTitle").innerText = "Create Post";
  postId.value = "";
  postTitle.value = "";
  postBody.value = "";
}

function readPost(id) {
  let post = posts.find(p => p.id === id);
  alert(`ID: ${post.id}\nTitle: ${post.title}\nBody: ${post.body}`);
}

function editPost(id) {
  let post = posts.find(p => p.id === id);
  document.getElementById("formContainer").style.display = "block";
  document.getElementById("formTitle").innerText = "Edit Post";
  postId.value = post.id;
  postTitle.value = post.title;
  postBody.value = post.body;
}

function deletePost(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    displayTable();
  }
}

function savePost() {
  let id = postId.value;
  let title = postTitle.value;
  let body = postBody.value;

  if (id) {
   
    let post = posts.find(p => p.id == id);
    post.title = title;
    post.body = body;
  } else {
    // إضافة
    let newId = posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    posts.push({ id: newId, title, body });
  }

  cancelForm();
  displayTable();
}

function cancelForm() {
  document.getElementById("formContainer").style.display = "none";
}


searchBox.addEventListener("input", () => {
  currentPage = 1;
  displayTable();
});

loadData();
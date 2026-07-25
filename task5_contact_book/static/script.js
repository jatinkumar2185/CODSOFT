const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const state = {
  contacts: [],
  query: "",
  letter: "",
  editingId: null,
  deletingId: null,
};

const el = {
  alphaTabs: document.getElementById("alphaTabs"),
  allTab: document.querySelector(".tab-all"),
  cardGrid: document.getElementById("cardGrid"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  addBtn: document.getElementById("addBtn"),

  modalBackdrop: document.getElementById("modalBackdrop"),
  cardForm: document.getElementById("cardForm"),
  modalTitle: document.getElementById("modalTitle"),
  fieldName: document.getElementById("fieldName"),
  fieldPhone: document.getElementById("fieldPhone"),
  fieldEmail: document.getElementById("fieldEmail"),
  fieldAddress: document.getElementById("fieldAddress"),
  fieldId: document.getElementById("fieldId"),
  cancelBtn: document.getElementById("cancelBtn"),
  formError: document.getElementById("formError"),

  confirmBackdrop: document.getElementById("confirmBackdrop"),
  confirmText: document.getElementById("confirmText"),
  confirmCancel: document.getElementById("confirmCancel"),
  confirmDelete: document.getElementById("confirmDelete"),
};

// ---------------------------------------------------------------- alphabet
function buildAlphaTabs() {
  el.alphaTabs.innerHTML = "";
  ALPHABET.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.dataset.letter = letter;
    btn.textContent = letter;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => setLetter(letter));
    el.alphaTabs.appendChild(btn);
  });
}

function setLetter(letter) {
  state.letter = state.letter === letter ? "" : letter;
  syncTabButtons();
  loadContacts();
}

function syncTabButtons() {
  el.allTab.setAttribute("aria-pressed", String(state.letter === ""));
  el.alphaTabs.querySelectorAll(".tab").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.letter === state.letter));
  });
}

function refreshAvailableLetters() {
  const present = new Set(state.contacts.map((c) => (c.name[0] || "").toUpperCase()));
  el.alphaTabs.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("tab-empty", !present.has(btn.dataset.letter));
  });
}

// ---------------------------------------------------------------- data
async function loadContacts() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.letter) params.set("letter", state.letter);

  const res = await fetch(`/api/contacts?${params.toString()}`);
  state.contacts = await res.json();
  renderCards();
}

async function loadAllForLetterCounts() {
  // Fetch the unfiltered set once to know which letters have contacts.
  const res = await fetch("/api/contacts");
  const all = await res.json();
  const present = new Set(all.map((c) => (c.name[0] || "").toUpperCase()));
  el.alphaTabs.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("tab-empty", !present.has(btn.dataset.letter));
  });
}

// ---------------------------------------------------------------- render
function renderCards() {
  el.cardGrid.innerHTML = "";

  if (state.contacts.length === 0) {
    el.emptyState.hidden = false;
    el.emptyState.textContent = state.query || state.letter
      ? "No cards match that search. Try another name, number, or letter."
      : "";
    if (!(state.query || state.letter)) {
      el.emptyState.innerHTML = 'This drawer is empty. Punch in your first card with the <strong>+ New Card</strong> button.';
    }
    return;
  }
  el.emptyState.hidden = true;

  state.contacts.forEach((c) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-name">${escapeHtml(c.name)}</div>
      <div class="card-row"><span class="label">Phone</span><span class="value">${escapeHtml(c.phone)}</span></div>
      ${c.email ? `<div class="card-row"><span class="label">Email</span><span class="value">${escapeHtml(c.email)}</span></div>` : ""}
      ${c.address ? `<div class="card-row address"><span class="label">Address</span><span class="value">${escapeHtml(c.address)}</span></div>` : ""}
      <div class="card-actions">
        <button class="icon-btn edit-btn">Edit</button>
        <button class="icon-btn danger delete-btn">Delete</button>
      </div>
    `;
    card.querySelector(".edit-btn").addEventListener("click", () => openEditModal(c));
    card.querySelector(".delete-btn").addEventListener("click", () => openConfirmModal(c));
    el.cardGrid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------- add/edit modal
function openAddModal() {
  state.editingId = null;
  el.modalTitle.textContent = "New Card";
  el.cardForm.reset();
  el.fieldId.value = "";
  el.formError.hidden = true;
  el.modalBackdrop.hidden = false;
  el.fieldName.focus();
}

function openEditModal(contact) {
  state.editingId = contact.id;
  el.modalTitle.textContent = "Edit Card";
  el.fieldName.value = contact.name;
  el.fieldPhone.value = contact.phone;
  el.fieldEmail.value = contact.email;
  el.fieldAddress.value = contact.address;
  el.fieldId.value = contact.id;
  el.formError.hidden = true;
  el.modalBackdrop.hidden = false;
  el.fieldName.focus();
}

function closeModal() {
  el.modalBackdrop.hidden = true;
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    name: el.fieldName.value.trim(),
    phone: el.fieldPhone.value.trim(),
    email: el.fieldEmail.value.trim(),
    address: el.fieldAddress.value.trim(),
  };

  if (!payload.name || !payload.phone) {
    el.formError.textContent = "Name and phone are required.";
    el.formError.hidden = false;
    return;
  }

  const id = el.fieldId.value;
  const url = id ? `/api/contacts/${id}` : "/api/contacts";
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    el.formError.textContent = body.error || "Something went wrong saving that card.";
    el.formError.hidden = false;
    return;
  }

  closeModal();
  await loadContacts();
  await loadAllForLetterCounts();
}

// ---------------------------------------------------------------- delete modal
function openConfirmModal(contact) {
  state.deletingId = contact.id;
  el.confirmText.textContent = `This removes ${contact.name} for good.`;
  el.confirmBackdrop.hidden = false;
}

function closeConfirmModal() {
  el.confirmBackdrop.hidden = true;
  state.deletingId = null;
}

async function handleDelete() {
  if (!state.deletingId) return;
  await fetch(`/api/contacts/${state.deletingId}`, { method: "DELETE" });
  closeConfirmModal();
  await loadContacts();
  await loadAllForLetterCounts();
}

// ---------------------------------------------------------------- search
let searchTimer = null;
function handleSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = el.searchInput.value.trim();
    loadContacts();
  }, 180);
}

// ---------------------------------------------------------------- wiring
el.allTab.addEventListener("click", () => setLetter(""));
el.searchInput.addEventListener("input", handleSearchInput);
el.addBtn.addEventListener("click", openAddModal);
el.cancelBtn.addEventListener("click", closeModal);
el.cardForm.addEventListener("submit", handleSubmit);
el.modalBackdrop.addEventListener("click", (e) => { if (e.target === el.modalBackdrop) closeModal(); });

el.confirmCancel.addEventListener("click", closeConfirmModal);
el.confirmDelete.addEventListener("click", handleDelete);
el.confirmBackdrop.addEventListener("click", (e) => { if (e.target === el.confirmBackdrop) closeConfirmModal(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeConfirmModal();
  }
});

// ---------------------------------------------------------------- init
buildAlphaTabs();
syncTabButtons();
loadContacts().then(loadAllForLetterCounts);

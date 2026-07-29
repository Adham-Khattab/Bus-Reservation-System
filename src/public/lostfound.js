(() => {
  const rowEl = document.getElementById("lostfoundRow");
  const overlay = document.getElementById("uploadModalOverlay");
  const closeBtn = document.getElementById("uploadModalClose");
  const itemNameInput = document.getElementById("itemNameInput");
  const busNumberInput = document.getElementById("busNumberInput");
  const fileInput = document.getElementById("modalFileInput");
  const uploadBox = document.getElementById("modalUploadBox");
  const preview = document.getElementById("modalPreview");
  const errorEl = document.getElementById("modalError");
  const submitBtn = document.getElementById("modalSubmit");

  const items = [];

  const MAX_SIZE_MB = 5;
  const NUM_UPLOAD_SLOTS = 10;
  let pendingFile = null;
  let activeCard = null;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderFilledCard(item) {
    return `
            <div class="lostfound-card upload-slot filled">
                <div class="item-info">
                    <div><strong>Item-description:</strong> ${escapeHtml(item.description)}</div>
                    <div><strong>Bus Number:</strong> ${escapeHtml(item.busNumber)}</div>
                </div>
            </div>
        `;
  }

  function renderUploadSlot(index) {
    return `
            <div class="lostfound-card upload-slot" data-index="${index}">
                <span class="upload-label">
                    Upload item:
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <p class="upload-hint">Images must be in JPG or PNG format and not exceed ${MAX_SIZE_MB} MB.</p>
            </div>
        `;
  }

  function bindUploadSlots() {
    rowEl.querySelectorAll(".upload-slot:not(.filled)").forEach((card) => {
      card.addEventListener("click", () => openModal(card));
    });
  }

  function render() {
    const filledHtml = items.map(renderFilledCard).join("");
    const uploadHtml = Array.from({ length: NUM_UPLOAD_SLOTS }, (_, i) =>
      renderUploadSlot(i),
    ).join("");
    rowEl.innerHTML = filledHtml + uploadHtml;
    bindUploadSlots();
  }

  function openModal(card) {
    activeCard = card;
    itemNameInput.value = "";
    busNumberInput.value = "";
    fileInput.value = "";
    preview.hidden = true;
    preview.src = "";
    errorEl.hidden = true;
    pendingFile = null;
    overlay.hidden = false;
  }

  function closeModal() {
    overlay.hidden = true;
    activeCard = null;
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  uploadBox.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    errorEl.hidden = true;

    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    const maxBytes = MAX_SIZE_MB * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      errorEl.textContent = "Please upload a JPG or PNG image.";
      errorEl.hidden = false;
      fileInput.value = "";
      pendingFile = null;
      return;
    }

    if (file.size > maxBytes) {
      errorEl.textContent = `File exceeds ${MAX_SIZE_MB} MB.`;
      errorEl.hidden = false;
      fileInput.value = "";
      pendingFile = null;
      return;
    }

    pendingFile = file;
    const reader = new FileReader();
    reader.onload = (evt) => {
      preview.src = evt.target.result;
      preview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  submitBtn.addEventListener("click", async () => {
    const name = itemNameInput.value.trim();
    const busNumber = busNumberInput.value.trim();

    if (!name || !busNumber) {
      errorEl.textContent = "Please fill in all fields.";
      errorEl.hidden = false;
      return;
    }

    try {
      const formData = new FormData();

      formData.append("description", name);
      formData.append("bus_number", busNumber);

      if (pendingFile) {
        formData.append("photo", pendingFile);
      }

      const res = await fetch("/api/lost-found", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save item.");
      }

      const savedItem = await res.json();

      if (activeCard) {
        activeCard.outerHTML = renderFilledCard({
          description: savedItem.description,
          busNumber: savedItem.bus_number,
        });
        bindUploadSlots();
      }
      closeModal();
    } catch (err) {
      errorEl.textContent =
        err.message || "Something went wrong. Please try again.";
      errorEl.hidden = false;
    }
  });

  render();
})();

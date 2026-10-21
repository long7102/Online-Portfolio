(() => {
  const groups = window.highwayGalleryGroups;
  const container = document.getElementById("gallery-groups");
  const dialog = document.getElementById("gallery-dialog");
  if (!Array.isArray(groups) || !container || !dialog) return;

  const image = dialog.querySelector(".gallery-full-image");
  const title = dialog.querySelector("#gallery-dialog-title");
  const position = dialog.querySelector(".gallery-position");
  const fullImage = dialog.querySelector(".gallery-open-image");
  const previous = dialog.querySelector(".gallery-prev");
  const next = dialog.querySelector(".gallery-next");
  const close = dialog.querySelector(".gallery-close");
  let groupIndex = 0;
  let imageIndex = 0;
  let trigger = null;
  let oldOverflow = "";

  groups.forEach((group, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-group";
    button.setAttribute("aria-label", `Mở ${group.title}, ${group.images.length} ảnh`);

    const cover = document.createElement("img");
    cover.src = group.cover;
    cover.alt = "";
    cover.loading = "lazy";
    cover.decoding = "async";

    const copy = document.createElement("span");
    copy.className = "gallery-group-copy";
    const number = document.createElement("span");
    number.className = "gallery-group-number";
    number.textContent = `${String(index + 1).padStart(2, "0")} / ${group.images.length} ảnh`;
    const name = document.createElement("strong");
    name.className = "gallery-group-title";
    name.textContent = group.title;
    const description = document.createElement("span");
    description.className = "gallery-group-description";
    description.textContent = group.description;
    copy.append(number, name, description);
    button.append(cover, copy);
    button.addEventListener("click", () => openGroup(index, button));
    container.append(button);
  });

  function render() {
    const group = groups[groupIndex];
    const url = group.images[imageIndex];
    image.src = url;
    image.alt = `Highway Menswear · ${group.title} · ảnh ${imageIndex + 1} trên ${group.images.length}`;
    title.textContent = group.title;
    position.textContent = `${String(imageIndex + 1).padStart(2, "0")} / ${String(group.images.length).padStart(2, "0")}`;
    fullImage.href = url;
    previous.disabled = imageIndex === 0;
    next.disabled = imageIndex === group.images.length - 1;
    if (group.images[imageIndex + 1]) {
      const preload = new Image();
      preload.src = group.images[imageIndex + 1];
    }
  }

  function openGroup(index, button) {
    groupIndex = index;
    imageIndex = 0;
    trigger = button;
    oldOverflow = document.body.style.overflow;
    render();
    dialog.showModal();
    document.body.style.overflow = "hidden";
    close.focus();
  }

  function move(step) {
    const target = imageIndex + step;
    if (target < 0 || target >= groups[groupIndex].images.length) return;
    imageIndex = target;
    render();
  }

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = oldOverflow;
    image.removeAttribute("src");
    trigger?.focus();
  });

  let touchStartX = null;
  dialog.querySelector(".gallery-stage").addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  dialog.querySelector(".gallery-stage").addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });
})();


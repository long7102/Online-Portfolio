(() => {
  const groups = window.highwayGalleryGroups;
  const container = document.getElementById("gallery-groups");
  const dialog = document.getElementById("gallery-dialog");
  if (!Array.isArray(groups) || !container || !dialog) return;

  const stack = dialog.querySelector(".gallery-image-stack");
  const layers = [...stack.querySelectorAll(".gallery-full-image")];
  const thumbnails = dialog.querySelector(".gallery-thumbnails");
  const title = dialog.querySelector("#gallery-dialog-title");
  const position = dialog.querySelector(".gallery-position");
  const fullImage = dialog.querySelector(".gallery-open-image");
  const previous = dialog.querySelector(".gallery-prev");
  const next = dialog.querySelector(".gallery-next");
  const close = dialog.querySelector(".gallery-close");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let groupIndex = 0;
  let imageIndex = 0;
  let activeLayer = 0;
  let transitionVersion = 0;
  let trigger = null;
  let oldOverflow = "";

  groups.forEach((group, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-group";
    const kind = group.id === "cover-story" ? "ảnh bìa" : "ảnh";
    button.setAttribute("aria-label", `Mở ${group.title}, ${group.images.length} ${kind}`);

    const cover = document.createElement("img");
    cover.src = group.cover;
    cover.alt = "";
    cover.loading = "lazy";
    cover.decoding = "async";

    const copy = document.createElement("span");
    copy.className = "gallery-group-copy";
    const meta = document.createElement("span");
    meta.className = "gallery-group-number";
    const setNumber = document.createElement("span");
    setNumber.textContent = `Bộ ${String(index + 1).padStart(2, "0")}`;
    const imageCount = document.createElement("span");
    imageCount.textContent = `${group.images.length} ${kind}`;
    meta.append(setNumber, imageCount);
    const name = document.createElement("strong");
    name.className = "gallery-group-title";
    name.textContent = group.title;
    const description = document.createElement("span");
    description.className = "gallery-group-description";
    description.textContent = group.description;
    copy.append(meta, name, description);
    button.append(cover, copy);
    button.addEventListener("click", () => openGroup(index, button));
    container.append(button);
  });

  function buildThumbnails(group) {
    const buttons = group.images.map((url, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-thumb";
      button.setAttribute("aria-label", `Xem ảnh ${index + 1} trong bộ ${group.title}`);
      const preview = document.createElement("img");
      preview.src = url;
      preview.alt = "";
      preview.loading = "lazy";
      preview.decoding = "async";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      button.append(preview, number);
      button.addEventListener("click", () => {
        if (index === imageIndex) return;
        const direction = index > imageIndex ? "next" : "prev";
        imageIndex = index;
        showImage(true, direction);
      });
      return button;
    });
    thumbnails.replaceChildren(...buttons);
  }

  function updateInterface(group, url) {
    title.textContent = group.title;
    position.textContent = `${String(imageIndex + 1).padStart(2, "0")} / ${String(group.images.length).padStart(2, "0")}`;
    fullImage.href = url;
    previous.disabled = imageIndex === 0;
    next.disabled = imageIndex === group.images.length - 1;
    const buttons = thumbnails.querySelectorAll(".gallery-thumb");
    buttons.forEach((button, index) => {
      if (index === imageIndex) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    const selected = buttons[imageIndex];
    if (selected && thumbnails.clientWidth) {
      thumbnails.scrollTo({
        left: selected.offsetLeft - thumbnails.offsetLeft - (thumbnails.clientWidth - selected.clientWidth) / 2,
        behavior: reducedMotion.matches ? "instant" : "smooth"
      });
    }
    if (group.images[imageIndex + 1]) {
      const preload = new Image();
      preload.src = group.images[imageIndex + 1];
    }
  }

  function showImage(animate, direction = "next") {
    const group = groups[groupIndex];
    const url = group.images[imageIndex];
    const alt = `Highway Menswear · ${group.title} · ảnh ${imageIndex + 1} trên ${group.images.length}`;
    updateInterface(group, url);
    const version = ++transitionVersion;
    if (!animate || reducedMotion.matches) {
      layers.forEach((layer) => layer.classList.remove("is-active", "is-leaving"));
      activeLayer = 0;
      layers[0].src = url;
      layers[0].alt = alt;
      layers[0].classList.add("is-active");
      layers[1].removeAttribute("src");
      return;
    }

    const outgoing = layers[activeLayer];
    const incomingIndex = 1 - activeLayer;
    const incoming = layers[incomingIndex];
    stack.dataset.direction = direction;
    incoming.classList.remove("is-active", "is-leaving");
    incoming.src = url;
    incoming.alt = alt;
    incoming.decode().catch(() => {}).then(() => {
      if (version !== transitionVersion || !dialog.open) return;
      requestAnimationFrame(() => {
        if (version !== transitionVersion || !dialog.open) return;
        outgoing.classList.remove("is-active");
        outgoing.classList.add("is-leaving");
        incoming.classList.add("is-active");
        activeLayer = incomingIndex;
      });
    });
  }

  function openGroup(index, button) {
    groupIndex = index;
    imageIndex = 0;
    activeLayer = 0;
    trigger = button;
    oldOverflow = document.body.style.overflow;
    buildThumbnails(groups[index]);
    showImage(false);
    dialog.showModal();
    document.body.style.overflow = "hidden";
    close.focus();
  }

  function move(step) {
    const target = imageIndex + step;
    if (target < 0 || target >= groups[groupIndex].images.length) return;
    imageIndex = target;
    showImage(true, step > 0 ? "next" : "prev");
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
    ++transitionVersion;
    document.body.style.overflow = oldOverflow;
    layers.forEach((layer) => {
      layer.classList.remove("is-active", "is-leaving");
      layer.removeAttribute("src");
    });
    thumbnails.replaceChildren();
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


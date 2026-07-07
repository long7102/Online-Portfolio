'use strict';
document.addEventListener("DOMContentLoaded", function () {
  // Xóa class light-mode ngay lập tức khi trang vừa load để ép Dark Mode
  document.body.classList.remove("light-mode");
  
  // Tùy chọn: Xóa luôn lưu trữ trạng thái cũ nếu muốn "ép" 100% Dark Mode
  // localStorage.removeItem('theme'); 
});
// 1. HÀM TOGGLE PHẦN TỬ CHUNG
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }


// 2. LOGIC SIDEBAR (MOBILE)
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}


// 3. LOGIC MODAL ĐÁNH GIÁ (TESTIMONIALS)
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    testimonialsModalFunc();
  });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);


// 4. LOGIC BỘ LỌC DỰ ÁN (FILTER & CUSTOM SELECT) - ĐÃ VÁ LỖI TYPO
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]"); // CHỮA LỖI TYPO: Đã đổi 'data-selecct-value' thành 'data-select-value'
const filterBtn = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    // Ép giá trị danh mục của dự án về chữ thường để so sánh chính xác nhất
    let itemCategory = filterItems[i].dataset.category ? filterItems[i].dataset.category.toLowerCase().trim() : "";
    
    if (selectedValue === "all" || selectedValue === "tất cả" || selectedValue === itemCategory) {
      filterItems[i].classList.add("active");
      filterItems[i].style.animation = "fadeIn 0.5s ease forwards";
    } else {
      filterItems[i].classList.remove("active");
      filterItems[i].style.animation = "none";
    }
  }
}

// Lấy giá trị lọc từ thuộc tính data-select-item nếu có để không bị lỗi khi đổi chữ hiển thị
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = (this.getAttribute("data-select-item") || this.innerText).toLowerCase().trim();
    if (selectValue) selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

if (filterBtn.length > 0) {
  let lastClickedBtn = filterBtn[0];
  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      // Đọc giá trị từ data-filter-btn trước để khớp với data-category dưới HTML
      let selectedValue = (this.getAttribute("data-filter-btn") || this.innerText).toLowerCase().trim();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);
      lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }
}


// 5. VALIDATION FORM LIÊN HỆ
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

if (form && formInputs.length > 0 && formBtn) {
  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  }
}


// 6. FIX CHUẨN ĐIỀU HƯỚNG TRANG + ANIMATION CHUYỂN TRANG MƯỢT MÀ
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const targetPage = this.getAttribute("data-nav-link").toLowerCase().trim();

    for (let j = 0; j < pages.length; j++) {
      const pageData = pages[j].dataset.page.toLowerCase().trim();

      if (targetPage === pageData) {
        pages[j].classList.add("active");
        navigationLinks[j].classList.add("active");
        window.scrollTo(0, 0);

        // Hiệu ứng mượt Web Animations API
        pages[j].animate([
          { opacity: 0, transform: 'translateY(15px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 400,
          easing: 'ease-out'
        });

      } else {
        pages[j].classList.remove("active");
        navigationLinks[j].classList.remove("active");
      }
    }
  });
}


// 7. TÍNH NĂNG: BẤM VÀO DỰ ÁN PHÓNG TO ẢNH TOÀN MÀN HÌNH (LIGHTBOX CHI TIẾT CHO HR)
const projectItems = document.querySelectorAll(".project-item a");

const lightboxContainer = document.createElement("div");
lightboxContainer.setAttribute("style", `
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 10, 10, 0.93); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px); cursor: zoom-out;
`);

const lightboxImg = document.createElement("img");
lightboxImg.setAttribute("style", `
  max-width: 90%; max-height: 85%; border-radius: 12px;
  transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  object-fit: contain;
`);

lightboxContainer.appendChild(lightboxImg);
document.body.appendChild(lightboxContainer);

const resizeLightboxForDesktop = () => {
  if (window.innerWidth >= 1024) {
    lightboxImg.style.maxWidth = "95vw";
    lightboxImg.style.maxHeight = "92vh";
  } else {
    lightboxImg.style.maxWidth = "90%";
    lightboxImg.style.maxHeight = "85%";
  }
};

if (projectItems.length > 0) {
  projectItems.forEach(item => {
    item.addEventListener("click", function (e) {
      e.preventDefault(); 
      const targetImg = this.querySelector(".project-img img");
      if (targetImg) {
        lightboxImg.src = targetImg.src;
        lightboxImg.alt = targetImg.alt;
        resizeLightboxForDesktop();
        lightboxContainer.style.opacity = "1";
        lightboxContainer.style.pointerEvents = "all";
        lightboxImg.style.transform = "scale(1)";
      }
    });
  });
}

lightboxContainer.addEventListener("click", function () {
  lightboxContainer.style.opacity = "0";
  lightboxContainer.style.pointerEvents = "none";
  lightboxImg.style.transform = "scale(0.9)";
});

window.addEventListener("resize", resizeLightboxForDesktop);

// 8. ĐẲNG CẤP PRO MAX: CUSTOM PLAYER + VOLUME CONTROL + PLAYBACK SPEED (#FFD36B)
const createCustomVideoModal = () => {
  // 1. Tạo lớp nền mờ kính (Overlay)
  const overlay = document.createElement("div");
  overlay.id = "video-modal-overlay";
  overlay.setAttribute("style", `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(10, 10, 10, 0.8); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: all 0.4s ease;
    backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
  `);

  // 2. Khung chứa Player Custom
  const playerContainer = document.createElement("div");
  playerContainer.id = "custom-video-container";
  playerContainer.setAttribute("style", `
    position: relative; width: 80vw; max-width: 1000px; aspect-ratio: 16/9;
    background: #000; border-radius: 20px; overflow: hidden;
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transform: scale(0.85); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `);

  // Thẻ video gốc
  const video = document.createElement("video");
  video.id = "main-custom-video";
  video.setAttribute("preload", "metadata");
  video.setAttribute("style", "width: 100%; height: 100%; object-fit: contain; display: block; cursor: pointer;");

  // 3. THANH ĐIỀU KHIỂN CUSTOM (CONTROLS BAR)
  const controlsBar = document.createElement("div");
  controlsBar.id = "video-controls-bar";
  controlsBar.setAttribute("style", `
    position: absolute; bottom: 0; left: 0; width: 100%;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0));
    padding: 20px 25px; display: flex; flex-direction: column; gap: 12px;
    opacity: 0; transform: translateY(10px); transition: all 0.3s ease;
    z-index: 2; pointer-events: all;
  `);

  // Thanh tiến trình (Progress Bar)
  const progressBarContainer = document.createElement("div");
  progressBarContainer.setAttribute("style", "width: 100%; height: 5px; background: rgba(255,255,255,0.2); border-radius: 3px; cursor: pointer; position: relative;");
  
  const progressBar = document.createElement("div");
  progressBar.setAttribute("style", "width: 0%; height: 100%; background: #FFD36B; border-radius: 3px; position: absolute; left: 0; top: 0; transition: width 0.1s linear;");
  progressBarContainer.appendChild(progressBar);

  // Hàng nút bấm chức năng
  const controlButtonsRow = document.createElement("div");
  controlButtonsRow.setAttribute("style", "display: flex; align-items: center; justify-content: space-between; color: #fff; font-family: sans-serif; font-size: 14px;");

  // KHU VỰC BÊN TRÁI: Play, Time, Volume Control
  const leftControls = document.createElement("div");
  leftControls.setAttribute("style", "display: flex; align-items: center; gap: 20px;");

  const playBtn = document.createElement("button");
  playBtn.innerHTML = "▶";
  playBtn.setAttribute("style", "background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; width: 25px; text-align: left; transition: color 0.2s;");

  const timeDisplay = document.createElement("span");
  timeDisplay.innerText = "00:00 / 00:00";
  timeDisplay.setAttribute("style", "color: rgba(255,255,255,0.7); font-size: 13px; font-variant-numeric: tabular-nums;");

  // Bộ tăng giảm âm lượng thông minh (Volume Box)
  const volumeContainer = document.createElement("div");
  volumeContainer.setAttribute("style", "display: flex; align-items: center; gap: 8px; position: relative;");

  const volumeBtn = document.createElement("button");
  volumeBtn.innerHTML = "🔊"; // Icon loa
  volumeBtn.setAttribute("style", "background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; padding: 0;");

  const volumeSlider = document.createElement("input");
  volumeSlider.setAttribute("type", "range");
  volumeSlider.setAttribute("min", "0");
  volumeSlider.setAttribute("max", "1");
  volumeSlider.setAttribute("step", "0.05");
  volumeSlider.setAttribute("value", "1");
  volumeSlider.setAttribute("style", `
    width: 0px; opacity: 0; visibility: hidden; transition: all 0.3s ease;
    height: 4px; cursor: pointer; accent-color: #FFD36B;
  `);

  // Hiệu ứng hover vào khu vực loa thì thanh kéo âm lượng mới lòi ra ngoài
  volumeContainer.onmouseenter = () => { volumeSlider.style.width = "70px"; volumeSlider.style.opacity = "1"; volumeSlider.style.visibility = "visible"; };
  volumeContainer.onmouseleave = () => { volumeSlider.style.width = "0px"; volumeSlider.style.opacity = "0"; volumeSlider.style.visibility = "hidden"; };

  volumeContainer.appendChild(volumeBtn);
  volumeContainer.appendChild(volumeSlider);

  leftControls.appendChild(playBtn);
  leftControls.appendChild(timeDisplay);
  leftControls.appendChild(volumeContainer);

  // KHU VỰC BÊN PHẢI: Playback Speed, Fullscreen, Close
  const rightControls = document.createElement("div");
  rightControls.setAttribute("style", "display: flex; align-items: center; gap: 20px;");

  // Nút chỉnh tốc độ phát (Playback Speed Button)
  const speedBtn = document.createElement("button");
  speedBtn.innerHTML = "1.0x";
  speedBtn.setAttribute("style", `
    background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1);
    color: #FFD36B; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s; min-width: 55px; text-align: center;
  `);

  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.innerHTML = "⛶";
  fullscreenBtn.setAttribute("style", "background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; transition: color 0.2s;");

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕ Đóng";
  closeBtn.setAttribute("style", "background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 6px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s;");

  rightControls.appendChild(speedBtn);
  rightControls.appendChild(fullscreenBtn);
  rightControls.appendChild(closeBtn);

  controlButtonsRow.appendChild(leftControls);
  controlButtonsRow.appendChild(rightControls);

  controlsBar.appendChild(progressBarContainer);
  controlsBar.appendChild(controlButtonsRow);

  playerContainer.appendChild(video);
  playerContainer.appendChild(controlsBar);
  overlay.appendChild(playerContainer);
  document.body.appendChild(overlay);

  // 4. LOGIC XỬ LÝ SỰ KIỆN TOÀN DIỆN (ADVANCED MEDIA API CODE)
  
  // Trượt ẩn/hiện thanh controls bar khi hover vào khung player
  playerContainer.onmouseenter = () => { controlsBar.style.opacity = "1"; controlsBar.style.transform = "translateY(0)"; };
  playerContainer.onmouseleave = () => { if (!video.paused) { controlsBar.style.opacity = "0"; controlsBar.style.transform = "translateY(10px)"; } };

  // Xử lý Play/Pause
  const togglePlay = () => {
    if (video.paused) {
      video.play();
      playBtn.innerHTML = "❚❚";
    } else {
      video.pause();
      playBtn.innerHTML = "▶";
    }
  };
  playBtn.onclick = togglePlay;
  video.onclick = togglePlay;

  // Xử lý Âm lượng (Volume)
  volumeSlider.oninput = (e) => {
    const val = e.target.value;
    video.volume = val;
    if (val == 0) {
      volumeBtn.innerHTML = "🔇";
    } else if (val < 0.5) {
      volumeBtn.innerHTML = "🔉";
    } else {
      volumeBtn.innerHTML = "🔊";
    }
  };

  // Bấm vào icon loa để Mute/Unmute nhanh
  let lastVolume = 1;
  volumeBtn.onclick = () => {
    if (video.volume > 0) {
      lastVolume = video.volume;
      video.volume = 0;
      volumeSlider.value = 0;
      volumeBtn.innerHTML = "🔇";
    } else {
      video.volume = lastVolume;
      volumeSlider.value = lastVolume;
      volumeBtn.innerHTML = lastVolume < 0.5 ? "🔉" : "🔊";
    }
  };

  // Xử lý Tốc độ phát tuần hoàn (1x -> 1.25x -> 1.5x -> 2x -> 1x)
  const speeds = [1, 1.25, 1.5, 2];
  let currentSpeedIndex = 0;
  speedBtn.onclick = () => {
    currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    const newSpeed = speeds[currentSpeedIndex];
    video.playbackRate = newSpeed; // Lệnh tăng tốc độ video gốc của HTML5
    speedBtn.innerHTML = `${newSpeed}x`;
  };

  // Cập nhật thời gian và thanh tiến trình
  const formatTime = (time) => {
    const mins = Math.floor(time / 60).toString().padStart(2, '0');
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  video.ontimeupdate = () => {
    const percentage = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percentage}%`;
    timeDisplay.innerText = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
  };

  progressBarContainer.onclick = (e) => {
    const rect = progressBarContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  // Toàn màn hình cho khung Custom Player
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen?.() || playerContainer.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  };

  // Tắt và Reset trình phát
  const shutdownVideo = () => {
    video.pause();
    video.src = "";
    video.playbackRate = 1; // Trả tốc độ về mặc định khi đóng
    speedBtn.innerHTML = "1.0x";
    currentSpeedIndex = 0;
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    playerContainer.style.transform = "scale(0.85)";
  };

  closeBtn.onclick = shutdownVideo;
  overlay.onclick = (e) => { if (e.target === overlay) shutdownVideo(); };
};

// Khởi tạo đầu phát Custom Pro Max
createCustomVideoModal();

// Lắng nghe sự kiện bấm nút từ danh sách bài viết video
document.body.addEventListener("click", function (e) {
  const videoBtn = e.target.closest("[data-video-src]");
  
  if (videoBtn) {
    e.preventDefault();
    
    const overlay = document.getElementById("video-modal-overlay");
    const playerContainer = document.getElementById("custom-video-container");
    const video = document.getElementById("main-custom-video");
    const controlsBar = document.getElementById("video-controls-bar");
    const videoUrl = videoBtn.getAttribute("data-video-src");

    if (videoUrl && overlay && video) {
      video.src = videoUrl;
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "all";
      playerContainer.style.transform = "scale(1)";
      controlsBar.style.opacity = "1";
      controlsBar.style.transform = "translateY(0)";

      video.play().catch(err => console.log("Autoplay blocked:", err));
      overlay.querySelector("button").innerHTML = "❚❚"; 
    }
  }
});

// 9. TÍNH NĂNG: BẤM VÀO BLOG PHÓNG TO ẢNH PROFILE (LIGHTBOX MỜ NỀN KÍNH)
const createImageModal = () => {
  // 1. Tạo lớp nền mờ kính phía sau (Overlay)
  const overlay = document.createElement("div");
  overlay.id = "image-modal-overlay";
  overlay.setAttribute("style", `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(10, 10, 10, 0.75); z-index: 10005;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: all 0.4s ease;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    cursor: zoom-out;
  `);

  // 2. Tạo thẻ chứa ảnh phóng to
  const imgContainer = document.createElement("div");
  imgContainer.setAttribute("style", `
    max-width: 85vw; max-height: 85vh; display: flex; align-items: center; justify-content: center;
    transform: scale(0.85); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `);

  const bigImg = document.createElement("img");
  bigImg.id = "modal-image-target";
  bigImg.setAttribute("style", `
    max-width: 100%; max-height: 85vh; border-radius: 16px; object-fit: contain;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
  `);

  imgContainer.appendChild(bigImg);
  overlay.appendChild(imgContainer);
  document.body.appendChild(overlay);

  // Bấm vào vùng mờ hoặc chính tấm ảnh để đóng lại
  overlay.addEventListener("click", function () {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    imgContainer.style.transform = "scale(0.85)";
  });
};

// Khởi tạo khung modal ảnh ngay khi tải trang
createImageModal();

// Lắng nghe sự kiện click bằng Event Delegation chống lỗi tab động
document.body.addEventListener("click", function (e) {
  const imageBtn = e.target.closest("[data-image-target]");
  
  if (imageBtn) {
    e.preventDefault();
    
    const overlay = document.getElementById("image-modal-overlay");
    const imgContainer = overlay.querySelector("div");
    const bigImg = document.getElementById("modal-image-target");
    const imageUrl = imageBtn.getAttribute("data-image-target");

    if (imageUrl && overlay && bigImg) {
      bigImg.src = imageUrl;
      bigImg.alt = imageBtn.querySelector("img") ? imageBtn.querySelector("img").alt : "Profile Image";
      
      // Kích hoạt hiệu ứng zoom và mờ nền
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "all";
      imgContainer.style.transform = "scale(1)";
    }
  }
});


// BẬT TÍNH NĂNG ĐIỀU KHIỂN BẰNG BÀN PHÍM CHUẨN IT
document.addEventListener("keydown", (e) => {
  const overlay = document.getElementById("video-modal-overlay");
  const video = document.getElementById("main-custom-video");
  
  // Chỉ kích hoạt phím tắt khi cái khung Video đang được mở hiển thị trên màn hình
  if (overlay && overlay.style.opacity === "1" && video) {
    
    // 1. Phím Spacebar (Khoảng trắng): Bấm để Play/Pause
    if (e.code === "Space") {
      e.preventDefault(); // Chặn hành vi cuộn trang mặc định của phím Space
      const playBtn = overlay.querySelector("button"); // Tìm nút Play
      if (video.paused) {
        video.play();
        if(playBtn) playBtn.innerHTML = "❚❚";
      } else {
        video.pause();
        if(playBtn) playBtn.innerHTML = "▶";
      }
    }
    
    // 2. Phím M: Bấm để Tắt/Bật tiếng nhanh (Mute)
    if (e.code === "KeyM") {
      const volumeBtn = overlay.querySelector("div[style*='position: relative'] button");
      const volumeSlider = document.querySelector("input[type='range']");
      if (video.volume > 0) {
        video.volume = 0;
        if(volumeSlider) volumeSlider.value = 0;
        if(volumeBtn) volumeBtn.innerHTML = "🔇";
      } else {
        video.volume = 1;
        if(volumeSlider) volumeSlider.value = 1;
        if(volumeBtn) volumeBtn.innerHTML = "🔊";
      }
    }

    // 3. Phím Esc (Escape): Bấm để đóng trình phát ngay lập tức
    if (e.code === "Escape") {
      const closeBtn = overlay.querySelector("button[style*='background: rgba(255,255,255,0.1)']");
      if (closeBtn) closeBtn.click();
    }
  }
});

// ĐẲNG CẤP BASE IT: LỜI CHÀO ẨN TRONG TAB CONSOLE (F12)
(() => {
  const asciiArt = `
 __   __     ______     __   __   __         ______     __   __     ______    
/\ "-.\ \   /\  ___\   /\ \ / /  /\ \       /\  __ \   /\ "-.\ \   /\  ___\   
\ \ \-.  \  \ \ \__ \  \ \ \'/   \ \ \____  \ \ \/\ \  \ \ \-.  \  \ \ \__ \  
 \ \_\\"\_\  \ \_____\  \ \__|    \ \_____\  \ \_____\  \ \_\\"\_\  \ \_____\ 
  \/_/ \/_/   \/_____/   \/_/      \/_____/   \/_____/   \/_/ \/_/   \/_____/ 
                                                                              
  `;
  
  const titleStyle = `
    color: #FFD36B; 
    font-size: 16px; 
    font-weight: bold; 
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    font-family: monospace;
  `;
  
  const textStyle = `
    color: #00ffcc; 
    font-size: 13px; 
    font-variant-numeric: tabular-nums;
    font-family: monospace;
  `;

  console.log(`%c${asciiArt}`, titleStyle);
  console.log("%c🚀 Bạn vừa mở hộp kỹ thuật! Chứng tỏ bạn cũng là một người có tư duy logic đấy.", titleStyle);
  console.log("%c👉 Portfolio này được code tay 100% bằng HTML5/CSS3/Vanilla JS thuần, tối ưu hóa hiệu năng CDN.", textStyle);
  console.log("%c📬 Kết nối làm việc với tôi qua form bên dưới hoặc email nhé. Cheers!", "color: #fff; font-style: italic;");
})();


// ==========================================
// TÍNH NĂNG ĐỔI DARK/LIGHT MODE CHUẨN CHUYÊN GIA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const body = document.body;

  // 1. Kiểm tra xem bộ nhớ máy người dùng trước đó đã lưu chế độ nào chưa
  const currentTheme = localStorage.getItem("portfolio-theme");

  if (currentTheme === "light") {
    body.classList.add("light-mode");
    if (themeIcon) themeIcon.setAttribute("name", "sunny-outline"); // Đổi sang icon mặt trời
  }

  // 2. Bắt sự kiện Click vào nút đổi chế độ
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      // Toggle class .light-mode ở thẻ body
      body.classList.toggle("light-mode");

      // Kiểm tra trạng thái hiện tại sau khi click để lưu cấu hình và đổi icon
      if (body.classList.contains("light-mode")) {
        localStorage.setItem("portfolio-theme", "dark");
        if (themeIcon) themeIcon.setAttribute("name", "sunny-outline"); // Chuyển sang icon mặt trời nếu là nền sáng
      } else {
        localStorage.setItem("portfolio-theme", "light");
        if (themeIcon) themeIcon.setAttribute("name", "moon-outline");  // Quay về icon mặt trăng nếu là nền tối
      }
    });
  }
});



// =========================================================================
// LOGIC PHÁT SÁNG TIÊU ĐIỂM KHI CLICK (UI CLICK FEEDBACK LOOP)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const clickableElements = document.querySelectorAll(".clickable-target");

  clickableElements.forEach(element => {
    element.addEventListener("click", function() {
      // 1. Thêm class phát sáng vào phần tử vừa click
      this.classList.add("clicked-glow");

      // 2. Sau 400ms (khi animation chạy xong), tự động xóa class để sẵn sàng cho lần click tiếp theo
      setTimeout(() => {
        this.classList.remove("clicked-glow");
      }, 400);
    });
  });
});


document.addEventListener("DOMContentLoaded", function () {
  // 1. Tự động cập nhật năm bản quyền
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

  // 2. Tự động cập nhật ngày tháng thời gian thực
  const liveDateSpan = document.getElementById("live-date");
  if (liveDateSpan) {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const now = new Date();
    const dateStr = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    liveDateSpan.textContent = dateStr;
  }

  // 3. LOGIC TỐI CAO: CẬP NHẬT THỜI TIẾT THEO BUỔI (SÁNG / TỐI LÀM LÁC MẮT HR)
  const liveWeatherSpan = document.getElementById("live-weather");
  if (liveWeatherSpan) {
    const now = new Date();
    const month = now.getMonth() + 1; // Tháng hiện tại (1-12)
    const hour = now.getHours();       // Giờ hiện tại (0-23)
    
    // Kiểm tra xem đang là ban ngày hay ban đêm
    const isDaytime = hour >= 6 && hour < 18; 

    let temp = 25;
    let status = "Trời mát mẻ";
    let icon = "🌤️";

    // MÙA HÈ (Tháng 5 - Tháng 8)
    if (month >= 5 && month <= 8) {
      if (isDaytime) {
        temp = Math.floor(Math.random() * (36 - 33 + 1)) + 33; // Ngày: 33-36°C
        status = "Hà Nội oi bức, Nắng nóng";
        icon = "☀️";
      } else {
        temp = Math.floor(Math.random() * (29 - 27 + 1)) + 27; // Đêm: 27-29°C
        status = "Đêm Hà Nội dịu mát, Có gió nhẹ";
        icon = "🌙";
      }
    } 
    // MÙA THU (Tháng 9 - Tháng 11)
    else if (month >= 9 && month <= 11) {
      if (isDaytime) {
        temp = Math.floor(Math.random() * (28 - 25 + 1)) + 25; // Ngày: 25-28°C
        status = "Thu Hà Nội đầy nắng, Gió heo may";
        icon = "🌤️";
      } else {
        temp = Math.floor(Math.random() * (22 - 19 + 1)) + 19; // Đêm: 19-22°C
        status = "Đêm Thu se lạnh, Trời nhiều sao";
        icon = "✨";
      }
    } 
    // MÙA ĐÔNG (Tháng 12 - Tháng 2 năm sau)
    else if (month === 12 || month <= 2) {
      if (isDaytime) {
        temp = Math.floor(Math.random() * (19 - 15 + 1)) + 15; // Ngày: 15-19°C
        status = "Hà Nội hanh khô, Trời âm u";
        icon = "☁️";
      } else {
        temp = Math.floor(Math.random() * (14 - 11 + 1)) + 11; // Đêm: 11-14°C
        status = "Đêm Đông Hà Nội rét buốt";
        icon = "🥶";
      }
    } 
    // MÙA XUÂN (Tháng 3 - Tháng 4)
    else {
      if (isDaytime) {
        temp = Math.floor(Math.random() * (24 - 21 + 1)) + 21; 
        status = "Hà Nội mát mẻ, Nắng ấm";
        icon = "⛅";
      } else {
        temp = Math.floor(Math.random() * (19 - 17 + 1)) + 17; 
        status = "Đêm Xuân Hà Nội có mưa phùn";
        icon = "🌧️";
      }
    }

    // Xuất dữ liệu ra màn hình
    liveWeatherSpan.innerHTML = `<span class="weather-icon">${icon}</span> <span class="weather-text">Hà Nội: ${temp}°C, ${status}</span>`;
  }
});

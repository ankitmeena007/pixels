document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  let photos = [];

  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  let lightboxImg = document.getElementById("lightbox-img");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const closeBtn = document.getElementById("close-btn");
  const counter = document.getElementById("counter");

  let lastTap = 0;
  let zoomed = false;

  // Touch/drag variables
  let touchStartX = 0;
  let touchStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  let imgTranslateX = 0;
  let imgTranslateY = 0;

  const swipeThreshold = 50; // Minimum px for swipe

  // Load photos from JSON
  fetch("photos.json")
    .then(res => res.json())
    .then(data => {
      photos = data.reverse();
      gallery.innerHTML = "";

      photos.forEach((photo, index) => {
        const figure = document.createElement("figure");
        figure.classList.add("photo");

        const picture = document.createElement("picture");
        const base = photo.replace(/-\d+$/, "");

        const sourceWebp = document.createElement("source");
        sourceWebp.type = "image/webp";
        sourceWebp.dataset.srcset = `
          images/${base}-400.webp 400w,
          images/${base}-800.webp 800w,
          images/${base}-1600.webp 1600w
        `;
        sourceWebp.sizes = "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw";

        const sourceJpg = document.createElement("source");
        sourceJpg.type = "image/jpeg";
        sourceJpg.dataset.srcset = `
          images/${base}-400.jpg 400w,
          images/${base}-800.jpg 800w,
          images/${base}-1600.jpg 1600w
        `;
        sourceJpg.sizes = sourceWebp.sizes;

        const img = document.createElement("img");
        img.dataset.src = `images/${base}-800.jpg`;
        img.alt = base;
        img.loading = "lazy";

        img.addEventListener("click", () => openLightbox(index));

        picture.appendChild(sourceWebp);
        picture.appendChild(sourceJpg);
        picture.appendChild(img);
        figure.appendChild(picture);
        gallery.appendChild(figure);
      });

      setupLazyLoading();
    });

  function setupLazyLoading() {
    const lazySources = document.querySelectorAll("source[data-srcset]");
    const lazyImgs = document.querySelectorAll("img[data-src]");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target;
              if (el.tagName === "SOURCE") {
                el.srcset = el.dataset.srcset;
                delete el.dataset.srcset;
              }
              if (el.tagName === "IMG") {
                el.src = el.dataset.src;
                delete el.dataset.src;
              }
              observer.unobserve(el);
            }
          });
        },
        { rootMargin: "200px" }
      );

      lazySources.forEach(el => observer.observe(el));
      lazyImgs.forEach(el => observer.observe(el));
    } else {
      lazySources.forEach(el => el.srcset = el.dataset.srcset);
      lazyImgs.forEach(el => el.src = el.dataset.src);
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox(false);
    lightbox.classList.add("active");
    zoomed = false;
    imgTranslateX = 0;
    imgTranslateY = 0;
    lightboxImg.style.transform = "scale(1) translate(0px,0px)";
    setupZoomAndPan();
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    zoomed = false;
    imgTranslateX = 0;
    imgTranslateY = 0;
    lightboxImg.style.transform = "scale(1) translate(0px,0px)";
  }

  function updateLightbox(fade = false) {
    const base = photos[currentIndex].replace(/-\d+$/, "");

    if (fade) {
      lightboxImg.style.transition = "opacity 0.25s ease";
      lightboxImg.style.opacity = 0;

      setTimeout(() => {
        lightboxImg.src = `images/${base}-1600.jpg`;
        counter.textContent = `${currentIndex + 1} / ${photos.length}`;
        zoomed = false;
        imgTranslateX = 0;
        imgTranslateY = 0;
        lightboxImg.style.transform = "scale(1) translate(0px,0px)";
        lightboxImg.style.opacity = 1;
      }, 150);
    } else {
      lightboxImg.src = `images/${base}-1600.jpg`;
      counter.textContent = `${currentIndex + 1} / ${photos.length}`;
      zoomed = false;
      imgTranslateX = 0;
      imgTranslateY = 0;
      lightboxImg.style.transform = "scale(1) translate(0px,0px)";
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % photos.length;
    updateLightbox(true);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    updateLightbox(true);
  }

  // Navigation events
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);
  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  // ==========================
  // Zoom & Pan (Desktop & Mobile)
  // ==========================
  function setupZoomAndPan() {
    const newImg = lightboxImg.cloneNode(true);
    lightboxImg.parentNode.replaceChild(newImg, lightboxImg);
    lightboxImg = newImg;

    let startX = 0, startY = 0;
    let mouseDown = false;

    // Mobile touch
    lightboxImg.addEventListener("touchstart", e => {
      const touch = e.changedTouches[0];
      startX = touch.screenX;
      startY = touch.screenY;
      panStartX = imgTranslateX;
      panStartY = imgTranslateY;
    });

    lightboxImg.addEventListener("touchend", e => {
      if (zoomed) {
        snapZoomedImage();
      } else {
        const touch = e.changedTouches[0];
        const dx = touch.screenX - startX;
        const dy = touch.screenY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
          dx < 0 ? showNext() : showPrev();
        }
      }

      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        toggleZoom(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
      lastTap = currentTime;
    });

    lightboxImg.addEventListener("touchmove", e => {
      if (!zoomed) return;
      const touch = e.changedTouches[0];
      imgTranslateX = panStartX + (touch.screenX - startX);
      imgTranslateY = panStartY + (touch.screenY - startY);
      lightboxImg.style.transform = `scale(2) translate(${imgTranslateX}px, ${imgTranslateY}px)`;
    });

    // Desktop zoom & pan
    if (window.innerWidth >= 600) {
      lightboxImg.style.cursor = "zoom-in";

      lightboxImg.addEventListener("click", e => {
        toggleZoom(e.clientX, e.clientY);
      });

      lightboxImg.addEventListener("mousedown", e => {
        if (!zoomed) return;
        mouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        panStartX = imgTranslateX;
        panStartY = imgTranslateY;
        e.preventDefault();
      });

      lightboxImg.addEventListener("mousemove", e => {
        if (!mouseDown) return;
        imgTranslateX = panStartX + (e.clientX - startX);
        imgTranslateY = panStartY + (e.clientY - startY);
        lightboxImg.style.transform = `scale(2) translate(${imgTranslateX}px, ${imgTranslateY}px)`;
      });

      lightboxImg.addEventListener("mouseup", () => { mouseDown = false; snapZoomedImage(); });
      lightboxImg.addEventListener("mouseleave", () => { mouseDown = false; snapZoomedImage(); });
    }
  }

  // Snap zoomed image to edges
  function snapZoomedImage() {
    if (!zoomed) return;

    const rect = lightboxImg.getBoundingClientRect();
    const parentRect = lightbox.getBoundingClientRect();
    const scale = 2; // current zoom scale

    const maxX = (rect.width * scale - parentRect.width) / 2;
    const maxY = (rect.height * scale - parentRect.height) / 2;

    imgTranslateX = Math.max(-maxX, Math.min(imgTranslateX, maxX));
    imgTranslateY = Math.max(-maxY, Math.min(imgTranslateY, maxY));

    lightboxImg.style.transition = "transform 0.2s ease-out";
    lightboxImg.style.transform = `scale(${scale}) translate(${imgTranslateX}px, ${imgTranslateY}px)`;

    setTimeout(() => { lightboxImg.style.transition = ""; }, 200);
  }

  function toggleZoom(clientX, clientY) {
    const rect = lightboxImg.getBoundingClientRect();
    if (!zoomed) {
      zoomed = true;
      lightboxImg.style.transformOrigin = `${((clientX - rect.left) / rect.width) * 100}% ${((clientY - rect.top) / rect.height) * 100}%`;
      lightboxImg.style.transform = "scale(2) translate(0px,0px)";
      imgTranslateX = 0;
      imgTranslateY = 0;
      lightboxImg.style.cursor = "zoom-out";
    } else {
      zoomed = false;
      imgTranslateX = 0;
      imgTranslateY = 0;
      lightboxImg.style.transform = "scale(1) translate(0px,0px)";
      lightboxImg.style.cursor = "zoom-in";
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  let photos = [];

  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const closeBtn = document.getElementById("close-btn");

  // Load photos from JSON
  fetch("photos.json")
    .then(res => res.json())
    .then(data => {
      photos = data.reverse(); // most recent first
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
    updateLightbox();
    lightbox.classList.add("active");
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
  }

  function updateLightbox() {
    const base = photos[currentIndex].replace(/-\d+$/, "");
    lightboxImg.src = `images/${base}-1600.jpg`;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % photos.length;
    updateLightbox();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    updateLightbox();
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
});

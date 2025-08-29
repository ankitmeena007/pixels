document.addEventListener("DOMContentLoaded", () => {
  fetch("photos.json")
    .then(res => res.json())
    .then(photos => {
      const gallery = document.getElementById("gallery");

      photos.forEach(photo => {
        const figure = document.createElement("figure");
        figure.classList.add("photo");

        const picture = document.createElement("picture");

        // Clean base name (in case old -400/-800 suffix exists)
        const base = photo.replace(/-\d+$/, "");

        // WebP source
        const sourceWebp = document.createElement("source");
        sourceWebp.type = "image/webp";
        sourceWebp.dataset.srcset = `
          images/${base}-400.webp 400w,
          images/${base}-800.webp 800w,
          images/${base}-1600.webp 1600w
        `;
        sourceWebp.sizes = "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw";

        // JPG fallback
        const sourceJpg = document.createElement("source");
        sourceJpg.type = "image/jpeg";
        sourceJpg.dataset.srcset = `
          images/${base}-400.jpg 400w,
          images/${base}-800.jpg 800w,
          images/${base}-1600.jpg 1600w
        `;
        sourceJpg.sizes = sourceWebp.sizes;

        // Default <img>
        const img = document.createElement("img");
        img.dataset.src = `images/${base}-800.jpg`; // default mid-size
        img.alt = base;
        img.loading = "lazy";

        picture.appendChild(sourceWebp);
        picture.appendChild(sourceJpg);
        picture.appendChild(img);

        figure.appendChild(picture);
        gallery.appendChild(figure);
      });

      setupLazyLoading();
      setupLightbox();
    });

  // Lazy-loading using IntersectionObserver
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
      // Fallback
      lazySources.forEach(el => el.srcset = el.dataset.srcset);
      lazyImgs.forEach(el => el.src = el.dataset.src);
    }
  }

  // Lightbox functionality
  function setupLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    document.querySelectorAll(".photo img").forEach(img => {
      img.addEventListener("click", () => {
        const base = img.alt;
        lightboxImg.src = `images/${base}-1600.jpg`; // high-res
        lightbox.classList.add("active");
      });
    });

    // Close lightbox on click
    lightbox.addEventListener("click", e => {
      if (e.target === lightbox || e.target === lightboxImg) {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
      }
    });

    // Close lightbox on ESC
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
      }
    });
  }
});

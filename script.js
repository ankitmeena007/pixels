document.addEventListener("DOMContentLoaded", () => {
  fetch("photos.json")
    .then((response) => response.json())
    .then((photos) => {
      const gallery = document.getElementById("gallery");

      photos.forEach((photo) => {
        const figure = document.createElement("figure");

        const picture = document.createElement("picture");

        // WebP source
        const sourceWebp = document.createElement("source");
        sourceWebp.type = "image/webp";
        sourceWebp.srcset = `images/${photo}-400.webp 400w, images/${photo}-800.webp 800w, images/${photo}-1600.webp 1600w`;
        sourceWebp.sizes =
          "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw";
        picture.appendChild(sourceWebp);

        // JPG fallback
        const sourceJpg = document.createElement("source");
        sourceJpg.type = "image/jpeg";
        sourceJpg.srcset = `images/${photo}-400.jpg 400w, images/${photo}-800.jpg 800w, images/${photo}-1600.jpg 1600w`;
        sourceJpg.sizes =
          "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw";
        picture.appendChild(sourceJpg);

        // Default <img> tag
        const img = document.createElement("img");
        img.src = `images/${photo}-800.jpg`;
        img.alt = photo;
        img.loading = "lazy";
        picture.appendChild(img);

        figure.appendChild(picture);
        gallery.appendChild(figure);

        // Lightbox click
        img.addEventListener("click", () => {
          openLightbox(`images/${photo}-1600.jpg`);
        });
      });
    });

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.remove("hidden");
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
  }

  // Close on background click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});

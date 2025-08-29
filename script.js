async function loadPhotos() {
  const response = await fetch('photos.json');
  const photos = await response.json();
  const gallery = document.getElementById('gallery');

  photos.forEach(name => {
    const picture = document.createElement('picture');

    // WebP responsive source
    picture.innerHTML = `
      <source 
        type="image/webp" 
        srcset="
          images/${name}-400.webp 400w,
          images/${name}-800.webp 800w,
          images/${name}-1600.webp 1600w
        "
        sizes="(max-width: 600px) 100vw,
               (max-width: 1200px) 50vw,
               33vw"
      >
    `;

    // JPG fallback
    const img = document.createElement('img');
    img.src = `images/${name}-800.jpg`; // mid-size default
    img.alt = name;
    img.loading = "lazy";
    img.classList.add("photo");

    picture.appendChild(img);
    gallery.appendChild(picture);

    // Lightbox
    img.addEventListener("click", () => openLightbox(name));
  });
}

function openLightbox(name) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  // Show large image in lightbox
  lightboxImg.src = `images/${name}-1600.jpg`;

  lightbox.classList.add("active");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("active");
}

document.getElementById("lightbox").addEventListener("click", closeLightbox);

// Run
loadPhotos();

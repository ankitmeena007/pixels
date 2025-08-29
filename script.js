async function loadPhotos() {
  const res = await fetch("photos.json");
  const photos = await res.json();

  const gallery = document.getElementById("gallery");

  photos.forEach(photo => {
    const figure = document.createElement("figure");
    figure.classList.add("photo");

    const picture = document.createElement("picture");

    // WebP sources (lazy)
    const sourceWebp = document.createElement("source");
    sourceWebp.type = "image/webp";
    sourceWebp.dataset.srcset = `
      images/${photo}-400.webp 400w,
      images/${photo}-800.webp 800w,
      images/${photo}-1600.webp 1600w
    `;
    sourceWebp.sizes = "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw";

    // JPG sources (fallback)
    const sourceJpg = document.createElement("source");
    sourceJpg.type = "image/jpeg";
    sourceJpg.dataset.srcset = `
      images/${photo}-400.jpg 400w,
      images/${photo}-800.jpg 800w,
      images/${photo}-1600.jpg 1600w
    `;
    sourceJpg.sizes = sourceWebp.sizes;

    // Default <img>
    const img = document.createElement("img");
    img.alt = photo;
    img.dataset.src = `images/${photo}-800.jpg`; // lazy-loaded
    img.loading = "lazy"; // native browser lazy load as fallback

    picture.appendChild(sourceWebp);
    picture.appendChild(sourceJpg);
    picture.appendChild(img);

    figure.appendChild(picture);
    gallery.appendChild(figure);
  });

  setupLazyLoading();
}

function setupLazyLoading() {
  const lazySources = document.querySelectorAll("source[data-srcset]");
  const lazyImgs = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window) {
    let observer = new IntersectionObserver(entries => {
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
    }, { rootMargin: "200px" });

    lazySources.forEach(src => observer.observe(src));
    lazyImgs.forEach(img => observer.observe(img));
  } else {
    // Fallback: load all immediately
    lazySources.forEach(src => { src.srcset = src.dataset.srcset; });
    lazyImgs.forEach(img => { img.src = img.dataset.src; });
  }
}

loadPhotos();

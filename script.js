async function loadPhotos() {
  const response = await fetch('photos.json');
  const photos = await response.json();
  const gallery = document.getElementById('gallery');

  photos.forEach(photo => {
    const picture = document.createElement('picture');

    const sourceWebp = document.createElement('source');
    sourceWebp.srcset = `images/${photo}-400.webp 400w, images/${photo}-800.webp 800w, images/${photo}-1600.webp 1600w`;
    sourceWebp.type = 'image/webp';

    const sourceJpg = document.createElement('source');
    sourceJpg.srcset = `images/${photo}-400.jpg 400w, images/${photo}-800.jpg 800w, images/${photo}-1600.jpg 1600w`;
    sourceJpg.type = 'image/jpeg';

    const img = document.createElement('img');
    img.src = `images/${photo}-800.jpg`;
    img.alt = photo;
    img.loading = 'lazy';

    picture.appendChild(sourceWebp);
    picture.appendChild(sourceJpg);
    picture.appendChild(img);

    picture.addEventListener('click', () => openLightbox(img.src));

    gallery.appendChild(picture);
  });
}

function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  lightbox.style.display = 'block';
  lightboxImg.src = src;
}

document.querySelector('.close').onclick = function() {
  document.getElementById('lightbox').style.display = 'none';
};

document.getElementById('lightbox').onclick = function(e) {
  if (e.target.id === 'lightbox') {
    document.getElementById('lightbox').style.display = 'none';
  }
};

loadPhotos();
import { Notify } from "notiflix"
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';

const form = document.querySelector('.search__form');
const gallery = document.querySelector('.gallery');
const URL_KEY = '27903219-6f010dc630c8173d81668507d';
const loadMore = document.querySelector('.load-more');

let inputValue = '';
let page = 1;
const options = {
    threshold: 1.0,
    rootMargin: '100px',
};

form.addEventListener('submit', onFormSubmit);

axios.defaults.baseURL = 'https://pixabay.com/api/';
async function fetchImages(inputValue) {
    try {
        const response = await axios.get('', {
        params: {
            key: URL_KEY,
            q: inputValue,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: 8,
            page: page,
        }
    });
        return response.data;
    } catch (error) {
        console.log(error.message)
    }
}

async function onFormSubmit(e) {
    try {
    e.preventDefault();
    page = 1;
    gallery.innerHTML = '';
    inputValue = e.currentTarget.elements.searchQuery.value;
    if (inputValue === '') {
        gallery.innerHTML = '';
        return;
    }
    
    const fetch = await fetchImages(inputValue);
    const render = await renderMarkup(fetch);
    const totalHits = fetch.totalHits;
        
        if (gallery.children.length < 500 && totalHits > 0) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        }
        if (fetch.hits.length === 0) {
        Notify.warning("Sorry, there are no images matching your search query. Please try again.")
        }
        e.target.reset();
    } catch (error) {
        console.log(error.message)
        Notify.warning("We're sorry, but you've reached the end of search results.");
    }
}

async function renderMarkup(data) {
    const image = data.hits;
    const markup = image.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `<div class="photo-card"><a class="image-link" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> <span class="number-of">${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b> <span class="number-of">${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b> <span class="number-of">${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b> <span class="number-of">${downloads}</span>
    </p>
  </div>
  </a>
</div>`
    }).join('');
    // lightBox.refresh();
    gallery.insertAdjacentHTML("beforeend", markup);
}

// /////////////////
// gallery.addEventListener('click', onGalleryClick);

// function onGalleryClick(e) {
//     console.log(e.target)
//     const imgTarget = e.target.classList.contains('image');
//     if (!imgTarget) {
//         return;
//     }
    
//     e.preventDefault();
// };

// const lightBox = new SimpleLightbox(`.gallery a`, { captionDelay: 250});

function observation() {
    const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
        if (entry.isIntersecting && gallery.innerHTML !== '') {
        page += 1;
        const fetch = await fetchImages(inputValue);
        const render = await renderMarkup(fetch);
        }
    })
        }, options);
            observer.observe(document.querySelector('.scroll-limit'));
}
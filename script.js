// ===========================================
// 0. TMDb API SETUP
// TMDb (The Movie Database) is a free, legitimate source for real movie posters.
// Get your own free key at https://www.themoviedb.org/settings/api
// ===========================================
const TMDB_API_KEY = "a2a5d08adfc56245804ae6823ac0da54";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500";

// ===========================================
// 1. MOVIE DATA
// Each movie is an object with details.
// "poster" starts as a placeholder and gets replaced with a real
// poster from TMDb once it's fetched (see fetchAllPosters below).
// ===========================================
const movies = [
  {
    title: "3 Idiots",
    genre: "Comedy",
    year: 2009,
    review: "A hilarious yet moving take on the pressure Indian students face to conform. Balances laughs and life lessons better than almost any film in its genre.",
    rating: 5,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=3+Idiots"
  },
  {
    title: "Inception",
    genre: "Sci-Fi",
    year: 2010,
    review: "A mind-bending heist through layers of dreams. Demands full attention, but rewards it with one of the most original concepts in modern cinema.",
    rating: 5,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=Inception"
  },
  {
    title: "Dangal",
    genre: "Drama",
    year: 2016,
    review: "An inspiring true story of a father training his daughters to become wrestling champions. The final match sequence is genuinely nerve-wracking.",
    rating: 5,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=Dangal"
  },
  {
    title: "The Dark Knight",
    genre: "Action",
    year: 2008,
    review: "Elevated the superhero genre with a grounded, morally complex story. The performance as the villain remains one of the most talked-about in film history.",
    rating: 5,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=The+Dark+Knight"
  },
  {
    title: "Andhadhun",
    genre: "Thriller",
    year: 2018,
    review: "A darkly funny, twist-filled thriller about a blind pianist caught up in a murder. Keeps you guessing right up to the ambiguous final shot.",
    rating: 4,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=Andhadhun"
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    year: 2014,
    review: "An emotional, ambitious journey through space and time. The visuals and score are stunning, even if the science lectures slow the pace at times.",
    rating: 4,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=Interstellar"
  },
  {
    title: "Zindagi Na Milegi Dobara",
    genre: "Drama",
    year: 2011,
    review: "Three friends on a road trip through Spain confront their fears and figure out what they actually want from life. Warm, funny, and easy to rewatch.",
    rating: 4,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=ZNMD"
  },
  {
    title: "Baahubali: The Beginning",
    genre: "Action",
    year: 2015,
    review: "A larger-than-life epic with massive scale and ambition. The world-building and action set pieces set a new bar for Indian cinema.",
    rating: 4,
    poster: "https://placehold.co/240x300/170a26/a855f7?text=Baahubali"
  }
];

// ===========================================
// 2. GRAB ELEMENTS FROM THE PAGE
// ===========================================
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

// Modal elements
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalOriginalReview = document.getElementById("modalOriginalReview");
const modalCast = document.getElementById("modalCast");
const modalUserReviews = document.getElementById("modalUserReviews");
const reviewForm = document.getElementById("reviewForm");
const reviewerName = document.getElementById("reviewerName");
const reviewerText = document.getElementById("reviewerText");

// Keeps track of which movie's modal is currently open
let currentMovieTitle = null;

// ===========================================
// 3. BUILD A STAR RATING (1 to 5 stars)
// Returns an HTML string like: ★★★★☆
// ===========================================
function buildStars(rating, movieIndex) {
  let starsHTML = '<div class="stars" data-movie="' + movieIndex + '">';
  for (let i = 1; i <= 5; i++) {
    const filledClass = i <= rating ? "filled" : "";
    starsHTML += `<span class="star ${filledClass}" data-value="${i}">★</span>`;
  }
  starsHTML += "</div>";
  return starsHTML;
}

// ===========================================
// 4. RENDER MOVIES TO THE PAGE
// Takes a list of movies and draws a card for each one
// ===========================================
function renderMovies(movieList) {
  movieGrid.innerHTML = "";

  if (movieList.length === 0) {
    movieGrid.innerHTML = "<p style='color:#b5a8a0;'>No movies match your search.</p>";
    return;
  }

  movieList.forEach((movie) => {
    const originalIndex = movies.indexOf(movie);

    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <img class="poster" src="${movie.poster}" alt="${movie.title} poster" />
      <div class="movie-info">
        <h2 class="movie-title">${movie.title}</h2>
        <p class="movie-meta">${movie.genre} • ${movie.year}</p>
        <p class="movie-review">${movie.review}</p>
        ${buildStars(movie.rating, originalIndex)}
      </div>
    `;

    card.addEventListener("click", () => {
      openMovieModal(movie);
    });

    movieGrid.appendChild(card);
  });

  attachStarListeners();
}

// ===========================================
// 5. LET USERS CLICK STARS TO CHANGE RATING
// ===========================================
function attachStarListeners() {
  const starGroups = document.querySelectorAll(".stars");

  starGroups.forEach((group) => {
    const stars = group.querySelectorAll(".star");

    stars.forEach((star) => {
      star.addEventListener("click", (event) => {
        event.stopPropagation();

        const movieIndex = group.getAttribute("data-movie");
        const newRating = parseInt(star.getAttribute("data-value"));

        movies[movieIndex].rating = newRating;

        applyFilters();
      });
    });
  });
}

// ===========================================
// 6. SEARCH + GENRE FILTER LOGIC
// ===========================================
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedGenre = genreFilter.value;

  const filtered = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
    const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  renderMovies(filtered);
}

searchInput.addEventListener("input", applyFilters);
genreFilter.addEventListener("change", applyFilters);

// ===========================================
// 7. USER REVIEWS — SAVED IN localStorage
// ===========================================
function getAllUserReviews() {
  const data = localStorage.getItem("movieUserReviews");
  return data ? JSON.parse(data) : {};
}

function getReviewsForMovie(title) {
  const allReviews = getAllUserReviews();
  return allReviews[title] || [];
}

function addReviewForMovie(title, name, text) {
  const allReviews = getAllUserReviews();

  if (!allReviews[title]) {
    allReviews[title] = [];
  }

  allReviews[title].push({
    name: name,
    text: text,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("movieUserReviews", JSON.stringify(allReviews));
}

// ===========================================
// 8. MODAL — OPEN, CLOSE, AND DISPLAY REVIEWS + CAST
// ===========================================
function openMovieModal(movie) {
  currentMovieTitle = movie.title;

  modalPoster.src = movie.poster;
  modalPoster.alt = movie.title + " poster";
  modalTitle.textContent = movie.title;
  modalMeta.textContent = movie.genre + " • " + movie.year;
  modalOriginalReview.textContent = movie.review;

  renderCast(movie);
  renderUserReviews(movie.title);

  reviewForm.reset();
  modalOverlay.classList.add("active");
}

function closeMovieModal() {
  modalOverlay.classList.remove("active");
  currentMovieTitle = null;
}

function renderCast(movie) {
  const cast = movie.cast || [];

  if (cast.length === 0) {
    modalCast.innerHTML = '<p class="no-cast">Cast info loading or unavailable...</p>';
    return;
  }

  modalCast.innerHTML = cast
    .map(
      (actor) => `
      <div class="cast-member">
        <img class="cast-photo" src="${actor.photo}" alt="${actor.name}" />
        <div class="cast-name">${actor.name}</div>
        <div class="cast-character">${actor.character}</div>
      </div>
    `
    )
    .join("");
}

function renderUserReviews(title) {
  const reviews = getReviewsForMovie(title);

  if (reviews.length === 0) {
    modalUserReviews.innerHTML = '<p class="no-reviews">No reviews yet. Be the first!</p>';
    return;
  }

  modalUserReviews.innerHTML = reviews
    .map(
      (r) => `
      <div class="user-review">
        <span class="reviewer-name">${r.name}</span>
        <span class="reviewer-date">${r.date}</span>
        <p>${r.text}</p>
      </div>
    `
    )
    .join("");
}

modalClose.addEventListener("click", closeMovieModal);

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeMovieModal();
  }
});

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = reviewerName.value.trim();
  const text = reviewerText.value.trim();

  if (name === "" || text === "") return;

  addReviewForMovie(currentMovieTitle, name, text);
  renderUserReviews(currentMovieTitle);
  reviewForm.reset();
});

// ===========================================
// 9. FETCH REAL POSTERS FROM TMDb
// ===========================================
async function fetchPosterForMovie(movie) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      movie.tmdbId = result.id;
      if (result.poster_path) {
        movie.poster = TMDB_IMG_BASE + result.poster_path;
      }
    }
  } catch (error) {
    console.error("Couldn't fetch poster for", movie.title, error);
  }
}

// ===========================================
// 9b. FETCH CAST FROM TMDb
// Uses the movie's TMDb id to get top cast members with photos.
// ===========================================
async function fetchCastForMovie(movie) {
  if (!movie.tmdbId) {
    movie.cast = [];
    return;
  }

  try {
    const url = `https://api.themoviedb.org/3/movie/${movie.tmdbId}/credits?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cast) {
      movie.cast = data.cast.slice(0, 6).map((actor) => ({
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path
          ? TMDB_IMG_BASE + actor.profile_path
          : "https://placehold.co/140x140/170a26/a855f7?text=" + encodeURIComponent(actor.name.split(" ")[0])
      }));
    } else {
      movie.cast = [];
    }
  } catch (error) {
    console.error("Couldn't fetch cast for", movie.title, error);
    movie.cast = [];
  }
}

async function fetchAllPosters() {
  await Promise.all(
    movies.map(async (movie) => {
      await fetchPosterForMovie(movie);
      await fetchCastForMovie(movie);
    })
  );
  applyFilters();
}

// ===========================================
// 10. INITIAL LOAD
// ===========================================
renderMovies(movies);
fetchAllPosters();

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
  movieGrid.innerHTML = ""; // clear the grid first

  if (movieList.length === 0) {
    movieGrid.innerHTML = "<p style='color:#b5a8a0;'>No movies match your search.</p>";
    return;
  }

  movieList.forEach((movie) => {
    // find this movie's real index in the original array
    // (so star-clicks update the correct movie even after filtering)
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

    // Open the review modal when the card itself is clicked
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
        event.stopPropagation(); // don't let this click also open the movie modal

        const movieIndex = group.getAttribute("data-movie");
        const newRating = parseInt(star.getAttribute("data-value"));

        // update the data
        movies[movieIndex].rating = newRating;

        // re-render so the change shows immediately
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

// Run the filter every time the user types or changes the dropdown
searchInput.addEventListener("input", applyFilters);
genreFilter.addEventListener("change", applyFilters);

// ===========================================
// 7. USER REVIEWS — SAVED IN localStorage
// localStorage only stores data in THIS browser, on THIS device.
// It's perfect for a personal project/demo, but other visitors
// won't see reviews added on someone else's computer.
// ===========================================

// Get all saved reviews as one object, e.g.
// { "Inception": [{name: "Rahul", text: "Loved it", date: "..."}], ... }
function getAllUserReviews() {
  const data = localStorage.getItem("movieUserReviews");
  return data ? JSON.parse(data) : {};
}

// Get just the reviews for one movie
function getReviewsForMovie(title) {
  const allReviews = getAllUserReviews();
  return allReviews[title] || [];
}

// Add a new review for a movie and save it back to localStorage
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
// 8. MODAL — OPEN, CLOSE, AND DISPLAY REVIEWS
// ===========================================
function openMovieModal(movie) {
  currentMovieTitle = movie.title;

  modalPoster.src = movie.poster;
  modalPoster.alt = movie.title + " poster";
  modalTitle.textContent = movie.title;
  modalMeta.textContent = movie.genre + " • " + movie.year;
  modalOriginalReview.textContent = movie.review;

  renderUserReviews(movie.title);

  reviewForm.reset();
  modalOverlay.classList.add("active");
}

function closeMovieModal() {
  modalOverlay.classList.remove("active");
  currentMovieTitle = null;
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

// Close modal when clicking the X button
modalClose.addEventListener("click", closeMovieModal);

// Close modal when clicking the dark overlay (but not the box itself)
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeMovieModal();
  }
});

// Handle the "Add Your Review" form submission
reviewForm.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from refreshing

  const name = reviewerName.value.trim();
  const text = reviewerText.value.trim();

  if (name === "" || text === "") return;

  addReviewForMovie(currentMovieTitle, name, text);
  renderUserReviews(currentMovieTitle); // refresh the list immediately
  reviewForm.reset();
});

// ===========================================
// 9. FETCH REAL POSTERS FROM TMDb
// For each movie, search TMDb by title and grab its official poster.
// Runs once when the page loads; cards start with placeholders and
// update automatically as each real poster arrives.
// ===========================================
async function fetchPosterForMovie(movie) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      movie.poster = TMDB_IMG_BASE + data.results[0].poster_path;
    }
  } catch (error) {
    // If TMDb is unreachable or the key is invalid, just keep the placeholder
    console.error("Couldn't fetch poster for", movie.title, error);
  }
}

async function fetchAllPosters() {
  // Fetch all posters in parallel, then re-render once they're ready
  await Promise.all(movies.map(fetchPosterForMovie));
  applyFilters(); // re-draw the grid with real posters now in place
}

// ===========================================
// 10. INITIAL LOAD
// Show placeholders immediately, then swap in real posters once fetched.
// ===========================================
renderMovies(movies);
fetchAllPosters();

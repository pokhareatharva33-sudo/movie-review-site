// ===========================================
// 1. MOVIE DATA
// Each movie is an object with details.
// In a real project, this could come from an API instead.
// ===========================================
const movies = [
  {
    title: "Galaxy Drift",
    genre: "Sci-Fi",
    year: 2023,
    review: "A visually stunning space adventure with a story that keeps you guessing till the last scene.",
    rating: 4,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Galaxy+Drift"
  },
  {
    title: "The Last Verdict",
    genre: "Drama",
    year: 2022,
    review: "Powerful courtroom drama carried by outstanding performances from the lead cast.",
    rating: 5,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=The+Last+Verdict"
  },
  {
    title: "Rickshaw Riot",
    genre: "Comedy",
    year: 2021,
    review: "A laugh-out-loud comedy of errors set in the streets of Mumbai. Simple but effective.",
    rating: 3,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Rickshaw+Riot"
  },
  {
    title: "Silent Hunter",
    genre: "Thriller",
    year: 2024,
    review: "Tense, edge-of-your-seat thriller, though the ending feels a little rushed.",
    rating: 4,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Silent+Hunter"
  },
  {
    title: "Iron Fury",
    genre: "Action",
    year: 2020,
    review: "Non-stop action sequences, but the plot takes a backseat to the explosions.",
    rating: 3,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Iron+Fury"
  },
  {
    title: "Monsoon Diaries",
    genre: "Drama",
    year: 2023,
    review: "A quiet, heartfelt story about family and forgiveness set during the rains.",
    rating: 5,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Monsoon+Diaries"
  }
];

// ===========================================
// 2. GRAB ELEMENTS FROM THE PAGE
// ===========================================
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

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
      star.addEventListener("click", () => {
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
// 7. INITIAL LOAD — show all movies when the page opens
// ===========================================
renderMovies(movies);

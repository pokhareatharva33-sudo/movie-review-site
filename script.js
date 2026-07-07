// ===========================================
// 1. MOVIE DATA
// Each movie is an object with details.
// In a real project, this could come from an API instead.
// ===========================================
const movies = [
  {
    title: "3 Idiots",
    genre: "Comedy",
    year: 2009,
    review: "A hilarious yet moving take on the pressure Indian students face to conform. Balances laughs and life lessons better than almost any film in its genre.",
    rating: 5,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=3+Idiots"
  },
  {
    title: "Inception",
    genre: "Sci-Fi",
    year: 2010,
    review: "A mind-bending heist through layers of dreams. Demands full attention, but rewards it with one of the most original concepts in modern cinema.",
    rating: 5,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Inception"
  },
  {
    title: "Dangal",
    genre: "Drama",
    year: 2016,
    review: "An inspiring true story of a father training his daughters to become wrestling champions. The final match sequence is genuinely nerve-wracking.",
    rating: 5,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Dangal"
  },
  {
    title: "The Dark Knight",
    genre: "Action",
    year: 2008,
    review: "Elevated the superhero genre with a grounded, morally complex story. The performance as the villain remains one of the most talked-about in film history.",
    rating: 5,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=The+Dark+Knight"
  },
  {
    title: "Andhadhun",
    genre: "Thriller",
    year: 2018,
    review: "A darkly funny, twist-filled thriller about a blind pianist caught up in a murder. Keeps you guessing right up to the ambiguous final shot.",
    rating: 4,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Andhadhun"
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    year: 2014,
    review: "An emotional, ambitious journey through space and time. The visuals and score are stunning, even if the science lectures slow the pace at times.",
    rating: 4,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Interstellar"
  },
  {
    title: "Zindagi Na Milegi Dobara",
    genre: "Drama",
    year: 2011,
    review: "Three friends on a road trip through Spain confront their fears and figure out what they actually want from life. Warm, funny, and easy to rewatch.",
    rating: 4,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=ZNMD"
  },
  {
    title: "Baahubali: The Beginning",
    genre: "Action",
    year: 2015,
    review: "A larger-than-life epic with massive scale and ambition. The world-building and action set pieces set a new bar for Indian cinema.",
    rating: 4,
    poster: "https://placehold.co/240x300/1f1a18/d4af37?text=Baahubali"
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


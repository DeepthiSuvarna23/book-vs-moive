document.getElementById("compareBtn").addEventListener("click", compare);

async function compare() {
  const title = document.getElementById("titleInput").value.trim();
  if (!title) return;

  const verdict = document.getElementById("verdict");
  verdict.textContent = "Comparing...";
  verdict.style.color = "#333";

  try {
    const [bookData, movieData] = await Promise.all([
      fetchBookData(title),
      fetchMovieData(title)
    ]);

    displayResult("bookDetails", bookData, "Book");
    displayResult("movieDetails", movieData, "Movie");
    compareRatings(bookData.rating, movieData.rating);
  } catch (err) {
    verdict.textContent = "Oops! Something went wrong.";
    console.error(err);
  }
}

async function fetchBookData(title) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    return {
      title: "Not found",
      author: "N/A",
      rating: "N/A",
      thumbnail: ""
    };
  }

  const book = data.items[0].volumeInfo;
  return {
    title: book.title || "Unknown",
    author: book.authors ? book.authors.join(", ") : "Unknown",
    rating: book.averageRating ? book.averageRating.toString() : "N/A",
    thumbnail: book.imageLinks ? book.imageLinks.thumbnail : ""
  };
}

async function fetchMovieData(title) {
  const apiKey = "e58f9f70";
  const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "False") {
    return {
      title: "Not found",
      year: "N/A",
      rating: "N/A",
      poster: ""
    };
  }

  return {
    title: data.Title || "Unknown",
    year: data.Year || "Unknown",
    rating: data.imdbRating || "N/A",
    poster: data.Poster && data.Poster !== "N/A" ? data.Poster : ""
  };
}

function displayResult(elementId, data, type) {
  const element = document.getElementById(elementId);
  element.innerHTML = `
    <p><strong>${type} Title:</strong> ${data.title}</p>
    <p><strong>${type === "Book" ? "Author(s):" : "Year:"}</strong> ${type === "Book" ? data.author : data.year}</p>
    <p><strong>Rating:</strong> ${data.rating}</p>
    ${
      (data.thumbnail || data.poster)
        ? `<img src="${type === "Book" ? data.thumbnail : data.poster}" alt="${type} cover" style="margin-top:1rem; max-width:100%;">`
        : `<p>No image available</p>`
    }
  `;
}

function compareRatings(bookRating, movieRating) {
  const verdict = document.getElementById("verdict");

  if (!bookRating || !movieRating || bookRating === "N/A" || movieRating === "N/A") {
    verdict.textContent = "Sorry, rating not available for either the book or the movie.";
    verdict.style.color = "#ff6f61";
    return;
  }

  const book = parseFloat(bookRating);
  const movie = parseFloat(movieRating);
  let message = "";

  if (book > movie) {
    message = "📖 The Book is rated better!";
  } else if (movie > book) {
    message = "🎬 The Movie is rated better!";
  } else {
    message = "🤝 Both are equally rated!";
  }

  verdict.textContent = message;
  verdict.style.color = "#333";
}

    document.addEventListener("DOMContentLoaded", () => {
        const baseUrl = "http://localhost:3000";
        const filmsList = document.getElementById("films");
        const poster = document.getElementById("poster");
        const title = document.getElementById("title");
        const runtime = document.getElementById("runtime");
        const filmInfo = document.getElementById("film-info");
        const showtime = document.getElementById("showtime");
        const ticketNum = document.getElementById("ticket-num");
        const buyTicketButton = document.getElementById("buy-ticket");

        let selectedMovieId = null;

        

        // Buy Ticket Button
        buyTicketButton.addEventListener("click", () => {
            if (selectedMovieId) {
                fetch(`${baseUrl}/films/${selectedMovieId}`)
                    .then((response) => response.json())
                    .then((movie) => {
                        if (movie.tickets_sold < movie.capacity) {
                            movie.tickets_sold++;
                            updateMovieDetails(movie);

                            // Disable the "Buy Ticket" button
                            buyTicketButton.disabled = true;

                            // CSS class to style the list item as inactive
                            const selectedFilm = document.querySelector(`.film.item[value="${selectedMovieId}"]`);
                            selectedFilm.classList.add("inactive");

                            // PATCH request to update ticket information
                            setTimeout(() => {
                                fetch(`${baseUrl}/films/${selectedMovieId}`, {
                                    method: "PATCH",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ tickets_sold: movie.tickets_sold }),
                                });
                            }, 1000);
                        }
                    });
            }
        });

        // Function to handle movie selection
        function selectMovie(movieId) {
            if (selectedMovieId !== movieId) {
                selectedMovieId = movieId;
                const selectedFilm = document.querySelector(`.film.item[value="${movieId}"]`);
                if (selectedFilm) {
                    const activeFilms = document.querySelectorAll(".film.item");
                    activeFilms.forEach((film) => film.classList.remove("active"));
                    selectedFilm.classList.add("active");
                    fetch(`${baseUrl}/films/${movieId}`)
                        .then((response) => response.json())
                        .then((movie) => {
                            updateMovieDetails(movie);
                        });
                }
            }
        }

        // Click event listener for movie selection
        filmsList.addEventListener("click", (event) => {
            if (event.target.classList.contains("film")) {
                selectMovie(event.target.getAttribute("value"));
            }
        });

        // Function to populate the film menu
        function populateFilmMenu(films) {
            filmsList.innerHTML = "";
            films.forEach((film) => {
                const filmItem = document.createElement("li");
                filmItem.className = "film item";
                filmItem.textContent = film.title;
                filmItem.setAttribute("value", film.id);

                filmsList.appendChild(filmItem);
            });
        }

        // Movie data then select the first movie by default
        fetch(`${baseUrl}/films`)
            .then((response) => response.json())
            .then((films) => {
                if (films.length > 0) {
                    populateFilmMenu(films);
                    selectMovie(films[0].id);
                }
            });

        // Update movie details
        function updateMovieDetails(movie) {
            poster.src = movie.poster;
            title.textContent = movie.title;
            runtime.textContent = `${movie.runtime} minutes`;
            filmInfo.textContent = movie.description;
            showtime.textContent = movie.showtime;
            const availableTickets = movie.capacity - movie.tickets_sold;
            ticketNum.textContent = availableTickets;
            buyTicketButton.disabled = availableTickets === 0;
        }
    });
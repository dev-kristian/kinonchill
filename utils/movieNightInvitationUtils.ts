import { TopWatchlistItem } from "@/types/types";
import { RefObject, useEffect } from "react";

export function handleAddMovieTitle(
  inputMovieTitle: string,
  movieTitles: TopWatchlistItem[],
  setMovieTitles: React.Dispatch<React.SetStateAction<TopWatchlistItem[]>>,
  setInputMovieTitle: React.Dispatch<React.SetStateAction<string>>
) {
  if (inputMovieTitle.trim() !== "") {
    const newMovie: TopWatchlistItem = {
      id: Date.now(),
      title: inputMovieTitle.trim(),
      poster_path: "",
      vote_average: 0,
      media_type: "movie",
      watchlist_count: 0,
      weighted_score: 0,
    };
    setMovieTitles([...movieTitles, newMovie]);
    setInputMovieTitle("");
  }
}

export function removeMovieTitle(
  index: number,
  movieTitles: TopWatchlistItem[],
  setMovieTitles: React.Dispatch<React.SetStateAction<TopWatchlistItem[]>>
) {
  setMovieTitles(movieTitles.filter((_, i) => i !== index));
}

export function handleInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setInputMovieTitle: React.Dispatch<React.SetStateAction<string>>,
  topWatchlistItems: { movie: TopWatchlistItem[] },
  setSuggestions: React.Dispatch<React.SetStateAction<TopWatchlistItem[]>>
) {
  const value = e.target.value;
  setInputMovieTitle(value);

  if (value.length > 1) {
    const movieSuggestions = topWatchlistItems.movie
      .filter((item) => item.title?.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 3); // Limit to 5 suggestions

    setSuggestions(movieSuggestions);
  } else {
    setSuggestions([]);
  }
}

export function handleSuggestionClick(
    movie: TopWatchlistItem,
    setInputMovieTitle: React.Dispatch<React.SetStateAction<string>>,
    movieTitles: TopWatchlistItem[],
    setMovieTitles: React.Dispatch<React.SetStateAction<TopWatchlistItem[]>>,
    setSuggestions: React.Dispatch<React.SetStateAction<TopWatchlistItem[]>>,
    addMovieToPoll?: (movieTitle: string) => Promise<void>  // make this parameter optional
  ) {
    // Reset input and clear suggestions
    setInputMovieTitle('');
    setSuggestions([]);
  
    // Handle adding the movie locally for MovieNightInvitation
    if (movieTitles && setMovieTitles) {
      setMovieTitles([...movieTitles, movie]);
    }
  
    // If addMovieToPoll is provided, invoke it (MoviePoll scenario)
    if (addMovieToPoll && movie.title) {
      addMovieToPoll(movie.title).catch((error) => {
        console.error('Error adding movie to poll:', error);
      });
    }
  }

export function useOutsideClickHandler(
  inputContainerRef: RefObject<HTMLDivElement>,
  setSuggestions: React.Dispatch<React.SetStateAction<TopWatchlistItem[]>>
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputContainerRef, setSuggestions]);
}
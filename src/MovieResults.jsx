import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Film, User, Settings } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import api from './services/api';
import './MovieResults.css';

function MovieResults() {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(movieName);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedMovies = useMemo(() => {
    const decodedTitle = decodeURIComponent(movieName || '');

    if (Array.isArray(movies) && movies.length > 0) {
      return movies
        .map((m) => ({
          id: m?.id ?? m?.movieId ?? null,
          title: m?.title ?? m?.movieTitle ?? decodedTitle,
          posterUrl: m?.posterUrl ?? m?.posterPath ?? m?.imageUrl ?? null,
          year: m?.year ?? m?.releaseYear ?? '',
          overview: m?.overview ?? m?.description ?? '',
          genres: m?.genres ?? m?.genreNames ?? [],
        }))
        .filter((m) => m.title);
    }

    return decodedTitle
      ? [{
        id: null,
        title: decodedTitle,
        posterUrl: null,
        year: '',
        overview: '',
        genres: [],
      }]
      : [];
  }, [movieName, movies]);

  // Search movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = (await api.searchMoviesFromRecommendations?.(movieName))
          ?? (await api.searchMovies(movieName));
        setMovies(data);
      } catch (err) {
        setError('Failed to fetch movies. Please try again.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieName) {
      fetchMovies();
    }
  }, [movieName]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim() !== movieName) {
      navigate(`/movie/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileNavigate = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const handleSettingsNavigate = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  };

  const handleMovieClick = (movieTitle) => {
    navigate(`/movie-detail/0/${encodeURIComponent(movieTitle)}`);
  };

  return (
    <div className="results-container">
      <header className="results-header">
        <div className="results-header-inner">
          <div className="results-header-left">
            <button type="button" className="nav-button" onClick={handleLogoClick}>
              <Film size={18} />
              <span>MovieSearch</span>
            </button>
          </div>

          <div className="results-header-center">
            <form className="search-wrapper results-navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a movie..."
              />
              <Search
                size={20}
                className="search-icon search-icon-right"
                role="button"
                aria-label="Search"
                title="Search"
                onClick={() => {
                  if (searchQuery.trim() && searchQuery.trim() !== movieName) {
                    navigate(`/movie/${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              />
            </form>
          </div>

          <div className="results-header-right">
            <div className="profile-menu-wrapper">
              <button className="nav-button" onClick={handleProfileClick} aria-label="Profile menu">
                <User size={20} />
              </button>

              <CSSTransition
                in={showProfileMenu}
                timeout={180}
                classNames="menu"
                unmountOnExit
              >
                <div className="profile-dropdown">
                  <button className="nav-button results-navbar-btn--menu" onClick={handleProfileNavigate}>
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                  <button className="nav-button results-navbar-btn--menu" onClick={handleSettingsNavigate}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                </div>
              </CSSTransition>
            </div>
          </div>
        </div>
      </header>

      <main className="results-main">
        <section className="results-hero">
          <p className="results-kicker">Search results</p>
          <h1 className="results-title">“{movieName}”</h1>
          <p className="results-subtitle">Browse results and open a movie to get mood-based music recommendations.</p>
        </section>

        {loading && (
          <div className="results-state">
            <p>Loading movies...</p>
          </div>
        )}

        {error && (
          <div className="results-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && normalizedMovies.length === 0 && (
          <div className="results-state">
            <p>No movies found for “{movieName}”.</p>
          </div>
        )}

        {!loading && !error && normalizedMovies.length > 0 && (
          <section className="results-grid" aria-label="Movie results">
            {normalizedMovies.slice(0, 1).map((movie) => (
              <article
                key={movie.id ?? movie.title}
                className="results-card"
                onClick={() => handleMovieClick(movie.title)}
              >
                <div className="results-poster">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                  ) : (
                    <Film size={44} className="results-poster-placeholder" />
                  )}
                </div>
                <div className="results-card-body">
                  <h2 className="results-card-title">{movie.title}</h2>
                  <p className="results-card-meta">{movie.year}{movie.genres?.length ? ` • ${movie.genres.join(', ')}` : ''}</p>
                  <p className="results-card-desc">{movie.overview || 'No description available.'}</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default MovieResults;

import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Film, User, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { CSSTransition } from 'react-transition-group';
import api from './services/api';
import './MovieResults.css';
import './App.css';


function MovieResults() {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(movieName);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [movies, setMovies] = useState([]);
  const [recommendationResponse, setRecommendationResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toPosterUrl = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:'))) return raw;
    if (typeof raw === 'string' && raw.startsWith('/')) return `https://image.tmdb.org/t/p/w500${raw}`;
    if (typeof raw === 'string' && !raw.includes('://') && (raw.toLowerCase().endsWith('.jpg') || raw.toLowerCase().endsWith('.png'))) return `https://image.tmdb.org/t/p/w500/${raw}`;
    return raw;
  };

  const normalizedMovies = useMemo(() => {
    const decodedTitle = decodeURIComponent(movieName || '');

    if (Array.isArray(movies) && movies.length > 0) {
      return movies
        .map((m) => ({
          id: m?.id ?? m?.movieId ?? null,
          title: m?.title ?? m?.movieTitle ?? decodedTitle,
          posterUrl: toPosterUrl(
            m?.posterUrl ??
            m?.PosterUrl ??
            m?.posterPath ??
            m?.PosterPath ??
            m?.poster_path ??
            m?.backdropPath ??
            m?.backdrop_path ??
            m?.imageUrl ??
            m?.ImageUrl ??
            null
          ),
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

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError(null);

          let data = await api.searchMoviesFromRecommendations(movieName);

          if ((!data || (Array.isArray(data) && data.length === 0)) && api.searchMovies) {
            data = await api.searchMovies(movieName);
          }

                console.log("Backendden Gelen Tam Veri:", data);

          // Backend response şekline göre filmi ayırıyoruz.
                if (data && data.movie && data.result) {
                    setMovies([data.movie]);
                  setRecommendationResponse(data);
                }
                else if (Array.isArray(data)) {
                    setMovies(data);
                  setRecommendationResponse(null);
                }
                else {
                    setMovies([]);
                  setRecommendationResponse(null);
                }

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
    navigate(`/movie-detail/0/${encodeURIComponent(movieTitle)}`, {
      state: {
        recommendationResponse,
      },
    });
  };

  return (
    <div className="results-container">
      <header className="results-header">
        <div className="results-header-inner">
          <div className="results-header-left">
            <button type="button" className="nav-button" onClick={handleLogoClick}>
              <Film size={18} />
              <span><strong>Ostia</strong></span>
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
            <button

                            style={{ marginRight: '10px' }}
                            type="button"
                            className="nav-button"
                            onClick={theme.toggleTheme}
                            aria-label="Toggle theme"
                            title={theme.theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        >
                            {theme.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            <span>{theme.theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>
            <div className="profile-menu-wrapper">
              <button className="nav-button" onClick={handleProfileClick} aria-label="Profile menu">
                <User size={20} />
              </button>

              {showProfileMenu && (
                                    <div className="profile-dropdown">
                                        <button className="dropdown-item" onClick={handleProfileNavigate}>
                                            <User size={18} />
                                            <span>Profile</span>
                                        </button>
                                        <button className="dropdown-item" onClick={handleSettingsNavigate}>
                                            <Settings size={18} />
                                            <span>Settings</span>
                                        </button>
                                    </div>
                                )}
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

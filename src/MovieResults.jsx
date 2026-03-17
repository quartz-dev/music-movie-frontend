import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Film, User, Settings } from 'lucide-react';
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

  // Film araması yap
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.searchMovies(movieName);
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

  const handleMovieClick = (movieId, movieTitle) => {
    navigate(`/movie-detail/${movieId}/${encodeURIComponent(movieTitle)}`);
  };

  return (
    <div className="results-container">
      <header className="results-header">
        <div className="results-header-inner">
          <button type="button" className="results-logo" onClick={handleLogoClick}>
            <Film size={18} />
            <span>MovieSearch</span>
          </button>

          <form className="results-search" onSubmit={handleSearch}>
            <Search size={18} className="results-search-icon" />
            <input
              type="text"
              className="results-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies"
            />
          </form>

          <div className="profile-menu-wrapper">
            <button className="profile-button" onClick={handleProfileClick} aria-label="Profil menüsü">
              <User size={20} />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleProfileNavigate}>
                  <User size={18} />
                  <span>Profilim</span>
                </button>
                <button className="dropdown-item" onClick={handleSettingsNavigate}>
                  <Settings size={18} />
                  <span>Ayarlar</span>
                </button>
              </div>
            )}
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

        {!loading && !error && movies.length === 0 && (
          <div className="results-state">
            <p>No movies found for “{movieName}”.</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <section className="results-grid" aria-label="Movie results">
            {movies.map((movie) => (
              <article
                key={movie.id}
                className="results-card"
                onClick={() => handleMovieClick(movie.id, movie.title)}
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

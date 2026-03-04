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
      {/* Header - Google tarzı arama çubuğu ile */}
      <header className="results-header">
        <div className="header-content">
          <div className="logo-section" onClick={handleLogoClick}>
            <Film size={32} className="logo-icon" />
            <span className="logo-text">MovieSearch</span>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={20} className="search-bar-icon" />
            <input
              type="text"
              className="search-bar-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Film ara..."
            />
          </form>

          {/* Profil Butonu */}
          <div className="header-profile-wrapper">
            <div className="profile-menu-wrapper">
              <button 
                className="profile-button"
                onClick={handleProfileClick}
                aria-label="Profil menüsü"
              >
                <User size={20} />
              </button>

              {/* Dropdown Menü */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button 
                    className="dropdown-item"
                    onClick={handleProfileNavigate}
                  >
                    <User size={18} />
                    <span>Profilim</span>
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={handleSettingsNavigate}
                  >
                    <Settings size={18} />
                    <span>Ayarlar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ana içerik alanı */}
      <main className="results-main">
        <div className="results-info">
          <p className="results-count">"{movieName}" için sonuçlar</p>
        </div>

        <div className="results-content">
          {loading && (
            <div className="loading-message">
              <p>Loading movies...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div className="no-results">
              <p>No movies found for "{movieName}"</p>
            </div>
          )}

          {!loading && !error && movies.length > 0 && movies.map((movie) => (
            <div 
              key={movie.id} 
              className="result-card" 
              onClick={() => handleMovieClick(movie.id, movie.title)}
            >
              <div className="result-poster">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} />
                ) : (
                  <Film size={60} className="placeholder-icon" />
                )}
              </div>
              <div className="result-details">
                <h2 className="result-title">{movie.title}</h2>
                <p className="result-meta">
                  {movie.year} • {movie.genres?.join(', ')}
                </p>
                <p className="result-description">
                  {movie.overview || 'No description available.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MovieResults;

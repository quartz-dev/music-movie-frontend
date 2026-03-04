import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Settings, TrendingUp, Grid, Music, LogIn, UserPlus } from 'lucide-react';
import './App.css';

function Home() {
  const [query, setQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/movie/${query}`);
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      navigate(`/movie/${query}`);
    }
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

  return (
    <div className="dark-container">
      <nav className="home-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button className="profile-nav-button" onClick={handleProfileNavigate}>
              <User size={18} />
              <span>Profile</span>
            </button>
            <button className="nav-button" onClick={() => navigate('/popular')}>
              <TrendingUp size={18} />
              <span>Popular</span>
            </button>
            <button className="nav-button" onClick={() => navigate('/categories')}>
              <Grid size={18} />
              <span>Categories</span>
            </button>
            <button className="nav-button" onClick={() => navigate('/playlists')}>
              <Music size={18} />
              <span>Playlists</span>
            </button>
          </div>
          <div className="navbar-right">
            {!isLoggedIn ? (
              <>
                <button className="auth-nav-button" onClick={() => navigate('/login')}>
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                <button className="auth-nav-button register-btn" onClick={() => navigate('/register')}>
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <div className="profile-menu-wrapper">
                <button className="profile-button" onClick={handleProfileClick} aria-label="Profile menu">
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
            )}
          </div>
        </div>
      </nav>
      <form className="search-wrapper" onSubmit={handleSearch}>
        <Search size={20} className="search-icon" onClick={handleSearchClick} />
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
        />
      </form>
    </div>
  );
}

export default Home;

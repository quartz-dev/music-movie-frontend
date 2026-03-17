import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Film, Music, Clock, Sparkles, Settings } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from './context/AuthContext';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const auth = useAuth();

  const userData = auth.user;

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleSettingsNavigate = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  };

  // Sample data - real data will come from the API
  const recentSearches = [
    { id: 1, title: "Inception", year: 2010, searchDate: "2 days ago" },
    { id: 2, title: "Interstellar", year: 2014, searchDate: "1 week ago" },
    { id: 3, title: "The Dark Knight", year: 2008, searchDate: "2 weeks ago" },
    { id: 4, title: "Pulp Fiction", year: 1994, searchDate: "1 month ago" },
  ];

  const playlists = [
    { 
      id: 1, 
      name: "Inception Soundtrack Mix", 
      songCount: 12, 
      duration: "48 min",
      movie: "Inception"
    },
    { 
      id: 2, 
      name: "Sci-Fi Classics", 
      songCount: 20, 
      duration: "1 hr 20 min",
      movie: "Interstellar"
    },
    { 
      id: 3, 
      name: "Epic Movie Themes", 
      songCount: 15, 
      duration: "58 min",
      movie: "The Dark Knight"
    },
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} />
          Home
        </button>

        <div className="header-right-section">
          <button onClick={() => navigate('/settings')} className="settings-link-btn">
            Settings
          </button>

          {/* Profil Butonu */}
          <div className="profile-menu-wrapper">
            <button 
              className="profile-button avatar-circle"
              onClick={handleProfileClick}
              aria-label="Profile menu"
              style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent)', color: 'white', fontWeight: 'bold' }}
            >
              {userData?.profilePictureUrl ? (
                <img src={userData.profilePictureUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : userData?.username ? (
                userData.username.charAt(0).toUpperCase()
              ) : userData?.userName ? (
                userData.userName.charAt(0).toUpperCase()
              ) : userData?.name ? (
                userData.name.charAt(0).toUpperCase()
              ) : userData?.firstName ? (
                userData.firstName.charAt(0).toUpperCase()
              ) : userData?.email ? (
                userData.email.charAt(0).toUpperCase()
              ) : (
                <User size={20} />
              )}
            </button>

            {/* Dropdown Menü */}
            <CSSTransition
              in={showProfileMenu}
              timeout={180}
              classNames="menu"
              unmountOnExit
            >
              <div className="profile-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Zaten profil sayfasındayız
                  }}
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={handleSettingsNavigate}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </div>
            </CSSTransition>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {auth.loading && (
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Loading...</h2>
            </div>
          </div>
        )}
        {/* Kullanıcı Bilgileri Kartı */}
        <div className="profile-card">
          <div className="profile-avatar profile-avatar--filled" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent)', color: 'white', fontSize: '32px', fontWeight: 'bold', margin: '0 auto 20px auto' }}>
              {userData?.profilePictureUrl ? (
                <img src={userData.profilePictureUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : userData?.username ? (
                userData.username.charAt(0).toUpperCase()
              ) : userData?.userName ? (
                userData.userName.charAt(0).toUpperCase()
              ) : userData?.name ? (
                userData.name.charAt(0).toUpperCase()
              ) : userData?.firstName ? (
                userData.firstName.charAt(0).toUpperCase()
              ) : userData?.email ? (
                userData.email.charAt(0).toUpperCase()
              ) : (
                <User size={40} />
              )}
          </div>

          <h1 className="profile-title">{
            (userData?.name || userData?.firstName) && (userData?.surname || userData?.lastName) 
              ? `${userData.name || userData.firstName} ${userData.surname || userData.lastName}` 
              : userData?.name ? userData.name
              : (userData?.username || userData?.userName || 'Kullanıcı Profili')
          }</h1>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{recentSearches.length}</div>
              <div className="stat-label">Film Arama</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{playlists.length}</div>
              <div className="stat-label">Playlist</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">
                {playlists.reduce((sum, p) => sum + p.songCount, 0)}
              </div>
              <div className="stat-label">Şarkı</div>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <Mail size={20} />
              <div className="info-text">
                <span className="info-label">E-posta</span>
                <span className="info-value">{userData?.email || 'Unknown'}</span>
              </div>
            </div>

            <div className="info-item">
              <Calendar size={20} />
              <div className="info-text">
                <span className="info-label">Üyelik Tarihi</span>
                <span className="info-value">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Son Aranan Filmler */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={24} />
              Recently searched movies
            </h2>
          </div>

          <div className="movies-grid">
            {recentSearches.map(movie => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster-placeholder">
                  <Film size={40} />
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                  <p className="movie-search-date">{movie.searchDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Oluşturulan Playlistler */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <Music size={24} />
              My playlists
            </h2>
          </div>

          <div className="playlists-list">
            {playlists.map(playlist => (
              <div key={playlist.id} className="playlist-card">
                <div className="playlist-icon">
                  <Sparkles size={28} />
                </div>
                <div className="playlist-info">
                  <h3 className="playlist-name">{playlist.name}</h3>
                  <p className="playlist-source">From the movie "{playlist.movie}"</p>
                  <div className="playlist-meta">
                    <span>{playlist.songCount} songs</span>
                    <span className="meta-dot">•</span>
                    <span>{playlist.duration}</span>
                  </div>
                </div>
                <button className="playlist-play-btn">
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="profile-note">
          This is a sample profile page. Real user data will be shown here when
          authentication and the movie API are integrated.
        </p>
      </div>
    </div>
  );
}

export default Profile;

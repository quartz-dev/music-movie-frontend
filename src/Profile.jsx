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

  // Örnek veriler - gerçek veriler API'den gelecek
  const recentSearches = [
    { id: 1, title: "Inception", year: 2010, searchDate: "2 gün önce" },
    { id: 2, title: "Interstellar", year: 2014, searchDate: "1 hafta önce" },
    { id: 3, title: "The Dark Knight", year: 2008, searchDate: "2 hafta önce" },
    { id: 4, title: "Pulp Fiction", year: 1994, searchDate: "1 ay önce" },
  ];

  const playlists = [
    { 
      id: 1, 
      name: "Inception Soundtrack Mix", 
      songCount: 12, 
      duration: "48 dk",
      movie: "Inception"
    },
    { 
      id: 2, 
      name: "Sci-Fi Classics", 
      songCount: 20, 
      duration: "1s 20dk",
      movie: "Interstellar"
    },
    { 
      id: 3, 
      name: "Epic Movie Themes", 
      songCount: 15, 
      duration: "58 dk",
      movie: "The Dark Knight"
    },
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} />
          Ana Sayfa
        </button>

        <div className="header-right-section">
          <button onClick={() => navigate('/settings')} className="settings-link-btn">
            Ayarlar
          </button>

          {/* Profil Butonu */}
          <div className="profile-menu-wrapper">
            <button 
              className="profile-button avatar-circle"
              onClick={handleProfileClick}
              aria-label="Profil menüsü"
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
                <span className="info-value">{userData?.email || 'Bilinmiyor'}</span>
              </div>
            </div>

            <div className="info-item">
              <Calendar size={20} />
              <div className="info-text">
                <span className="info-label">Üyelik Tarihi</span>
                <span className="info-value">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Bilinmiyor'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Son Aranan Filmler */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={24} />
              Son Aranan Filmler
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
              Playlistlerim
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
                  <p className="playlist-source">"{playlist.movie}" filminden</p>
                  <div className="playlist-meta">
                    <span>{playlist.songCount} şarkı</span>
                    <span className="meta-dot">•</span>
                    <span>{playlist.duration}</span>
                  </div>
                </div>
                <button className="playlist-play-btn">
                  Çal
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="profile-note">
          Bu bir örnek profil sayfasıdır. Gerçek kullanıcı verileri 
          authentication ve film API'si entegre edildiğinde burada gösterilecektir.
        </p>
      </div>
    </div>
  );
}

export default Profile;

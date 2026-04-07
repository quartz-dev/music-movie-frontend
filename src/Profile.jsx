import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Film, Music, Clock, Sparkles, Settings } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import './Profile.css';

const normalizeRecentSearches = (payload) => {
  const list =
    (Array.isArray(payload) ? payload : null) ??
    (Array.isArray(payload?.data) ? payload.data : null) ??
    (Array.isArray(payload?.result?.data) ? payload.result.data : null) ??
    (Array.isArray(payload?.items) ? payload.items : null) ??
    [];

  return list.map((item, index) => ({
    id: item?.id ?? item?.searchId ?? `${item?.movieTitle ?? item?.title ?? 'search'}-${index}`,
    title: item?.movieTitle ?? item?.title ?? 'Unknown movie',
    year: item?.year ?? item?.releaseYear ?? '',
    searchDate: item?.searchDate ?? item?.createdDate ?? item?.createdAt ?? null,
  }));
};

const normalizePlaylists = (payload) => {
  const list =
    (Array.isArray(payload) ? payload : null) ??
    (Array.isArray(payload?.data) ? payload.data : null) ??
    (Array.isArray(payload?.Data) ? payload.Data : null) ??
    (Array.isArray(payload?.result?.data) ? payload.result.data : null) ??
    (Array.isArray(payload?.Result?.Data) ? payload.Result.Data : null) ??
    (Array.isArray(payload?.items) ? payload.items : null) ??
    [];

  return list.map((item, index) => {
    const movie = item?.movie ?? item?.Movie ?? null;
    const musics =
      (Array.isArray(item?.musics) ? item.musics : null) ??
      (Array.isArray(item?.Musics) ? item.Musics : null) ??
      (Array.isArray(item?.songs) ? item.songs : null) ??
      [];
    return {
      id:
        item?.id ??
        item?.Id ??
        item?.playlistId ??
        item?.PlaylistId ??
        item?.playlistID ??
        `${item?.playlistName ?? item?.PlaylistName ?? item?.name ?? item?.Name ?? 'playlist'}-${index}`,
      name: item?.playlistName ?? item?.PlaylistName ?? item?.name ?? item?.Name ?? 'Untitled playlist',
      songCount: item?.songCount ?? item?.SongCount ?? musics.length ?? 0,
      movie:
        movie?.title ??
        movie?.Title ??
        movie?.movieTitle ??
        movie?.MovieTitle ??
        item?.movieTitle ??
        item?.MovieTitle ??
        null,
      duration: item?.duration ?? item?.Duration ?? null,
      isDeleted: Boolean(item?.isDeleted ?? item?.IsDeleted),
    };
  }).filter((playlist) => !playlist.isDeleted);
};

const formatRelativeDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString();
};

function Profile() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const auth = useAuth();

  const userData = auth.user;

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleSettingsNavigate = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        const [recentResponse, playlistsResponse] = await Promise.all([
          api.getUserRecentSearches?.(),
          api.getUserPlaylists?.(auth?.user?.id ?? auth?.user?.userId ?? null, true),
        ]);

        if (ignore) return;

        setRecentSearches(normalizeRecentSearches(recentResponse));
        setPlaylists(normalizePlaylists(playlistsResponse));
      } catch (err) {
        console.error('Profile data fetch error:', err);
        if (!ignore) {
          setRecentSearches([]);
          setPlaylists([]);
          setDataError('Profile data could not be loaded.');
        }
      } finally {
        if (!ignore) setDataLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [auth?.user?.id, auth?.user?.userId]);

  const totalSongs = useMemo(() => playlists.reduce((sum, playlist) => sum + (playlist.songCount ?? 0), 0), [playlists]);

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
                {totalSongs}
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
            {dataLoading && <p className="profile-note">Loading recent searches...</p>}
            {!dataLoading && recentSearches.length === 0 && <p className="profile-note">No recent searches yet.</p>}
            {recentSearches.map(movie => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster-placeholder">
                  <Film size={40} />
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                  <p className="movie-search-date">{formatRelativeDate(movie.searchDate)}</p>
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
            {dataLoading && <p className="profile-note">Loading playlists...</p>}
            {!dataLoading && playlists.length === 0 && <p className="profile-note">No playlists yet.</p>}
            {playlists.map(playlist => (
              <div key={playlist.id} className="playlist-card">
                <div className="playlist-icon">
                  <Sparkles size={28} />
                </div>
                <div className="playlist-info">
                  <h3 className="playlist-name">{playlist.name}</h3>
                  <p className="playlist-source">{playlist.movie ? `From the movie "${playlist.movie}"` : 'No movie attached'}</p>
                  <div className="playlist-meta">
                    <span>{playlist.songCount} songs</span>
                    {playlist.duration && (
                      <>
                        <span className="meta-dot">•</span>
                        <span>{playlist.duration}</span>
                      </>
                    )}
                  </div>
                </div>
                <button className="playlist-play-btn" onClick={() => navigate(`/playlists/${playlist.id}`)}>
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>

        {dataError && <p className="profile-note">{dataError}</p>}
      </div>
    </div>
  );
}

export default Profile;

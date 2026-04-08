import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Settings, TrendingUp, Grid, Music, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import api from './services/api';
import './App.css';

function Home() {
    const [query, setQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
    const auth = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;

        (async () => {
            try {
                const payload = await api.getRecentPublicPlaylists(10, true);

                const playlists =
                    (Array.isArray(payload) ? payload : null) ??
                    (Array.isArray(payload?.data) ? payload.data : null) ??
                    (Array.isArray(payload?.Data) ? payload.Data : null) ??
                    (Array.isArray(payload?.items) ? payload.items : null) ??
                    [];

                if (!ignore) setFeaturedPlaylists(playlists.slice(0, 10));
            } catch {
                if (!ignore) setFeaturedPlaylists([]);
            }
        })();

        return () => {
            ignore = true;
        };
    }, []);

    const setCardTilt = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (py - 0.5) * -8;
        const ry = (px - 0.5) * 10;
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
        card.style.setProperty('--px', `${px * 100}%`);
        card.style.setProperty('--py', `${py * 100}%`);
    };

    const resetCardTilt = (e) => {
        const card = e.currentTarget;
        card.style.setProperty('--rx', `0deg`);
        card.style.setProperty('--ry', `0deg`);
        card.style.setProperty('--px', `50%`);
        card.style.setProperty('--py', `50%`);
    };

    const userData = auth.user;
    const isLoggedIn = auth.isLoggedIn;
    const authLoading = auth.loading;

    const handleLogout = async () => {
        await auth.logout();
        setShowProfileMenu(false);
        navigate('/');
    };

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
        <div className={theme.theme === 'dark' ? 'dark-container' : 'light-container'}>
            <nav className="home-navbar">
                <div className="navbar-content">
                    <div className="navbar-left">
                        {isLoggedIn && !authLoading && (
                            <button className="profile-nav-button" onClick={handleProfileNavigate}>
                                <User size={18} />
                                <span>Profile</span>
                            </button>
                        )}
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
                        <button
                            type="button"
                            className="nav-button"
                            onClick={theme.toggleTheme}
                            aria-label="Toggle theme"
                            title={theme.theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        >
                            {theme.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            <span>{theme.theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>

                        {!authLoading && !isLoggedIn ? (
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
                        ) : isLoggedIn ? (
                            <div className="profile-menu-wrapper">
                                <button className="profile-button avatar-circle" onClick={handleProfileClick} aria-label="Profile menu" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent)', color: 'white', fontWeight: 'bold' }}>
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
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </nav>
            <main className="home-main">
                <section className="home-hero">
                    <p className="home-eyebrow">Cinematic discovery, tuned to your taste</p>
                    <h1 className="home-title">Search a movie. Feel its mood. Match it with music.</h1>

                    <form className="search-wrapper" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for a movie..."
                        />
                        <Search
                            size={20}
                            className="search-icon search-icon-right"
                            onClick={handleSearchClick}
                            role="button"
                            aria-label="Search"
                            title="Search"
                        />
                    </form>

                    <section className="featured">
                        <div className="featured-frame">
                            <div className="featured-floating">
                                <h2 className="featured-title">Recent playlists</h2>
                                <p className="featured-subtitle">The latest 10 public playlists shared by the community.</p>
                            </div>
                            <div className="featured-row" role="list">
                                {featuredPlaylists.map((pl) => (
                                    <button
                                        key={pl.id ?? pl.playlistId ?? pl.name}
                                        type="button"
                                        role="listitem"
                                        className={`featured-card ${((pl.favoritesCount ?? pl.favCount ?? 0) % 2 === 0) ? 'is-accent2' : 'is-accent'}`}
                                        onClick={() => navigate(`/playlists`)}
                                        onPointerMove={setCardTilt}
                                        onPointerLeave={resetCardTilt}
                                        onPointerCancel={resetCardTilt}
                                    >
                                        <div className="pl-top">
                                            <div className="pl-cover" aria-hidden="true">
                                                {pl.coverImageUrl ? (
                                                    <img className="pl-cover-img" src={pl.coverImageUrl} alt="" />
                                                ) : (
                                                    <div className="pl-cover-fallback" />
                                                )}
                                            </div>

                                            <div className="pl-head">
                                                <div className="pl-title" title={pl.name ?? pl.playlistName ?? 'Playlist'}>
                                                    {pl.name ?? pl.playlistName ?? 'Playlist'}
                                                </div>
                                                <div className="pl-owner">
                                                    {pl.ownerName ?? pl.createdBy ?? pl.userName ?? 'Community'}
                                                    {typeof (pl.favoritesCount ?? pl.favCount) === 'number' ? ` • ${pl.favoritesCount ?? pl.favCount} fav` : ''}
                                                </div>

                                                <div className="pl-actions">
                                                    <div className="pl-save" aria-hidden="true">
                                                        + Kaydet
                                                    </div>
                                                    <div className="pl-controls" aria-hidden="true">
                                                        <div className="pl-dot" />
                                                        <div className="pl-dot" />
                                                        <div className="pl-dot" />
                                                    </div>
                                                    <div className="pl-play" aria-hidden="true" title="Play">
                                                        ▶
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pl-preview" aria-hidden="true">
                                            {(Array.isArray(pl.tracksPreview) ? pl.tracksPreview : [
                                                { title: 'Track', artist: 'Artist', duration: '03:12' },
                                                { title: 'Track', artist: 'Artist', duration: '02:48' },
                                                { title: 'Track', artist: 'Artist', duration: '03:35' },
                                            ]).slice(0, 3).map((t, idx) => (
                                                <div className="pl-track" key={idx}>
                                                    <div className="pl-track-no">{idx + 1}</div>
                                                    <div className="pl-track-meta">
                                                        <div className="pl-track-title">{t.title ?? t.name ?? `Track ${idx + 1}`}</div>
                                                        <div className="pl-track-artist">{t.artist ?? t.artistName ?? 'Artist'}</div>
                                                    </div>
                                                    <div className="pl-track-time">{t.duration ?? ''}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default Home;
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Film, Search } from 'lucide-react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import './Playlists.css';

const normalizePlaylistsPayload = (payload) => {
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
    const name = item?.playlistName ?? item?.PlaylistName ?? item?.name ?? item?.Name ?? 'Untitled playlist';

    return {
      id: item?.id ?? item?.Id ?? item?.playlistId ?? item?.PlaylistId ?? item?.playlistID ?? `${name}-${index}`,
      userId: item?.userId ?? item?.UserId ?? null,
      name,
      description: item?.description ?? item?.Description ?? null,
      movieId: item?.movieId ?? item?.MovieId ?? null,
      movieTitle:
        movie?.title ??
        movie?.Title ??
        movie?.movieTitle ??
        movie?.MovieTitle ??
        item?.movieTitle ??
        item?.MovieTitle ??
        null,
      coverUrl:
        movie?.posterUrl ??
        movie?.PosterUrl ??
        movie?.posterPath ??
        movie?.PosterPath ??
        movie?.coverUrl ??
        movie?.CoverUrl ??
        movie?.imageUrl ??
        movie?.ImageUrl ??
        item?.coverUrl ??
        item?.CoverUrl ??
        null,
      isPublic: Boolean(item?.isPublic ?? item?.IsPublic),
      favoriteCount: item?.favoriteCount ?? item?.FavoriteCount ?? 0,
      createdAt: item?.createdDate ?? item?.CreatedDate ?? item?.createdAt ?? item?.CreatedAt ?? null,
      updatedAt: item?.updatedDate ?? item?.UpdatedDate ?? item?.updatedAt ?? item?.UpdatedAt ?? null,
      isDeleted: Boolean(item?.isDeleted ?? item?.IsDeleted),
      songCount: item?.songCount ?? item?.SongCount ?? musics.length ?? 0,
    };
  }).filter((playlist) => !playlist.isDeleted);
};

function Playlists() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab === 'movies' ? 'movies' : 'playlists');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth.loading && !auth.isLoggedIn) {
      navigate('/login', {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      });
    }
  }, [auth.loading, auth.isLoggedIn, location.pathname, location.search, location.hash, navigate]);

  useEffect(() => {
    let ignore = false;

    if (auth.loading) return;

    if (!auth.isLoggedIn) {
      setPlaylists([]);
      setError(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
        const data = await api.getUserPlaylists(userId, true);
        if (!ignore) {
          setPlaylists(normalizePlaylistsPayload(data));
        }
      } catch (err) {
        console.error('Failed to load playlists:', err);
        if (!ignore) {
          setPlaylists([]);
          setError('Failed to load playlists.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [location.state?.refresh, auth.loading, auth.isLoggedIn, auth?.user?.id, auth?.user?.userId]);

  const handleSearchClick = () => {
    if (query.trim()) {
      navigate(`/playlists?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchClick();
  };

  const movies = useMemo(() => {
    const map = new Map();
    for (const p of playlists) {
      if (!p.movieTitle) continue;
      const key = p.movieTitle;
      const existing = map.get(key);
      if (existing) {
        existing.playlistCount += 1;
        continue;
      }
      map.set(key, {
        title: p.movieTitle,
        coverUrl: p.coverUrl,
        playlistCount: 1,
      });
    }
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [playlists]);

  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case 'name_asc':
        return 'Name (A–Z)';
      case 'name_desc':
        return 'Name (Z–A)';
      case 'songs_desc':
        return 'Song count';
      case 'recent':
      default:
        return 'Most recent';
    }
  }, [sortBy]);

  const sortedPlaylists = useMemo(() => {
    const copy = [...playlists];
    switch (sortBy) {
      case 'name_asc':
        copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return copy;
      case 'name_desc':
        copy.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        return copy;
      case 'songs_desc':
        copy.sort((a, b) => (b.songCount ?? 0) - (a.songCount ?? 0));
        return copy;
      case 'recent':
      default:
        copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return copy;
    }
  }, [playlists, sortBy]);

  const visiblePlaylists = useMemo(() => {
    if (activeTab !== 'movies') return sortedPlaylists;
    if (!selectedMovie) return [];
    return sortedPlaylists.filter((p) => (p.movieTitle || '') === selectedMovie);
  }, [activeTab, selectedMovie, sortedPlaylists]);

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter((m) => (m.title || '').toLowerCase().includes(q));
  }, [movies, query]);

  const filteredPlaylists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visiblePlaylists;

    if (activeTab === 'movies') {
      return visiblePlaylists;
    }

    return visiblePlaylists.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [activeTab, query, visiblePlaylists]);

  return (
    <div className="dark-container">
      <main className="library-page">
      <div className="library-topbar">
        <h1 className="library-title">Your Library</h1>

        <form className="library-topbar-search" role="search" onSubmit={handleSearchSubmit}>
          <input
            className="library-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library"
            aria-label="Search your library"
          />
          <Search
            size={18}
            className="library-search-icon library-search-icon-right"
            onClick={handleSearchClick}
            role="button"
            aria-label="Search"
            title="Search"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSearchClick();
            }}
          />
        </form>

         <div className="library-topbar-actions" />
      </div>

      <div className="library-tabs-row">
        <div className="library-tabs" role="tablist" aria-label="Library filters">
          <button className="nav-button" type="button" onClick={() => navigate('/')} aria-label="Go to Home">
            <Film size={18} />
            <span><strong>Ostia</strong></span>
          </button>

          <button
            className={`library-tab ${activeTab === 'playlists' ? 'is-active' : ''}`}
            type="button"
            onClick={() => {
              setActiveTab('playlists');
              setSelectedMovie(null);
            }}
          >
            Playlists
          </button>
          <button
            className={`library-tab ${activeTab === 'movies' ? 'is-active' : ''}`}
            type="button"
            onClick={() => {
              setActiveTab('movies');
              setSelectedMovie(null);
            }}
          >
            Movies
          </button>
        </div>
      </div>

      <div className="library-controls">
        <div className="library-right-controls">
          <div className="library-sort-wrapper">
            <button
              className="library-sort"
              type="button"
              aria-haspopup="menu"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((v) => !v)}
            >
              {sortLabel}
              <ChevronDown size={16} />
            </button>

            {sortOpen && (
              <div className="library-sort-menu" role="menu">
                <button
                  className="library-sort-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setSortBy('recent');
                    setSortOpen(false);
                  }}
                >
                  <span className="library-sort-item-left">
                    Most recent
                  </span>
                  {sortBy === 'recent' && <Check size={16} />}
                </button>

                <button
                  className="library-sort-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setSortBy('name_asc');
                    setSortOpen(false);
                  }}
                >
                  <span className="library-sort-item-left">Name (A–Z)</span>

                  {sortBy === 'name_asc' && <Check size={16} />}
                </button>

                <button
                  className="library-sort-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setSortBy('name_desc');
                    setSortOpen(false);
                  }}
                >
                  <span className="library-sort-item-left">Name (Z–A)</span>
                  {sortBy === 'name_desc' && <Check size={16} />}
                </button>

                <button
                  className="library-sort-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setSortBy('songs_desc');
                    setSortOpen(false);
                  }}
                >
                  <span className="library-sort-item-left">Song count</span>
                  {sortBy === 'songs_desc' && <Check size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="library-grid">
        {loading && <div className="library-empty-state">Loading playlists...</div>}
        {!loading && error && <div className="library-empty-state">{error}</div>}
        {!loading && !error && playlists.length === 0 && <div className="library-empty-state">No playlists yet.</div>}

        {activeTab === 'movies' && !selectedMovie && (
          <>
            {filteredMovies.map((m) => (
              <div
                key={m.title}
                className="library-card"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMovie(m.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedMovie(m.title);
                }}
              >
                <div className="library-cover">
                  {m.coverUrl ? (
                    <img src={m.coverUrl} alt="" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          'linear-gradient(135deg, rgba(78, 46, 255, 0.9) 0%, rgba(169, 185, 255, 0.55) 100%)',
                      }}
                    >
                      <Film size={44} className="results-poster-placeholder" />
                    </div>
                  )}
                </div>
                <div className="library-card-title">{m.title}</div>
                <p className="library-card-subtitle">{m.playlistCount} playlist{m.playlistCount === 1 ? '' : 's'}</p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'movies' && selectedMovie && (
          <>
            <div
              key="back"
              className="library-card library-card--back"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMovie(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedMovie(null);
              }}
            >
              <div className="library-cover library-cover--back">
                <ArrowLeft size={42} />
              </div>
              <div className="library-card-title">Back</div>
              <p className="library-card-subtitle">All movies</p>
            </div>

            {filteredPlaylists.map((p) => (
              <div
                key={p.id}
                className="library-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/playlists/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/playlists/${p.id}`);
                }}
              >
                <div className="library-cover">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt="" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          'linear-gradient(135deg, rgba(78, 46, 255, 0.9) 0%, rgba(169, 185, 255, 0.55) 100%)',
                      }}
                    >
                      <Film size={44} className="results-poster-placeholder" />
                    </div>
                  )}
                </div>

                <div className="library-card-title">{p.name}</div>
                <p className="library-card-subtitle">
                  {`${p.songCount} songs • ${p.isPublic ? 'Public' : 'Private'}${p.movieTitle ? ` • ${p.movieTitle}` : ''}`}
                </p>
              </div>
            ))}
          </>
        )}

        {activeTab !== 'movies' && (
          <>
            {filteredPlaylists.map((p) => (
              <div
                key={p.id}
                className="library-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/playlists/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/playlists/${p.id}`);
                }}
              >
                <div className="library-cover">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt="" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          'linear-gradient(135deg, rgba(78, 46, 255, 0.9) 0%, rgba(169, 185, 255, 0.55) 100%)',
                      }}
                    >
                      <Film size={44} className="results-poster-placeholder" />
                    </div>
                  )}
                </div>

                <div className="library-card-title">{p.name}</div>
                <p className="library-card-subtitle">
                  {`${p.songCount} songs • ${p.isPublic ? 'Public' : 'Private'}${p.movieTitle ? ` • ${p.movieTitle}` : ''}`}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      </main>
    </div>
  );
}

export default Playlists;

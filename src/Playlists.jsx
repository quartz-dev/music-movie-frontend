import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Film, Search } from 'lucide-react';
import './Playlists.css';

function Playlists() {
  const navigate = useNavigate();
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('playlists');
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSearchClick = () => {
    if (query.trim()) {
      navigate(`/playlists?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchClick();
  };

  const playlists = [
    {
      id: 1,
      name: 'Beğenilen Şarkılar',
      movieTitle: null,
      coverType: 'liked',
      createdAt: '2026-03-10',
      songCount: 228,
    },
    {
      id: 2,
      name: 'Inception Soundtrack Mix',
      movieTitle: 'Inception',
      coverUrl: 'https://picsum.photos/seed/inception/400/400',
      createdAt: '2026-03-16',
      songCount: 12,
    },
    {
      id: 3,
      name: 'Sci‑Fi Classics',
      movieTitle: 'Interstellar',
      coverUrl: 'https://picsum.photos/seed/scifi/400/400',
      createdAt: '2026-02-22',
      songCount: 20,
    },
    {
      id: 4,
      name: 'Epic Movie Themes',
      movieTitle: 'The Dark Knight',
      coverUrl: 'https://picsum.photos/seed/epic/400/400',
      createdAt: '2025-12-02',
      songCount: 15,
    },
    {
      id: 5,
      name: 'Big Boss Music',
      movieTitle: 'Bang…',
      coverUrl: 'https://picsum.photos/seed/bigboss/400/400',
      createdAt: '2026-01-08',
      songCount: 35,
    },
  ];

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
        posterType: p.coverType,
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
            <span>Home</span>
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
                  {p.coverType === 'liked' ? (
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
                      <span style={{ fontSize: 44, color: '#fff', lineHeight: 1 }}>♥</span>
                    </div>
                  ) : (
                    <img src={p.coverUrl} alt="" />
                  )}
                </div>

                <div className="library-card-title">{p.name}</div>
                <p className="library-card-subtitle">{p.movieTitle || '—'}</p>
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
                  {p.coverType === 'liked' ? (
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
                      <span style={{ fontSize: 44, color: '#fff', lineHeight: 1 }}>♥</span>
                    </div>
                  ) : (
                    <img src={p.coverUrl} alt="" />
                  )}
                </div>

                <div className="library-card-title">{p.name}</div>
                <p className="library-card-subtitle">{p.movieTitle || '—'}</p>
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

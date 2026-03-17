import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Plus, Search, Play } from 'lucide-react';
import './Playlists.css';

function Playlists() {
  const navigate = useNavigate();
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createError, setCreateError] = useState('');

  const handleSearchClick = () => {
    if (query.trim()) {
      navigate(`/playlists?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchClick();
  };

  const openCreate = () => {
    setCreateError('');
    setNewName('');
    setNewDescription('');
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setCreateError('Lütfen bir çalma listesi adı girin.');
      return;
    }

    closeCreate();
  };

  const playlists = [
    {
      id: 1,
      name: 'Beğenilen Şarkılar',
      subtitle: 'Çalma listesi • 228 şarkı',
      coverType: 'liked',
      createdAt: '2026-03-10',
      songCount: 228,
    },
    {
      id: 2,
      name: 'Inception Soundtrack Mix',
      subtitle: 'Çalma listesi • yener',
      coverUrl: 'https://picsum.photos/seed/inception/400/400',
      createdAt: '2026-03-16',
      songCount: 12,
    },
    {
      id: 3,
      name: 'Sci‑Fi Classics',
      subtitle: 'Çalma listesi • yener',
      coverUrl: 'https://picsum.photos/seed/scifi/400/400',
      createdAt: '2026-02-22',
      songCount: 20,
    },
    {
      id: 4,
      name: 'Epic Movie Themes',
      subtitle: 'Çalma listesi • yener',
      coverUrl: 'https://picsum.photos/seed/epic/400/400',
      createdAt: '2025-12-02',
      songCount: 15,
    },
    {
      id: 5,
      name: 'Big Boss Music',
      subtitle: 'Çalma listesi • Bang…',
      coverUrl: 'https://picsum.photos/seed/bigboss/400/400',
      createdAt: '2026-01-08',
      songCount: 35,
    },
  ];

  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case 'name_asc':
        return 'İsim (A–Z)';
      case 'name_desc':
        return 'İsim (Z–A)';
      case 'songs_desc':
        return 'Şarkı sayısı';
      case 'recent':
      default:
        return 'Yakın tarihli';
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

  return (
    <div className="dark-container">
      <main className="library-page">
      <div className="library-topbar">
        <h1 className="library-title">Kitaplığın</h1>

        <form className="library-topbar-search" role="search" onSubmit={handleSearchSubmit}>
          <input
            className="library-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kitaplığında ara"
            aria-label="Kitaplığında ara"
          />
          <Search
            size={18}
            className="library-search-icon library-search-icon-right"
            onClick={handleSearchClick}
            role="button"
            aria-label="Ara"
            title="Ara"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSearchClick();
            }}
          />
        </form>

        <div className="library-topbar-actions">
          <button className="library-create-btn" type="button" onClick={openCreate}>
            <Plus size={18} />
            Oluştur
          </button>

          <button
            className="library-create-btn"
            type="button"
            onClick={() => navigate('/')}
            aria-label="Ana sayfaya dön"
          >
            Ana Sayfa
          </button>
        </div>
      </div>

      <div className="library-tabs-row">
        <div className="library-tabs library-tabs--right" role="tablist" aria-label="Kütüphane filtreleri">
          <button className="library-tab is-active" type="button">Çalma Listeleri</button>
          <button className="library-tab" type="button">Sanatçılar</button>
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
                    Yakın tarihli
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
                  <span className="library-sort-item-left">İsim (A–Z)</span>
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
                  <span className="library-sort-item-left">İsim (Z–A)</span>
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
                  <span className="library-sort-item-left">Şarkı sayısı</span>
                  {sortBy === 'songs_desc' && <Check size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="library-grid">
        {sortedPlaylists.map((p) => (
          <div key={p.id} className="library-card">
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

              <div className="library-play-overlay" aria-hidden="true">
                <Play size={18} />
              </div>
            </div>

            <div className="library-card-title">{p.name}</div>
            <p className="library-card-subtitle">{p.subtitle}</p>
          </div>
        ))}
      </div>

      {createOpen && (
        <div
          className="library-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreate();
          }}
        >
          <div
            className="library-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Çalma listesi oluştur"
          >
            <div className="library-modal-header">
              <div className="library-modal-title">Çalma listesi oluştur</div>
              <button className="library-modal-close" type="button" onClick={closeCreate} aria-label="Kapat">
                ×
              </button>
            </div>

            <form className="library-modal-form" onSubmit={handleCreateSubmit}>
              <label className="library-modal-label" htmlFor="playlistName">Ad</label>
              <input
                id="playlistName"
                className="library-modal-input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Movie Night"
                autoFocus
              />

              <label className="library-modal-label" htmlFor="playlistDesc">Açıklama (opsiyonel)</label>
              <textarea
                id="playlistDesc"
                className="library-modal-textarea"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="İstersen kısa bir not ekleyebilirsin…"
                rows={3}
              />

              {createError && <div className="library-modal-error" role="alert">{createError}</div>}

              <div className="library-modal-actions">
                <button className="library-modal-btn library-modal-btn--ghost" type="button" onClick={closeCreate}>
                  Vazgeç
                </button>
                <button className="library-modal-btn" type="submit">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default Playlists;

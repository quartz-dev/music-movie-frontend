import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, UserCircle2 } from 'lucide-react';
import './PlaylistDetail.css';

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}

function PlaylistDetail() {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const [trackQuery, setTrackQuery] = useState('');

  const playlists = useMemo(
    () => [
      {
        id: '1',
        name: 'Beğenilen Şarkılar',
        subtitle: 'Çalma listesi • 228 şarkı',
        coverType: 'liked',
      },
      {
        id: '2',
        name: 'Inception Soundtrack Mix',
        subtitle: 'Çalma listesi • yener',
        coverUrl: 'https://picsum.photos/seed/inception/400/400',
      },
      {
        id: '3',
        name: 'Sci‑Fi Classics',
        subtitle: 'Çalma listesi • yener',
        coverUrl: 'https://picsum.photos/seed/scifi/400/400',
      },
      {
        id: '4',
        name: 'Epic Movie Themes',
        subtitle: 'Çalma listesi • yener',
        coverUrl: 'https://picsum.photos/seed/epic/400/400',
      },
    ],
    [],
  );

  const playlist = playlists.find((p) => String(p.id) === String(playlistId)) ?? playlists[0];

  const tracks = useMemo(
    () => [
      {
        id: 't1',
        title: 'Ankaradayız',
        artist: 'Ezhel, Anıl Piyancı, Red, Keişan',
        album: 'Sekiz',
        addedAt: '8 Nis 2025',
        durationSec: 282,
        coverUrl: 'https://picsum.photos/seed/ankara/160/160',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
      {
        id: 't2',
        title: "İSTANBUL'UN Bİ YERİNE",
        artist: 'Abugat',
        album: 'COSA NOSTRA',
        addedAt: '8 Nis 2025',
        durationSec: 115,
        coverUrl: 'https://picsum.photos/seed/istanbul/160/160',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
      {
        id: 't3',
        title: 'Kör Kurşun',
        artist: 'Şam',
        album: 'Vehim',
        addedAt: '8 Nis 2025',
        durationSec: 104,
        coverUrl: 'https://picsum.photos/seed/kursun/160/160',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      },
      {
        id: 't4',
        title: 'Psikoz',
        artist: 'Şam',
        album: 'Vehim',
        addedAt: '8 Nis 2025',
        durationSec: 196,
        coverUrl: 'https://picsum.photos/seed/psikoz/160/160',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      },
    ],
    [],
  );

  const filteredTracks = useMemo(() => {
    const q = trackQuery.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) => {
      const title = String(t.title ?? '').toLowerCase();
      const artist = String(t.artist ?? '').toLowerCase();
      const album = String(t.album ?? '').toLowerCase();
      return title.includes(q) || artist.includes(q) || album.includes(q);
    });
  }, [trackQuery, tracks]);

  return (
    <div className="dark-container">
      <header className="pld-navbar" role="banner">
        <button
          className="pld-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <button
          className="pld-library"
          type="button"
          onClick={() => navigate('/playlists')}
          aria-label="Library"
          title="Library"
        >
          Library
        </button>

        <button
          className="pld-profile"
          type="button"
          onClick={() => navigate('/profile')}
          aria-label="Profile"
          title="Profile"
        >
          <UserCircle2 size={22} />
        </button>
      </header>

      <main className="pld-page">
        <aside className="pld-sidebar">
          <div className="pld-sidebar-top">
            <div className="pld-sidebar-title">Your Library</div>
          </div>

          <div className="pld-sidebar-list" role="list">
            {playlists.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pld-side-item ${String(p.id) === String(playlist?.id) ? 'is-active' : ''}`}
                onClick={() => navigate(`/playlists/${p.id}`)}
              >
                <div className="pld-side-cover" aria-hidden="true">
                  {p.coverType === 'liked' ? (
                    <div className="pld-liked">♥</div>
                  ) : (
                    <img src={p.coverUrl} alt="" />
                  )}
                </div>
                <div className="pld-side-meta">
                  <div className="pld-side-name">{p.name}</div>
                  <div className="pld-side-sub">{p.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="pld-main">
          <header className="pld-hero">
            <div className="pld-hero-cover" aria-hidden="true">
              {playlist?.coverType === 'liked' ? (
                <div className="pld-hero-liked">♥</div>
              ) : (
                <img src={playlist?.coverUrl} alt="" />
              )}
            </div>

            <div className="pld-hero-meta">
              <div className="pld-hero-type">Public Playlist</div>
              <h1 className="pld-hero-title">{playlist?.name}</h1>
              <div className="pld-hero-sub">yener • {tracks.length} songs</div>
            </div>
          </header>

          <form className="pld-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <Search size={16} className="pld-search-icon" aria-hidden="true" />
            <input
              className="pld-search-input"
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Search in this playlist"
              aria-label="Search in this playlist"
            />
          </form>

          <div className="pld-table">
            <div className="pld-row pld-row--head" role="row">
              <div className="pld-col pld-col--idx">#</div>
              <div className="pld-col pld-col--title">Title</div>
              <div className="pld-col pld-col--album">Album</div>
              <div className="pld-col pld-col--added">Date added</div>
              <div className="pld-col pld-col--dur">Time</div>
            </div>

            {filteredTracks.map((t, i) => (
              <div key={t.id} className="pld-row" role="row">
                <div className="pld-col pld-col--idx">{i + 1}</div>
                <div className="pld-col pld-col--title">
                  <div className="pld-track">
                    <img className="pld-track-cover" src={t.coverUrl} alt="" />
                    <div className="pld-track-meta">
                      <div className="pld-track-title">{t.title}</div>
                      <div className="pld-track-artist">{t.artist}</div>
                    </div>
                  </div>
                </div>
                <div className="pld-col pld-col--album">{t.album}</div>
                <div className="pld-col pld-col--added">{t.addedAt}</div>
                <div className="pld-col pld-col--dur">{formatTime(t.durationSec)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PlaylistDetail;

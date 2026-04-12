import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Film, Search, UserCircle2 } from 'lucide-react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import './PlaylistDetail.css';

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}

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
    const name = item?.playlistName ?? item?.PlaylistName ?? item?.name ?? item?.Name ?? 'Untitled playlist';
    const rawCoverUrl =
      movie?.posterPath ??
      movie?.PosterPath ??
      movie?.posterUrl ??
      movie?.PosterUrl ??
      movie?.coverUrl ??
      movie?.CoverUrl ??
      movie?.imageUrl ??
      movie?.ImageUrl ??
      item?.coverUrl ??
      item?.CoverUrl ??
      null;

    const coverUrl =
      typeof rawCoverUrl === 'string' && rawCoverUrl.includes('https://image.tmdb.org/t/p/w500https://')
        ? rawCoverUrl.replace('https://image.tmdb.org/t/p/w500https://', 'https://')
        : rawCoverUrl;

    return {
      id: item?.id ?? item?.Id ?? item?.playlistId ?? item?.PlaylistId ?? item?.playlistID ?? `${name}-${index}`,
      userId: item?.userId ?? item?.UserId ?? null,
      name,
      description: item?.description ?? item?.Description ?? null,
      isPublic: Boolean(item?.isPublic ?? item?.IsPublic),
      favoriteCount: item?.favoriteCount ?? item?.FavoriteCount ?? 0,
      createdAt: item?.createdDate ?? item?.CreatedDate ?? item?.createdAt ?? item?.CreatedAt ?? null,
      coverUrl,
      owner: item?.ownerName ?? item?.OwnerName ?? item?.createdBy ?? item?.CreatedBy ?? item?.username ?? item?.userName ?? 'Unknown',
      isDeleted: Boolean(item?.isDeleted ?? item?.IsDeleted),
      tracks: musics.map((music, trackIndex) => ({
        id: music?.id ?? music?.Id ?? music?.musicId ?? music?.MusicId ?? `${music?.title ?? music?.Title ?? music?.name ?? 'track'}-${trackIndex}`,
        title: music?.title ?? music?.Title ?? music?.name ?? music?.Name ?? music?.songName ?? music?.SongName ?? 'Unknown title',
        artist: music?.artist ?? music?.Artist ?? music?.artistName ?? music?.ArtistName ?? music?.singer ?? music?.Singer ?? 'Unknown artist',
        album: music?.album ?? music?.Album ?? music?.albumName ?? music?.AlbumName ?? 'Unknown album',
        addedAt: music?.addedAt ?? music?.AddedAt ?? music?.createdDate ?? music?.CreatedDate ?? music?.createdAt ?? music?.CreatedAt ?? null,
        durationSec: Number(music?.durationSec ?? music?.DurationSec ?? music?.duration ?? music?.Duration ?? music?.durationSeconds ?? music?.DurationSeconds ?? 0),
        coverUrl: music?.albumImageUrl ?? music?.AlbumImageUrl ?? music?.coverUrl ?? music?.CoverUrl ?? music?.imageUrl ?? music?.ImageUrl ?? null,
      })),
    };
  }).filter((playlist) => !playlist.isDeleted);
};

const formatAddedDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

function PlaylistDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlistId } = useParams();
  const auth = useAuth();
  const [trackQuery, setTrackQuery] = useState('');
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
        const [userData, recentData] = await Promise.all([
          api.getUserPlaylists(userId, true),
          api.getRecentPublicPlaylists(20, false),
        ]);

        const merged = [...normalizePlaylists(userData), ...normalizePlaylists(recentData)];
        const unique = Array.from(new Map(merged.map((playlist) => [String(playlist.id), playlist])).values());

        if (!ignore) {
          setPlaylists(unique);
        }
      } catch (err) {
        console.error('Playlist detail fetch error:', err);
        if (!ignore) {
          setPlaylists([]);
          setError('Failed to load playlist.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [auth.loading, auth.isLoggedIn, auth?.user?.id, auth?.user?.userId]);

  const playlist = useMemo(() => playlists.find((p) => String(p.id) === String(playlistId)) ?? null, [playlists, playlistId]);
  const tracks = playlist?.tracks ?? [];

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
            {!loading && playlists.length === 0 && <div className="pld-empty-state">No playlists yet.</div>}
            {playlists.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pld-side-item ${String(p.id) === String(playlist?.id) ? 'is-active' : ''}`}
                onClick={() => navigate(`/playlists/${p.id}`)}
              >
                <div className="pld-side-cover" aria-hidden="true">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt="" />
                  ) : (
                    <div className="pld-liked"><Film size={18} /></div>
                  )}
                </div>
                <div className="pld-side-meta">
                  <div className="pld-side-name">{p.name}</div>
                  <div className="pld-side-sub">Playlist • {p.tracks.length} songs</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="pld-main">
          {loading && <div className="pld-empty-state pld-empty-state--main">Loading playlist...</div>}
          {!loading && error && <div className="pld-empty-state pld-empty-state--main">{error}</div>}
          {!loading && !error && !playlist && <div className="pld-empty-state pld-empty-state--main">Playlist not found.</div>}

          {playlist && (
          <>
          <header className="pld-hero">
            <div className="pld-hero-cover" aria-hidden="true">
              {playlist?.coverUrl ? (
                <img src={playlist?.coverUrl} alt="" />
              ) : (
                <div className="pld-hero-liked"><Film size={56} /></div>
              )}
            </div>

            <div className="pld-hero-meta">
              <div className="pld-hero-type">{playlist?.isPublic ? 'Public Playlist' : 'Private Playlist'}</div>
              <h1 className="pld-hero-title">{playlist?.name}</h1>
              <div className="pld-hero-sub">{playlist?.owner} • {tracks.length} songs</div>
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

            {!loading && filteredTracks.length === 0 && (
              <div className="pld-empty-state pld-empty-state--table">No tracks in this playlist.</div>
            )}

            {filteredTracks.map((t, i) => (
              <div key={t.id} className="pld-row" role="row">
                <div className="pld-col pld-col--idx">{i + 1}</div>
                <div className="pld-col pld-col--title">
                  <div className="pld-track">
                    {t.coverUrl ? (
                      <img className="pld-track-cover" src={t.coverUrl} alt="" />
                    ) : (
                      <div className="pld-track-cover pld-track-cover--placeholder"><Film size={16} /></div>
                    )}
                    <div className="pld-track-meta">
                      <div className="pld-track-title">{t.title}</div>
                      <div className="pld-track-artist">{t.artist}</div>
                    </div>
                  </div>
                </div>
                <div className="pld-col pld-col--album">{t.album}</div>
                <div className="pld-col pld-col--added">{formatAddedDate(t.addedAt)}</div>
                <div className="pld-col pld-col--dur">{formatTime(t.durationSec)}</div>
              </div>
            ))}
          </div>
          </>
          )}
        </section>
      </main>
    </div>
  );
}

export default PlaylistDetail;

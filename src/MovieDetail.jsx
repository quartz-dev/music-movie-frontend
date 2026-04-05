import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Music } from 'lucide-react';
import api from './services/api';
import './MovieDetail.css';

function MovieDetail() {
  const { movieId, movieTitle } = useParams();
  const navigate = useNavigate();

  const titleDecoded = decodeURIComponent(movieTitle || '');

  const toPosterUrl = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:'))) return raw;
    if (typeof raw === 'string' && raw.startsWith('/')) return `https://image.tmdb.org/t/p/w500${raw}`;
    return raw;
  };

  const movie = {
    id: movieId,
    title: titleDecoded,
    posterUrl: null,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moodTags, setMoodTags] = useState([]);
  const [songRecommendations, setSongRecommendations] = useState([]);
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const decodedTitle = decodeURIComponent(movieTitle || '');

        const res =
          (decodedTitle ? await api.searchMoviesFromRecommendations(decodedTitle) : null) ??
          (movieId ? await api.getMovieMoodAndSongs(movieId) : null);

        if (ignore) return;

        const data = res?.data ?? res;

        const posterRaw =
          data?.posterUrl ??
          data?.PosterUrl ??
          data?.posterPath ??
          data?.PosterPath ??
          data?.imageUrl ??
          data?.ImageUrl ??
          data?.movie?.posterUrl ??
          data?.movie?.PosterUrl ??
          data?.movie?.posterPath ??
          data?.movie?.PosterPath ??
          data?.movie?.imageUrl ??
          data?.movie?.ImageUrl ??
          null;
        setPosterUrl(toPosterUrl(posterRaw));

        const tags =
          data?.moodTags ??
          data?.MoodTags ??
          data?.moods ??
          data?.Moods ??
          data?.tags ??
          data?.Tags ??
          data?.moodAnalysis?.tags ??
          data?.moodAnalysis ??
          data?.MoodAnalysis?.tags ??
          data?.MoodAnalysis ??
          [];

        const songs =
          (Array.isArray(data) ? data : null) ??
          data?.songs ??
          data?.Songs ??
          data?.songRecommendations ??
          data?.SongRecommendations ??
          data?.recommendations ??
          data?.Recommendations ??
          data?.tracks ??
          data?.Tracks ??
          data?.musicSuggestions ??
          data?.MusicSuggestions ??
          data?.suggestions ??
          data?.Suggestions ??
          [];

        setMoodTags(Array.isArray(tags) ? tags : []);
        setSongRecommendations(Array.isArray(songs) ? songs : []);
      } catch {
        if (!ignore) {
          setError('Failed to load recommendations.');
          setMoodTags([]);
          setSongRecommendations([]);
          setPosterUrl(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [movieId, movieTitle]);

  const normalizedMoodTags = useMemo(() => {
    if (typeof moodTags === 'string') {
      return moodTags
        .split(/[,#]/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, emoji: '' }));
    }

    return (Array.isArray(moodTags) ? moodTags : [])
      .flatMap((t) => {
        if (!t) return [];
        if (typeof t === 'string') return [{ name: t, emoji: '' }];
        if (typeof t === 'object' && typeof t.name === 'string') return [{ name: t.name, emoji: t.emoji ?? '' }];

        const raw = t?.tag ?? t?.title ?? t?.mood ?? t?.value ?? '';
        if (typeof raw === 'string' && raw.trim()) return [{ name: raw.trim(), emoji: t?.emoji ?? '' }];
        return [];
      })
      .filter((t) => t.name);
  }, [moodTags]);

  const normalizedSongs = useMemo(() => {
    return (Array.isArray(songRecommendations) ? songRecommendations : []).map((s) => ({
      id: s?.id ?? s?.trackId ?? `${s?.title ?? s?.name ?? ''}-${s?.artist ?? s?.artistName ?? ''}`,
      title: s?.title ?? s?.Title ?? s?.name ?? s?.Name ?? s?.trackName ?? s?.TrackName ?? s?.songName ?? s?.SongName ?? '',
      artist: s?.artist ?? s?.Artist ?? s?.artistName ?? s?.ArtistName ?? s?.singer ?? s?.Singer ?? '',
      album: s?.album ?? s?.Album ?? s?.albumName ?? s?.AlbumName ?? s?.albumTitle ?? s?.AlbumTitle ?? '',
      coverUrl: s?.coverUrl ?? s?.imageUrl ?? s?.albumCoverUrl ?? null,
      spotifyUrl: s?.spotifyUrl ?? s?.externalUrl ?? s?.url ?? '#',
      previewUrl: s?.previewUrl ?? s?.preview ?? null,
    })).filter((s) => s.title);
  }, [songRecommendations]);

  const movieView = useMemo(() => ({
    ...movie,
    posterUrl: posterUrl ?? movie.posterUrl,
  }), [movie, posterUrl]);

  return (
    <div className="movie-detail-container">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-button-detail">
        <ArrowLeft size={20} />
        Back to Results
      </button>

      {/* Main Title */}
      <h1 className="page-main-title">{movieView?.title || movie?.title || ''}</h1>

      {/* Movie Info and Mood Analysis Section */}
      <div className="movie-mood-section">
        {/* Movie Poster */}
        <div className="movie-poster-large">
          <div className="poster-placeholder">
            {movieView?.posterUrl ? (
              <img src={movieView.posterUrl} alt={movieView.title} className="poster-image" />
            ) : (
              <>
                <Music size={100} />
                <p className="poster-movie-title">
                  {movieView?.title || decodeURIComponent(movieTitle)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mood Analysis */}
        <div className="mood-analysis-box">
          <h2 className="mood-analysis-title">
            {movie?.title || decodeURIComponent(movieTitle)} - Mood Analysis
          </h2>
          <div className="mood-tags">
            {normalizedMoodTags.length > 0 ? (
              normalizedMoodTags.map((tag, index) => (
                <div key={index} className="mood-tag">
                  <span className="mood-tag-text">#{tag.name}</span>
                  {tag.emoji ? <span className="mood-tag-emoji">{tag.emoji}</span> : null}
                </div>
              ))
            ) : (
              <div className="mood-tag">
                <span className="mood-tag-text">No mood analysis available.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song Recommendations Title */}
      <h2 className="recommendations-title">Recommended songs</h2>

      {loading && (
        <div className="results-state">
          <p>Loading recommendations...</p>
        </div>
      )}

      {!loading && error && (
        <div className="results-state">
          <p>{error}</p>
        </div>
      )}

      {/* Song Cards Grid */}
      <div className="songs-grid">
        {normalizedSongs.slice(0, 5).map((song, index) => (
          <div key={song.id} className="song-card">
            {/* Album Cover */}
            <div className="album-cover">
              {song.coverUrl ? (
                <img src={song.coverUrl} alt={song.title} className="album-image" />
              ) : (
                <Music size={60} className="album-placeholder-icon" />
              )}
            </div>

            {/* Song Info */}
            <div className="song-info">
              <h3 className="song-number">{index + 1}. {song.title}</h3>
              <p className="song-artist">{song.artist}</p>
            </div>

            {/* Action Buttons */}
            <div className="song-actions">
              <button 
                className="play-button"
                onClick={() => window.open(song.previewUrl || '#', '_blank')}
              >
                <Play size={20} />
              </button>
              <button 
                className="spotify-button"
                onClick={() => window.open(song.spotifyUrl || '#', '_blank')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Save to Spotify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieDetail;

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Music } from 'lucide-react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import './MovieDetail.css';

const extractSongsFromRecommendation = (data) => {
    const songs =
        data?.result?.data ??
        data?.data?.result?.data ??
        data?.data?.songs ??
        data?.data?.songRecommendations ??
        data?.musics ??
        data?.data?.musics ??
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.data) ? data.data : null) ??
        data?.songs ??
        data?.Songs ??
        data?.songRecommendations ??
        [];

    return Array.isArray(songs) ? songs : [];
};

const extractMovieFromRecommendation = (data) => {
    return (
        data?.movie ??
        data?.data?.movie ??
        data?.result?.movie ??
        data?.data?.result?.movie ??
        null
    );
};

const extractMovieIdFromRecommendation = (data, fallbackMovieId) => {
    const movie = extractMovieFromRecommendation(data);
    return movie?.id ?? movie?.movieId ?? fallbackMovieId ?? null;
};

const extractMusicIdsFromRecommendation = (data) => {
    const songs = extractSongsFromRecommendation(data);
    return songs
        .map((music) => music?.id ?? music?.musicId ?? music?.trackId ?? null)
        .filter((id) => id != null && id !== '');
};

function MovieDetail() {
    const { movieId, movieTitle } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    const titleDecoded = decodeURIComponent(movieTitle || '');

    const toPosterUrl = (raw) => {
        if (!raw) return null;
        if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:'))) return raw;
        if (typeof raw === 'string' && !raw.startsWith('/') && !raw.includes('://') && raw.toLowerCase().endsWith('.jpg')) return `https://image.tmdb.org/t/p/w500/${raw}`;
        if (typeof raw === 'string' && !raw.startsWith('/') && !raw.includes('://') && raw.toLowerCase().endsWith('.png')) return `https://image.tmdb.org/t/p/w500/${raw}`;
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
    const [movieDescription, setMovieDescription] = useState(''); // YENİ: Açıklama için state
    const [songRecommendations, setSongRecommendations] = useState([]);
    const [posterUrl, setPosterUrl] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const applyRecommendationData = (data) => {
        setRecommendationData(data ?? null);

        const posterRaw =
            data?.movie?.posterPath ??
            data?.movie?.PosterPath ??
            data?.movie?.posterUrl ??
            data?.posterPath ??
            data?.PosterPath ??
            data?.posterUrl ??
            data?.PosterUrl ??
            null;

        setPosterUrl(toPosterUrl(posterRaw));

        const description =
            data?.movie?.description ??
            data?.movie?.overview ??
            data?.description ??
            data?.overview ??
            'No description available.';

        setMovieDescription(description);

        const songs = extractSongsFromRecommendation(data);

        setSongRecommendations(Array.isArray(songs) ? songs : []);
    };

    useEffect(() => {
        let ignore = false;
        const preloadedResponse = location.state?.recommendationResponse ?? null;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                if (preloadedResponse) {
                    const decodedTitle = decodeURIComponent(movieTitle || '');
                    if (decodedTitle) {
                        api.cacheRecommendationResponse?.(`recommendations:${decodedTitle}`, preloadedResponse);
                    }
                    if (ignore) return;
                    applyRecommendationData(preloadedResponse);
                    setLoading(false);
                    return;
                }

                const decodedTitle = decodeURIComponent(movieTitle || '');
                const cachedResponse = api.getCachedRecommendationResponse?.(`recommendations:${decodedTitle}`);
                if (cachedResponse) {
                    if (ignore) return;
                    applyRecommendationData(cachedResponse);
                    setLoading(false);
                    return;
                }

                const res =
                    (decodedTitle ? await api.searchMoviesFromRecommendations(decodedTitle) : null) ??
                    (movieId ? await api.getMovieMoodAndSongs(movieId) : null);

                if (ignore) return;

                const data = res?.data ?? res;
                applyRecommendationData(data);
            } catch (err) {
                console.error("Detay sayfası hata:", err);
                if (!ignore) {
                    setError('Failed to load movie details.');
                    setMovieDescription('No description available.');
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
    }, [location.state, movieId, movieTitle]);

    const normalizedSongs = useMemo(() => {
        return (Array.isArray(songRecommendations) ? songRecommendations : []).map((s) => ({
            id: s?.id ?? s?.trackId ?? `${s?.title ?? s?.name ?? ''}-${s?.artist ?? s?.artistName ?? ''}`,
            title: s?.title ?? s?.Title ?? s?.name ?? s?.Name ?? s?.trackName ?? s?.TrackName ?? s?.songName ?? s?.SongName ?? '',
            artist: s?.artist ?? s?.Artist ?? s?.artistName ?? s?.ArtistName ?? s?.singer ?? s?.Singer ?? '',
            album: s?.album ?? s?.Album ?? s?.albumName ?? s?.AlbumName ?? s?.albumTitle ?? s?.AlbumTitle ?? '',
            coverUrl: s?.albumImageUrl ?? s?.coverUrl ?? s?.imageUrl ?? s?.albumCoverUrl ?? null,
            spotifyUrl: s?.spotifyUrl ?? s?.externalUrl ?? s?.url ?? '#',
            previewUrl: s?.previewUrl ?? s?.preview ?? null,
        })).filter((s) => s.title);
    }, [songRecommendations]);

    const movieView = useMemo(() => ({
        ...movie,
        posterUrl: posterUrl ?? movie.posterUrl,
    }), [movie, posterUrl]);

    const openSaveModal = () => {
        setPlaylistName((movieView?.title || titleDecoded || 'My Playlist').trim() ? `${(movieView?.title || titleDecoded || 'My Playlist').trim()} Playlist` : 'My Playlist');
        setPlaylistDescription(movieDescription || '');
        setIsPublic(false);
        setSaveError(null);
        setShowSaveModal(true);
    };

    const closeSaveModal = () => {
        if (saveLoading) return;
        setShowSaveModal(false);
    };

    const handleSaveToPlaylist = async (e) => {
        e.preventDefault();
        const name = playlistName.trim();

        if (!name) {
            setSaveError('Playlist name is required.');
            return;
        }

        const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
        if (!userId) {
            setSaveError('Please log in to save playlists.');
            return;
        }

        let sourceData = recommendationData ?? api.getCachedRecommendationResponse?.(`recommendations:${titleDecoded}`) ?? null;

        if (!extractMovieFromRecommendation(sourceData) || extractSongsFromRecommendation(sourceData).length === 0) {
            try {
                const refreshedResponse =
                    (titleDecoded ? await api.searchMoviesFromRecommendations(titleDecoded) : null) ??
                    (movieId ? await api.getMovieMoodAndSongs(movieId) : null);
                sourceData = refreshedResponse?.data ?? refreshedResponse ?? sourceData;
            } catch {
                // Keep existing sourceData and fallback model below
            }
        }

        const resolvedMovieId = extractMovieIdFromRecommendation(sourceData, movieId);
        const musicIds = extractMusicIdsFromRecommendation(sourceData);

        if (!resolvedMovieId) {
            setSaveError('Movie ID could not be resolved from recommendation response.');
            return;
        }

        if (musicIds.length === 0) {
            setSaveError('Music IDs could not be resolved from recommendation response.');
            return;
        }

        const payload = {
            userId,
            playlistName: name,
            description: playlistDescription.trim() || null,
            movieId: resolvedMovieId,
            musicIds,
            isPublic,
        };

        try {
            setSaveLoading(true);
            setSaveError(null);
            await api.createPlaylist(payload);
            setShowSaveModal(false);
            navigate('/playlists', {
                state: {
                    activeTab: 'playlists',
                    refresh: true,
                },
            });
        } catch (err) {
            console.error('Save playlist error:', err);
            setSaveError('Playlist could not be saved. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="movie-detail-container">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="back-button-detail">
                <ArrowLeft size={20} />
                Back to Results
            </button>

            {/* Main Title */}
            <h1 className="page-main-title">{movieView?.title || movie?.title || ''}</h1>

            <div className="save-playlist-row">
                <button
                    type="button"
                    className="save-playlist-button"
                    onClick={openSaveModal}
                    disabled={loading}
                >
                    Save to playlist
                </button>
            </div>

            {/* Movie Info and Description Section */}
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

                {/* Movie Description Box */}
                <div className="mood-analysis-box">
                    <h2 className="mood-analysis-title">
                        Synopsis
                    </h2>
                    {/* Tag'ler yerine direkt film açıklamasını yazdırıyoruz */}
                    <div style={{ lineHeight: '1.6', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                        {movieDescription}
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

            {!loading && !error && normalizedSongs.length === 0 && (
                <div className="results-state">
                    <p>No recommended songs found.</p>
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
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                                Save to Spotify
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showSaveModal && (
                <div className="save-playlist-modal-overlay" role="presentation" onClick={closeSaveModal}>
                    <div className="save-playlist-modal" role="dialog" aria-modal="true" aria-label="Save to playlist" onClick={(event) => event.stopPropagation()}>
                        <h3 className="save-playlist-modal-title">Save to playlist</h3>
                        <form onSubmit={handleSaveToPlaylist} className="save-playlist-form">
                            <label className="save-playlist-label" htmlFor="playlist-name-input">Playlist name</label>
                            <input
                                id="playlist-name-input"
                                className="save-playlist-input"
                                type="text"
                                value={playlistName}
                                onChange={(event) => setPlaylistName(event.target.value)}
                                placeholder="Playlist name"
                                maxLength={100}
                            />

                            <label className="save-playlist-label" htmlFor="playlist-description-input">Description</label>
                            <textarea
                                id="playlist-description-input"
                                className="save-playlist-input save-playlist-textarea"
                                value={playlistDescription}
                                onChange={(event) => setPlaylistDescription(event.target.value)}
                                placeholder="Playlist description"
                                maxLength={500}
                            />

                            <label className="save-playlist-checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(event) => setIsPublic(event.target.checked)}
                                />
                                <span>Public playlist</span>
                            </label>

                            {saveError && <p className="save-playlist-error">{saveError}</p>}

                            <div className="save-playlist-actions">
                                <button type="button" className="save-playlist-cancel" onClick={closeSaveModal} disabled={saveLoading}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-playlist-submit" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default MovieDetail;
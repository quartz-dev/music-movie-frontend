import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Music } from 'lucide-react';
import './MovieDetail.css';

function MovieDetail() {
  const { movieId, movieTitle } = useParams();
  const navigate = useNavigate();

  // Örnek mood tagları - API'den gelecek
  const moodTags = [
    { name: 'Epic', emoji: '🚀' },
    { name: 'Discovery', emoji: '🔭' },
    { name: 'Drama', emoji: '🎭' },
    { name: 'Emotional', emoji: '💖' },
    { name: 'Moody', emoji: '😔' },
    { name: 'Space', emoji: '🌌' }
  ];

  // Örnek şarkı önerileri - API'den gelecek
  const songRecommendations = [
    {
      id: 1,
      title: "Echoes",
      artist: "Pink Floyd",
      album: "Meddle",
      coverUrl: null, // Placeholder
      spotifyUrl: "#"
    },
    {
      id: 2,
      title: "Time",
      artist: "Hans Zimmer",
      album: "Inception OST",
      coverUrl: null,
      spotifyUrl: "#"
    },
    {
      id: 3,
      title: "Clair de Lune",
      artist: "Claude Debussy",
      album: "Suite Bergamasque",
      coverUrl: null,
      spotifyUrl: "#"
    },
    {
      id: 4,
      title: "Space Oddity",
      artist: "David Bowie",
      album: "Space Oddity",
      coverUrl: null,
      spotifyUrl: "#"
    },
    {
      id: 5,
      title: "To Build a Home",
      artist: "Cinematic Orchestra",
      album: "Ma Fleur",
      coverUrl: null,
      spotifyUrl: "#"
    }
  ];

  return (
    <div className="movie-detail-container">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-button-detail">
        <ArrowLeft size={20} />
        Back to Results
      </button>

      {/* Main Title */}
      <h1 className="page-main-title">
        Discover Your Movie's Mood and Get 5 Music Recommendations
      </h1>

      {/* Movie Info and Mood Analysis Section */}
      <div className="movie-mood-section">
        {/* Movie Poster */}
        <div className="movie-poster-large">
          <div className="poster-placeholder">
            {movie?.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="poster-image" />
            ) : (
              <>
                <Music size={100} />
                <p className="poster-movie-title">
                  {movie?.title || decodeURIComponent(movieTitle)}
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
            {moodTags && moodTags.map((tag, index) => (
              <div key={index} className="mood-tag">
                <span className="mood-tag-text">#{tag.name}</span>
                <span className="mood-tag-emoji">{tag.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Song Recommendations Title */}
      <h2 className="recommendations-title">
        5 Song Recommendations Independent of This Movie, Matching Its Mood
      </h2>

      {/* Song Cards Grid */}
      <div className="songs-grid">
        {songRecommendations && songRecommendations.map((song, index) => (
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

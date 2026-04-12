import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Film, Grid } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import './PageLayout.css';
import './MoviesByCategory.css';

const toPosterUrl = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:'))) return raw;
  if (typeof raw === 'string' && raw.startsWith('/')) return `https://image.tmdb.org/t/p/w500${raw}`;
  if (typeof raw === 'string' && !raw.includes('://') && (raw.toLowerCase().endsWith('.jpg') || raw.toLowerCase().endsWith('.png'))) return `https://image.tmdb.org/t/p/w500/${raw}`;
  return raw;
};

function MoviesByCategory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  const auth = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryName = location.state?.categoryName ?? 'Selected Category';

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = await api.getMoviesByCategory(categoryId, 1);
        const list =
          (Array.isArray(payload) ? payload : null) ??
          (Array.isArray(payload?.data) ? payload.data : null) ??
          (Array.isArray(payload?.Data) ? payload.Data : null) ??
          (Array.isArray(payload?.result?.data) ? payload.result.data : null) ??
          (Array.isArray(payload?.Result?.Data) ? payload.Result.Data : null) ??
          (Array.isArray(payload?.items) ? payload.items : null) ??
          [];

        if (!ignore) setMovies(list);
      } catch (err) {
        console.error('Failed to load movies by category:', err);
        if (!ignore) {
          setMovies([]);
          setError('Failed to load movies for this category.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [categoryId]);

  const normalizedMovies = useMemo(() => {
    return movies
      .map((item, index) => {
        const movie = item?.movie ?? item?.Movie ?? item;
        const title =
          movie?.title ??
          movie?.Title ??
          movie?.movieTitle ??
          movie?.MovieTitle ??
          item?.title ??
          item?.name ??
          item?.movieTitle ??
          null;

        return {
          id: movie?.id ?? movie?.Id ?? movie?.movieId ?? movie?.MovieId ?? item?.id ?? item?.Id ?? item?.movieId ?? `movie-${index}`,
          title,
          overview: movie?.overview ?? movie?.Overview ?? movie?.description ?? movie?.Description ?? item?.overview ?? item?.description ?? '',
          year: movie?.year ?? movie?.Year ?? movie?.releaseYear ?? movie?.ReleaseYear ?? item?.year ?? item?.releaseYear ?? '',
          posterUrl: toPosterUrl(
            movie?.posterUrl ??
            movie?.PosterUrl ??
            movie?.posterPath ??
            movie?.PosterPath ??
            movie?.poster_path ??
            movie?.backdropPath ??
            movie?.backdrop_path ??
            item?.posterUrl ??
            item?.PosterUrl ??
            item?.posterPath ??
            item?.poster_path ??
            null
          ),
        };
      })
      .filter((movie) => Boolean(movie.title));
  }, [movies]);

  const handleMovieOpen = (movieTitle) => {
    if (auth.loading) return;

    if (!auth.isLoggedIn) {
      const targetRoute = `/movie/${encodeURIComponent(movieTitle ?? '')}`;
      navigate('/login', {
        state: {
          from: targetRoute,
        },
      });
      return;
    }

    navigate(`/movie/${encodeURIComponent(movieTitle ?? '')}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/categories')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Categories
        </button>
      </div>

      <div className="page-content">
        <div className="page-title-section">
          <Grid size={40} className="page-icon" />
          <h1 className="page-title">{categoryName}</h1>
          <p className="page-description">Movies in this category</p>
        </div>

        {loading && (
          <div className="content-placeholder">
            <p>Loading movies...</p>
          </div>
        )}

        {!loading && error && (
          <div className="content-placeholder">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && normalizedMovies.length === 0 && (
          <div className="content-placeholder">
            <p>No movies found in this category.</p>
          </div>
        )}

        {!loading && !error && normalizedMovies.length > 0 && (
          <section className="category-movies-grid" aria-label="Movies by category">
            {normalizedMovies.map((movie) => (
              <article
                key={movie.id}
                className="category-movie-card"
                onClick={() => handleMovieOpen(movie.title)}
              >
                <div className="category-movie-poster">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                  ) : (
                    <Film size={44} className="category-movie-placeholder" />
                  )}
                </div>
                <div className="category-movie-body">
                  <h2 className="category-movie-title">{movie.title}</h2>
                  {movie.year && <p className="category-movie-meta">{movie.year}</p>}
                  <p className="category-movie-desc">{movie.overview || 'No description available.'}</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default MoviesByCategory;
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid } from 'lucide-react';
import api from './services/api';
import './PageLayout.css';

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = await api.getCategories();
        const list =
          (Array.isArray(payload) ? payload : null) ??
          (Array.isArray(payload?.data) ? payload.data : null) ??
          (Array.isArray(payload?.Data) ? payload.Data : null) ??
          (Array.isArray(payload?.result?.data) ? payload.result.data : null) ??
          (Array.isArray(payload?.Result?.Data) ? payload.Result.Data : null) ??
          (Array.isArray(payload?.items) ? payload.items : null) ??
          [];

        if (!ignore) {
          setCategories(list);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        if (!ignore) {
          setCategories([]);
          setError('Failed to load categories. Please try again.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedCategories = useMemo(() => {
    return categories
      .map((item, index) => ({
        id: item?.id ?? item?.Id ?? item?.categoryId ?? item?.CategoryId ?? index,
        name: item?.name ?? item?.Name ?? item?.categoryName ?? item?.CategoryName ?? 'Unknown category',
      }))
      .filter((item) => item.name);
  }, [categories]);

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>

      <div className="page-content">
        <div className="page-title-section">
          <Grid size={40} className="page-icon" />
          <h1 className="page-title">Movie Categories</h1>
          <p className="page-description">
            Browse movies by genre and category
          </p>
        </div>

        {loading && (
          <div className="content-placeholder">
            <p>Loading categories...</p>
          </div>
        )}

        {!loading && error && (
          <div className="content-placeholder">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && normalizedCategories.length === 0 && (
          <div className="content-placeholder">
            <p>No categories found.</p>
            <p className="placeholder-note">The API returned an empty category list.</p>
          </div>
        )}

        {!loading && !error && normalizedCategories.length > 0 && (
          <div className="category-grid" aria-label="Movie categories">
            {normalizedCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="category-card"
                  onClick={() => navigate(`/categories/${category.id}`, {
                    state: { categoryName: category.name },
                  })}
                >
                  {category.name}
                </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;

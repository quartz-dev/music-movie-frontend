import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid } from 'lucide-react';
import './PageLayout.css';

function Categories() {
  const navigate = useNavigate();

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

        <div className="content-placeholder">
          <p>Movie categories content will be displayed here...</p>
          <p className="placeholder-note">
            This page will show different movie genres and categories
          </p>
        </div>
      </div>
    </div>
  );
}

export default Categories;

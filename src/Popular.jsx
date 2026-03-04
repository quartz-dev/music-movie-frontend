import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import './PageLayout.css';

function Popular() {
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
          <TrendingUp size={40} className="page-icon" />
          <h1 className="page-title">Popular Movies</h1>
          <p className="page-description">
            Discover the most popular and trending movies right now
          </p>
        </div>

        <div className="content-placeholder">
          <p>Popular movies content will be displayed here...</p>
          <p className="placeholder-note">
            This page will show trending movies from TMDB API
          </p>
        </div>
      </div>
    </div>
  );
}

export default Popular;

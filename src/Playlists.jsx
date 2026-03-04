import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music } from 'lucide-react';
import './PageLayout.css';

function Playlists() {
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
          <Music size={40} className="page-icon" />
          <h1 className="page-title">Music Playlists</h1>
          <p className="page-description">
            Explore playlists created from movie soundtracks
          </p>
        </div>

        <div className="content-placeholder">
          <p>Music playlists content will be displayed here...</p>
          <p className="placeholder-note">
            This page will show music playlists generated from movies
          </p>
        </div>
      </div>
    </div>
  );
}

export default Playlists;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Palette, Globe, User, Settings as SettingsIcon } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileNavigate = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} />
          Home
        </button>

        {/* Profil Butonu */}
        <div className="profile-menu-wrapper">
          <button 
            className="profile-button"
            onClick={handleProfileClick}
              aria-label="Profile menu"
          >
            <User size={20} />
          </button>

          {/* Dropdown Menü */}
          <CSSTransition
            in={showProfileMenu}
            timeout={180}
            classNames="menu"
            unmountOnExit
          >
            <div className="profile-dropdown">
              <button
                className="dropdown-item"
                onClick={handleProfileNavigate}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  // Zaten ayarlar sayfasındayız
                }}
              >
                <SettingsIcon size={18} />
                <span>Settings</span>
              </button>
            </div>
          </CSSTransition>
        </div>
      </div>

      <div className="settings-content">
        <h1 className="settings-title">Settings</h1>
        
        <div className="settings-section">
          <h2 className="section-title">General</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <Bell size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Notifications</h3>
                <p className="settings-item-desc">Manage notification preferences</p>
              </div>
            </div>
            <button className="settings-btn">Edit</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Lock size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Privacy & Security</h3>
                <p className="settings-item-desc">Account security settings</p>
              </div>
            </div>
            <button className="settings-btn">Edit</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Palette size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Theme</h3>
                <p className="settings-item-desc">Appearance and theme options</p>
              </div>
            </div>
            <button className="settings-btn">Edit</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Globe size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Language & Region</h3>
                <p className="settings-item-desc">Language and region preferences</p>
              </div>
            </div>
            <button className="settings-btn">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Palette, Globe, User, Settings as SettingsIcon } from 'lucide-react';
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
          Ana Sayfa
        </button>

        {/* Profil Butonu */}
        <div className="profile-menu-wrapper">
          <button 
            className="profile-button"
            onClick={handleProfileClick}
            aria-label="Profil menüsü"
          >
            <User size={20} />
          </button>

          {/* Dropdown Menü */}
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button 
                className="dropdown-item"
                onClick={handleProfileNavigate}
              >
                <User size={18} />
                <span>Profilim</span>
              </button>
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  // Zaten ayarlar sayfasındayız
                }}
              >
                <SettingsIcon size={18} />
                <span>Ayarlar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-content">
        <h1 className="settings-title">Ayarlar</h1>
        
        <div className="settings-section">
          <h2 className="section-title">Genel Ayarlar</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <Bell size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Bildirimler</h3>
                <p className="settings-item-desc">Bildirim tercihlerini yönetin</p>
              </div>
            </div>
            <button className="settings-btn">Düzenle</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Lock size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Gizlilik ve Güvenlik</h3>
                <p className="settings-item-desc">Hesap güvenliği ayarları</p>
              </div>
            </div>
            <button className="settings-btn">Düzenle</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Palette size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Tema</h3>
                <p className="settings-item-desc">Görünüm ve tema seçenekleri</p>
              </div>
            </div>
            <button className="settings-btn">Düzenle</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Globe size={24} className="settings-icon" />
              <div>
                <h3 className="settings-item-title">Dil ve Bölge</h3>
                <p className="settings-item-desc">Dil ve bölge tercihleri</p>
              </div>
            </div>
            <button className="settings-btn">Düzenle</button>
          </div>
        </div>

        <p className="settings-note">
          Bu bir örnek ayarlar sayfasıdır. Gerçek ayarlar backend sistemi 
          entegre edildiğinde burada düzenlenebilecektir.
        </p>
      </div>
    </div>
  );
}

export default Settings;

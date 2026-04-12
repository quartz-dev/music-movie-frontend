import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import MovieDetail from './MovieDetail';
import Profile from './Profile';
import Settings from './Settings';
import Popular from './Popular';
import Categories from './Categories';
import MoviesByCategory from './MoviesByCategory';
import Playlists from './Playlists';
import PlaylistDetail from './PlaylistDetail';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movie/:movieTitle" element={<MovieDetail />} />
            <Route path="/movie-detail/:movieId/:movieTitle" element={<MovieDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<MoviesByCategory />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
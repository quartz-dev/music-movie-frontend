import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import MovieResults from './MovieResults';
import MovieDetail from './MovieDetail';
import Profile from './Profile';
import Settings from './Settings';
import Popular from './Popular';
import Categories from './Categories';
import Playlists from './Playlists';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movie/:movieName" element={<MovieResults />} />
        <Route path="/movie-detail/:movieId/:movieTitle" element={<MovieDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/playlists" element={<Playlists />} />
      </Routes>
    </Router>
  );
}

export default App;
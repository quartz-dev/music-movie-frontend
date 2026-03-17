import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Phone } from 'lucide-react';
import api from './services/api';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.username && formData.password.toLowerCase().includes(formData.username.toLowerCase())) {
      setError('Password cannot contain your username');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.register(formData);
      console.log('Registration successful:', response);

      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);

      const responseData = err.response?.data;
      if (responseData?.messages && Array.isArray(responseData.messages)) {
        setError(responseData.messages.join(', '));
      } else if (responseData?.errors) {
        // Validation errors form backend usually come as an object of arrays
        const errorMessages = Object.values(responseData.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(responseData?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <UserPlus size={48} className="auth-icon" />
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Sign up to get started</p>
        </div>

        {error && (
          <div className="auth-error">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={18} />
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Surname Field */}
          <div className="form-group">
            <label htmlFor="surname" className="form-label">
              <User size={18} />
              Surname
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              className="form-input"
              placeholder="Enter your surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              <Phone size={18} />
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="form-input"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <User size={18} />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              <Lock size={18} />
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="passwordConfirm"
                name="passwordConfirm"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="auth-back">
          <Link to="/" className="back-home-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

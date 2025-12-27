import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register({ name, email, password });
      
      if (user.role === 'user') {
        navigate('/create-request');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Get started with GearGuard today"
    >
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
        </div>

        <div className="form-group">
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        
        <div className="form-group">
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        
        <button type="submit" className="btn-primary full-width">
          Create Account →
        </button>
      </form>
      
      <div className="auth-link">
        <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
};

export default Signup;

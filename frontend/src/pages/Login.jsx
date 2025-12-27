import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login({ email, password });
      
      // Strict check: Only admin@gmail.com with admin role goes to admin dashboard
      if (user.email === 'admin@gmail.com' && user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        // Regular users redirect based on role
        switch (user.role) {
          case 'technician':
            navigate('/technician');
            break;
          case 'user':
            navigate('/user');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} noValidate>
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
          Sign in →
        </button>
      </form>
      
      <div className="auth-link">
        <Link to="/signup">Create account</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;

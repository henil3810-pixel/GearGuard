import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
           <div className="brand">
             <span className="brand-icon">⚙️</span>
             GearGuard
           </div>
           
           <div className="hero-text">
             <h1>Smart Maintenance Management for Modern Industry</h1>
             <p>Track equipment health, manage maintenance teams, and prevent costly downtime with our comprehensive CMMS solution.</p>
           </div>
           
           <div className="stats-container">
              <div className="stat-item">
                <h3>99.5%</h3>
                <p>Uptime</p>
              </div>
              <div className="stat-item">
                <h3>40%</h3>
                <p>Cost Reduction</p>
              </div>
              <div className="stat-item">
                <h3>2x</h3>
                <p>Faster Response</p>
              </div>
           </div>
        </div>
        <div className="copyright">
          © 2025 GearGuard. All rights reserved.
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-form-container" style={{ textAlign: 'center' }}>
          <div className="brand" style={{ color: 'var(--color-primary)', justifyContent: 'center', marginBottom: '2rem' }}>
             <span className="brand-icon">⚙️</span>
             GearGuard
           </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-text)' }}>
            Welcome
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Your complete equipment maintenance solution.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-text)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

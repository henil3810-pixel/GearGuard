import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
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
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

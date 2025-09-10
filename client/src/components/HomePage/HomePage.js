import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Help',
      action: () => navigate('help')
    },
    {
      title: 'Staff',
      action: () => navigate('/staff')
    },
    
    {
      title: 'Contact',
      action: () => navigate('/contact')
    },
    {
      title: 'Settings',
      action: () => navigate('/settings')
    },
    {
      title: 'Admin',
      action: () => navigate('/adminpanel')
    },
    {
      title: 'Campus View ',
      action: () => navigate('/campus')
    },
    
   
  ];

  const handleMenuClick = (item, index) => {
    setActiveMenu(index);
    setTimeout(() => {
      item.action();
    }, 200);
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-container">
            <div className="header-actions">
            <button className="user-profile">
              <span className="profile-icon"></span>
              <span>Login</span>
            </button>
          </div>
         
          
          <nav className="main-navigation">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`nav-item ${activeMenu === index ? 'active' : ''}`}
                onClick={() => handleMenuClick(item, index)}
                onMouseEnter={() => setActiveMenu(index)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-title">{item.title}</span>
                
              </button>
            ))}
          </nav>
            <div className="logo-section">
            <div className="logo">
            <span className="logo-text">SMART CAMPUS</span>
            <img 
              src="/assets/images/hit-logo.webp" 
              alt="HIT Logo" 
              className="logo-hit"
            />
          </div>
          </div>
        
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-background">
          <div className="background-overlay"></div>
          <img 
            src="/assets/images/hit-campus.jpg" 
            alt="HIT Campus" 
            className="hero-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('fallback-bg');
            }}
          />
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Active Rooms Detection
            </h1>
            
            <p className="hero-description">
              The Smart Campus system is designed to monitor room activity in real time. 
              By using sensors to detect light and movement, the system identifies which rooms are active or inactive. 
              This information is displayed on a digital campus map, making it easy for students, staff, and administrators to see the current status of different rooms. 
              The main goal is to optimize resource usage, improve energy efficiency, and create a more comfortable and convenient environment on campus.
            </p>
            <div className="hero-actions">
              <button 
                className="primary-action"
                onClick={() => navigate('/campus')}
              >
              Get Started
              </button>
            </div>
          </div>
             
        </div>

        
      </main>

    </div>
  );
};

export default HomePage;
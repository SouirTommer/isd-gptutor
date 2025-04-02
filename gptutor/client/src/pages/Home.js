import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container-fluid">
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '90vh'
      }}>
        <div style={{ width: '100%' }}>
          <hgroup style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' ,color: '#F0F1F3' }}>Revolutionize Learning</h1>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>with <mark style={{ backgroundColor: 'transparent', color: '#00b4d8' }}>GPTUTOR</mark> </h1>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold',color: '#F0F1F3'}}>for Modern Education</h1>
          </hgroup>
          
          <p style={{ 
            fontSize: '1.2rem', 
            marginTop: '2rem', 
            marginBottom: '3rem', 
            opacity: '0.8',
            textAlign: 'center'
          }}>
            Most learning platforms are powerful, but complex. We simplify the process with<br />
            GPTUTOR, so you can focus on teaching.
          </p>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <Link to="/upload" role="button" className="primary contrast" style={{ fontSize: '1.1rem', padding: '.75rem 2rem' , backgroundColor: '#00b4d8' , border: 'none', color: '#000000'}}>
              <i className="fas fa-rocket"></i> Start Using
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="container">
      <ul>
        <li><strong><Link to="/"><i className="fas fa-comment-alt"></i> GPTUTOR</Link></strong></li>
      </ul>
      <ul>
        <li>
          <button style={{ background: 'none', border: 'none', color: 'var(--color)' }}>
            <i className="fas fa-cog"></i>
          </button>
        </li>
        <li>
          <label htmlFor="theme-switch">
            <input type="checkbox" id="theme-switch" role="switch" />
            <i className="fas fa-moon"></i>
          </label>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

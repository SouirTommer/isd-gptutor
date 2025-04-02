import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container">
      <article>
        <header>
          <h1>404 - Page Not Found</h1>
        </header>
        <p>The page you are looking for does not exist.</p>
        <footer>
          <Link to="/" role="button">Return to Home</Link>
        </footer>
      </article>
    </div>
  );
};

export default NotFound;

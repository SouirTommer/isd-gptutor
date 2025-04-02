import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <article>
        <header>
          <h1>Welcome to GPTutor</h1>
          <p>Your AI-powered study companion</p>
        </header>

        <div className="grid">
          <div>
            <article>
              <header>
                <h3>Quick Stats</h3>
              </header>
              <div className="grid">
                <div>
                  <h4>4</h4>
                  <p>Study Decks</p>
                </div>
                <div>
                  <h4>24</h4>
                  <p>Flashcards</p>
                </div>
                <div>
                  <h4>3</h4>
                  <p>Recent PDFs</p>
                </div>
              </div>
            </article>
          </div>
          
          <div>
            <article>
              <header>
                <h3>Recent Activity</h3>
              </header>
              <ul>
                <li>Created "Physics Fundamentals" deck</li>
                <li>Studied "Math 101" deck</li>
                <li>Uploaded "History Notes"</li>
              </ul>
              <footer>
                <Link to="/dashboard" role="button">View All Activity</Link>
              </footer>
            </article>
          </div>
        </div>
        
        <div className="grid">
          <Link to="/upload" role="button" className="contrast">
            <i className="fas fa-plus"></i> Create New Deck
          </Link>
        </div>
      </article>
    </div>
  );
};

export default Home;

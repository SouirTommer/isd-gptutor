import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const recentDecks = [
    { id: 1, name: 'Study Guide', date: '2023-06-15', cards: 8 },
    { id: 2, name: 'Math 101', date: '2023-06-10', cards: 12 },
    { id: 3, name: 'Physics Fundamentals', date: '2023-06-05', cards: 6 }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-600">Welcome to your GPTutor dashboard</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold">Stats</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h4 className="text-3xl font-bold text-primary-600">4</h4>
                <p className="text-gray-600">Study Decks</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-primary-600">26</h4>
                <p className="text-gray-600">Flashcards</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-primary-600">3</h4>
                <p className="text-gray-600">Recent PDFs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold">Recent Decks</h3>
          </div>
          <div className="card-body p-0">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Cards</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDecks.map(deck => (
                  <tr key={deck.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">
                      <Link to={`/app/deck/${deck.id}`} className="text-primary-600 hover:underline">
                        {deck.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{deck.cards}</td>
                    <td className="px-4 py-2">{deck.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Link 
        to="/upload" 
        className="btn-primary inline-flex items-center px-4 py-2"
      >
        <i className="fas fa-plus mr-2"></i> Create New Study Materials
      </Link>
    </div>
  );
};

export default Dashboard;

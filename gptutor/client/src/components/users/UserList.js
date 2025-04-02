import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <article aria-busy="true">
          <h2>Loading users...</h2>
        </article>
      </div>
    );
  }

  return (
    <div className="container">
      <article>
        <header>
          <h1>Users</h1>
          <Link to="/users/add" role="button">Add User</Link>
        </header>
        
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <figure>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="grid">
                        <Link to={`/users/edit/${user._id}`} role="button" className="secondary">
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="contrast"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        )}
      </article>
    </div>
  );
};

export default UserList;

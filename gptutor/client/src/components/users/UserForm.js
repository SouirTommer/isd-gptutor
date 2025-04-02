import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isEdit, setIsEdit] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // If id exists, we're in edit mode
    if (id) {
      setIsEdit(true);
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/api/users/${id}`);
          setFormData({
            name: res.data.name,
            email: res.data.email,
            password: '' // Don't populate password for security reasons
          });
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      };
      fetchUser();
    }
  }, [id]);

  const { name, email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        // Update existing user
        await axios.put(`/api/users/${id}`, { name, email });
      } else {
        // Create new user
        await axios.post('/api/users', { name, email, password });
      }
      // Redirect to users list
      navigate('/users');
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  return (
    <div className="container">
      <article>
        <header>
          <h1>{isEdit ? 'Edit User' : 'Add User'}</h1>
        </header>
        <form onSubmit={onSubmit}>
          <div className="grid">
            <label htmlFor="name">
              Name
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </label>
          </div>
          <div className="grid">
            <label htmlFor="email">
              Email
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </label>
          </div>
          {!isEdit && (
            <div className="grid">
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required={!isEdit}
                />
              </label>
            </div>
          )}
          <button type="submit" className="primary">
            {isEdit ? 'Update User' : 'Add User'}
          </button>
        </form>
      </article>
    </div>
  );
};

export default UserForm;

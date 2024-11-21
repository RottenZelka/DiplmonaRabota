import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation before sending the request
    if (!formData.email || !formData.password) {
      setMessage('Please fill in both email and password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8888/api/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response);
      setMessage(response.data.message);  // Display the success message
    } catch (error) {
      // Improved error handling
      if (error.response) {
        setMessage('Error: ' + error.response.data.message);  // If server responded with an error
      } else if (error.request) {
        setMessage('No response received from server');
      } else {
        setMessage('Error: ' + error.message);  // Some other error
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;

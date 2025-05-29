import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create FormData object
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('password', formData.password);

      const response = await fetch(`${API_URL}/api/teams/register`, {
        method: 'POST',
        body: formDataObj
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <h2 className="text-center text-3xl font-bold">
          Create your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Team Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-500"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage; 
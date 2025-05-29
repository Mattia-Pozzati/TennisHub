import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'team'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert form data to URLSearchParams for form-urlencoded format
      const params = new URLSearchParams();
      params.append('email', formData.email);
      params.append('password', formData.password);
      params.append('user_type', formData.userType);

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      // Redirect based on user type
      switch (formData.userType) {
        case 'team':
          navigate('/team/dashboard');
          break;
        case 'referee':
          navigate('/referee/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <h2 className="text-center text-3xl font-bold">
          Sign in to your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div>
            <select
              name="userType"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="team">Team</option>
              <option value="referee">Referee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-500"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
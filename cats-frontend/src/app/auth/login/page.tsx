'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
    
const handleSubmit = async (e:React.SyntheticEvent) => {
  e.preventDefault();
setLoading(true);
    setError('');
  // ...rest of your code
    try {
      const response = await auth.login(formData.email, formData.password);
      
      if (response.success) {
        router.push('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-blue-600 font-bold text-2xl">C</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Login to CATS System
          </h2>
          <p className="text-slate-600">
            साइबर अपराध शिकायत प्रणाली में लॉगिन करें
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address / ईमेल पता
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password / पासवर्ड
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg text-lg font-semibold transition-colors shadow-md"
            >
              {loading ? 'Logging in...' : 'Login / लॉगिन'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-slate-600 hover:text-slate-800 text-sm flex items-center justify-center space-x-2"
            >
              <span>← Back to Home / होम पर वापस जाएं</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

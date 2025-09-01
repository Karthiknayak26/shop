import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/UI/Card';
import { Button } from '../../Components/UI/Button';
import { Input } from '../../Components/UI/Input';
import { Mail, Lock, Loader2 } from 'lucide-react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Home } from 'lucide-react';// Import the CSS file

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://shop-backend-92zc.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 404) {
        setError('No account found. Please sign up.');
        setTimeout(() => navigate('/register'), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Store user data and token in context
      setUser({ user: data.user, token: data.token });
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/'); // Redirect to main page
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="fab-home"
        aria-label="Go back to home"
      >
        <Home className="h-6 w-6" />
      </button>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <p className="text-center text-gray-500">Enter your credentials to login</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 form-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 form-input"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <p>
              No account?{' '}
              <span
                className="signup-link"
                onClick={() => navigate('/register')}
                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Please Sign Up
              </span>
            </p>

            <div className="text-center text-sm">
              <a href="#" className="text-blue-500 hover:text-blue-600">
                Forgot password?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
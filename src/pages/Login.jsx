import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen" style={{ backgroundColor: '#f5f0e8' }}>
      {/* Left panel */}
      <div className="relative flex w-[35%] flex-col justify-between" style={{ backgroundColor: '#faf7f2' }}>
        {/* Logo */}
        <div className="p-8">
          <img src="/icon.png" alt="Malaabis by Maymz" className="h-10 w-auto object-contain" />
        </div>

        {/* Sign In text */}
        <div className="px-12 pb-32">
          <h1 className="text-5xl font-bold" style={{ color: '#b8962e', fontFamily: 'serif' }}>Sign In</h1>
          <div className="mt-2 h-0.5 w-16" style={{ backgroundColor: '#b8962e' }} />
        </div>

        {/* Decorative circle with arrow */}
        <div
          className="absolute right-0 top-1/2 flex h-16 w-16 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full shadow-md"
          style={{ backgroundColor: '#faf7f2' }}
        >
          <span className="text-2xl font-light" style={{ color: '#b8962e' }}>›</span>
        </div>

        {/* Decorative top-right circle */}
        <div
          className="absolute right-0 top-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: '#f0ebe0' }}
        />
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-16">
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          {/* Email */}
          <div className="mb-8">
            <label className="mb-2 block text-2xl font-semibold" style={{ color: '#b8962e', fontFamily: 'serif' }}>
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="MalaabisbyMaymz@gmail.com"
              className="w-full border-0 border-b bg-transparent pb-2 text-sm outline-none placeholder:text-gray-400"
              style={{ borderBottomColor: '#b8962e', color: '#555' }}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="mb-2 block text-2xl font-semibold" style={{ color: '#b8962e', fontFamily: 'serif' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full border-0 border-b bg-transparent pb-2 text-sm outline-none placeholder:text-gray-400"
                style={{ borderBottomColor: '#b8962e', color: '#555' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <div className="mt-10 flex flex-col items-center gap-3">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-16 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#b8962e', borderRadius: '4px' }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

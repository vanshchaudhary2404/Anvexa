import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import '../styles/auth.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const emailFromQuery = new URLSearchParams(location.search).get('email') || '';
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState || emailFromQuery);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error('Please enter your email and OTP');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token && data.user) {
          login({ ...data.user, token: data.token });
        }

        toast.success(data.message || 'Email verified successfully');
        navigate('/');
        return;
      }

      toast.error(data.message || 'OTP verification failed');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('An error occurred while verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <img src="/AnvexaLogoo.png" alt="Anvexa" />
          <span>Anvexa</span>
          <span className="brand-dot">.</span>
        </div>

        <h2>Verify Email</h2>
        <p className="auth-subtitle">Enter the OTP sent to your email to activate your account.</p>

        <label htmlFor="verify-email">Email Address</label>
        <input
          id="verify-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="verify-otp">OTP</label>
        <input
          id="verify-otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>

        <p>
          Back to <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default VerifyOTP;

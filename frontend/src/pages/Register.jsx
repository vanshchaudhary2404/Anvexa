import {React ,useState , useContext } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import { toast } from "react-toastify";
import '../styles/auth.css';

const Register = () => {
  const [name , setName] = useState('');
  const [email , setEmail] = useState('');
  const [password , setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          login(data);
          toast.success(data.message || 'Registration successful');
          navigate('/');
          return;
        }

        toast.success(data.message || 'Registration successful');
        navigate('/verify-otp', { state: { email } });
        return;
      }

      toast.error(data.message || 'Registration failed');
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('An error occurred during registration');
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

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Anvexa and start shopping smarter</p>

        <label htmlFor="register-name">Full Name</label>
        <input
          id="register-name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="register-email">Email Address</label>
        <input
          id="register-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
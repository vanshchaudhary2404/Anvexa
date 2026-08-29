import {React ,useState , useContext } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import { toast } from "react-toastify";
import '../styles/auth.css';

const Login = () => {
  const [email , setEmail] = useState('');
  const [password , setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();// to set login state and navigate to home page after successful login

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await fetch('/api/auth/login' , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email , password }) 
      });
      const data = await res.json();
      if(res.ok){
        login(data); 
        toast.success('Login successful');
        navigate('/');
      }else{
        toast.error(data.message || 'Login failed');
      }
    }catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred during login');
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

        <h2 >Welcome Back</h2>
        <p className="auth-subtitle">Login to your account and continue shopping</p>

        <label htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
};

export default Login;
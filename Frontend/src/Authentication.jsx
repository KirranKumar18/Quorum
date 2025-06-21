import { useNavigate } from 'react-router-dom';
import './Authentication.css';
import { useState } from 'react';
import { supabase } from './Supabase';


export default function Authentication() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signup');
  const [Username,setUsername] = useState("");
  const navigate=useNavigate()

  const handleAuth = async () => {
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) 
        alert(error.message);
      else 
      alert('Check your email to confirm sign up!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) 
        alert(error.message);
      else {
        localStorage.setItem("Username", Username);
          alert(` ${Username} Logged in`);
            navigate('/Chatroom ')
      }

    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">

        <h2>{mode === 'signup' ? 'Sign Up' : 'Login'}</h2>

        <p> Username</p>
        <input className='auth-input' 
        type='text'
        placeholder='Enter Username'
        value={Username}
        onChange={(e)=>{setUsername(e.target.value)}}
        />
        
        <p> E-Mail</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <p>Password</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        <button onClick={handleAuth} className="auth-button">
          {mode === 'signup' ? 'Sign Up' : 'Login'}
        </button>

        <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="switch-button">    {/* setting the mode signIn or logIn */}
          {mode === 'signup' ? 'Login' : 'Sign Up'}
        </button>
      </div>
    </div>
  );  
}

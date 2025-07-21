import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './Supabase';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [User, setUser] = useState('')
  const navigate=useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // Add login logic here
  };

  const handleAuth = async () => {
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        
        if (error) {
          alert(error.message);
          return;
        }
        
        // After successful signup, create user metadata in MongoDB
        const metadataResult = await saveUserMetadata(email);
        console.log("New user signup - Metadata created:", metadataResult?.data);
        
        // Store user metadata in local storage
        if (metadataResult?.success) {
          localStorage.setItem('userMetadata', JSON.stringify(metadataResult.data));
          localStorage.setItem('userEmail', email);
        }
        
        alert('Check your email to confirm sign up!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert(error.message);
          return;
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.log("Failed to get user ID:", userError);
          return;
        }
        
        console.log("User authenticated:", user.id);
        
        // For login, get or create user metadata and log it
        const metadataResult = await getOrCreateUserMetadata(email);
        console.log("User login - User metadata:", metadataResult?.data);
        
        // Store user metadata in local storage for easy access throughout the app
        if (metadataResult?.success) {
          localStorage.setItem('userMetadata', JSON.stringify(metadataResult.data));
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userId', user.id);
        }
        
        alert('Login successful!');
        navigate('/chatroom');
      }
    } catch (err) {
      console.error("Authentication error:", err);
      alert("An error occurred during authentication. Please try again.");
    }
  };
  
  // Create new metadata for new users
  const saveUserMetadata = async (userEmail) => {
    try {
      // Using POST method with request body
      const response = await fetch('http://localhost:5000/api/LoginForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, isNewUser: true })
      });
      
      const data = await response.json();
      console.log("Metadata creation response:", data);
      
      if (!data.success) {
        console.warn("Metadata creation issue:", data.message);
      }
      
      return data;
    } catch (error) {
      console.error("Error saving metadata:", error);
    }
  };
  
  // Get existing metadata or create if doesn't exist for login
  const getOrCreateUserMetadata = async (userEmail) => {
    try {
      // Using POST method with request body
      const response = await fetch('http://localhost:5000/api/LoginForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, isLogin: true })
      });
      
      const data = await response.json();
      console.log("Metadata retrieval response:", data);
      
      return data;
    } catch (error) {
      console.error("Error retrieving metadata:", error);
    }
  };

  return (
    <div className="signup-form-center">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-quorum-gray">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quorum-gray w-5 h-5" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-quorum-dark/50 border-quorum-gray-dark text-white placeholder:text-quorum-gray focus:border-quorum-purple focus:ring-quorum-purple/20"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quorum-gray w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-quorum-dark/50 border-quorum-gray-dark text-white placeholder:text-quorum-gray focus:border-quorum-purple focus:ring-quorum-purple/20"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-quorum-gray hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link 
            to="/forgot-password"
            className="text-sm text-quorum-purple hover:text-quorum-purple-light transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-quorum hover:opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={handleAuth}
        >
          Sign In
        </Button>

        <div className="text-center">
          <p className="text-quorum-gray text-sm">
            Don't have an account?{' '}
            <Link 
              to="/signup"
              className="text-quorum-purple hover:text-quorum-purple-light transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, AtSign } from 'lucide-react';
import { Link,useNavigate } from 'react-router-dom';
import { supabase } from './Supabase.js'; // Adjust the import path as necessary


const SignupForm = () => {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // ADDED: To show error messages to the user
  const [isLoading, setIsLoading] = useState(false); // ADDED: To prevent multiple form submissions

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault(); // FIXED: Stops the page from refreshing when form submits
    setErrorMessage(''); // ADDED: Clear any previous error messages
    setIsLoading(true); // ADDED: Show loading state to user
    
    try {
      if (mode === 'signup') {
        // FIXED: Changed the signup format to match Supabase requirements
        // This stores username as user metadata in Supabase
        console.log(email, password ,username)
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
          data: {
            display_name: username
          }
        }
        });
        
        if (error) {
          setErrorMessage(error.message); // ADDED: Shows the exact error from Supabase
        } else {
          localStorage.setItem('Username', username);
          alert('Check your email to confirm sign up!');
        }
      } 
      else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMessage(error.message);
        } else {
          alert('Login successful!');
          // call the api 
          navigate('/chatroom');
        }
      }
    } catch (err) {
      // ADDED: Better error handling for network issues
      console.error('Auth error:', err);
      setErrorMessage('Failed to connect to authentication service. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false); // ADDED: Turn off loading state when done
    }
  };

  return (
    <div className="signup-form-center">
      <form onSubmit={handleAuth} className="space-y-6 w-full"> {/* FIXED: Changed from onClick to onSubmit */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Create account</h2>
          <p className="text-quorum-gray">Join meaningful conversations</p>
        </div>

        {/* ADDED: Display error message to the user */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">

          <div>
            <Label htmlFor="username" className="text-white text-sm font-medium">
              Username
            </Label>
            <div className="relative mt-1">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quorum-gray w-5 h-5" />
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event)=>{setUsername(event.target.value)}}
                className="pl-10 bg-quorum-dark/50 border-quorum-gray-dark text-white placeholder:text-quorum-gray focus:border-quorum-purple focus:ring-quorum-purple/20"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signup-email" className="text-white text-sm font-medium">
              Email
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quorum-gray w-5 h-5" />
              <Input
                id="signup-email"
                name="email"
                type="email"
                value={email}
                onChange={(event)=>{setEmail(event.target.value)}}
                className="pl-10 bg-quorum-dark/50 border-quorum-gray-dark text-white placeholder:text-quorum-gray focus:border-quorum-purple focus:ring-quorum-purple/20"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signup-password" className="text-white text-sm font-medium">
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quorum-gray w-5 h-5" />
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event)=>{setPassword(event.target.value)}}
                className="pl-10 pr-10 bg-quorum-dark/50 border-quorum-gray-dark text-white placeholder:text-quorum-gray focus:border-quorum-purple focus:ring-quorum-purple/20"
                placeholder="Create a password"
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

        <div className="text-xs text-quorum-gray">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-quorum-purple hover:text-quorum-purple-light">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-quorum-purple hover:text-quorum-purple-light">
            Privacy Policy
          </Link>
        </div>

        {/* FIXED: Added loading state to button and disabled it while loading */}
        <Button
          type="submit"
          className="w-full bg-gradient-quorum hover:opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <p className="text-quorum-gray text-sm">
            Already have an account?{' '}
            <Link 
              to="/login"
              className="text-quorum-purple hover:text-quorum-purple-light transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;

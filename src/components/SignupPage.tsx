import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Choose your username', field: 'username', placeholder: 'Enter username', type: 'text' },
    { id: 2, title: 'What\'s your email?', field: 'email', placeholder: 'Enter email address', type: 'email' },
    { id: 3, title: 'Create a password', field: 'password', placeholder: 'Enter password', type: 'password' },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = async () => {
    const currentValue = formData[currentStepData?.field as keyof typeof formData];
    if (!currentValue) return;

    if (currentStep < 3) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      // Handle signup completion with Supabase
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            }
          }
        });

        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email for verification.",
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('Signup error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentStepData?.field as keyof typeof formData]: value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const isCurrentStepValid = () => {
    const currentValue = formData[currentStepData?.field as keyof typeof formData];
    return currentValue && currentValue.length > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-8"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step.id <= currentStep
                    ? 'bg-white shadow-glow'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-elegant">
          <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            {/* Step Indicator */}
            <div className="text-center mb-6">
              <div className="text-white/60 text-sm mb-2">
                Step {currentStep} of 3
              </div>
              <h2 className="text-2xl font-bold text-white">
                {currentStepData?.title}
              </h2>
            </div>

            {/* Input Field */}
            <div className="space-y-6">
              <Input
                type={currentStepData?.type}
                placeholder={currentStepData?.placeholder}
                value={formData[currentStepData?.field as keyof typeof formData]}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg p-4 h-14"
                autoFocus
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between space-x-4">
                <Button
                  variant="outline"
                  className={`text-white border-white/30 hover:bg-white/10 ${
                    currentStep === 1 ? 'invisible' : ''
                  }`}
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  className={`bg-white text-primary hover:bg-white/90 shadow-glow flex-1 ${
                    (!isCurrentStepValid() || loading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || loading}
                >
                  {currentStep === 3 ? (
                    <>
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Creating Account...' : 'Complete Signup'}
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <span className="text-white/60">Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-white font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>

        {/* Guest Chat Option */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Try it as a guest</h3>
          <p className="text-white/70 text-sm mb-4">
            Experience GroupFlow without signing up. Join our demo chat room.
          </p>
          <Button
            variant="outline"
            className="w-full text-white border-white/20 hover:bg-white/10"
            onClick={() => navigate('/guest-chat')}
          >
            Enter Guest Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
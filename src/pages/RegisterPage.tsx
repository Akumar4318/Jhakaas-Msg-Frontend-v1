import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  timezone: z.string().default('Asia/Kolkata'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      timezone: 'Asia/Kolkata',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await registerAuth(data.name, data.email, data.password, data.timezone);
      navigate('/calendar');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-mono">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-semantic-green flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 fill-current text-background-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-text-l1">
          Create an Account
        </h2>
        <p className="mt-1 text-center text-xs text-text-l5">
          Start scheduling automated WhatsApp messages with smart calendar management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background-white py-8 px-4 shadow-xl shadow-border-light/50 sm:rounded-2xl sm:px-10 border border-border-light">
          {serverError && (
            <div className="mb-4 p-3 bg-semanticLight-red border border-semantic-red/30 text-semantic-red text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-text-l3 mb-1">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3.5 py-2.5 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
                placeholder="Rahul Sharma"
              />
              {errors.name && <p className="text-xs text-semantic-red mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-l3 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3.5 py-2.5 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
                placeholder="rahul@example.com"
              />
              {errors.email && <p className="text-xs text-semantic-red mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-l3 mb-1">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3.5 py-2.5 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
                placeholder="At least 6 characters"
              />
              {errors.password && <p className="text-xs text-semantic-red mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-l3 mb-1">Default Timezone</label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
                <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-semantic-green hover:bg-semanticDark-green text-background-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-text-l5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-semanticDark-green hover:text-semantic-green">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

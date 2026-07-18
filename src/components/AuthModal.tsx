import React, { useState } from 'react';
import { X, Sparkles, User, Phone, MapPin, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserSession, BoutiqueSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BoutiqueSettings;
  onCustomerLogin: (session: UserSession) => void;
  onAdminLogin: () => void;
  registeredUsers?: any[];
  onRegisterUser?: (newUser: any) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  settings,
  onCustomerLogin,
  onAdminLogin,
  registeredUsers = [],
  onRegisterUser
}: AuthModalProps) {
  if (!isOpen) return null;

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState(''); // Unified login identifier (phone or admin user)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAuthLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // --- DEMO / MOCK FLOW ---
        const inputUser = username.trim().toLowerCase();
        const adminUser = settings.adminUser.trim().toLowerCase();

        if (!isSignUp) {
          // LOG IN FLOW
          if (inputUser === adminUser && password === settings.adminPassword) {
            onAdminLogin();
            setSuccess('Welcome back, Admin! (Demo Mode) Accessing management dashboard...');
            setTimeout(() => {
              onClose();
            }, 1500);
            return;
          }

          // Customer Login Flow
          if (!username.trim()) {
            setError('Please enter your Registered Name or Phone Number.');
            return;
          }
          if (!password.trim()) {
            setError('Please enter your secret password to sign in.');
            return;
          }

          // Load registered users from props
          const savedUsers = registeredUsers;

          const matchedUser = savedUsers.find((u: any) => 
            (u.phone?.trim() === username.trim() || u.fullName?.toLowerCase().trim() === username.toLowerCase().trim()) &&
            u.password === password
          );

          if (matchedUser) {
            onCustomerLogin({
              fullName: matchedUser.fullName,
              phone: matchedUser.phone,
              address: matchedUser.address
            });
            setSuccess('Successfully logged in! (Demo Mode) Accessing VIP Lounge...');
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            setError('Incorrect phone/username or password. If you are a new customer, please Sign Up.');
          }
        } else {
          // SIGN UP FLOW
          if (!fullName.trim()) {
            setError('Please enter your Full Name.');
            return;
          }
          if (!phone.trim() || phone.trim().length < 7) {
            setError('Please enter a valid active mobile number.');
            return;
          }
          if (!address.trim()) {
            setError('Please enter your complete shipping delivery address.');
            return;
          }
          if (!password) {
            setError('Please choose a password.');
            return;
          }
          if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match. Please enter the exact same password in both fields.');
            return;
          }

          // Check if phone already registered
          const savedUsers = registeredUsers;
          const userExists = savedUsers.some((u: any) => u.phone?.trim() === phone.trim());

          if (userExists) {
            setError('This phone number is already registered! Please log in instead.');
            return;
          }

          // Create and save new user
          const newUser = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            password: password
          };

          if (onRegisterUser) {
            onRegisterUser(newUser);
          }

          onCustomerLogin({
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim()
          });

          setSuccess('Your luxury boutique account is active! (Demo Mode) Opening Lounge...');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
        return;
      }

      // --- REAL SUPABASE AUTH FLOW ---
      const inputUser = username.trim();

      if (!isSignUp) {
        // --- LOG IN FLOW ---
        if (!inputUser) {
          setError('Please enter your Registered Name, Phone, or Email.');
          return;
        }
        if (!password.trim()) {
          setError('Please enter your password.');
          return;
        }

        // Determine login email address from input identifier
        let loginEmail = '';
        if (inputUser.includes('@')) {
          loginEmail = inputUser;
        } else if (
          inputUser.toLowerCase() === settings.adminUser.trim().toLowerCase() ||
          inputUser.toLowerCase() === 'admin'
        ) {
          // Map admin username to a consistent admin email
          loginEmail = 'admin@mahiboutique.com';
        } else {
          // Map customer phone to pseudo email
          const cleanPhone = inputUser.replace(/[^0-9]/g, '');
          if (cleanPhone.length >= 7) {
            loginEmail = `${cleanPhone}@mahiboutique.com`;
          } else {
            // Fallback for non-numeric usernames
            loginEmail = `${inputUser.toLowerCase().replace(/[^a-z0-9]/g, '')}@mahiboutique.com`;
          }
        }

        // 1. Log in with Supabase Auth
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password
        });

        if (authError) {
          throw new Error(authError.message);
        }

        if (data.user) {
          // 2. Fetch profile from the 'profiles' table to check role / metadata
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          // Check if this account is an Admin
          const isAdmin = 
            profile?.is_admin === true || 
            profile?.role === 'admin' || 
            data.user.email === 'admin@mahiboutique.com' ||
            inputUser.toLowerCase() === settings.adminUser.trim().toLowerCase();

          if (isAdmin) {
            onAdminLogin();
            setSuccess('Welcome back, Admin! Accessing management dashboard...');
          } else {
            // Customer mapping
            onCustomerLogin({
              fullName: profile?.full_name || data.user.user_metadata?.full_name || inputUser,
              phone: profile?.phone || data.user.user_metadata?.phone || '',
              address: profile?.address || 'Kathmandu, Nepal',
              country: 'Nepal',
              whatsapp: profile?.phone || data.user.user_metadata?.phone || '',
              location: 'Kathmandu'
            });
            setSuccess('Successfully logged in! Accessing VIP Lounge...');
          }

          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        // --- SIGN UP FLOW ---
        if (!fullName.trim()) {
          setError('Please enter your Full Name.');
          return;
        }
        if (!phone.trim() || phone.trim().length < 7) {
          setError('Please enter a valid active mobile number.');
          return;
        }
        if (!address.trim()) {
          setError('Please enter your complete shipping delivery address.');
          return;
        }
        if (!password) {
          setError('Please choose a password.');
          return;
        }
        if (password.length < 4) {
          setError('Password must be at least 4 characters long.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please enter the exact same password in both fields.');
          return;
        }

        const generatedEmail = `${phone.trim().replace(/\s+/g, '')}@mahiboutique.com`;

        // 1. Sign up user in Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: generatedEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim()
            }
          }
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (data.user) {
          // 2. Create the profile in Supabase profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: fullName.trim(),
              phone: phone.trim(),
              address: address.trim(),
              is_admin: false // Default to regular customer
            });

          if (profileError) {
            console.error("Profile creation error during signup:", profileError);
          }

          onCustomerLogin({
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            country: 'Nepal',
            whatsapp: phone.trim(),
            location: 'Kathmandu'
          });

          setSuccess('Your luxury boutique account is active! Opening Lounge...');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm font-sans">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-clay overflow-hidden animate-fade-in my-8 p-6 sm:p-8">
        
        {/* Header Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-clay-light/50 hover:bg-dark hover:text-white rounded-full text-neutral-400 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-dark text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-5 h-5 text-brand animate-pulse" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-dark tracking-tight uppercase">
            {isSignUp ? 'Join the VIP Lounge' : 'Boutique Sign In'}
          </h2>
          <p className="text-neutral-500 text-xs font-light max-w-xs mx-auto">
            {isSignUp 
              ? 'Create a personal Mahi account to track orders and write custom reviews.' 
              : 'Sign in to access custom order lists and private brand lounges.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold text-left">
              ⚠ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold text-left animate-pulse">
              ✓ {success}
            </div>
          )}

          {!isSignUp ? (
            // LOG IN FIELDS
            <>
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand" />
                  Username or Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Registered Name or Phone"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs border border-clay rounded-xl p-3 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-brand" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-clay rounded-xl p-3 pr-10 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // SIGN UP FIELDS
            <>
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand" />
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reshma Thapa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs border border-clay rounded-xl p-3 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  id="signup-fullname"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98XXXXXXXX or 971XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-clay rounded-xl p-3 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  id="signup-phone"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  Delivery Destination Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lalitpur, Jhamsikhel"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs border border-clay rounded-xl p-3 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  id="signup-address"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-brand" />
                  Choose Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-clay rounded-xl p-3 pr-10 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Verify your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs border border-clay rounded-xl p-3 pr-10 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full py-3.5 bg-dark hover:bg-brand text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
              authLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {authLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating Access...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create My Account' : 'Authenticate Access'}</span>
            )}
          </button>
        </form>

        {/* Toggle Signup/Signin view */}
        <div className="mt-5 text-center flex flex-col items-center gap-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
              setPassword('');
              setConfirmPassword('');
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="text-xs text-neutral-400 hover:text-dark font-medium transition cursor-pointer"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : 'Don’t have an account yet? Create VIP Account'
            }
          </button>
          
          {!isSignUp && (
            <p className="text-[10px] text-neutral-400 mt-1">
              Are you the store manager? Log in here using your admin credentials.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

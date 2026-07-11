import React, { useState } from 'react';
import { X, Sparkles, User, Phone, MapPin, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserSession, BoutiqueSettings } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BoutiqueSettings;
  onCustomerLogin: (session: UserSession) => void;
  onAdminLogin: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  settings,
  onCustomerLogin,
  onAdminLogin
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if it is Admin log in
    const inputUser = username.trim().toLowerCase();
    const adminUser = settings.adminUser.trim().toLowerCase();

    if (!isSignUp) {
      // LOG IN FLOW
      if (inputUser === adminUser && password === settings.adminPassword) {
        onAdminLogin();
        setSuccess('Welcome back, Admin! Accessing management dashboard...');
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

      // Load registered users from localStorage
      const savedUsersRaw = localStorage.getItem('mahi_registered_users_v1');
      const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

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
        setSuccess('Successfully logged in! Accessing VIP Lounge...');
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
      const savedUsersRaw = localStorage.getItem('mahi_registered_users_v1');
      const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
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

      savedUsers.push(newUser);
      localStorage.setItem('mahi_registered_users_v1', JSON.stringify(savedUsers));

      onCustomerLogin({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      setSuccess('Your luxury boutique account is active! Opening Lounge...');
      setTimeout(() => {
        onClose();
      }, 1500);
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
            className="w-full py-3.5 bg-dark hover:bg-brand text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isSignUp ? 'Create My Account' : 'Authenticate Access'}
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

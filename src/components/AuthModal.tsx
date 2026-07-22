import React, { useState } from 'react';
import { X, Sparkles, User, Phone, MapPin, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserSession, BoutiqueSettings } from '../types';
import { auth, db, googleProvider, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseConfigured } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

  // Phone OTP specific state
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [phoneForOTP, setPhoneForOTP] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setAuthLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setError('Firebase is not configured correctly.');
        setAuthLoading(false);
        return;
      }

      const credentials = await signInWithPopup(auth, googleProvider);
      if (credentials.user) {
        let profile: any = null;
        try {
          const docRef = doc(db, 'profiles', credentials.user.uid);
          const docSnap = await getDoc(docRef);
          profile = docSnap.exists() ? docSnap.data() : null;

          if (!profile) {
            profile = {
              id: credentials.user.uid,
              email: credentials.user.email || `${credentials.user.uid}@mahiboutique.com`,
              fullName: credentials.user.displayName || 'Google VIP Guest',
              phone: credentials.user.phoneNumber || '',
              avatarUrl: credentials.user.photoURL || '',
              address: 'Kathmandu, Nepal',
              is_admin: credentials.user.email === 'admin@mahiboutique.com' || credentials.user.email === 'workineuhr@gmail.com' || credentials.user.email === 'mahicreations369@gmail.com',
              role: (credentials.user.email === 'admin@mahiboutique.com' || credentials.user.email === 'workineuhr@gmail.com' || credentials.user.email === 'mahicreations369@gmail.com') ? 'admin' : 'customer'
            };
            await setDoc(docRef, profile);
          }
        } catch (fsErr) {
          console.warn("Firestore profile sync offline/error:", fsErr);
        }

        onCustomerLogin({
          fullName: profile?.fullName || profile?.full_name || credentials.user.displayName || 'Google VIP Guest',
          phone: profile?.phone || credentials.user.phoneNumber || '9800000000',
          address: profile?.address || 'Kathmandu, Nepal',
          country: 'Nepal',
          whatsapp: profile?.phone || credentials.user.phoneNumber || '9800000000',
          location: 'Kathmandu'
        });

        setSuccess('Google Login Successful!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError(`Domain (${window.location.hostname}) is not authorized in Firebase Console. For Admin access, use Admin Username & Password in the Admin Panel or Email Sign-in!`);
      } else {
        setError(err.message || 'Failed to authenticate with Google');
      }
      setAuthLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAuthLoading(true);
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
      }
      const appVerifier = (window as any).recaptchaVerifier;
      
      let formattedPhone = phoneForOTP.trim();
      if (formattedPhone.startsWith('9') && formattedPhone.length === 10) {
        formattedPhone = '+977' + formattedPhone;
      } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
        formattedPhone = '+971' + formattedPhone;
      } else if (!formattedPhone.startsWith('+')) {
        setError('Please enter a full phone number with country code (e.g. +9779800000000 or +971500000000)');
        setAuthLoading(false);
        return;
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult);
      setOtpSent(true);
      setSuccess('Verification OTP code has been sent to ' + formattedPhone);
    } catch (err: any) {
      console.error("OTP Send error:", err);
      setError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAuthLoading(true);
    try {
      const result = await verificationId.confirm(otpCode);
      const user = result.user;
      
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      let profile = docSnap.exists() ? docSnap.data() : null;
      
      if (!profile) {
        profile = {
          id: user.uid,
          email: `${user.phoneNumber || user.uid}@mahiboutique.com`,
          fullName: 'Boutique Phone Guest',
          phone: user.phoneNumber || '',
          avatarUrl: '',
          address: 'Kathmandu, Nepal',
          is_admin: false,
          role: 'customer'
        };
        await setDoc(docRef, profile);
      }
      
      onCustomerLogin({
        fullName: profile.fullName || profile.full_name || 'Boutique VIP Guest',
        phone: profile.phone || user.phoneNumber || '',
        address: profile.address || 'Kathmandu, Nepal',
        country: 'Nepal',
        whatsapp: profile.phone || user.phoneNumber || '',
        location: 'Kathmandu'
      });
      
      setSuccess('Verification Successful! Welcome to the VIP Lounge.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP code. Please verify and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAuthLoading(true);

    try {
      const inputUser = username.trim();

      if (!isSignUp) {
        // --- LOG IN FLOW ---
        if (!inputUser) {
          setError('Please enter your Registered Name, Phone, or Gmail.');
          setAuthLoading(false);
          return;
        }
        if (!password.trim()) {
          setError('Please enter your password.');
          setAuthLoading(false);
          return;
        }

        const cleanInputUser = inputUser.toLowerCase();
        const cleanSettingsUser = settings.adminUser.trim().toLowerCase();

        // Check 1: Direct Admin Credentials Match (Local or Custom Username override)
        const isDirectAdminMatch = 
          (cleanInputUser === cleanSettingsUser || 
           cleanInputUser === 'admin' || 
           cleanInputUser === 'mahi123@' || 
           cleanInputUser === 'mahi123') &&
          password === settings.adminPassword;

        if (isDirectAdminMatch) {
          onCustomerLogin({
            fullName: settings.adminUser || 'Mahi Admin',
            phone: '9801234567',
            address: 'Kathmandu, Nepal',
            country: 'Nepal',
            whatsapp: '9801234567',
            location: 'Kathmandu'
          });

          setTimeout(() => {
            onAdminLogin();
          }, 50);

          setSuccess('Welcome back, Admin! Accessing management dashboard...');
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        }

        // Check 2: Format Email safely for Firebase Auth
        let loginEmail = '';
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputUser);

        if (isValidEmail) {
          loginEmail = inputUser;
        } else if (
          cleanInputUser === cleanSettingsUser ||
          cleanInputUser === 'admin' ||
          cleanInputUser === 'mahi123@' ||
          cleanInputUser === 'mahi123'
        ) {
          loginEmail = 'admin@mahiboutique.com';
        } else {
          const cleanPhone = inputUser.replace(/[^0-9]/g, '');
          if (cleanPhone.length >= 7) {
            loginEmail = `${cleanPhone}@mahiboutique.com`;
          } else {
            const cleanUser = inputUser.toLowerCase().replace(/[^a-z0-9]/g, '');
            loginEmail = `${cleanUser || 'user'}@mahiboutique.com`;
          }
        }

        try {
          const credentials = await signInWithEmailAndPassword(auth, loginEmail, password);
          if (credentials.user) {
            const docRef = doc(db, 'profiles', credentials.user.uid);
            const docSnap = await getDoc(docRef);
            let profile = docSnap.exists() ? docSnap.data() : null;

            const isAdmin = 
              profile?.is_admin === true || 
              profile?.role === 'admin' || 
              credentials.user.email === 'admin@mahiboutique.com' ||
              credentials.user.email === 'workineuhr@gmail.com' ||
              credentials.user.email === 'mahicreations369@gmail.com' ||
              cleanInputUser === cleanSettingsUser ||
              cleanInputUser === 'admin' ||
              cleanInputUser === 'mahi123@';

            if (isAdmin) {
              if (!profile) {
                profile = {
                  id: credentials.user.uid,
                  email: credentials.user.email || 'admin@mahiboutique.com',
                  fullName: 'Mahi Admin',
                  phone: '9801234567',
                  avatarUrl: '',
                  address: 'Kathmandu, Nepal',
                  is_admin: true,
                  role: 'admin'
                };
                await setDoc(docRef, profile);
              } else if (!profile.is_admin || profile.role !== 'admin') {
                profile.is_admin = true;
                profile.role = 'admin';
                await setDoc(docRef, profile, { merge: true });
              }

              onCustomerLogin({
                fullName: profile.fullName || profile.full_name || 'Mahi Admin',
                phone: profile.phone || '9801234567',
                address: profile.address || 'Kathmandu, Nepal',
                country: 'Nepal',
                whatsapp: profile.phone || '9801234567',
                location: 'Kathmandu'
              });

              setTimeout(() => {
                onAdminLogin();
              }, 50);

              setSuccess('Welcome back, Admin! Accessing management dashboard...');
            } else {
              onCustomerLogin({
                fullName: profile?.fullName || profile?.full_name || inputUser,
                phone: profile?.phone || '',
                address: profile?.address || 'Kathmandu, Nepal',
                country: 'Nepal',
                whatsapp: profile?.phone || '',
                location: 'Kathmandu'
              });
              setSuccess('Successfully logged in! Accessing VIP Lounge...');
            }

            setTimeout(() => {
              onClose();
            }, 1500);
          }
        } catch (fbErr: any) {
          // Fallback check if admin password matched even if Firebase fails or is unconfigured
          if (
            (cleanInputUser === cleanSettingsUser || cleanInputUser === 'admin' || cleanInputUser === 'mahi123@' || cleanInputUser === 'mahi123') &&
            password === settings.adminPassword
          ) {
            onCustomerLogin({
              fullName: settings.adminUser || 'Mahi Admin',
              phone: '9801234567',
              address: 'Kathmandu, Nepal',
              country: 'Nepal',
              whatsapp: '9801234567',
              location: 'Kathmandu'
            });

            setTimeout(() => {
              onAdminLogin();
            }, 50);

            setSuccess('Welcome back, Admin! Accessing management dashboard...');
            setTimeout(() => {
              onClose();
            }, 1000);
            return;
          }

          if (fbErr.code === 'auth/invalid-email') {
            setError('Invalid email or username format. Please verify your credentials or use your admin username.');
          } else if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
            setError('Invalid credentials. Please check your username and password.');
          } else {
            setError(fbErr.message || 'Authentication failed. Please check your credentials.');
          }
        }
      } else {
        // --- SIGN UP FLOW ---
        if (!fullName.trim()) {
          setError('Please enter your Full Name.');
          setAuthLoading(false);
          return;
        }
        if (!phone.trim() || phone.trim().length < 7) {
          setError('Please enter a valid active mobile number.');
          setAuthLoading(false);
          return;
        }
        if (!address.trim()) {
          setError('Please enter your complete shipping delivery address.');
          setAuthLoading(false);
          return;
        }
        if (!password) {
          setError('Please choose a password.');
          setAuthLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('Password must be at least 4 characters long.');
          setAuthLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please enter the exact same password in both fields.');
          setAuthLoading(false);
          return;
        }

        const generatedEmail = `${phone.trim().replace(/\s+/g, '')}@mahiboutique.com`;
        const credentials = await createUserWithEmailAndPassword(auth, generatedEmail, password);

        if (credentials.user) {
          const docRef = doc(db, 'profiles', credentials.user.uid);
          const profile = {
            id: credentials.user.uid,
            email: generatedEmail,
            fullName: fullName.trim(),
            phone: phone.trim(),
            avatarUrl: '',
            address: address.trim(),
            is_admin: false,
            role: 'customer'
          };
          await setDoc(docRef, profile);

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
          <div className="w-16 h-16 bg-white border border-clay-light rounded-2xl flex items-center justify-center mx-auto overflow-hidden shadow-md p-1 mb-2">
            <img 
              src={settings.logoUrl || '/src/assets/images/mahi_logo_new_1783763329444.jpg'} 
              alt="Mahi Boutique Logo" 
              className="w-full h-full object-contain rounded-xl animate-pulse-slow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/mahi_logo_new_1783763329444.jpg';
              }}
            />
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

        {!isSignUp && (
          <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'password'
                  ? 'bg-dark text-white shadow'
                  : 'text-neutral-500 hover:text-dark'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'otp'
                  ? 'bg-dark text-white shadow'
                  : 'text-neutral-500 hover:text-dark'
              }`}
            >
              Phone OTP Login
            </button>
          </div>
        )}

        {loginMode === 'otp' && !isSignUp ? (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
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

            <div id="recaptcha-container"></div>

            {!otpSent ? (
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand" />
                  Your Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +97798XXXXXXXX or +97150XXXXXXX"
                  value={phoneForOTP}
                  onChange={(e) => setPhoneForOTP(e.target.value)}
                  className="w-full text-xs border border-clay rounded-xl p-3 bg-clay-light/25 font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                />
                <p className="text-[10px] text-neutral-400">
                  Please enter your phone number with your country code (e.g., +977 for Nepal, +971 for UAE).
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand" />
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      disabled
                      value={phoneForOTP}
                      className="flex-1 text-xs border border-clay rounded-xl p-3 bg-neutral-100 font-semibold text-neutral-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setVerificationId(null);
                        setOtpCode('');
                        setSuccess('');
                      }}
                      className="px-3 py-2 text-xs font-bold border border-clay rounded-xl hover:bg-neutral-50 text-neutral-500"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-brand" />
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-xs border border-clay rounded-xl p-3 bg-clay-light/25 font-semibold text-dark tracking-widest text-center focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>
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
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{otpSent ? 'Verify & Login' : 'Send OTP Code'}</span>
              )}
            </button>
          </form>
        ) : (
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
                    Username, Phone, or Gmail
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Registered Name, Phone, or Gmail"
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
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-clay"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-neutral-400">
            <span className="bg-white px-3">Or Login Instantly With</span>
          </div>
        </div>

        <button
          type="button"
          disabled={authLoading}
          onClick={handleGoogleLogin}
          className="w-full py-3.5 border border-clay bg-white hover:bg-neutral-50 text-dark text-xs font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

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
              Admin and customers use this same universal form to log in. Admins can log in with their registered Gmail.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

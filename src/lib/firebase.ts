// Hostinger Standalone Authentication & Data Store Configuration
// Bypasses external Firebase server connections for seamless hosting on Hostinger (mahicreations.xyz)

export const isFirebaseConfigured = false;

// Mock Firebase exports for backwards compatibility without network calls
export const db: any = {};
export const auth: any = {
  currentUser: null
};
export const googleProvider: any = {};
export const RecaptchaVerifier: any = class {
  constructor() {}
  render() { return Promise.resolve('mock-recaptcha'); }
};
export const signInWithPhoneNumber = async () => {
  return {
    confirm: async () => ({
      user: {
        uid: 'hostinger_user_' + Date.now(),
        displayName: 'Mahi Boutique VIP Guest',
        phoneNumber: '+9779801234567',
        email: 'customer@mahicreations.xyz'
      }
    })
  };
};


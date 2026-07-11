import React from 'react';

// Real logo for eSewa (Official colors and layout)
export function ESewaLogo({ className = "h-6" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-[#60bb46] px-2.5 py-1.5 rounded-lg text-white font-sans font-bold shadow-sm ${className}`}>
      <span className="text-[11px] tracking-tight lowercase">e</span>
      <span className="text-[12px] tracking-normal capitalize font-extrabold text-white">Sewa</span>
    </div>
  );
}

// Real logo for Khalti (Official colors and layout)
export function KhaltiLogo({ className = "h-6" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-[#5c2d91] px-2.5 py-1.5 rounded-lg text-white font-sans font-bold shadow-sm ${className}`}>
      <span className="text-[12px] tracking-normal font-black text-white capitalize">khalti</span>
    </div>
  );
}

// Real logo for Visa
export function VisaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem' }}>
      <path d="M15.42 27.69L22.25 4.31h5.45l-6.83 23.38h-5.45zM38.82 4.31h-4.22c-1.3 0-2.39.75-2.9 1.95L23.86 27.69h5.71s.93-2.55 1.14-3.1h6.96c.16.73.66 3.1.66 3.1h5.05L38.82 4.31zm-6.61 15.65c.42-1.15 2.02-5.5 2.02-5.5s.42 1.14.77 2.1c.45 1.25 1.25 3.4 1.25 3.4H32.21zm21.43 1.83c-1.14-.58-1.83-.98-1.83-1.58s.66-1.22 2.11-1.22c1.64 0 2.87.36 3.77.77l.45.21.68-4.25c-.93-.41-2.65-.85-4.75-.85-4.95 0-8.43 2.62-8.45 6.35 0 2.78 2.49 4.33 4.4 5.26 1.95.95 2.61 1.57 2.6 2.42-.02 1.3-1.57 1.9-3.02 1.9-2.55 0-4-.4-5.26-.95l-.46-.22-.72 4.49c1.22.56 3.47 1.05 5.8 1.05 5.25 0 8.65-2.58 8.68-6.58.02-2.2-1.32-3.87-4.45-5.41zM67.82 4.31h-4.18c-1.64 0-2.39 1.1-2.73 1.9L52.82 27.69h5.7l1.13-3.13h6.95s.65 1.77.78 2.37c.14.62.62.76 1.08.76h5.04L67.82 4.31zm-6.62 15.65c.42-1.15 2.02-5.5 2.02-5.5s.42 1.14.77 2.1c.45 1.25 1.25 3.4 1.25 3.4H61.2z" fill="#1A1F71"/>
      <path d="M14.65 4.31H7.8L3.25 16.5C1.83 12.83 0 4.31 0 4.31h4.9L9.42 21.2 14.65 4.31z" fill="#F7B600"/>
    </svg>
  );
}

// Real logo for MasterCard
export function MasterCardLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem' }}>
      <circle cx="31" cy="31" r="31" fill="#EB001B" fillOpacity="0.9"/>
      <circle cx="69" cy="31" r="31" fill="#F79E1B" fillOpacity="0.9"/>
      <path d="M50 8.24C45.2 14.34 42.4 22.34 42.4 31C42.4 39.66 45.2 47.66 50 53.76C54.8 47.66 57.6 39.66 57.6 31C57.6 22.34 54.8 14.34 50 8.24Z" fill="#FF5F00"/>
    </svg>
  );
}

// Real logo for Cash on Delivery (COD)
export function CODLogo({ className = "h-6" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 bg-neutral-800 px-3 py-1.5 rounded-lg text-white font-sans font-bold shadow-sm border border-neutral-700/50 ${className}`}>
      <span className="text-[10px] tracking-wide font-medium text-white">Cash on Delivery</span>
    </div>
  );
}

// Real logo for Bank Transfer
export function BankTransferLogo({ className = "h-6" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#0a2540] px-3 py-1.5 rounded-lg text-white font-sans font-bold shadow-sm border border-blue-900/30 ${className}`}>
      <span className="text-[10px] tracking-wide font-medium text-white">Bank Transfer</span>
    </div>
  );
}

// Real logo for Facebook (Original blue)
export function FacebookLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.03 4.41 11.02 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.5c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.44C19.59 23.09 24 18.1 24 12.07z"/>
    </svg>
  );
}

// Real logo for Instagram (True brand gradient mapping)
export function InstagramLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="instaGrad" cx="30%" cy="107%" r="130%" fx="30%" fy="107%">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="5%" stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="url(#instaGrad)"/>
      <path d="M12 5.838a6.157 6.157 0 00-6.162 6.162A6.157 6.157 0 0012 18.162a6.157 6.157 0 006.162-6.162A6.157 6.157 0 0012 5.838zm0 10.162a3.993 3.993 0 11.001-7.986A3.993 3.993 0 0112 16zm4.991-9.988a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" fill="#FFF"/>
    </svg>
  );
}

// Real logo for TikTok (Modern black icon with offset cyan & red shadows)
export function TikTokLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#010101"/>
      <path d="M16.6 10.13c-1.32-.08-2.45-.75-3.14-1.74v5.36c0 2.48-2.02 4.5-4.5 4.5S4.46 16.23 4.46 13.75s2.02-4.5 4.5-4.5c.34 0 .66.04.98.11v2.17c-.3-.1-.63-.16-.98-.16-1.28 0-2.33 1.05-2.33 2.33s1.05 2.33 2.33 2.33 2.33-1.05 2.33-2.33V4.5h2.17c0 .97.6 1.83 1.48 2.19.49.2 1.03.31 1.63.31V10.13z" fill="#FFF"/>
    </svg>
  );
}

// Real logo for WhatsApp (Official green)
export function WhatsAppLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.463h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

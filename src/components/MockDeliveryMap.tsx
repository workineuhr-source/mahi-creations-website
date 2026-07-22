import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Truck, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Phone, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Building2, 
  RefreshCw,
  LocateFixed,
  ChevronRight
} from 'lucide-react';
import { OrderStatus } from '../types';

interface MockDeliveryMapProps {
  deliveryLocationName: string;
  customerAddress: string;
  customerName: string;
  orderStatus: OrderStatus;
  courierName?: string;
  courierPhone?: string;
  estimatedDelivery?: string;
  orderId: string;
}

// Generate realistic pseudo GPS coordinates based on location name string
function getCoordinatesForLocation(locName: string, address: string) {
  let hash = 0;
  const combined = locName + address;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) / 1000) - 0.05;
  const lngOffset = ((Math.abs(hash >> 3) % 100) / 1000) - 0.05;
  
  const baseLat = 27.7172; // Kathmandu Base Lat
  const baseLng = 85.3240; // Kathmandu Base Lng

  return {
    lat: (baseLat + latOffset).toFixed(4),
    lng: (baseLng + lngOffset).toFixed(4),
    distanceKm: (2.5 + (Math.abs(hash) % 120) / 10).toFixed(1)
  };
}

export default function MockDeliveryMap({
  deliveryLocationName,
  customerAddress,
  customerName,
  orderStatus,
  courierName = 'Mahi Express Logistics',
  courierPhone = '+977 9801234567',
  estimatedDelivery = 'Within 24 to 48 Hours',
  orderId
}: MockDeliveryMapProps) {
  const [mapStyle, setMapStyle] = useState<'warm' | 'satellite' | 'night'>('warm');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(true);

  const coords = getCoordinatesForLocation(deliveryLocationName, customerAddress);

  // Status progress percentage along the delivery line
  const getProgressPercentage = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 5;
      case 'Confirmed': return 25;
      case 'Packaging': return 45;
      case 'Out for Delivery': return 82;
      case 'Delivered': return 100;
      case 'Cancelled': return 0;
      default: return 20;
    }
  };

  const progressPercent = getProgressPercentage(orderStatus);

  // Map background styling configs
  const getMapBgClass = () => {
    switch (mapStyle) {
      case 'night':
        return 'bg-[#0f172a] text-slate-100 border-slate-800';
      case 'satellite':
        return 'bg-[#1a2e1d] text-emerald-50 border-emerald-900';
      case 'warm':
      default:
        return 'bg-[#fbf7f4] text-neutral-800 border-amber-900/10';
    }
  };

  const getGridColor = () => {
    switch (mapStyle) {
      case 'night': return '#1e293b';
      case 'satellite': return '#234227';
      default: return '#eedfd5';
    }
  };

  const getRoadColor = () => {
    switch (mapStyle) {
      case 'night': return '#334155';
      case 'satellite': return '#2d5232';
      default: return '#e3d0c3';
    }
  };

  const getRiverColor = () => {
    switch (mapStyle) {
      case 'night': return '#0284c7';
      case 'satellite': return '#0369a1';
      default: return '#38bdf8';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-md ${getMapBgClass()} ${
      isFullscreen ? 'fixed inset-4 z-50 m-auto max-w-5xl h-[85vh] shadow-2xl ring-4 ring-brand/30' : 'w-full'
    }`}>
      
      {/* MAP HEADER TOP CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-inherit/40 bg-white/40 dark:bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand/10 text-brand font-bold flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-sm font-black uppercase tracking-wider">
                Live GPS Delivery Map
              </h4>
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Dispatch Signal
              </span>
            </div>
            <p className="text-[10px] opacity-75 font-medium">
              Tracking Order <span className="font-mono font-bold">{orderId}</span> • Coordinates: {coords.lat}° N, {coords.lng}° E
            </p>
          </div>
        </div>

        {/* CONTROLS RIGHT BAR */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Map Style Selector */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-xl gap-1 text-[10px] font-bold">
            <button
              onClick={() => setMapStyle('warm')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'warm' ? 'bg-brand text-white shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Boutique
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-emerald-700 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('night')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'night' ? 'bg-slate-800 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Night
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl overflow-hidden border border-inherit/20">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.6))}
              className="px-2.5 py-1 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <span className="text-[9px] font-mono px-1 opacity-60">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="px-2.5 py-1 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG INTERACTIVE MAP CANVAS */}
      <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden select-none">
        
        {/* Scale transformation wrapper */}
        <div 
          className="w-full h-full transition-transform duration-500 ease-out flex items-center justify-center relative"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Map Graphics Layer */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Grid pattern */}
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={getGridColor()} strokeWidth="1" opacity="0.6" />
              </pattern>
              
              {/* Linear Gradient for Dispatch Route */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c5a880" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill="url(#mapGrid)" />

            {/* Simulated River / Natural Contour feature */}
            <path 
              d="M -20,180 Q 150,120 300,240 T 700,200 T 1100,280" 
              fill="none" 
              stroke={getRiverColor()} 
              strokeWidth="24" 
              opacity="0.25"
              strokeLinecap="round" 
            />

            {/* Secondary Roads Grid */}
            <g stroke={getRoadColor()} strokeWidth="3" opacity="0.75">
              <line x1="10%" y1="0" x2="10%" y2="100%" />
              <line x1="30%" y1="0" x2="30%" y2="100%" />
              <line x1="50%" y1="0" x2="50%" y2="100%" />
              <line x1="75%" y1="0" x2="75%" y2="100%" />

              <line x1="0" y1="20%" x2="100%" y2="20%" />
              <line x1="0" y1="50%" x2="100%" y2="50%" />
              <line x1="0" y1="75%" x2="100%" y2="75%" />
            </g>

            {/* Main Ring Road Highway Corridor */}
            <path 
              d="M 50 280 C 120 80, 480 50, 720 280" 
              fill="none" 
              stroke={getRoadColor()} 
              strokeWidth="10" 
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* MAIN DISPATCH ROUTE CURVE (From Hub (15%, 70%) to Destination (80%, 30%)) */}
            <path
              id="dispatchPath"
              d="M 120 260 Q 320 80 680 120"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeDasharray="8 6"
              strokeLinecap="round"
              filter="url(#glow)"
              className="animate-pulse"
            />

            {/* Background Trace Line */}
            <path
              d="M 120 260 Q 320 80 680 120"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
              opacity="0.3"
            />
          </svg>

          {/* MAP NODES & PINS OVERLAY LAYER */}
          <div className="absolute inset-0 pointer-events-none">
            
            {/* ORIGIN NODE: MAHI CREATIONS HQ BOUTIQUE DISPATCH WAREHOUSE */}
            <div className="absolute left-[15%] top-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer">
              <div className="relative flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-amber-900/20 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5 text-amber-300" />
                </div>
                <div className="mt-1.5 px-2.5 py-1 bg-neutral-900/90 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md border border-white/10">
                  🏬 Central Warehouse
                </div>
              </div>
            </div>

            {/* DESTINATION PIN: CUSTOMER DELIVERY LOCATION */}
            <div className="absolute left-[78%] top-[32%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer">
              <div className="relative flex flex-col items-center">
                
                {/* Pulse beacon waves */}
                <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute -inset-8 rounded-full bg-rose-500/10 animate-pulse" />

                {/* Pin Icon Header */}
                <motion.div 
                  onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-rose-500/30 z-20 cursor-pointer"
                >
                  <MapPin className="w-6 h-6 text-white drop-shadow-md animate-bounce" />
                </motion.div>

                {/* DESTINATION POPUP BADGE */}
                <AnimatePresence>
                  {isTooltipOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="mt-2 p-3 bg-white dark:bg-neutral-900 text-dark dark:text-white rounded-2xl shadow-2xl border border-clay-dark dark:border-neutral-700 min-w-[210px] max-w-[260px] text-left z-30 pointer-events-auto"
                    >
                      <div className="flex justify-between items-center border-b border-inherit pb-1.5 mb-1.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand">
                          📍 Delivery Destination
                        </span>
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          GPS Verified
                        </span>
                      </div>

                      <p className="text-xs font-black truncate">{deliveryLocationName}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 font-medium leading-tight">
                        {customerAddress}
                      </p>

                      <div className="mt-2 pt-1.5 border-t border-inherit flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-neutral-400">Recipient:</span>
                        <span className="font-bold text-dark dark:text-white">{customerName}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* ANIMATED COURIER RIDER VEHICLE ALONG PATH */}
            <motion.div 
              initial={{ left: '15%', top: '70%' }}
              animate={{ 
                left: `${15 + (progressPercent * 0.63)}%`, 
                top: `${70 - (progressPercent * 0.38)}%` 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20"
            >
              <div className="relative group flex flex-col items-center">
                
                {/* Rider Icon Badge */}
                <div className="p-2.5 rounded-2xl bg-brand text-white shadow-xl border-2 border-white ring-4 ring-brand/30 flex items-center justify-center animate-pulse">
                  <Truck className="w-5 h-5 text-white" />
                </div>

                {/* Rider floating status label */}
                <div className="mt-1 px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-extrabold rounded-full uppercase tracking-wider whitespace-nowrap shadow-md border border-white/20">
                  {orderStatus === 'Delivered' ? 'Arrived!' : 'Mahi Rider In Transit'}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* MAP BOTTOM INFORMATION OVERLAY FOOTER */}
        <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-inherit shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">
                Dispatch Courier & ETA
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-bold text-dark dark:text-white">{courierName}</span>
                <span className="text-neutral-300">•</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {estimatedDelivery}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-inherit">
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">
                Distance to Hub
              </p>
              <p className="font-bold font-mono text-dark dark:text-white">
                ~{coords.distanceKm} km ({progressPercent}% completed)
              </p>
            </div>

            {courierPhone && courierPhone !== 'Pending review' && (
              <a
                href={`tel:${courierPhone}`}
                className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                <Phone className="w-3 h-3" />
                <span>Call Rider</span>
              </a>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

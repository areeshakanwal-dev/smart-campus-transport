import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for the live search interaction
  const mockBuses = [
    { id: 1, route: 'Route 1', name: 'Campus → Hostels', status: 'On Time', color: 'green' },
    { id: 2, route: 'Route 2', name: 'City Center → Campus', status: '5 min late', color: 'red' },
    { id: 3, route: 'Route 3', name: 'West Campus → Main', status: 'On Time', color: 'green' },
  ];

  const filteredBuses = mockBuses.filter(bus => 
    bus.route.toLowerCase().includes(searchQuery.toLowerCase()) || 
    bus.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen font-sans bg-[#0F172A] relative overflow-hidden">
      
      {/* 1. Full-Screen Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Bus Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-transparent"></div>
      </div>

      {/* 2. Top Navigation Bar (Glassmorphism) */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-3xl">🚌</span>
            <h1 className="text-2xl font-bold text-[#FBBF24] tracking-tight hover:text-white transition">CampusFlow</h1>
          </div>
          
          <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-200">
            <a href="#" className="hover:text-[#FBBF24] transition">Live Map</a>
            <a href="#" className="hover:text-[#FBBF24] transition">Routes & Timings</a>
            <a href="#" className="hover:text-[#FBBF24] transition">About</a>
            <a href="#" className="hover:text-[#FBBF24] transition">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-white hover:text-[#FBBF24] transition">Login</Link>
            <Link to="/register" className="text-sm font-bold text-[#0F172A] bg-[#FBBF24] px-6 py-2 rounded-full hover:bg-yellow-400 hover:scale-105 transition shadow-lg">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-2 gap-12 items-center">
        
        <div className="max-w-2xl">
          <div className="inline-block bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-6 border border-blue-500/30">
            Real-time Tracking System
          </div>
          <h1 className="text-6xl font-extrabold text-white leading-[1.1] mb-6">
            Your Campus Bus,<br/>
            <span className="text-[#FBBF24]">Live & On Time</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-lg">
            Track your bus, check routes, and never miss your ride again. Experience the safest and smartest way to commute on campus.
          </p>

          {/* Interactive Search Bar */}
          <div className="relative max-w-lg mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-gray-400 group-focus-within:text-[#FBBF24] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by Bus Number or Route..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:bg-white/20 transition-all shadow-xl"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-[#FBBF24] hover:bg-yellow-400 text-[#0F172A] px-6 rounded-full font-bold transition-all">
              Search
            </button>
          </div>

          {/* Quick Route Status Cards (Filtered by Search) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredBuses.map((bus) => (
              <div key={bus.id} className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🚌</span>
                  <span className="text-sm font-bold text-white">{bus.route}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{bus.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full bg-${bus.color}-500 animate-pulse`}></div>
                  <span className={`text-xs font-bold text-${bus.color}-400`}>{bus.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side illustration (Optional, currently empty to let the background shine) */}
        <div></div>
      </main>
    </div>
  );
}
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-[#0F172A] text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🚌</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#FBBF24]">Campus Express</h1>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium items-center">
          <Link to="/login" className="hover:text-[#FBBF24] transition">Live Map</Link>
          <Link to="/login" className="hover:text-[#FBBF24] transition">Routes & Timings</Link>
          <Link to="/login" className="hover:text-[#FBBF24] transition">Login</Link>
          <Link to="/register" className="bg-[#FBBF24] text-[#0F172A] px-5 py-2 rounded-full font-bold hover:bg-yellow-500 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-extrabold text-[#0F172A] leading-tight mb-6">
            Your Campus Bus, <br/>
            <span className="text-[#1E3A8A]">Live & On Time</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your bus, check routes, and never miss your ride again. The ultimate transport solution for students and parents.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="bg-[#FBBF24] text-[#0F172A] px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition shadow-lg">
              Track a Bus
            </Link>
          </div>
          
          {/* Quick Route Status Cards */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600">●</div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Route 1</p>
                <p className="text-sm font-semibold text-[#0F172A]">On Time</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full text-red-600">●</div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Route 2</p>
                <p className="text-sm font-semibold text-[#0F172A]">5 min Late</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#FBBF24] rounded-full blur-3xl opacity-20 transform translate-x-10 translate-y-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Campus Bus" 
            className="rounded-2xl shadow-2xl relative z-10 border-4 border-white object-cover h-[400px] w-full"
          />
        </div>
      </main>
    </div>
  );
}
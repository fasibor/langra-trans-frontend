import { Link } from 'react-router-dom';
import { Bus, Shield, QrCode, CheckCircle, ArrowRight } from 'lucide-react';

const features = [
  { icon: Bus, title: 'Easy Booking', desc: 'Book your seat in seconds from your phone' },
  { icon: Shield, title: 'Secure Payments', desc: 'Verified bank transfer with admin confirmation' },
  { icon: QrCode, title: 'QR Boarding', desc: 'Skip the queue with your digital ticket QR code' },
  { icon: CheckCircle, title: 'Real-time Status', desc: 'Track your booking from payment to boarding' },
];

const routes = [
  'Berger → Victoria Island',
  'Ajah → Victoria Island',
  'Ikeja → Lekki',
  'Ikorodu → Lagos Island',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-brand-100">
          <img src="/logo.png" alt="Langra Trans" className="w-full h-full object-contain" />
        </div>
          <span className="font-display font-bold text-xl text-dark-800">Langra Trans</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
            Log in
          </Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4 rounded-lg shadow-md">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center px-6 py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-100">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
          Lagos Commuter Transport
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-dark-900 leading-tight mb-5">
          Book your bus seat<br />
          <span className="text-brand-600">without the hassle</span>
        </h1>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          No more WhatsApp back-and-forth. Book, pay, and board with your digital ticket — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 justify-center">
            Book a ride today <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary inline-flex items-center gap-2 justify-center">
            Sign in to account
          </Link>
        </div>
      </section>

      {/* Routes strip */}
      <div className="bg-dark-800 py-4 overflow-hidden">
        <div className="flex gap-8 px-6 animate-pulse-slow">
          {[...routes, ...routes].map((r, i) => (
            <span key={i} className="text-slate-300 text-sm font-medium whitespace-nowrap flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-center text-dark-800 mb-10">
          Everything you need to commute smarter
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-semibold text-dark-800 text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white text-center py-16 px-6">
        <h2 className="font-display font-bold text-3xl mb-3">Ready to ride?</h2>
        <p className="text-brand-100 mb-8 text-lg">Create your free account in under a minute.</p>
        <Link to="/register" className="bg-white text-brand-600 font-bold px-8 py-3 rounded-xl inline-block hover:bg-brand-50 transition-colors shadow-xl">
          Create free account
        </Link>
      </section>

      <footer className="text-center py-8 text-slate-400 text-sm">
        © {new Date().getFullYear()} Squad Langra Transportation Limited · langratrans.com.ng · 07036100723
      </footer>
    </div>
  );
}

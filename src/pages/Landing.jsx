import { Link } from 'react-router-dom';
import {
  Shield, QrCode, CheckCircle, ArrowRight,
  MapPin, Clock, Users, Star, Phone, Mail,
  Link2, Globe, Bus,
} from 'lucide-react';

const features = [
  { icon: MapPin,       title: 'Easy Booking',      desc: 'Book your seat in seconds from your phone. No calls, no WhatsApp back-and-forth.' },
  { icon: Shield,       title: 'Secure Payments',   desc: 'Transfer to our verified GTBank account and submit your reference. Fast admin verification.' },
  { icon: QrCode,       title: 'QR Boarding Pass',  desc: 'Get a unique QR code on confirmation. Simply scan to board — no paper tickets.' },
  { icon: CheckCircle,  title: 'Real-time Updates',  desc: 'Live booking status, bus arrival alerts, and push notifications straight to your phone.' },
];

const safetyPoints = [
  'Verified drivers on every trip',
  'GPS tracking on active routes',
  'Admin-verified payments only',
  'Seat capacity enforced — no overbooking',
  'QR boarding prevents ticket fraud',
];

const contact = {
  phone:     '07036100723',
  email:     'Contact@langratrans.com.ng',
  website:   'langratrans.com.ng',
  instagram: 'langratransportation',
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-brand-100 shadow-sm">
            <img src="/logo.png" alt="Langra Trans" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-dark-800 text-base leading-tight block">Langra Trans</span>
            <span className="text-[10px] text-slate-400 leading-tight">Squad Langra Transportation Ltd</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-5 rounded-xl shadow-md">
            Book a ride
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-brand-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-6 py-20 sm:py-28">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-brand-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Lagos Commuter Transport — Structured & Reliable
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            Book your bus seat<br />
            <span className="text-brand-400">without the hassle</span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            No more WhatsApp back-and-forth. Book, pay, and board with your digital QR ticket — all in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-xl shadow-brand-900/40">
              Get started free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors border border-white/20">
              Sign in to account
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-dark-900 mb-3">How it works</h2>
            <p className="text-slate-500">From booking to boarding in four simple steps</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Book',    desc: 'Choose route, date and pickup point' },
              { step: '02', title: 'Pay',     desc: 'Transfer fare to our GTBank account' },
              { step: '03', title: 'Confirm', desc: 'Admin verifies and sends your QR ticket' },
              { step: '04', title: 'Board',   desc: 'Scan QR or quote code at the bus' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-display font-bold text-sm">{step}</span>
                </div>
                <p className="font-display font-bold text-dark-800 mb-1">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-dark-900 mb-3">Everything you need</h2>
          <p className="text-slate-500">Built for Lagos commuters who value their time</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-brand-100 transition-all">
              <div className="w-12 h-12 bg-brand-50 group-hover:bg-brand-100 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-display font-bold text-dark-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Safety ───────────────────────────────────────────── */}
      <section className="bg-dark-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Shield size={12} /> Safety first
            </div>
            <h2 className="font-display font-bold text-3xl mb-4">Your safety is our priority</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Every trip is backed by verified drivers, seat capacity control, and a transparent booking trail — so you always know exactly who's driving and where your money goes.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Book safely today <ArrowRight size={16} />
            </Link>
          </div>
          <ul className="space-y-3">
            {safetyPoints.map(point => (
              <li key={point} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={13} className="text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Testimonials placeholder ─────────────────────────── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-dark-900 mb-3">Trusted by Lagos commuters</h2>
          <p className="text-slate-500 mb-10">Join hundreds of passengers who've made the switch from WhatsApp booking</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { text: 'Finally, a proper booking system! No more "please hold" on WhatsApp. My seat is confirmed before I even leave the house.', name: 'Adaeze O.', route: 'Berger → VI' },
              { text: "The QR code boarding is so smooth. Driver just scans and I'm on. Love that I get notified when the bus arrives at my stop.", name: "Emeka N.", route: "Ajah → VI" },
              { text: 'Admin verified my payment within 5 minutes. Had my ticket before my coffee finished. Brilliant service.', name: 'Funmi A.', route: 'Ikeja → Lekki' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-left">
                <div className="flex gap-0.5 mb-3">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-dark-800 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.route}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-dark-900 mb-3">Get in touch</h2>
          <p className="text-slate-500 mb-10">Questions? We're here to help.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Phone,     label: 'Phone / WhatsApp', value: contact.phone,     href: `tel:${contact.phone}` },
              { icon: Mail,      label: 'Email',            value: contact.email,     href: `mailto:${contact.email}` },
              { icon: Globe,     label: 'Website',          value: contact.website,   href: `https://${contact.website}` },
              { icon: Link2, label: 'Instagram',        value: `@${contact.instagram}`, href: `https://instagram.com/${contact.instagram}` },
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-2xl hover:bg-brand-50 hover:border-brand-100 border border-transparent transition-all group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-100 transition-colors">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-dark-800 text-center break-all">{value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white text-center py-16 px-6">
        <h2 className="font-display font-bold text-3xl mb-3">Ready to ride smarter?</h2>
        <p className="text-brand-100 mb-8 text-lg max-w-md mx-auto">Create your free account and book your first trip in under 2 minutes.</p>
        <Link to="/register" className="bg-white text-brand-600 font-bold px-10 py-4 rounded-xl inline-block hover:bg-brand-50 transition-colors shadow-xl">
          Create free account
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-dark-900 text-slate-400 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700">
            <img src="/logo.png" alt="Langra Trans" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-white text-sm">Langra Trans</span>
        </div>
        <p className="text-xs text-slate-500 mb-1">Squad Langra Transportation Limited</p>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} · {contact.website} · {contact.phone}
        </p>
      </footer>
    </div>
  );
}

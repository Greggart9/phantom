import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('An existing order');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setTopic('An existing order');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-14 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1320px] mx-auto">
        {/* ========================================================= */}
        {/* TOP HEADER: Eyebrow + Headline & Description               */}
        {/* ========================================================= */}
        <header className="pb-10 sm:pb-14 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#cf5230]">
                CONTACT
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08]">
                Talk to the studio
              </h1>
            </div>

            <div className="lg:col-span-5 lg:pl-6">
              <p className="text-sm sm:text-[17px] text-neutral-400 font-normal leading-relaxed max-w-sm">
                A person reads every message, usually within one working day. For orders, include your order number and we will find it faster.
              </p>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN CONTENT: 2-Column Layout (Form & Studio Details)     */}
        {/* ========================================================= */}
        <main className="pt-12 sm:pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* ---------------- Left: Contact Form ---------------- */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="bg-[#181716] border border-neutral-800 p-8 sm:p-12 space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="text-xl font-medium text-white">Message sent</h3>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                    Thank you{firstName ? `, ${firstName}` : ''}. We have received your note regarding{' '}
                    <span className="text-white font-normal">"{topic}"</span> and someone from the Lisbon studio will write back to{' '}
                    <span className="text-white font-normal">{email}</span> within one working day.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-3 text-xs uppercase tracking-wider font-semibold border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="block text-[11px] font-medium tracking-[0.16em] uppercase text-neutral-400"
                      >
                        FIRST NAME
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ines"
                        className="w-full bg-[#181716] border border-neutral-800 focus:border-neutral-500 text-white placeholder-neutral-600 text-sm px-4 py-3.5 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="lastName"
                        className="block text-[11px] font-medium tracking-[0.16em] uppercase text-neutral-400"
                      >
                        LAST NAME
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Karlsson"
                        className="w-full bg-[#181716] border border-neutral-800 focus:border-neutral-500 text-white placeholder-neutral-600 text-sm px-4 py-3.5 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-medium tracking-[0.16em] uppercase text-neutral-400"
                    >
                      EMAIL
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#181716] border border-neutral-800 focus:border-neutral-500 text-white placeholder-neutral-600 text-sm px-4 py-3.5 outline-none transition-colors"
                    />
                  </div>

                  {/* What is this about? */}
                  <div className="space-y-2">
                    <label
                      htmlFor="topic"
                      className="block text-[11px] font-medium tracking-[0.16em] uppercase text-neutral-400"
                    >
                      WHAT IS THIS ABOUT?
                    </label>
                    <div className="relative">
                      <select
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-[#181716] border border-neutral-800 focus:border-neutral-500 text-white text-sm px-4 py-3.5 outline-none transition-colors appearance-none pr-10 cursor-pointer"
                      >
                        <option value="An existing order" className="bg-[#181716] text-white">
                          An existing order
                        </option>
                        <option value="Product sizing & fit" className="bg-[#181716] text-white">
                          Product sizing & fit
                        </option>
                        <option value="Press & wholesale" className="bg-[#181716] text-white">
                          Press & wholesale
                        </option>
                        <option value="Repairs & care" className="bg-[#181716] text-white">
                          Repairs & care
                        </option>
                        <option value="General enquiry" className="bg-[#181716] text-white">
                          General enquiry
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="block text-[11px] font-medium tracking-[0.16em] uppercase text-neutral-400"
                    >
                      MESSAGE
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you need..."
                      className="w-full bg-[#181716] border border-neutral-800 focus:border-neutral-500 text-white placeholder-neutral-600 text-sm px-4 py-3.5 outline-none transition-colors resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#f5f4f0] text-[#121110] hover:bg-[#cf5230] hover:text-white px-7 py-3.5 text-xs font-bold tracking-[0.18em] uppercase transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>SEND MESSAGE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ---------------- Right: Studio Details & FAQ Card ---------------- */}
            <div className="lg:col-span-5 space-y-6">
              {/* Metadata List */}
              <div className="divide-y divide-neutral-800/80">
                {/* Email */}
                <div className="pb-6 flex items-start gap-3.5">
                  <Mail className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-neutral-400">
                      EMAIL
                    </p>
                    <a
                      href="mailto:hello@phantom.studio"
                      className="text-sm sm:text-[15px] text-white hover:text-[#cf5230] transition-colors"
                    >
                      hello@phantom.studio
                    </a>
                  </div>
                </div>

                {/* Telephone */}
                <div className="py-6 flex items-start gap-3.5">
                  <Phone className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-neutral-400">
                      TELEPHONE
                    </p>
                    <a
                      href="tel:+351210994410"
                      className="text-sm sm:text-[15px] text-white hover:text-[#cf5230] transition-colors"
                    >
                      +351 21 099 4410
                    </a>
                  </div>
                </div>

                {/* Studio & Collections */}
                <div className="py-6 flex items-start gap-3.5">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-neutral-400">
                      STUDIO & COLLECTIONS
                    </p>
                    <p className="text-sm sm:text-[15px] text-white leading-relaxed">
                      Rua da Boavista 84, 1200-069 Lisboa, Portugal
                    </p>
                  </div>
                </div>

                {/* Studio Hours */}
                <div className="pt-6 pb-2 flex items-start gap-3.5">
                  <Clock className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-neutral-400">
                      STUDIO HOURS
                    </p>
                    <p className="text-sm sm:text-[15px] text-white leading-relaxed">
                      Monday to Friday, 09:00 – 18:00 WET
                    </p>
                  </div>
                </div>
              </div>

              {/* Need an answer right now? FAQ Card */}
              <div className="bg-[#181716] border border-neutral-800/80 p-6 sm:p-7 space-y-3 mt-8">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  Need an answer right now?
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Most questions about delivery, returns and care are already answered in the help centre.
                </p>
                <div className="pt-2">
                  <Link
                    to="/faq"
                    className="text-[11px] font-bold tracking-[0.18em] uppercase text-white hover:text-[#cf5230] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>READ THE FAQ</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  ShieldCheck, 
  Clock, 
  Users, 
  Sparkles, 
  PhoneCall, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Calendar, 
  UserCheck,
  Brain, 
  Baby, 
  Home as HomeIcon, 
  Activity, 
  Pill, 
  Smile, 
  Briefcase, 
  GraduationCap, 
  Star,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { INITIAL_FACILITIES } from '../data/initialData';

export const HomePage: React.FC = () => {
  const { setCurrentPage, setIsApplyModalOpen, setSelectedFacilityId } = useApp();

  // Hero carousel images
  const heroSlides = [
    {
      driveId: '1RD_YHQAFkpt9Z7RhI-wIRuTXbR4VrQeL',
      image: 'https://lh3.googleusercontent.com/d/1RD_YHQAFkpt9Z7RhI-wIRuTXbR4VrQeL=s1600',
      title: 'Compassionate Care, Happy Living',
      subtitle: 'Providing exceptional elderly care and child care services in a safe, loving, and professional environment.',
      tag: 'Elderly Residential & Memory Care'
    },
    {
      driveId: '14C5r5SG-WEy_EW0Emfcihbcr1gf54Lrx',
      image: 'https://lh3.googleusercontent.com/d/14C5r5SG-WEy_EW0Emfcihbcr1gf54Lrx=s1600',
      title: 'Nurturing Young Minds & Early Learners',
      subtitle: 'Safe, creative daycare and child development programs where children learn, play, and thrive every day.',
      tag: 'Sunshine Early Childhood Hub'
    },
    {
      driveId: '1EQa4jpEq9Zq69sk9a0TO3SvTvUe69F4a',
      image: 'https://lh3.googleusercontent.com/d/1EQa4jpEq9Zq69sk9a0TO3SvTvUe69F4a=s1600',
      title: '24/7 Professional Medical & Nursing Support',
      subtitle: 'Qualified nurses and dedicated caregivers giving families complete peace of mind and dignified personal support.',
      tag: 'Certified Healthcare Excellence'
    },
    {
      driveId: '14giwcfbhccFYKyWmMmmGIGqGBebF8wzg',
      image: 'https://lh3.googleusercontent.com/d/14giwcfbhccFYKyWmMmmGIGqGBebF8wzg=s1600',
      title: 'Warm Family Visitation & Living Spaces',
      subtitle: 'Comfortable suites, peaceful garden courtyards, and vibrant community activities designed for joyous living.',
      tag: 'Premium Facilities & Courtyards'
    },
    {
      driveId: '1s37_fOJY8lbOFCxAEhjEUkryEFPiKdBO',
      image: 'https://lh3.googleusercontent.com/d/1s37_fOJY8lbOFCxAEhjEUkryEFPiKdBO=s1600',
      title: 'Intergenerational Connection & Care',
      subtitle: 'Fostering meaningful bonds between seniors and youth, creating a warm, vibrant family atmosphere.',
      tag: 'Community & Belonging'
    },
    {
      driveId: '1pq0pK4up7TkZgw1Vf9jwqma3o7Z9L-Gg',
      image: 'https://lh3.googleusercontent.com/d/1pq0pK4up7TkZgw1Vf9jwqma3o7Z9L-Gg=s1600',
      title: 'Dedicated Rehabilitation & Wellness',
      subtitle: 'Tailored physical therapy and daily wellness routines promoting mobility, health, and vitality.',
      tag: 'Personalized Health Plans'
    },
    {
      driveId: '1FbsvuC0H0owjh7TMs6SCSUdyHkg7U8xP',
      image: 'https://lh3.googleusercontent.com/d/1FbsvuC0H0owjh7TMs6SCSUdyHkg7U8xP=s1600',
      title: 'Dignified Daily Support & Companionship',
      subtitle: 'Empathetic care staff providing personalized assistance with bathing, meals, and social activities.',
      tag: 'Empathetic Caregivers'
    },
    {
      driveId: '1CPJfA_mw7gMrXkYoL9AMSVDezeW_ehkL',
      image: 'https://lh3.googleusercontent.com/d/1CPJfA_mw7gMrXkYoL9AMSVDezeW_ehkL=s1600',
      title: 'Safe Sanctuary for Peace of Mind',
      subtitle: 'Modern, fully monitored home facilities ensuring utmost safety, comfort, and emotional well-being.',
      tag: 'Samanthasappy Home'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const whyChooseUs = [
    { icon: Award, title: 'Professional Caregivers', desc: 'Fully vetted, certified nurses and compassionate care specialists dedicated to individual well-being.' },
    { icon: ShieldCheck, title: 'Safe Environment', desc: 'Secure, 24/7 monitored facilities with emergency call systems and child-safeguarded learning zones.' },
    { icon: Heart, title: 'Personalized Care Plans', desc: 'Customized support tailored to medical history, dietary needs, cognitive therapy, and personal hobbies.' },
    { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock nursing supervision, medication assistance, and responsive family communication.' },
    { icon: Users, title: 'Family Communication', desc: 'Transparent real-time portal for relatives to view care updates, daily vitals, and message staff.' },
    { icon: Sparkles, title: 'Compassionate Services', desc: 'Treating every elderly resident and child with genuine warmth, respect, dignity, and family love.' },
  ];

  const careServices = [
    { icon: HomeIcon, title: 'Residential Elderly Care', category: 'Elderly', desc: 'Full residential accommodation with personalized daily assistance, delicious meals, and companionship.' },
    { icon: Brain, title: 'Dementia Support', category: 'Elderly', desc: 'Specialized memory support, sensory therapy, and de-escalation routines by certified practitioners.' },
    { icon: Baby, title: 'Child Care Services', category: 'Children', desc: 'Montessori early learning, supervised play, art workshops, and pediatric safeguarding.' },
    { icon: Activity, title: 'Daily Living Assistance', category: 'Support', desc: 'Bathing, dressing, mobility exercises, and personal hygiene maintained with utter dignity.' },
    { icon: PhoneCall, title: 'Domiciliary Care', category: 'Community', desc: 'Flexible home care visits for elderly community members who prefer living independently.' },
    { icon: ShieldCheck, title: 'Vulnerable Adult Support', category: 'Support', desc: 'Tailored sensory and routine care for adults requiring specialized daily living assistance.' },
    { icon: Pill, title: 'Medication Support', category: 'Medical', desc: 'Rigorous 5-rights medication administration, vitals tracking, and doctor coordination.' },
    { icon: Smile, title: 'Recreational Activities', category: 'Wellness', desc: 'Daily music therapy, garden strolls, board games, storytime, and holiday celebrations.' },
  ];

  const testimonials = [
    {
      quote: "Samanthasappy Home gave our family complete peace of mind. Nurse Sarah and the team care for my mother Eleanor with such genuine tenderness.",
      author: 'Mrs. Oluwatoyin Ayorinde',
      role: 'Daughter of Resident Eleanor Miller',
      rating: 5,
      avatar: 'https://lh3.googleusercontent.com/d/1R5fJ2qNlolxPplTofoUlxcK9enRcki51'
    },
    {
      quote: "The daycare facilities are second to none! My twins Clara and Leo wake up excited every morning for Montessori storytime with Miss Emily.",
      author: 'Alhaji Isa Mohamed',
      role: 'Parent of Daycare Students',
      rating: 5,
      avatar: 'https://lh3.googleusercontent.com/d/1hzRfdg8VNTDKxJosADJR-k-hLDa_Pr2m'
    },
    {
      quote: "As a student caregiver trainee, the structured training programs and compassionate mentorship at Samanthasappy Home launched my healthcare career.",
      author: 'Miss Sophia Oguejiofor',
      role: 'Caregiver Trainee',
      rating: 5,
      avatar: 'https://lh3.googleusercontent.com/d/1NaGSgQEiIQcGsReE05QE7f3L1GW6KiPL'
    },
    {
      quote: "Living here feels like being part of a warm, vibrant family. The garden strolls, chef-prepared meals, and attentive nurses keep me joyful every day.",
      author: 'Chief Michael Ogundipe',
      role: 'Son of a Resident',
      rating: 5,
      avatar: 'https://lh3.googleusercontent.com/d/1wvSxFz5bBbEE6-qjWJHpGHIdkNU5tS4k'
    },
    {
      quote: "The real-time updates and daily health logs on the family portal give us tremendous confidence. I know my father is receiving top-tier medical attention.",
      author: 'Dr. Tope Babatunde',
      role: 'Daughter of Resident Arthur Vance',
      rating: 5,
      avatar: 'https://lh3.googleusercontent.com/d/1MsXUQUlKKMfa7_x2h2Fd9d-DscUfzpFq'
    },
    {
      quote: "The child care specialists at Sunshine Hub nurture creativity and emotional confidence. Our son Noah has flourished remarkably!",
      author: 'Mr. Chinedu Okocha',
      role: 'Father of Early Learner',
      rating: 5,
      avatar: 'https://lh3.googleusercontent.com/d/1r-YolVfonyBx6w5siDFyu2VYDNfcXQfo'
    }
  ];

  return (
    <div className="space-y-20 pb-16">

      {/* Hero Carousel Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950 overflow-hidden">
        
        {/* Carousel Background Images */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (slide.driveId && !target.src.includes('uc?export=view')) {
                  target.src = `https://drive.google.com/uc?export=view&id=${slide.driveId}`;
                }
              }}
              className="w-full h-full object-cover object-center filter brightness-[0.45]"
            />
          </div>
        ))}

        {/* Hero Content Overlay */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {heroSlides[currentSlide].tag}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-xl drop-shadow-sm">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* Hero Buttons */}
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-gradient-to-r from-sky-700 via-teal-700 to-sky-800 hover:from-sky-800 hover:to-teal-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-900/20 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer text-sm sm:text-base"
              >
                <UserCheck className="w-5 h-5" />
                Apply Now
              </button>
              <button
                onClick={() => {
                  setCurrentPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer text-sm sm:text-base"
              >
                Contact Us
              </button>
              <button
                onClick={() => {
                  setCurrentPage('careers');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-sm"
              >
                Join Our Team
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators & Manual Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide ? 'w-6 bg-sky-400' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>


      {/* About Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-50 to-sky-50/60 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                Welcome to Samanthasappy Home
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Where Family Warmth Meets Healthcare Excellence
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Founded with a passionate commitment to compassionate caregiving, Samanthasappy Home provides holistic, dignified living for elderly individuals and safe, inspiring early education for young children. 
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether supporting a senior resident living with dementia or caring for children during early development, our dedicated nursing staff, comfortable suites, and state-of-the-art facilities ensure every individual feels cherished, secure, and truly at home.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs text-center">
                  <div className="text-2xl font-extrabold text-sky-700">100+</div>
                  <div className="text-xs text-slate-500 font-medium">Happy Residents & Kids</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs text-center">
                  <div className="text-2xl font-extrabold text-teal-700">24/7</div>
                  <div className="text-xs text-slate-500 font-medium">Nursing & Support</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs text-center">
                  <div className="text-2xl font-extrabold text-amber-600">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Family Peace of Mind</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentPage('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 font-bold text-sm group cursor-pointer"
                >
                  Learn More About Our Philosophy & Team
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://lh3.googleusercontent.com/d/1ZmobG_jBYkspTz0Z4XwVG0au9tFnuIEq=s1600"
                  alt="Caregiver with elderly resident"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('uc?export=view')) {
                      target.src = 'https://drive.google.com/uc?export=view&id=1ZmobG_jBYkspTz0Z4XwVG0au9tFnuIEq';
                    }
                  }}
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Why Families Trust Us
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Built on Unwavering Standards of Safety & Warmth
          </h2>
          <p className="text-slate-600 text-base">
            We combine world-class medical standards with the loving atmosphere of a true family home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>


      {/* Our Care Services Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Comprehensive Care Spectrum
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                Our Core Care & Living Services
              </h2>
            </div>
            <button
              onClick={() => {
                setCurrentPage('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-sm cursor-pointer"
            >
              Explore Full Service Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-sky-500/50 transition-all space-y-3 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-sky-900/60 text-sky-300 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md uppercase">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>





      {/* Testimonials Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80 overflow-hidden">
        <style>{`
          @keyframes testimonialMarquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-testimonial-marquee {
            display: flex;
            width: max-content;
            animation: testimonialMarquee 38s linear infinite;
          }
          .animate-testimonial-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              Heartfelt Stories
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              What Families, Residents & Trainees Say
            </h2>
            <p className="text-slate-500 text-xs">
              Hover over any testimonial card to pause the auto-sliding ticker
            </p>
          </div>

          {/* Infinite Sliding Testimonial Ticker */}
          <div className="relative w-full overflow-hidden py-4">
            {/* Subtle Gradient Fade Edges */}
            <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-testimonial-marquee flex gap-6">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div 
                  key={idx} 
                  className="w-[300px] sm:w-[380px] shrink-0 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{t.author}</div>
                      <div className="text-xs text-slate-500 font-medium">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* Career & Training Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white overflow-hidden relative border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-4 h-4" /> Join Our Mission
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Are You Passionate About Healthcare & Caregiving?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                We recruit compassionate nurses, care assistants, and childcare educators, and offer accredited caregiver training programs for individuals starting their healthcare journey.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => {
                    setCurrentPage('careers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer"
                >
                  View Job Openings & Apply
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('careers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl border border-slate-700 transition-all text-sm cursor-pointer"
                >
                  Explore Training Courses
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-sky-600 via-teal-600 to-amber-500 flex items-center justify-center p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center text-center p-4">
                  <Briefcase className="w-10 h-10 text-amber-400 mb-2" />
                  <div className="font-extrabold text-white text-lg">CPD Accredited</div>
                  <div className="text-[11px] text-slate-400">Caregiver Training Center</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Contact CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-700 via-teal-700 to-sky-800 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Ready to Give Your Loved One the Care They Deserve?
          </h2>
          <p className="text-sky-100 text-base max-w-xl mx-auto leading-relaxed">
            Our friendly care coordinators are standing by 24/7 to answer your questions, organize a private facility tour, or discuss personalized care plans.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-white text-sky-900 hover:bg-sky-50 font-bold px-8 py-4 rounded-xl shadow-lg transition-all text-base cursor-pointer"
            >
              Apply Now
            </button>
            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-sky-900/60 hover:bg-sky-900/80 text-white border border-sky-400/40 font-bold px-8 py-4 rounded-xl transition-all text-base cursor-pointer"
            >
              Contact Care Team
            </button>
          </div>
        </div>
      </section>

      {/* Floating Advert - Fixed to right side */}
      <div className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40">
        <div className="relative group bg-white p-1 sm:p-1.5 rounded-2xl shadow-2xl border border-amber-300/80 hover:border-amber-500 transition-all duration-300 max-w-[125px] xs:max-w-[160px] sm:max-w-[220px]">
          {/* Advert Content */}
          <div 
            onClick={() => {
              setCurrentPage('roofing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer overflow-hidden rounded-xl bg-slate-100 flex flex-col group/img"
          >
            <img
              src="https://lh3.googleusercontent.com/d/1IvcORl7SQsFnChg5cW-Uu0wwNVO6TwhJ=s1600"
              alt="Samantha Sappy Roofing Solutions"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('uc?export=view')) {
                  target.src = 'https://drive.google.com/uc?export=view&id=1IvcORl7SQsFnChg5cW-Uu0wwNVO6TwhJ';
                }
              }}
              className="w-full h-auto max-h-[220px] sm:max-h-[300px] object-cover rounded-t-xl group-hover/img:scale-105 transition-transform duration-300"
            />
            <div className="p-1.5 sm:p-2 text-center bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white rounded-b-xl">
              <span className="text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1">
                Roofing Services <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

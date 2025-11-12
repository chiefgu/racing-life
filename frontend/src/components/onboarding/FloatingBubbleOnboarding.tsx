'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

type OnboardingState =
  | 'signup'
  | 'welcome'
  | 'selectJockeys'
  | 'selectTrainers'
  | 'selectTracks'
  | 'selectBookmakers'
  | 'processing'
  | 'complete';

interface SelectableItem {
  id: string;
  name: string;
  image?: string;
  stats?: string;
}

const JOCKEYS: SelectableItem[] = [
  { id: '1', name: 'James McDonald', stats: '24% SR • 1,200+ wins' },
  { id: '2', name: 'Tom Marquand', stats: '21% SR • 850+ wins' },
  { id: '3', name: 'Damien Oliver', stats: '19% SR • 3,200+ wins' },
  { id: '4', name: 'Jamie Kah', stats: '26% SR • 900+ wins' },
  { id: '5', name: 'Zac Purton', stats: '23% SR • 1,400+ wins' },
  { id: '6', name: 'Hugh Bowman', stats: '20% SR • 2,500+ wins' },
  { id: '7', name: 'Kerrin McEvoy', stats: '18% SR • 2,800+ wins' },
  { id: '8', name: 'Glen Boss', stats: '17% SR • 2,900+ wins' },
];

const TRAINERS: SelectableItem[] = [
  { id: '1', name: 'Chris Waller', stats: '18% SR • 3,500+ wins' },
  { id: '2', name: 'Ciaron Maher', stats: '16% SR • 1,800+ wins' },
  { id: '3', name: 'Gai Waterhouse', stats: '15% SR • 4,200+ wins' },
  { id: '4', name: 'Peter Moody', stats: '17% SR • 2,100+ wins' },
  { id: '5', name: 'James Cummings', stats: '14% SR • 1,600+ wins' },
  { id: '6', name: 'Annabel Neasham', stats: '19% SR • 650+ wins' },
];

const TRACKS: SelectableItem[] = [
  { id: '1', name: 'Randwick' },
  { id: '2', name: 'Flemington' },
  { id: '3', name: 'Caulfield' },
  { id: '4', name: 'Rosehill' },
  { id: '5', name: 'Moonee Valley' },
  { id: '6', name: 'Eagle Farm' },
];

const BOOKMAKERS: SelectableItem[] = [
  { id: '1', name: 'bet365' },
  { id: '2', name: 'Ladbrokes' },
  { id: '3', name: 'Sportsbet' },
  { id: '4', name: 'TAB' },
  { id: '5', name: 'Unibet' },
  { id: '6', name: 'Neds' },
  { id: '7', name: 'Pointsbet' },
  { id: '8', name: 'BlueBet' },
];

// Image URLs for the orb
const imgBackground = '/orb/background.png';
const img = '/orb/gradient1.svg';
const img1 = '/orb/gradient2.svg';
const img2 = '/orb/gradient3.svg';
const img3 = '/orb/gradient4.svg';
const imgOuterRing = '/orb/outer-ring.svg';
const imgGlare = '/orb/glare.svg';

// Animated Orb Component
function AnimatedOrb({
  size = 'large',
  energy = 0,
}: {
  size?: 'small' | 'large' | 'xlarge' | 'success';
  energy?: number;
}) {
  const [prevEnergy, setPrevEnergy] = useState(energy);
  const [showBoost, setShowBoost] = useState(false);

  useEffect(() => {
    if (energy > prevEnergy) {
      setShowBoost(true);
      setTimeout(() => setShowBoost(false), 600);
    }
    setPrevEnergy(energy);
  }, [energy, prevEnergy]);

  // Use actual dimensions instead of CSS scaling to maintain image quality
  const sizeConfig = {
    small: {
      container: 'w-32 h-32',
      baseWidth: 150.182, // 50% of original
      bgWidth: 150.182,
    },
    large: {
      container: 'w-40 h-40',
      baseWidth: 200.243, // 66% of original
      bgWidth: 200.243,
    },
    xlarge: {
      container: 'w-48 h-48',
      baseWidth: 266.103, // original size
      bgWidth: 300.364,
    },
    success: {
      container: 'w-40 h-40',
      baseWidth: 200.243,
      bgWidth: 200.243,
    },
  };

  const config = sizeConfig[size];
  const scaleFactor = config.baseWidth / 266.103; // relative to xlarge

  // Energy-based animation parameters (0-1 scale) - MORE DRAMATIC
  const normalizedEnergy = Math.min(energy / 12, 1); // Max out at 12 selections
  const rotationIntensity = 3 + normalizedEnergy * 25; // 3° to 28° (much more dramatic)
  const floatDistance = 4 + normalizedEnergy * 20; // 4px to 24px
  const animationSpeed = 6 - normalizedEnergy * 4; // 6s to 2s (much faster)
  const glowIntensity = normalizedEnergy * 0.9; // 0 to 0.9 opacity (brighter)
  const pulseScale = 1 + normalizedEnergy * 0.15; // 1.0 to 1.15 scale (more noticeable)

  return (
    <div className={`relative ${config.container} mx-auto`}>
      {/* Animated glow that intensifies with selections - MUCH BRIGHTER */}
      <AnimatePresence>
        {energy > 0 && (
          <motion.div
            key="glow"
            className="absolute inset-[-50%] rounded-full blur-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [glowIntensity * 0.5, glowIntensity, glowIntensity * 0.5],
              scale: [1, 1.2 + normalizedEnergy * 0.3, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(236, 72, 153, 0.5) 40%, rgba(59, 130, 246, 0.3) 70%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Energy boost flash when selection is made */}
      <AnimatePresence>
        {showBoost && (
          <motion.div
            key={`boost-${energy}`}
            className="absolute inset-[-20%] rounded-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.8, 0], scale: [0.5, 1.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(236, 72, 153, 0.6) 50%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        key="orb-animation"
        className="relative size-full"
        animate={
          size === 'xlarge'
            ? { rotate: 360 }
            : size === 'success'
              ? {}
              : {
                  rotate: [0, rotationIntensity, -rotationIntensity, 0],
                  y: [0, -floatDistance, 0, floatDistance, 0],
                  scale: [1, pulseScale, 1, pulseScale, 1],
                }
        }
        transition={
          size === 'xlarge'
            ? { rotate: { duration: 20, repeat: Infinity, ease: 'linear' } }
            : size === 'success'
              ? {}
              : {
                  duration: animationSpeed,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
        }
      >
        {/* Background */}
        <div
          className="absolute bottom-[-7.5%] left-[calc(50%-1.16px)] top-[-5.38%] translate-x-[-50%]"
          style={{ width: `${config.bgWidth}px` }}
        >
          <div className="absolute inset-[-25.47%]">
            <img alt="" className="block max-w-none size-full" src={imgBackground} />
          </div>
        </div>

        {/* Animation gradients */}
        <div
          className="absolute inset-0 overflow-clip"
          style={{ borderRadius: `${config.baseWidth}px` }}
        >
          <motion.div
            className="absolute bg-white overflow-clip top-0"
            style={{
              height: `${266.103 * scaleFactor}px`,
              left: `${-20.29 * scaleFactor}px`,
              width: `${425.765 * scaleFactor}px`,
            }}
            animate={{
              x: [0, 10 * scaleFactor * (1 + normalizedEnergy), 0],
              y: [0, -5 * scaleFactor * (1 + normalizedEnergy), 0],
            }}
            transition={{
              duration: 3 - normalizedEnergy,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="absolute"
              style={{
                left: `${84.86 * scaleFactor}px`,
                width: `${256.346 * scaleFactor}px`,
                height: `${256.346 * scaleFactor}px`,
                top: `${34.89 * scaleFactor}px`,
              }}
            >
              <div className="absolute inset-[-46.14%]">
                <img alt="" className="block max-w-none size-full" src={img} />
              </div>
            </div>
            <div
              className="absolute"
              style={{
                left: `${44.35 * scaleFactor}px`,
                width: `${256.346 * scaleFactor}px`,
                height: `${256.346 * scaleFactor}px`,
                top: `${180.95 * scaleFactor}px`,
              }}
            >
              <div className="absolute inset-[-46.14%]">
                <img alt="" className="block max-w-none size-full" src={img1} />
              </div>
            </div>
            <div
              className="absolute"
              style={{
                height: `${362.196 * scaleFactor}px`,
                left: `${-32.82 * scaleFactor}px`,
                top: `${-162.62 * scaleFactor}px`,
                width: `${163.801 * scaleFactor}px`,
              }}
            >
              <div className="absolute inset-[-32.65%_-72.2%]">
                <img alt="" className="block max-w-none size-full" src={img2} />
              </div>
            </div>
            <div
              className="absolute"
              style={{
                height: `${362.196 * scaleFactor}px`,
                left: `${341.2 * scaleFactor}px`,
                top: `${-96.09 * scaleFactor}px`,
                width: `${163.801 * scaleFactor}px`,
              }}
            >
              <div className="absolute inset-[-32.65%_-72.2%]">
                <img alt="" className="block max-w-none size-full" src={img3} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Glare */}
        <div
          className="absolute"
          style={{
            filter: `blur(${10.32 * scaleFactor}px)`,
            left: `${48.71 * scaleFactor}px`,
            borderRadius: `${158.561 * scaleFactor}px`,
            width: `${168.682 * scaleFactor}px`,
            height: `${168.682 * scaleFactor}px`,
            top: `${44.65 * scaleFactor}px`,
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 168.68 168.68\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'0.5\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(5.1644e-16 8.4341 -8.4341 5.1644e-16 84.341 84.341)\\'><stop stop-color=\\'rgba(255,255,255,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(255,255,255,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')",
          }}
        />

        {/* Outer ring */}
        <div className="absolute bottom-0 left-[-3%] right-[0.25%] top-[-1%]">
          <div className="absolute inset-[-6.56%_-6.45%]">
            <img alt="" className="block max-w-none size-full" src={imgOuterRing} />
          </div>
        </div>

        {/* Glare overlay */}
        <div className="absolute flex inset-[4.41%_45.42%_53.62%_5.42%] items-center justify-center mix-blend-overlay">
          <div
            className="flex-none rotate-[273deg]"
            style={{
              height: `${125.459 * scaleFactor}px`,
              width: `${105.259 * scaleFactor}px`,
            }}
          >
            <div className="relative size-full">
              <div className="absolute inset-[-10.74%_-12.8%_-8.35%_-9.95%]">
                <img alt="" className="block max-w-none size-full" src={imgGlare} />
              </div>
            </div>
          </div>
        </div>

        {/* Success checkmark */}
        {size === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute inset-0 flex items-center justify-center text-white z-10"
          >
            <Check
              style={{ width: `${64 * scaleFactor}px`, height: `${64 * scaleFactor}px` }}
              strokeWidth={3}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Signup Screen
function SignupScreen({
  onNext,
  onRegister,
}: {
  onNext: (data: { firstName: string; lastName: string; email: string; password: string }) => void;
  onRegister: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setGeneralError('');

    // Check password match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Check reCAPTCHA
    if (!recaptchaToken) {
      setGeneralError('Please complete the reCAPTCHA verification');
      return;
    }

    if (firstName && lastName && email && password) {
      setLoading(true);
      try {
        await onRegister(firstName, lastName, email, password);
        onNext({ firstName, lastName, email, password });
      } catch (error) {
        console.error('Registration error:', error);
        let message = 'Registration failed. Please try again.';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          message = String((error as { message: unknown }).message);
        }
        setGeneralError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  return (
    <section className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl px-8">
        <div className="bg-white border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm text-gray-600">
              Join Australia's premier racing intelligence platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full text-sm text-gray-900 py-2.5 px-3 border border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                required
                minLength={8}
                className={`w-full text-sm text-gray-900 py-2.5 px-3 border outline-none transition-colors ${
                  passwordError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                }`}
              />
              {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={onRecaptchaChange}
              />
            </div>

            {/* General Error Message */}
            {generalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {generalError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold text-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/"
                className="text-brand-primary hover:text-brand-primary-intense font-semibold"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Welcome Screen
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center px-8 bg-white">
      <div className="flex flex-col items-center text-center -mt-24">
        <AnimatedOrb size="large" />
        <p className="text-2xl text-gray-800 mt-10 max-w-md leading-relaxed font-light">
          Let's build your personal AI racing analyst. We'll start by picking your favorites.
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="mt-10 w-full max-w-sm py-4 px-6 rounded-full bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Let's Start
        </motion.button>
      </div>
    </section>
  );
}

// Selection Screen (reusable for jockeys, trainers, tracks)
function SelectionScreen({
  title,
  subtitle,
  items,
  selectedIds,
  onToggle,
  onNext,
  onSkip,
  onBack,
  isLastStep,
  searchPlaceholder,
  totalEnergy,
}: {
  title: string;
  subtitle: string;
  items: SelectableItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  isLastStep: boolean;
  searchPlaceholder: string;
  totalEnergy: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center bg-white px-8">
      {/* Centered Content */}
      <div className="flex flex-col items-center text-center w-full max-w-2xl -mt-8">
        {/* Header */}
        <div className="mb-8">
          <AnimatedOrb size="small" energy={totalEnergy} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-lg text-gray-600 mt-2">{subtitle}</p>

        {/* Search Bar */}
        <div className="w-full mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base text-gray-800 py-3 pl-12 pr-4 rounded-full border-2 border-gray-200 focus:border-brand-primary outline-none"
            />
          </div>
        </div>

        {/* Selection Grid */}
        <div className="w-full mt-6">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggle(item.id)}
                  className={`
                    py-3 px-5 rounded-full font-medium text-base
                    transition-all duration-200 text-center
                    ${
                      isSelected
                        ? 'bg-brand-primary text-white shadow-lg'
                        : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-brand-primary'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">{item.name}</span>
                    {item.stats && (
                      <span
                        className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}
                      >
                        {item.stats}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-4 mt-10">
          {onBack && (
            <button
              onClick={onBack}
              className="py-4 px-6 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onSkip}
            className="flex-1 py-4 px-6 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-4 px-6 rounded-full bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  );
}

// Processing Screen
function ProcessingScreen({ totalEnergy }: { totalEnergy: number }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    'Building your AI Preference Engine...',
    'Learning your preferences...',
    'Calibrating real-time alerts...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
      <AnimatedOrb size="xlarge" energy={Math.max(totalEnergy, 12)} />
      <motion.p
        key={statusIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-xl text-gray-600 mt-12"
      >
        {statuses[statusIndex]}
      </motion.p>
    </section>
  );
}

// Completion Screen
function CompletionScreen({
  onGoToDashboard,
  totalEnergy,
  saving,
}: {
  onGoToDashboard: () => void;
  totalEnergy: number;
  saving: boolean;
}) {
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center px-8 bg-white">
      <div className="flex flex-col items-center text-center -mt-24">
        <AnimatedOrb size="success" energy={Math.max(totalEnergy, 12)} />
        <h1 className="text-2xl font-bold text-gray-900 mt-10">
          Your Personal AI Analyst is Ready
        </h1>
        <p className="text-lg text-gray-600 mt-2 max-w-xs">
          Your dashboard is now tailored to you. Get ready for personalized insights.
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onGoToDashboard}
          disabled={saving}
          className="mt-10 w-full max-w-sm py-4 px-6 rounded-full bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving preferences...' : 'Go to My Dashboard'}
        </motion.button>
      </div>
    </section>
  );
}

// Main Component
export default function FloatingBubbleOnboarding() {
  const [state, setState] = useState<OnboardingState>('signup');
  const [_signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [selectedJockeys, setSelectedJockeys] = useState<string[]>([]);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectedBookmakers, setSelectedBookmakers] = useState<string[]>([]);
  const [savingFavourites, setSavingFavourites] = useState(false);

  const { register, token } = useAuth();
  const router = useRouter();

  const toggleSelection = (
    category: 'jockeys' | 'trainers' | 'tracks' | 'bookmakers',
    id: string
  ) => {
    const setters = {
      jockeys: setSelectedJockeys,
      trainers: setSelectedTrainers,
      tracks: setSelectedTracks,
      bookmakers: setSelectedBookmakers,
    };
    const values = {
      jockeys: selectedJockeys,
      trainers: selectedTrainers,
      tracks: selectedTracks,
      bookmakers: selectedBookmakers,
    };

    const currentValues = values[category];
    const setter = setters[category];

    if (currentValues.includes(id)) {
      setter(currentValues.filter((selectedId) => selectedId !== id));
    } else {
      setter([...currentValues, id]);
    }
  };

  const handleNext = (nextState: OnboardingState) => {
    if (nextState === 'processing') {
      setState('processing');
      // Simulate processing time
      setTimeout(() => {
        setState('complete');
      }, 5000);
    } else {
      setState(nextState);
    }
  };

  const handleBack = (prevState: OnboardingState) => {
    setState(prevState);
  };

  const handleRegister = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    const name = `${firstName} ${lastName}`;
    await register(email, name, password);
  };

  const handleSignupSubmit = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setSignupData(data);
    setState('welcome');
  };

  const handleGoToDashboard = async () => {
    // Save favourites to backend before navigating
    if (token) {
      setSavingFavourites(true);
      try {
        // Convert selected IDs to names for backend storage
        const jockeyNames = selectedJockeys
          .map((id) => JOCKEYS.find((j) => j.id === id)?.name)
          .filter(Boolean) as string[];
        const trainerNames = selectedTrainers
          .map((id) => TRAINERS.find((t) => t.id === id)?.name)
          .filter(Boolean) as string[];
        const trackNames = selectedTracks
          .map((id) => TRACKS.find((t) => t.id === id)?.name)
          .filter(Boolean) as string[];
        const bookmakerNames = selectedBookmakers
          .map((id) => BOOKMAKERS.find((b) => b.id === id)?.name)
          .filter(Boolean) as string[];

        await apiClient.saveFavourites(
          {
            jockeys: jockeyNames,
            trainers: trainerNames,
            tracks: trackNames,
            bookmakers: bookmakerNames,
          },
          token
        );

        // Navigate to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to save favourites:', error);
        // Still navigate even if favourites save fails
        router.push('/dashboard');
      } finally {
        setSavingFavourites(false);
      }
    } else {
      // No token, just navigate to home
      router.push('/');
    }
  };

  // Calculate total energy from all selections
  const totalEnergy =
    selectedJockeys.length +
    selectedTrainers.length +
    selectedTracks.length +
    selectedBookmakers.length;

  return (
    <main className="relative w-full h-screen bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {state === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SignupScreen onNext={handleSignupSubmit} onRegister={handleRegister} />
          </motion.div>
        )}

        {state === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WelcomeScreen onStart={() => setState('selectJockeys')} />
          </motion.div>
        )}

        {state === 'selectJockeys' && (
          <motion.div
            key="selectJockeys"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SelectionScreen
              title="Select your favorite jockeys"
              subtitle="We'll alert you in real-time when they're racing."
              items={JOCKEYS}
              selectedIds={selectedJockeys}
              onToggle={(id) => toggleSelection('jockeys', id)}
              onNext={() => handleNext('selectTrainers')}
              onSkip={() => handleNext('selectTrainers')}
              onBack={() => handleBack('welcome')}
              isLastStep={false}
              searchPlaceholder="Search for a jockey..."
              totalEnergy={totalEnergy}
            />
          </motion.div>
        )}

        {state === 'selectTrainers' && (
          <motion.div
            key="selectTrainers"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SelectionScreen
              title="Any trainers you follow?"
              subtitle="The AI will learn from their patterns and alert you."
              items={TRAINERS}
              selectedIds={selectedTrainers}
              onToggle={(id) => toggleSelection('trainers', id)}
              onNext={() => handleNext('selectTracks')}
              onSkip={() => handleNext('selectTracks')}
              onBack={() => handleBack('selectJockeys')}
              isLastStep={false}
              searchPlaceholder="Search for a trainer..."
              totalEnergy={totalEnergy}
            />
          </motion.div>
        )}

        {state === 'selectTracks' && (
          <motion.div
            key="selectTracks"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SelectionScreen
              title="Your favorite tracks"
              subtitle="Get custom alerts and tips for these venues."
              items={TRACKS}
              selectedIds={selectedTracks}
              onToggle={(id) => toggleSelection('tracks', id)}
              onNext={() => handleNext('selectBookmakers')}
              onSkip={() => handleNext('selectBookmakers')}
              onBack={() => handleBack('selectTrainers')}
              isLastStep={false}
              searchPlaceholder="Search for a track..."
              totalEnergy={totalEnergy}
            />
          </motion.div>
        )}

        {state === 'selectBookmakers' && (
          <motion.div
            key="selectBookmakers"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SelectionScreen
              title="Finally, your favorite bookmakers"
              subtitle="We'll show you the best odds from your preferred bookies."
              items={BOOKMAKERS}
              selectedIds={selectedBookmakers}
              onToggle={(id) => toggleSelection('bookmakers', id)}
              onNext={() => handleNext('processing')}
              onSkip={() => handleNext('processing')}
              onBack={() => handleBack('selectTracks')}
              isLastStep={true}
              searchPlaceholder="Search for a bookmaker..."
              totalEnergy={totalEnergy}
            />
          </motion.div>
        )}

        {state === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProcessingScreen totalEnergy={totalEnergy} />
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CompletionScreen
              onGoToDashboard={handleGoToDashboard}
              totalEnergy={totalEnergy}
              saving={savingFavourites}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

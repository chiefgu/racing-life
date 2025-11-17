'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

// Image URLs for the orb
const imgBackground = '/orb/background.png';
const img = '/orb/gradient1.svg';
const img1 = '/orb/gradient2.svg';
const img2 = '/orb/gradient3.svg';
const img3 = '/orb/gradient4.svg';
const imgOuterRing = '/orb/outer-ring.svg';
const imgGlare = '/orb/glare.svg';

// Animated Orb Component
export default function AnimatedOrb({
  size = 'large',
  energy = 0,
}: {
  size?: 'tiny' | 'small' | 'large' | 'xlarge' | 'success';
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
    tiny: {
      container: 'w-8 h-8',
      baseWidth: 37.545, // 25% of original (for inline use)
      bgWidth: 37.545,
    },
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

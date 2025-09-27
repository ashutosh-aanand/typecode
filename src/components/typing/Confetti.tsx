'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });
  const [showConfetti, setShowConfetti] = useState(false);

  // Get window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    updateDimensions();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  // Handle confetti activation
  useEffect(() => {
    if (isActive && windowDimensions.height > 0) {
      setShowConfetti(true);
      
      // Calculate duration based on screen height for natural fall
      // Gravity is 0.3, so pieces fall slower - give them enough time
      const fallDuration = Math.max(6000, (windowDimensions.height / 100) * 1000);
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, fallDuration);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete, windowDimensions.height]);

  if (!showConfetti || windowDimensions.width === 0) {
    return null;
  }

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      numberOfPieces={200}
      recycle={false}
      gravity={0.3}
      wind={0.02}
      colors={[
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#F97316', // Orange
      ]}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    />
  );
}

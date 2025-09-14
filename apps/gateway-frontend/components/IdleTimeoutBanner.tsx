'use client';

import { useEffect, useState } from 'react';

/**
 * IdleTimeoutBanner - Shows a warning when user is idle
 * Simplified version for gateway frontend
 */
export default function IdleTimeoutBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    // Simple idle detection for gateway frontend
    let idleTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      setShowBanner(false);

      // Start idle detection (30 minutes)
      idleTimer = setTimeout(() => {
        setShowBanner(true);
        setTimeLeft(300); // 5 minute warning

        // Start countdown
        const countdown = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              // In a real app, this would redirect to login
              setShowBanner(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        warningTimer = setTimeout(() => {
          clearInterval(countdown);
          setShowBanner(false);
        }, 300000); // 5 minutes
      }, 1800000); // 30 minutes
    };

    // Events that reset the idle timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-100 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-700 p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-amber-800 dark:text-amber-200 font-medium">
            Session timeout warning: You will be logged out in {formatTime(timeLeft)}
          </span>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="px-4 py-2 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
        >
          Stay Active
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useCallback } from 'react';

// Auto logout after this many minutes of inactivity
const INACTIVE_MINUTES = 15;
const INACTIVE_MS = INACTIVE_MINUTES * 60 * 1000;

// Warning shown 1 minute before logout
const WARNING_MS = INACTIVE_MS - 60 * 1000;

const useAutoLogout = (onLogout) => {
  const logoutTimer  = useRef(null);
  const warningTimer = useRef(null);
  const warningShown = useRef(false);

  const clearTimers = () => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  };

  const resetTimers = useCallback(() => {
    clearTimers();
    warningShown.current = false;

    // Warning at 14 minutes
    warningTimer.current = setTimeout(() => {
      if (!warningShown.current) {
        warningShown.current = true;
        alert('You have been inactive for 14 minutes. You will be logged out in 1 minute unless you continue.');
      }
    }, WARNING_MS);

    // Logout at 15 minutes
    logoutTimer.current = setTimeout(() => {
      clearTimers();
      alert('You have been logged out due to inactivity.');
      onLogout();
    }, INACTIVE_MS);
  }, [onLogout]);

  useEffect(() => {
    // Events that count as activity
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'click',
      'scroll',
    ];

    const handleActivity = () => resetTimers();

    // Start timers on mount
    resetTimers();

    // Listen for activity
    events.forEach(event =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    // Cleanup on unmount
    return () => {
      clearTimers();
      events.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [resetTimers]);
};

export default useAutoLogout;
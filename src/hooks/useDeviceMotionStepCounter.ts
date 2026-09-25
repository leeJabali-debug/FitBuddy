import { useState, useEffect, useRef, useCallback } from 'react';

export type MotionSensitivity = 'high' | 'medium' | 'low';

interface UseDeviceMotionStepCounterProps {
  onStepCounted?: (steps: number, motionMagnitude: number, movementType: string) => void;
  defaultActive?: boolean;
}

// Crisp Web Audio Pop/Chime on Shake
function playShakeChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant dual-frequency chirp
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function useDeviceMotionStepCounter({
  onStepCounted,
  defaultActive = true,
}: UseDeviceMotionStepCounterProps = {}) {
  const [isActive, setIsActive] = useState<boolean>(defaultActive);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [motionIntensity, setMotionIntensity] = useState<number>(0); // 0 - 100 scale for UI
  const [lastMagnitude, setLastMagnitude] = useState<number>(9.8);
  const [unusualMovementDetected, setUnusualMovementDetected] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<MotionSensitivity>('high'); // Default to high for responsive shake detection
  const [sessionSteps, setSessionSteps] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [stepsPerShake, setStepsPerShake] = useState<number>(1);
  const [shakeCount, setShakeCount] = useState<number>(0);

  // References for smoothing, peak detection, and cooldowns
  const lastStepTimeRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const lastZRef = useRef<number>(0);
  const lastDirectionRef = useRef<number>(0);
  const reversalCountRef = useRef<number>(0);
  const lastReversalTimeRef = useRef<number>(0);

  // Mouse shake tracking on desktop
  const lastMouseXRef = useRef<number>(0);
  const lastMouseTimeRef = useRef<number>(0);
  const mouseReversalsRef = useRef<number>(0);
  const lastMouseDirRef = useRef<number>(0);

  const unusualTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onStepCountedRef = useRef(onStepCounted);
  onStepCountedRef.current = onStepCounted;
  const isSoundEnabledRef = useRef(isSoundEnabled);
  isSoundEnabledRef.current = isSoundEnabled;
  const stepsPerShakeRef = useRef(stepsPerShake);
  stepsPerShakeRef.current = stepsPerShake;

  // Sensitivity thresholds (m/s² jerk delta between consecutive accelerometer samples)
  const getShakeThreshold = useCallback(() => {
    switch (sensitivity) {
      case 'high':
        return 2.2; // Sensitive: small shake or rapid tilt triggers
      case 'medium':
        return 3.8; // Moderate shake
      case 'low':
        return 6.0; // Heavy vigorous shake
      default:
        return 2.5;
    }
  }, [sensitivity]);

  // Check hardware support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && ('DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window)) {
      setIsSupported(true);
      // Check if iOS permission function exists
      if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
        setPermissionStatus('prompt');
      } else {
        setPermissionStatus('granted');
      }
    } else {
      setIsSupported(false);
      setPermissionStatus('unsupported');
    }
  }, []);

  // Request explicit permission (for iOS 13+ devices)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission === 'function') {
      try {
        const response = await DME.requestPermission();
        if (response === 'granted') {
          setPermissionStatus('granted');
          setIsActive(true);
          return true;
        } else {
          setPermissionStatus('denied');
          return false;
        }
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        setPermissionStatus('denied');
        return false;
      }
    } else {
      setPermissionStatus('granted');
      setIsActive(true);
      return true;
    }
  }, []);

  // Register step and trigger haptics / sound
  const registerStep = useCallback((magnitude: number, movementType = 'Machine Shake') => {
    const countToAdd = stepsPerShakeRef.current || 1;
    setSessionSteps((prev) => prev + countToAdd);
    setShakeCount((prev) => prev + 1);
    setUnusualMovementDetected(true);

    if (unusualTimeoutRef.current) {
      clearTimeout(unusualTimeoutRef.current);
    }
    unusualTimeoutRef.current = setTimeout(() => {
      setUnusualMovementDetected(false);
    }, 550);

    // Audio chime if enabled
    if (isSoundEnabledRef.current) {
      playShakeChime();
    }

    // Haptic feedback if supported by browser/device
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([40, 20, 40]);
      } catch {
        // ignore vibrate permissions if restricted
      }
    }

    if (onStepCountedRef.current) {
      onStepCountedRef.current(countToAdd, Math.round(magnitude * 10) / 10, movementType);
    }
  }, []);

  // Real device motion & shake sensor event handler
  useEffect(() => {
    if (!isActive) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration;
      const accWithGrav = event.accelerationIncludingGravity;

      let x = 0;
      let y = 0;
      let z = 0;

      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        x = acc.x;
        y = acc.y;
        z = acc.z || 0;
      } else if (accWithGrav && accWithGrav.x !== null && accWithGrav.y !== null) {
        x = accWithGrav.x;
        y = accWithGrav.y;
        z = accWithGrav.z || 0;
      } else {
        return;
      }

      const rawMag = Math.sqrt(x * x + y * y + z * z);
      setLastMagnitude(rawMag);

      // Delta jerk between consecutive samples
      const dx = x - lastXRef.current;
      const dy = y - lastYRef.current;
      const dz = z - lastZRef.current;
      const jerkDelta = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Intensity bar: scale 0 to 100
      const intensityPct = Math.min(100, Math.round((jerkDelta / 10) * 100));
      setMotionIntensity(intensityPct);

      const threshold = getShakeThreshold();
      const now = Date.now();

      // Check directional reversal (characteristic of back-and-forth shaking)
      const currentDirX = dx > 0.8 ? 1 : dx < -0.8 ? -1 : 0;
      if (currentDirX !== 0 && currentDirX !== lastDirectionRef.current) {
        lastDirectionRef.current = currentDirX;
        if (now - lastReversalTimeRef.current < 450) {
          reversalCountRef.current++;
        } else {
          reversalCountRef.current = 1;
        }
        lastReversalTimeRef.current = now;
      }

      // Trigger condition:
      // 1. Jerk delta exceeds threshold (sudden acceleration spike or shake)
      // 2. OR rapid back-and-forth reversal detected
      // 3. Cadence filter of min 220ms between registered steps
      const isShakeImpulse = jerkDelta >= threshold || reversalCountRef.current >= 2;

      if (isShakeImpulse && now - lastStepTimeRef.current >= 220) {
        lastStepTimeRef.current = now;
        reversalCountRef.current = 0;
        const desc = jerkDelta > 7 ? 'Vigorous Machine Shake' : 'Machine Shake Motion';
        registerStep(rawMag, desc);
      }

      lastXRef.current = x;
      lastYRef.current = y;
      lastZRef.current = z;
    };

    // Gyroscope orientation fallback for machines without linear acceleration
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0; // Left to right tilt [-90, 90]
      const beta = e.beta || 0;   // Front to back tilt [-180, 180]
      const totalTilt = Math.abs(gamma) + Math.abs(beta);
      if (totalTilt > 15) {
        setLastMagnitude(Math.round((totalTilt / 10) * 10) / 10);
      }
    };

    // Mouse / Trackpad shake detection fallback for desktop laptops/PCs
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMouseTimeRef.current;
      if (dt > 0 && dt < 120) {
        const dx = e.clientX - lastMouseXRef.current;
        const currentDir = dx > 15 ? 1 : dx < -15 ? -1 : 0;
        if (currentDir !== 0 && currentDir !== lastMouseDirRef.current) {
          mouseReversalsRef.current++;
          lastMouseDirRef.current = currentDir;

          const intensity = Math.min(100, Math.round(Math.abs(dx) * 2));
          setMotionIntensity(intensity);

          // 3 rapid directional reversals = deliberate mouse/trackpad shake
          if (mouseReversalsRef.current >= 3 && now - lastStepTimeRef.current >= 240) {
            lastStepTimeRef.current = now;
            mouseReversalsRef.current = 0;
            registerStep(16, 'Mouse / Trackpad Shake');
          }
        }
      }
      lastMouseXRef.current = e.clientX;
      lastMouseTimeRef.current = now;
    };

    // Keyboard Spacebar / 'S' shake shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === 's' || e.key === 'S') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.repeat) return;
        registerStep(18, 'Key Shake Impulse');
      }
    };

    try {
      window.addEventListener('devicemotion', handleDeviceMotion, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('keydown', handleKeyDown);
    } catch (e) {
      console.warn('Could not attach motion listeners:', e);
    }

    return () => {
      try {
        window.removeEventListener('devicemotion', handleDeviceMotion, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleKeyDown);
      } catch {
        // cleanup
      }
    };
  }, [isActive, getShakeThreshold, registerStep]);

  // Simulation support for desktop and tests
  const triggerSimulatedMovement = useCallback((simulatedMagnitude = 18.2) => {
    setLastMagnitude(simulatedMagnitude);
    setMotionIntensity(92);
    registerStep(simulatedMagnitude, 'Machine Shake Sensor');

    setTimeout(() => {
      setMotionIntensity(0);
      setLastMagnitude(9.8);
    }, 450);
  }, [registerStep]);

  // Continuous walking/shake simulation loop toggle
  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
      setMotionIntensity(0);
    } else {
      setIsSimulating(true);
      simulationIntervalRef.current = setInterval(() => {
        const randomSpike = 16 + Math.random() * 8;
        triggerSimulatedMovement(randomSpike);
      }, 500);
    }
  }, [isSimulating, triggerSimulatedMovement]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (unusualTimeoutRef.current) {
        clearTimeout(unusualTimeoutRef.current);
      }
    };
  }, []);

  return {
    isActive,
    isSupported,
    permissionStatus,
    motionIntensity,
    lastMagnitude,
    unusualMovementDetected,
    sensitivity,
    sessionSteps,
    isSimulating,
    isSoundEnabled,
    stepsPerShake,
    shakeCount,
    setSensitivity,
    setIsActive,
    setIsSoundEnabled,
    setStepsPerShake,
    requestPermission,
    triggerSimulatedMovement,
    toggleSimulation,
    onToggleActive: () => setIsActive((prev) => !prev),
    onSetSensitivity: setSensitivity,
    onRequestPermission: requestPermission,
    onTriggerSimulatedMovement: triggerSimulatedMovement,
    onToggleSimulation: toggleSimulation,
    onToggleSound: () => setIsSoundEnabled((prev) => !prev),
    onSetStepsPerShake: setStepsPerShake,
  };
}

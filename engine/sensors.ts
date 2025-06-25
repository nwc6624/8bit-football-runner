import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export function useTilt() {
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x }) => {
      setTilt(x);
    });
    return () => subscription.remove();
  }, []);

  return tilt;
} 
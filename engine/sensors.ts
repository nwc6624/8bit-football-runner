import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export function useTilt() {
  const [tilt, setTilt] = useState(0);
  const buffer = useRef<number[]>([]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x }) => {
      buffer.current.push(x);
      if (buffer.current.length > 5) buffer.current.shift();
      const avg = buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length;
      setTilt(avg);
    });
    return () => subscription.remove();
  }, []);

  return tilt;
} 
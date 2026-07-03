import { useState, useEffect } from 'react';

export function useFormAutoSave<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auto-saved form data', e);
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [key, data]);

  const clearAutoSave = () => {
    localStorage.removeItem(key);
    setData(initialValue);
  };

  return [data, setData, clearAutoSave];
}

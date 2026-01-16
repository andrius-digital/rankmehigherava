import { useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'website-submission-draft';
const AUTOSAVE_DELAY = 2000; // 2 seconds

interface FormState {
  formData: Record<string, string>;
  hasGoogleProfile: string;
  hasSpecialOffers: string;
  hasFinancing: string;
  emergencyServices: Record<string, boolean>;
  insuranceHelp: Record<string, boolean>;
  hasSpecificFont: string;
  hasBrandBook: string;
  operatingHours: Record<string, { open: boolean; openTime: string; closeTime: string }>;
  services: Array<{ name: string; price: string; description: string }>;
  pages: Record<string, boolean>;
  logoFiles: string[];
  founderPhotos: string[];
  teamPhotos: string[];
  workPhotos: string[];
  currentStep: number;
  lastSaved: string;
}

export function useFormPersistence<T extends Partial<FormState>>(
  state: T,
  setState: (state: Partial<T>) => void
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormState;
        setState(parsed as Partial<T>);
        lastSavedRef.current = parsed.lastSaved || '';
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
  }, []);

  // Auto-save with debounce
  const saveForm = useCallback(() => {
    const now = new Date().toISOString();
    const dataToSave = {
      ...state,
      lastSaved: now,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    lastSavedRef.current = now;
  }, [state]);

  // Debounced save
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      saveForm();
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, saveForm]);

  // Clear saved data
  const clearSavedForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    lastSavedRef.current = '';
  }, []);

  // Check if there's saved data
  const hasSavedData = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }, []);

  // Get last saved time
  const getLastSaved = useCallback(() => {
    return lastSavedRef.current;
  }, []);

  return {
    saveForm,
    clearSavedForm,
    hasSavedData,
    getLastSaved,
  };
}

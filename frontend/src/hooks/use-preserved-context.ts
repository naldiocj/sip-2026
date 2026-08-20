"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook para preservar contexto de navegação (scroll position, expanded rows, etc.)
 * Usa sessionStorage para sobreviver a navegação back/forward.
 */
export function usePreservedContext<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `sip-preserved-${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = sessionStorage.getItem(`sip-preserved-${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return initialValue;
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const newVal = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        sessionStorage.setItem(`sip-preserved-${key}`, JSON.stringify(newVal));
      } catch {
        // Ignore storage errors
      }
      return newVal;
    });
  }, []);

  // Optional: Clear on unmount if needed
  useEffect(() => {
    return () => {
      // Optionally clear on unmount
      // sessionStorage.removeItem(storageKey);
    };
  }, []);

  return [value, setStoredValue];
}

/**
 * Hook para preservar estado de formulário
 */
export function useFormPersistence<T extends Record<string, unknown>>(
  formKey: string,
  initialValues: T
): [T, (values: T) => void, () => void] {
  const storageKey = `sip-form-${formKey}`;

  const [values, setValuesState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValues;

    try {
      const stored = sessionStorage.getItem(`sip-form-${formKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initialValues, ...parsed };
      }
    } catch {
      // Ignore parse errors
    }
    return initialValues;
  });

  const setValues = useCallback((newValues: T | ((prev: T) => T)) => {
    setValuesState((prev) => {
      const newVal = typeof newValues === "function" ? (newValues as (prev: T) => T)(prev) : newValues;
      try {
        sessionStorage.setItem(`sip-form-${formKey}`, JSON.stringify(newVal));
      } catch {
        // Ignore storage errors
      }
      return newVal;
    });
  }, []);

  const clear = useCallback(() => {
    setValuesState(initialValues);
    try {
      sessionStorage.removeItem(`sip-form-${formKey}`);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return [values, setValues, clear];
}

/**
 * Hook para preservar scroll position
 */
export function useScrollRestoration(key: string): [number, () => void] {
  const storageKey = `sip-scroll-${key}`;

  const [scrollY, setScrollY] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = sessionStorage.getItem(`sip-scroll-${key}`);
      if (stored) {
        const y = parseInt(stored, 10);
        if (!isNaN(y)) return y;
      }
    } catch {
      // Ignore storage errors
    }
    return 0;
  });

  const saveScrollY = useCallback(() => {
    const y = window.scrollY;
    setScrollY(y);
    try {
      sessionStorage.setItem(`sip-scroll-${key}`, String(y));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const restoreScrollY = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(`sip-scroll-${key}`);
      if (stored) {
        const y = parseInt(stored, 10);
        if (!isNaN(y)) {
          window.scrollTo(0, y);
          setScrollY(y);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const restoredRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      saveScrollY();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Restore scroll position once on mount
    if (!restoredRef.current) {
      restoredRef.current = true;
      restoreScrollY();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [saveScrollY]);

  return [scrollY, restoreScrollY];
}
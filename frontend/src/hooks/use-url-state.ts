"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook para gerenciar estado da URL (search params) de forma tipada.
 * Permite persistir filtros, paginação, ordenação na URL para deep linking.
 */
export function useUrlState<T extends Record<string, unknown>>(
  initialState: T,
  options: {
    /** Chaves que devem ser serializadas como JSON */
    jsonKeys?: (keyof T)[];
    /** Chaves que são arrays */
    arrayKeys?: (keyof T)[];
    /** Chaves que são booleanas */
    booleanKeys?: (keyof T)[];
    /** Chaves que são numéricas */
    numberKeys?: (keyof T)[];
  } = {}
): [T, (partial: Partial<T>) => void, () => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { jsonKeys = [], arrayKeys = [], booleanKeys = [], numberKeys = [] } = options;

  // Parse search params to state
  const state = useMemo((): T => {
    const parsed: Partial<T> = {};

    for (const key of Object.keys(initialState) as (keyof T)[]) {
      const paramValue = searchParams.get(key as string);

      if (paramValue === null) {
        parsed[key] = initialState[key];
        continue;
      }

      try {
        if (jsonKeys.includes(key)) {
          parsed[key] = JSON.parse(paramValue);
        } else if (arrayKeys.includes(key)) {
          parsed[key] = paramValue.split(",").filter(Boolean) as T[keyof T];
        } else if (booleanKeys.includes(key)) {
          parsed[key] = (paramValue === "true") as T[keyof T];
        } else if (numberKeys.includes(key)) {
          parsed[key] = Number(paramValue) as T[keyof T];
        } else {
          parsed[key] = paramValue as T[keyof T];
        }
      } catch {
        parsed[key] = initialState[key];
      }
    }

    return { ...initialState, ...parsed } as T;
  }, [searchParams, initialState, jsonKeys, arrayKeys, booleanKeys, numberKeys]);

  const setState = useCallback(
    (partial: Partial<T>) => {
      const newState = { ...state, ...partial };
      const params = new URLSearchParams();

      for (const key of Object.keys(newState) as (keyof T)[]) {
        const value = newState[key];

        if (value === undefined || value === null || value === "") {
          continue;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key as string, value.join(","));
          }
        } else if (typeof value === "object") {
          params.set(key as string, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          params.set(key as string, value.toString());
        } else {
          params.set(key as string, String(value));
        }
      }

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [state, router, pathname]
  );

  const clearState = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return [state, setState, clearState];
}

/**
 * Hook para persistir contexto de navegação (scroll position, expanded rows, etc.)
 * Usa sessionStorage para sobreviver a navegação back/forward.
 */
export function usePreservedContext<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `sip-preserved-${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = sessionStorage.getItem(storageKey);
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
        sessionStorage.setItem(storageKey, JSON.stringify(newVal));
      } catch {
        // Ignore storage errors
      }
      return newVal;
    });
  }, []);

  // Clear on unmount if needed
  useEffect(() => {
    return () => {
      // Optionally clear on unmount
      // sessionStorage.removeItem(storageKey);
    };
  }, []);

  return [value, setStoredValue];
}

/**
 * Hook combinado para estado de tabela com URL + preservação
 */
export function useTableState<TData, TFilters extends Record<string, unknown>>(
  options: {
    initialFilters: TFilters;
    filterKeys: (keyof TFilters)[];
    pageSize?: number;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
  }
) {
  const { initialFilters, filterKeys, pageSize = 20, sortKey, sortDirection } = options;

  const [filters, setFilters, clearFilters] = useUrlState<TFilters>(initialFilters, {
    arrayKeys: filterKeys,
  });

  const [pagination, setPagination] = useUrlState(
    { page: 1, pageSize, sortKey, sortDirection },
    { numberKeys: ["page", "pageSize"] as const }
  );

  const [sortConfig, setSortConfig] = usePreservedContext<{
    key: string;
    direction: "asc" | "desc";
  }>("table-sort", { key: sortKey ?? "", direction: sortDirection ?? "asc" });

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    filters,
    setFilters,
    clearFilters,
    pagination,
    setPagination,
    sortConfig,
    setSortConfig: setSortConfig as (val: { key: string; direction: "asc" | "desc" }) => void,
    handleSort,
  };
}
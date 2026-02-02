import React, { createContext, useContext, useState } from "react";

export interface PriorityCase {
  id: number;
  title: string;
  client: string;
  hearingDate: string;
}

interface PriorityContextType {
  priorityCases: PriorityCase[];
  addPriorityCase: (item: PriorityCase) => void;
  isPriority: (id: number) => boolean;
}

const PriorityContext = createContext<PriorityContextType | null>(null);

export function PriorityProvider({ children }: { children: React.ReactNode }) {
  const [priorityCases, setPriorityCases] = useState<PriorityCase[]>([]);

  const addPriorityCase = (item: PriorityCase) => {
    setPriorityCases((prev) => {
      if (prev.some((c) => c.id === item.id)) return prev;
      return [...prev, item]; // ✅ append only
    });
  };

  const isPriority = (id: number) =>
    priorityCases.some((c) => c.id === id);

  return (
    <PriorityContext.Provider
      value={{ priorityCases, addPriorityCase, isPriority }}
    >
      {children}
    </PriorityContext.Provider>
  );
}

export function usePriorityCases() {
  const ctx = useContext(PriorityContext);
  if (!ctx) {
    throw new Error("usePriorityCases must be used inside PriorityProvider");
  }
  return ctx;
}

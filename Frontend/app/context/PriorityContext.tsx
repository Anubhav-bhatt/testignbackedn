import { createContext, useContext, ReactNode, useState } from "react";

type PriorityCase = {
  id: string;
};

type PriorityContextType = {
  priorityCases: PriorityCase[];
  addPriorityCase: (c: PriorityCase) => void;
  removePriorityCase: (id: string) => void;
  isPriority: (id: string) => boolean;
};

const PriorityContext = createContext<PriorityContextType | undefined>(
  undefined
);

export function PriorityProvider({ children }: { children: ReactNode }) {
  const [priorityCases, setPriorityCases] = useState<PriorityCase[]>([]);

  const addPriorityCase = (c: PriorityCase) => {
    setPriorityCases((prev) =>
      prev.some((p) => p.id === c.id) ? prev : [...prev, c]
    );
  };

  const removePriorityCase = (id: string) => {
    setPriorityCases((prev) => prev.filter((p) => p.id !== id));
  };

  const isPriority = (id: string) => {
    return priorityCases.some((p) => p.id === id);
  };

  return (
    <PriorityContext.Provider
      value={{ priorityCases, addPriorityCase, removePriorityCase, isPriority }}
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

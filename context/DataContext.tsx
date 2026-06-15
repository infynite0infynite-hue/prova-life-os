import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type Timeframe = "daily" | "weekly" | "monthly" | "yearly" | "custom" | null;

export interface Goal {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  expectedOutcome: string;
  timeframe: Timeframe;
  customDays: number | null;
  subTasks: SubTask[];
  isCompleted: boolean;
  completedAt: string | null;
  universe: "normal" | "secret";
  createdAt: string;
}

export interface Section {
  id: string;
  name: string;
  emoji: string;
  color: string;
  universe: "normal" | "secret";
  createdAt: string;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface DataContextType {
  sections: Section[];
  goals: Goal[];
  addSection: (data: Omit<Section, "id" | "createdAt">) => void;
  updateSection: (id: string, data: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  makeSectionSecret: (id: string) => void;
  addGoal: (data: Omit<Goal, "id" | "createdAt" | "isCompleted" | "completedAt">) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  uncompleteGoal: (id: string) => void;
  toggleSubTask: (goalId: string, subTaskId: string) => void;
  celebratingGoalId: string | null;
  clearCelebration: () => void;
}

const DataContext = createContext<DataContextType | null>(null);
const STORAGE_KEY = "@provalifeOS_data_v2";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [celebratingGoalId, setCelebratingGoalId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.sections) setSections(parsed.sections);
          if (parsed.goals) setGoals(parsed.goals);
        } catch {}
      }
    });
  }, []);

  const persist = useCallback(
    (newSections: Section[], newGoals: Goal[]) => {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sections: newSections, goals: newGoals })
      );
    },
    []
  );

  const addSection = useCallback(
    (data: Omit<Section, "id" | "createdAt">) => {
      const s: Section = { ...data, id: uid(), createdAt: new Date().toISOString() };
      setSections((prev) => {
        const next = [...prev, s];
        persist(next, goals);
        return next;
      });
    },
    [goals, persist]
  );

  const updateSection = useCallback(
    (id: string, data: Partial<Section>) => {
      setSections((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
        persist(next, goals);
        return next;
      });
    },
    [goals, persist]
  );

  const deleteSection = useCallback(
    (id: string) => {
      setSections((prev) => {
        const next = prev.filter((s) => s.id !== id);
        setGoals((gPrev) => {
          const gNext = gPrev.filter((g) => g.sectionId !== id);
          persist(next, gNext);
          return gNext;
        });
        return next;
      });
    },
    [persist]
  );

  const makeSectionSecret = useCallback(
    (id: string) => {
      setSections((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, universe: "secret" as const } : s
        );
        setGoals((gPrev) => {
          const gNext = gPrev.map((g) =>
            g.sectionId === id ? { ...g, universe: "secret" as const } : g
          );
          persist(next, gNext);
          return gNext;
        });
        return next;
      });
    },
    [persist]
  );

  const addGoal = useCallback(
    (data: Omit<Goal, "id" | "createdAt" | "isCompleted" | "completedAt">) => {
      const g: Goal = {
        ...data,
        id: uid(),
        createdAt: new Date().toISOString(),
        isCompleted: false,
        completedAt: null,
      };
      setGoals((prev) => {
        const next = [...prev, g];
        persist(sections, next);
        return next;
      });
    },
    [sections, persist]
  );

  const updateGoal = useCallback(
    (id: string, data: Partial<Goal>) => {
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? { ...g, ...data } : g));
        persist(sections, next);
        return next;
      });
    },
    [sections, persist]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        persist(sections, next);
        return next;
      });
    },
    [sections, persist]
  );

  const completeGoal = useCallback(
    (id: string) => {
      setGoals((prev) => {
        const next = prev.map((g) =>
          g.id === id
            ? { ...g, isCompleted: true, completedAt: new Date().toISOString() }
            : g
        );
        persist(sections, next);
        return next;
      });
      setCelebratingGoalId(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [sections, persist]
  );

  const uncompleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => {
        const next = prev.map((g) =>
          g.id === id ? { ...g, isCompleted: false, completedAt: null } : g
        );
        persist(sections, next);
        return next;
      });
    },
    [sections, persist]
  );

  const toggleSubTask = useCallback(
    (goalId: string, subTaskId: string) => {
      setGoals((prev) => {
        const next = prev.map((g) => {
          if (g.id !== goalId) return g;
          const subTasks = g.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          const allDone = subTasks.length > 0 && subTasks.every((st) => st.isCompleted);
          return {
            ...g,
            subTasks,
            isCompleted: allDone ? true : g.isCompleted,
            completedAt: allDone && !g.isCompleted ? new Date().toISOString() : g.completedAt,
          };
        });
        persist(sections, next);
        return next;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [sections, persist]
  );

  const clearCelebration = useCallback(() => setCelebratingGoalId(null), []);

  return (
    <DataContext.Provider
      value={{
        sections,
        goals,
        addSection,
        updateSection,
        deleteSection,
        makeSectionSecret,
        addGoal,
        updateGoal,
        deleteGoal,
        completeGoal,
        uncompleteGoal,
        toggleSubTask,
        celebratingGoalId,
        clearCelebration,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

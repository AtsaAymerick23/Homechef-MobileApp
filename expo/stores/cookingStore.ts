import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CookingHistory, UserRecipe } from '@/constants/meals';

export type { CookingHistory, UserRecipe };

interface CookingState {
  history: CookingHistory[];
  userRecipes: UserRecipe[];
  addToHistory: (entry: CookingHistory) => void;
  clearHistory: () => void;
  addUserRecipe: (recipe: UserRecipe) => void;
  removeUserRecipe: (id: string) => void;
  updateUserRecipe: (id: string, updates: Partial<UserRecipe>) => void;
}

export const useCookingStore = create<CookingState>()(
  persist(
    (set) => ({
      history: [],
      userRecipes: [],

      addToHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history],
        })),

      clearHistory: () => set({ history: [] }),

      addUserRecipe: (recipe) =>
        set((state) => ({
          userRecipes: [recipe, ...state.userRecipes],
        })),

      removeUserRecipe: (id) =>
        set((state) => ({
          userRecipes: state.userRecipes.filter((r) => r.id !== id),
        })),

      updateUserRecipe: (id, updates) =>
        set((state) => ({
          userRecipes: state.userRecipes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
    }),
    {
      name: 'cooking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
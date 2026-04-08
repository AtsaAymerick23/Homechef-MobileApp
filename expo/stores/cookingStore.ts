import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CookingHistory, UserRecipe } from '@/constants/meals';

interface CookingState {
  history: CookingHistory[];
  userRecipes: UserRecipe[];
  addToHistory: (entry: CookingHistory) => void;
  addUserRecipe: (recipe: UserRecipe) => void;
  removeUserRecipe: (id: string) => void;
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

      addUserRecipe: (recipe) =>
        set((state) => ({
          userRecipes: [recipe, ...state.userRecipes],
        })),

      removeUserRecipe: (id) =>
        set((state) => ({
          userRecipes: state.userRecipes.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'cooking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

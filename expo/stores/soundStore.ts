// stores/soundStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { soundManager } from '../lib/soundManager';

interface SoundStore {
  sfxEnabled: boolean;
  bgEnabled: boolean;
  bgVolume: number;
  toggleSFX: () => void;
  toggleBG: () => void;
  setBGVolume: (v: number) => void;
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      sfxEnabled: true,
      bgEnabled: true,
      bgVolume: 0.3,
      toggleSFX: () => {
        const next = !get().sfxEnabled;
        soundManager.setSFXEnabled(next);
        set({ sfxEnabled: next });
      },
      toggleBG: () => {
        const next = !get().bgEnabled;
        soundManager.setBGEnabled(next);
        if (!next) soundManager.stopBackground();
        set({ bgEnabled: next });
      },
      setBGVolume: (bgVolume) => {
        soundManager.setBackgroundVolume(bgVolume);
        set({ bgVolume });
      },
    }),
    { name: 'sound-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
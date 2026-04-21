// lib/soundManager.ts
import { Audio } from 'expo-av';

type SFXKey = 'button_tap' | 'recipe_unlock' | 'cooking_start' | 'step_complete' | 'timer_done' | 'success';
type BGKey = 'kitchen' | 'cooking';

const SFX_MAP: Record<SFXKey, any> = {
  button_tap:     require('../assets/sounds/sfx/button_tap.mp3'),
  recipe_unlock:  require('../assets/sounds/sfx/recipe_unlock.mp3'),
  cooking_start:  require('../assets/sounds/sfx/cooking_start.mp3'),
  step_complete:  require('../assets/sounds/sfx/step_complete.mp3'),
  timer_done:     require('../assets/sounds/sfx/timer_done.mp3'),
  success:        require('../assets/sounds/sfx/success.mp3'),
};

const BG_MAP: Record<BGKey, any> = {
  kitchen: require('../assets/sounds/background/kitchen_ambience.mp3'),
  cooking: require('../assets/sounds/background/cooking_ambience.mp3'),
};

class SoundManager {
  private bgSound: Audio.Sound | null = null;
  private sfxEnabled = true;
  private bgEnabled = true;

  async init() {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  }

  setSFXEnabled(val: boolean) { this.sfxEnabled = val; }
  setBGEnabled(val: boolean)  { this.bgEnabled  = val; }

  async playSFX(key: SFXKey) {
    if (!this.sfxEnabled) return;
    const { sound } = await Audio.Sound.createAsync(SFX_MAP[key]);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    });
  }

  async playBackground(key: BGKey) {
    if (!this.bgEnabled) return;
    await this.stopBackground();
    const { sound } = await Audio.Sound.createAsync(BG_MAP[key], {
      isLooping: true,
      volume: 0.3,
    });
    this.bgSound = sound;
    await sound.playAsync();
  }

  async stopBackground() {
    if (this.bgSound) {
      await this.bgSound.stopAsync();
      await this.bgSound.unloadAsync();
      this.bgSound = null;
    }
  }

  async setBackgroundVolume(volume: number) {
    await this.bgSound?.setVolumeAsync(Math.max(0, Math.min(1, volume)));
  }
}

export const soundManager = new SoundManager();
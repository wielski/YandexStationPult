import AsyncStorage from '@react-native-async-storage/async-storage';

class PlayerStateStorage {
  private volume: number | null = null;

  public async setVolume(value: number): Promise<void> {
    await AsyncStorage.setItem('@player_volume', String(value))
  }

  public async getVolume(): Promise<number | null> {
    if (this.volume !== null) {
      return this.volume;
    }

    const volume = await AsyncStorage.getItem('@player_volume');

    if (volume) {
      this.volume = parseInt(volume, 10);
    }

    return this.volume;
  }

  public async removeVolume(): Promise<void> {
    await AsyncStorage.removeItem('@player_volume');
    this.volume = null;
  }
}

export default new PlayerStateStorage();

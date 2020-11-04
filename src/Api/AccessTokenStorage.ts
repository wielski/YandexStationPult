import AsyncStorage from '@react-native-async-storage/async-storage';

class AccessTokenStorage {
  private token: string | null = null;

  public async setToken(value: string): Promise<void> {
    await AsyncStorage.setItem('@access_token', value)
  }

  public async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token;
    }

    const token = await AsyncStorage.getItem('@access_token');
    this.token = token;

    return token;
  }

  public async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('@access_token');
    this.token = null;
  }
}

export default new AccessTokenStorage();

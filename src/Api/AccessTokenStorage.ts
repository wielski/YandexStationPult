import AsyncStorage from '@react-native-async-storage/async-storage';

class AccessTokenStorage {
  private token: string | null = null;
  private mainToken: string | null = null;

  // access token

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

  // main token

  public async setMainToken(value: string): Promise<void> {
    await AsyncStorage.setItem('@main_token', value)
  }

  public async getMainToken(): Promise<string | null> {
    if (this.mainToken) {
      return this.mainToken;
    }

    const token = await AsyncStorage.getItem('@main_token');
    this.mainToken = token;

    return token;
  }

  public async removeMainToken(): Promise<void> {
    await AsyncStorage.removeItem('@main_token');
    this.mainToken = null;
  }
}

export default new AccessTokenStorage();

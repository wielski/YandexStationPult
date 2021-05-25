import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountInfo } from '../models';

class AccountStorage {
  private accountInfo: AccountInfo | null = null;

  public async setAccountInfo(value: AccountInfo): Promise<void> {
    await AsyncStorage.setItem('@account_info', JSON.stringify(value))
  }

  public async getAccountInfo(): Promise<AccountInfo | null> {
    if (this.accountInfo !== null) {
      return this.accountInfo;
    }

    const accountInfo = await AsyncStorage.getItem('@account_info');

    if (accountInfo) {
      this.accountInfo = JSON.parse(accountInfo);
    }

    return this.accountInfo;
  }

  public async removeAccountInfo(): Promise<void> {
    await AsyncStorage.removeItem('@account_info');
    this.accountInfo = null;
  }
}

export default new AccountStorage();

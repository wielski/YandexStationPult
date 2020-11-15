import React, { Component } from 'react';
import RNFetchBlob from 'rn-fetch-blob';

import { StyleSheet, View } from 'react-native';
import { Spinner } from 'native-base';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import AccessTokenStorage from '../Api/AccessTokenStorage';
import AccountStorage from '../Api/AccountStorage';

import { useSharedState } from '../store';
import YandexMusicApi from '../Api/YandexMusicApi';

import { AccountInfo } from '../models';
import { YandexMusicAuth } from '../Api/YandexMusicAuth';

type Props = StackScreenProps<RootStackParamList, 'Main'>;
interface MainProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

const authApi = new YandexMusicAuth();

export class Main extends Component<MainProps> {
  constructor(props: MainProps) {
    super(props);
  }

  public async getAccountInfo(): Promise<AccountInfo> {
    const accountInfo = await AccountStorage.getAccountInfo();

    if (accountInfo) {
      return accountInfo;
    }

    const token = await AccessTokenStorage.getMainToken();

    const response = await RNFetchBlob.config({
      trusty: true
    }).fetch(
      'GET',
      'https://mobileproxy.passport.yandex.net/1/bundle/account/short_info?avatar_size=islands-200',
      {
        'Ya-Consumer-Authorization': `OAuth ${token}`
      },
    );

    if (response.info().status === 200) {
      const json = await response.json();

      AccountStorage.setAccountInfo(json);

      return json;
    }

    throw new Error('cant get account info');
  }

  public async getAccountMeta(): Promise<boolean> {
    const [state, setState] = this.props.sharedState;

    try {
      const account = await YandexMusicApi.getAccount();
      const info = await this.getAccountInfo();

      if (!account.id) {
        return false;
      }

      const likedTracks = await YandexMusicApi.getLikedTrackIds(account.id);

      setState({ account, info, likedTracks });
    } catch (e) {
      return false;
      // TODO: Process error
    }

    return true;
  }

  public processLogin(): void {
    const navigation = this.props.navigation;

    Promise.all([
      AccessTokenStorage.getToken(),
      AccessTokenStorage.getMainToken()
    ]).then(async ([token, mainToken]) => {
      if (token && mainToken) {
        const checkProfile = await this.getAccountMeta();

        if (!checkProfile) {
          AccessTokenStorage.removeToken();
          AccessTokenStorage.removeMainToken();
          AccountStorage.removeAccountInfo();

          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });

          return;
        }

        const [state, setState] = this.props.sharedState;
        setState({ authToken: token, mainToken: mainToken });

        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });
  }

  render() {
    return (
      <View style={styles.loading}><Spinner color="#ffdc5f" /></View>
    );
  }

  componentDidMount() {
    this.processLogin();
    authApi.init();
  }
}

export default (props: Props) => {
  return <Main sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: '#ffffff',
  },
});

import React, { Component } from 'react';

import { StyleSheet, View } from 'react-native';
import { Spinner } from 'native-base';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import AccessTokenStorage from '../Api/AccessTokenStorage';
import { useSharedState } from '../store';
import YandexMusicApi from '../Api/YandexMusicApi';

type Props = StackScreenProps<RootStackParamList, 'Main'>;
interface MainProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

const yandexMusicApi = new YandexMusicApi();

export class Main extends Component<MainProps> {
  constructor(props: MainProps) {
    super(props);
  }

  public async getAccountMeta(): Promise<boolean> {
    const [state, setState] = this.props.sharedState;

    try {
      const account = await yandexMusicApi.getAccount();

      if (!account.id) {
        return false;
      }

      const likedTracks = await yandexMusicApi.getLikedTracks(account.id);

      setState({ ...state, account, likedTracks });
    } catch (e) {
      return false;
      // TODO: Process error
    }

    return true;
  }

  public processLogin(): void {
    const navigation = this.props.navigation;

    AccessTokenStorage.getToken().then(async (token) => {
      if (token) {
        const checkProfile = await this.getAccountMeta();

        if (!checkProfile) {
          AccessTokenStorage.removeToken();

          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });

          return;
        }

        const [state, setState] = this.props.sharedState;
        setState({ ...state, authToken: token });

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

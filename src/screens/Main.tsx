import React, { Component } from 'react';

import { StyleSheet, View } from 'react-native';
import { Spinner } from 'native-base';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import AccessTokenStorage from '../Api/AccessTokenStorage';
import { useSharedState } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Main'>;
interface MainProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

export class Main extends Component<MainProps> {
  constructor(props: MainProps) {
    super(props);
  }

  public processLogin(): void {
    const [state, setState] = this.props.sharedState;
    const navigation = this.props.navigation;

    AccessTokenStorage.getToken().then((token) => {
      if (token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });

        setState({ ...state, authToken: token });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });
  }

  render() {
    this.processLogin();

    return (
      <View style={styles.loading}><Spinner color="#ffdc5f" /></View>
    );
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

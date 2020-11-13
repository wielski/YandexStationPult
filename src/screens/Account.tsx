import React, { Component } from 'react';

import { SafeAreaView, View, StyleSheet, Text, Image } from 'react-native';
import { Button } from 'native-base';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import { useSharedState } from '../store';
import AccessTokenStorage from '../Api/AccessTokenStorage';

type Props = StackScreenProps<RootStackParamList, 'Log'>;
interface AccountProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

const plus = require('../../assets/plus.png');

export class Account extends Component<AccountProps> {
  constructor(props: AccountProps) {
    super(props);
  }

  public async logout(): Promise<void> {
    const navigation = this.props.navigation;

    await AccessTokenStorage.removeToken;
    await AccessTokenStorage.removeMainToken();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  }

  render() {
    const [state] = this.props.sharedState;

    return (
      <SafeAreaView>
        <View style={styles.account}>
          { state.info && state.info.uid &&
            <View style={styles.accountInfo}>
              <View style={styles.accountAvatar}>
                { state.info && state.info.has_plus &&
                    <Image source={plus} style={styles.accountPlus}></Image>
                  }
                  <Image
                    style={styles.accountImage}
                    source={{
                      uri: state.info.avatar_url,
                    }}
                  />
              </View>
              <Text style={styles.accountName}>{ state.info.display_name }</Text>
            </View>
          }
          <View>
            <Button style={styles.button} onPress={() => { this.logout() }}>
              <Text style={styles.buttonText}>Выйти</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default (props: Props) => {
  return <Account sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  account: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 20,
    backgroundColor: '#6839cf',
  },
  buttonText: {
    color: '#ffffff',
  },
  accountInfo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '800',
  },
  accountAvatar: {
    marginBottom: 15,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountImage: {
    width: 80,
    height: 80,
    borderRadius: 90,
  },
  accountPlus: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

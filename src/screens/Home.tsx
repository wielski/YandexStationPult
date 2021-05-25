import React, { Component } from 'react';

import { SafeAreaView, StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import { useSharedState } from '../store';
import CookieManager from '@react-native-community/cookies';

type Props = StackScreenProps<RootStackParamList, 'Home'>;
interface HomeProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

export class Home extends Component<HomeProps> {
  state = {
    cookies: '',
  }

  constructor(props: HomeProps) {
    super(props);
  }

  public async getCookies() {
    CookieManager.get('https://yandex.ru').then((cookies) => {
      this.setState({
        cookies: Object.keys(cookies).map((key) => `${key}=${cookies[key]}`).join('; ')
      });
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
        <WebView
          style={styles.webview}
          source={{
            uri: 'https://yandex.ru/quasar/iot',
            headers: {
              'Cookie': this.state.cookies,
            },
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true} />
      </SafeAreaView>
    );
  }
}

export default (props: Props) => {
  return <Home sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  webview: {
    height: '100%',
  }
});

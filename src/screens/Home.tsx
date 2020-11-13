import React, { Component } from 'react';

import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import { useSharedState } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Home'>;
interface HomeProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

export class Home extends Component<HomeProps> {
  constructor(props: HomeProps) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: '#fff' }}>
        <WebView
          style={styles.webview}
          source={{ uri: 'https://yandex.ru/quasar/iot' }}
          javaScriptEnabled={true}
          domStorageEnabled={true} />
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

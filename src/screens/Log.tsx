import React, { Component } from 'react';

import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import { useSharedState } from '../store';

import GlagolApi from '../Api/GlagolApi';
import YandexStation from '../Api/YandexStation';
import YandexStationNetwork from '../Api/YandexStationNetwork';

type Props = StackScreenProps<RootStackParamList, 'Log'>;
interface LogProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

export class Log extends Component<LogProps> {
  constructor(props: LogProps) {
    super(props);
  }

  render() {
    const glagolLog = GlagolApi.getLog();
    const yandexStationLog = YandexStation.getLog();
    const yandexStationNetworkLog = YandexStationNetwork.getLog();

    return (
      <SafeAreaView>
        <ScrollView style={{ marginTop: 50 }}>
          { glagolLog.map((e, i) => (
            <Text key={`glagol${i}`}>{e}</Text>
          )) }
          { yandexStationLog.map((e, i) => (
            <Text key={`yastation${i}`}>{e}</Text>
          )) }
          { yandexStationNetworkLog.map((e, i) => (
            <Text key={`yanetwork${i}`}>{e}</Text>
          )) }
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default (props: Props) => {
  return <Log sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  
});

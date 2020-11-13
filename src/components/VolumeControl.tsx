import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Icon } from 'native-base';

const VolumeControl = ({
  maxVolume,
  currentVolume,
  onSeek,
  onSlidingStart,
}: {
  maxVolume: number,
  currentVolume: number,
  onSeek: (time: number) => void,
  onSlidingStart: () => void,
}) => {
  let volume = 'off';

  if (currentVolume >= 1 && currentVolume <= 5) {
    volume = 'low';
  }

  if (currentVolume >= 6 && currentVolume <= 10) {
    volume = 'high';
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.text, { color: '#000000' }]}>
          <Icon style={styles.icon} name={`ios-volume-${volume}`}></Icon>
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.text, { color: '#000000' }]}>
          { currentVolume }
        </Text>
      </View>
      <Slider
        maximumValue={maxVolume}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSeek}
        value={currentVolume}
        step={1}
        minimumTrackTintColor="#000"
        maximumTrackTintColor="#ccc"
        thumbStyle={styles.thumb}
        thumbTintColor="#fff"
        trackStyle={styles.track}
      />
    </View>
  );
};

export default VolumeControl;

const styles = StyleSheet.create({
  slider: {
    marginTop: -12,
  },
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    textAlign: 'center',
  },
  icon: {
    fontSize: 20,
  },
});

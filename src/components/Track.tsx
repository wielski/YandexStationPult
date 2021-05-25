import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import { Track as TrackT } from '../models';

type Props = {
  track: TrackT;
  onPress: (track: TrackT) => void;
};

const Track = (props: Props) => {
  const track = props.track;
  const cover = props.track.cover ? `http://${props.track.cover.replace(/%%/g, '100x100?webp=false')}` : null;
  const title = [track.subtitle, track.title].filter((c) => !!c).join(' — ');

  let h,m,s;
  h = Math.floor(track.duration/1000/60/60);
  m = Math.floor((track.duration/1000/60/60 - h)*60);
  s = Math.floor(((track.duration/1000/60/60 - h)*60 - m)*60);
  
  let durationArr = [];
  if (h > 0) {
    durationArr.push(String(h).padStart(2, '0'));
  }

  durationArr.push(String(m).padStart(2, '0'));
  durationArr.push(String(s).padStart(2, '0'));

  const duration = track.duration ? durationArr.join(':') : '-';

  return (
    <TouchableOpacity style={styles.track} onPress={() => props.onPress(track)}>
      <View style={styles.trackCover}>
        { cover ? <Image
          style={styles.coverImage}
          source={{
            uri: cover,
          }}
        /> : null}
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName}>{title}</Text>
        <Text style={styles.trackDuration}>{duration}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default Track;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#cccccc',
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  trackInfo: {
    paddingLeft: 10,
  },
  trackName: {
    fontWeight: '600',
    fontSize: 12,
  },
  trackDuration: {
    fontSize: 10,
    color: '#7f8387',
  },
});

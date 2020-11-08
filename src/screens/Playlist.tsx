import React, { Component } from 'react';

import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../Navigation';
import { useSharedState } from '../store';

import YandexStation from '../Api/YandexStation';
import YandexMusicApi from '../Api/YandexMusicApi';
import { Track } from '../models';

import SearchBar from '../components/SearchBar';
import { default as TrackComponent } from '../components/Track';

type Props = StackScreenProps<RootStackParamList, 'Playlist'>;
interface PlaylistsProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

type State = {
  tracks: Track[];
  searchText: string;
};

const yandexMusicApi = new YandexMusicApi();

export class Playlist extends Component<PlaylistsProps> {
  state: State = {
    tracks: [],
    searchText: '',
  };

  constructor(props: PlaylistsProps) {
    super(props);
  }

  public playTrack(track: Track): void {
    YandexStation.sendCommand({
      command: 'playMusic',
      id: String(track.id),
      type: 'track',
    });
  }

  public async loadPlaylist(): Promise<void> {
    const [state] = this.props.sharedState;
    if (!state.account) return;
    if (!this.props.route.params.kind) return;

    const userId = state.account.id;

    const tracks = await yandexMusicApi.getPlaylistTracks(userId, this.props.route.params.kind);

    this.setState({
      ...this.state,
      tracks,
    });
  }

  public clearTracks(): void {
    this.setState({
      ...this.state,
      tracks: [],
      tracksView: false,
    });
  }

  render() {
    let tracks = this.state.tracks;

    if (this.state.searchText && this.state.searchText.length > 0) {
      tracks = tracks.filter((track) => {
        const name = [track.subtitle, track.title].join(' - ');
        return name.toLowerCase().includes(this.state.searchText.toLowerCase());
      });
    }

    return (
      <SafeAreaView>
        <View style={styles.wrapper}>
          <SearchBar
            onClear={() => { this.setState({...this.state, searchText: '' }) }}
            onSearch={(text: string) => { this.setState({...this.state, searchText: text }) }} />

          <ScrollView style={styles.scroll}>
            {tracks && tracks.length > 0 ? 
              <View>
                {tracks.map((track, index) => (
                  <TrackComponent
                    key={index}
                    track={track}
                    onPress={(track) => {
                      this.playTrack(track)
                    }} />
                ))}
              </View>
            : <Text style={styles.tracksNotFound}>Ничего не найдено</Text>}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  componentDidMount(): void {
    this.loadPlaylist();
  }
}

export default (props: Props) => {
  return <Playlist sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    paddingBottom: 140,
  },
  scroll: {
    height: '100%',
  },
  tracksNotFound: {
    margin: 20,
    textAlign: 'center',
  },
});

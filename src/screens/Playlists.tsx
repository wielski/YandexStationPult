import React, { Component } from 'react';

import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import GestureRecognizer from 'react-native-swipe-gestures';

import { RootStackParamList } from '../Navigation';
import { useSharedState } from '../store';

import YandexStation from '../Api/YandexStation';
import YandexMusicApi from '../Api/YandexMusicApi';
import { Playlist, Track } from '../models';

import SearchBar from '../components/SearchBar';
import { debounce } from '../helpers';
import { default as TrackComponent } from '../components/Track';
import { navigate } from '../services/NavigationService';

type Props = StackScreenProps<RootStackParamList, 'Playlists'>;
interface PlaylistsProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

type State = {
  playlists: Playlist[];
  tracks: Track[];
  tracksView: boolean;
  refreshing: boolean;
};

const yandexMusicApi = new YandexMusicApi();

export class Playlists extends Component<PlaylistsProps> {
  state: State = {
    playlists: [],
    tracks: [],
    tracksView: false,
    refreshing: false,
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

  public async loadPlaylists(): Promise<void> {
    const [state] = this.props.sharedState;
    if (!state.account) return;

    const userId = state.account.id;

    const playlists = await yandexMusicApi.getPlaylists(userId);

    this.setState({
      ...this.state,
      playlists: [
        {
          id: 0,
          kind: 3,
          name: 'Мне нравится',
          cover: 'music.yandex.ru/blocks/playlist-cover/playlist-cover_like_2x.png',
          trackCount: state.likedTracks.length,
        },
        ...playlists,
      ],
    });
  }

  public async searchTracks(text: string): Promise<void> {
    let tracks: Track[] = [];

    try {
      tracks = await yandexMusicApi.searchTracks(text);
    } catch (e) {
      tracks = [];
    }

    this.setState({
      ...this.state,
      tracks: tracks,
      tracksView: true,
    });
  }
  searchTracksDebounce = debounce(this.searchTracks, 500);

  public clearTracks(): void {
    this.setState({
      ...this.state,
      tracks: [],
      tracksView: false,
    });
  }

  public async onRefresh(): Promise<void> {
    this.setState({ ...this.state, refreshing: true });

    if (this.state.tracksView) {
      await this.loadPlaylists();
    }

    this.setState({ ...this.state, refreshing: false });
  }

  public playlists() {
    const playlists = this.state.playlists;

    return (
      <View style={styles.playlists}>
        {playlists.map((playlist, index) => (
          <View style={styles.playlistWrapper} key={index}>
            <TouchableOpacity
              style={styles.playlist}
              onPress={() => {
                navigate('Playlist', { kind: playlist.kind });
              }}>
              <View style={styles.playlistImageWrapper}>
                {playlist.cover && playlist.cover.length > 0 ?
                  <Image
                    style={styles.playlistImage}
                    source={{
                      uri: `http://${playlist.cover.replace(/%%/g, 'm1000x1000?webp=false')}`,
                    }}
                  />
                : null}
              </View>
              <Text style={styles.playlistName}>{playlist.name}</Text>
              <Text style={styles.playlistTrackCount}>{playlist.trackCount}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }

  public tracks() {
    const tracks = this.state.tracks;

    return (
      <View>
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
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView>
        <View style={styles.wrapper}>
          <SearchBar
            onClear={() => { this.clearTracks() }}
            onSearch={(text: string) => { this.searchTracksDebounce(text) }} />

          <ScrollView
            style={styles.scroll}
            refreshControl={
              <RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                this.onRefresh()
              }} />
            }>
            {this.state.tracksView ? this.tracks() : this.playlists()}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  componentDidMount(): void {
    this.loadPlaylists();
  }
}

export default (props: Props) => {
  return <Playlists sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    paddingBottom: 140,
  },
  scroll: {
    height: '100%',
  },
  playlists: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playlistWrapper: {
    width: '33.33%',
  },
  playlist: {
    margin: 10,
  },
  playlistImageWrapper: {
    height: 100,
    width: '100%',
    borderRadius: 5,
    backgroundColor: '#cccccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16.00,
    elevation: 24,
  },
  playlistImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 100,
    borderRadius: 5,
  },
  playlistName: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 10,
    fontWeight: "600",
  },
  playlistTrackCount: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 10,
    fontWeight: "200",
  },
  tracksNotFound: {
    margin: 20,
    textAlign: 'center',
  },
});

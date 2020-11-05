import React, { Component } from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../Navigation';
import { useSharedState } from '../store';

import YandexMusicApi from '../Api/YandexMusicApi';
import { Playlist } from '../models';

type Props = StackScreenProps<RootStackParamList, 'Playlists'>;
interface PlaylistsProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

type State = {
  playlists: Playlist[];
};

const yandexMusicApi = new YandexMusicApi();

export class Playlists extends Component<PlaylistsProps> {
  state: State = {
    playlists: [],
  };

  constructor(props: PlaylistsProps) {
    super(props);
  }

  public async loadPlaylists(): Promise<void> {
    const [state] = this.props.sharedState;
    if (!state.account) return;

    const userId = state.account.id;

    const playlists = await yandexMusicApi.getPlaylists(userId);

    this.setState({
      playlists: [
        {
          id: 0,
          kind: 3,
          name: 'Мне нравится',
          cover: null,
        },
        ...playlists,
      ],
    });
  }

  render() {
    return (
      <SafeAreaView>
        <View style={styles.playlists}>
          
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
  playlists: {
    height: '100%',
  },
});

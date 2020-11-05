import React, { Component } from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon } from 'native-base';
import SeekBar from '../components/SeekBar';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../Navigation';
import { useSharedState } from '../store';

import Header from '../components/Header';
import YandexStation from '../Api/YandexStation';
import YandexMusicApi from '../Api/YandexMusicApi';

type Props = StackScreenProps<RootStackParamList, 'Dashboard'>;
interface DashboardProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

const yandexMusicApi = new YandexMusicApi();

export class Dashboard extends Component<DashboardProps> {
  constructor(props: DashboardProps) {
    super(props);
  }

  public play(): void {
    YandexStation.sendCommand({
      command: 'play',
    });
  }

  public stop(): void {
    YandexStation.sendCommand({
      command: 'stop',
    });
  }

  public prev(): void {
    YandexStation.sendCommand({
      command: 'prev',
    });
  }

  public next(): void {
    YandexStation.sendCommand({
      command: 'next',
    });
  }

  public seek(time: number): void {
    YandexStation.sendCommand({
      command: 'rewind',
      position: time,
    });
  }

  public async like(id: number): Promise<void> {
    const [state, setState] = this.props.sharedState
    if (!state.account) return;

    try {
      await yandexMusicApi.likeTrack(state.account.id, id);

      const likedTracks = [...state.likedTracks];
      likedTracks.push(id);

      setState({ ...state, likedTracks });
    } catch (e) {
      // TODO: Process error
    }
  }

  public async dislike(id: number): Promise<void> {
    const [state, setState] = this.props.sharedState
    if (!state.account) return;

    try {
      await yandexMusicApi.dislikeTrack(state.account.id, id);

      const likedTracks = [...state.likedTracks];
      const likedTrackIndex = likedTracks.indexOf(id);

      if (likedTrackIndex > -1) {
        likedTracks.splice(likedTrackIndex, 1);
        setState({ ...state, likedTracks });
      }
    } catch (e) {
      // TODO: Process error
    }
  }

  public isLiked(id: string): boolean {
    const [state] = this.props.sharedState;
    const intId = parseInt(id, 10);

    return Array.isArray(state.likedTracks) && [...state.likedTracks].includes(intId);
  }

  render() {
    const [state] = this.props.sharedState;
    const currentPlaying = state.currentPlaying;

    return (
      <SafeAreaView>
        <View style={styles.dashboard}>
          <Header />
          <View style={styles.container}>
            {currentPlaying.hasState && 
              <View style={styles.player}>
                {currentPlaying.cover && currentPlaying.cover.length > 0 ?
                  <View style={styles.cover}>
                    <Image
                      style={styles.coverImage}
                      source={{
                        uri: currentPlaying.cover,
                      }}
                    />
                  </View>
                : null}
                <View style={styles.name}>
                  <Text style={styles.title}>{currentPlaying.title}</Text>
                  <Text style={styles.subtitle}>{currentPlaying.subtitle}</Text>
                </View>
                <View style={styles.favoriteControl}>
                  { this.isLiked(String(currentPlaying.id)) ?
                    <Button onPress={() => this.dislike(currentPlaying.id as number)} style={styles.dislikeButton} small>
                      <Icon style={styles.dislikeButtonIcon} name="heart" />
                    </Button>
                    :
                    <Button onPress={() => this.like(currentPlaying.id as number)} style={styles.likeButton} small>
                      <Icon style={styles.likeButtonIcon} name="heart-empty" />
                    </Button>
                  }
                </View>
                <View style={styles.seek}>
                  <SeekBar
                    onSeek={this.seek.bind(this)}
                    trackLength={currentPlaying.duration as number}
                    onSlidingStart={() => this.setState({ paused: true })}
                    currentPosition={currentPlaying.progress as number}
                  />
                </View>
                <View style={styles.control}>
                  <Button onPress={() => this.prev()} style={styles.controlButton} large>
                    <Icon style={styles.controlIcon} name="arrow-back" />
                  </Button>
                  {!currentPlaying.playing &&
                    <Button onPress={() => this.play()} style={styles.controlButton} large>
                      <Icon style={styles.playPauseIcon} name="play" />
                    </Button>
                  }
                  {currentPlaying.playing &&
                    <Button onPress={() => this.stop()} style={styles.controlButton} large>
                      <Icon style={styles.playPauseIcon} name="pause" />
                    </Button>
                  }
                  <Button onPress={() => this.next()} style={styles.controlButton}large>
                    <Icon style={styles.controlIcon} name="arrow-forward" />
                  </Button>
                </View>
              </View>
            }
            {!currentPlaying.hasState &&
              <Text style={styles.noPlaying}>Сейчас ничего не играет</Text>
            }
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default (props: Props) => {
  return <Dashboard sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  dashboard: {
    height: '100%',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  player: {
    marginTop: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cover: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16.00,
    elevation: 24,
  },
  coverImage: {
    width: 250,
    height: 250,
  },
  name: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  control: {
    flex: 1,
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: 'transparent',
    marginLeft: 5,
    marginRight: 5,
  },
  controlIcon: {
    color: '#000000',
    fontSize: 32,
  },
  playPauseIcon: {
    color: '#000000',
    fontSize: 45,
  },
  seek: {
    width: 300,
    marginBottom: 20,
  },
  favoriteControl: {
    width: 300,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    padding: 0,
  },
  likeButtonIcon: {
    color: '#000000',
    fontSize: 18,
  },
  dislikeButton: {
    backgroundColor: 'transparent',
  },
  dislikeButtonIcon: {
    color: '#f50e0a',
    fontSize: 18,
  },
  noPlaying: {
    marginTop: 100,
    alignItems: 'center',
  },
});

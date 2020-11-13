import React, { Component } from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon } from 'native-base';
import { StackScreenProps } from '@react-navigation/stack';
import { showMessage } from 'react-native-flash-message';

import SeekBar from '../components/SeekBar';
import VolumeControl from '../components/VolumeControl';

import { RootStackParamList } from '../Navigation';
import { useSharedState } from '../store';

import Header from '../components/Header';
import YandexStation from '../Api/YandexStation';
import YandexMusicApi from '../Api/YandexMusicApi';
import YandexStationNetwork from '../Api/YandexStationNetwork';
import PlayerStateStorage from '../Api/PlayerStateStorage';

type Props = StackScreenProps<RootStackParamList, 'Dashboard'>;
interface DashboardProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

type LocalState = {
  isPlaying: boolean;
  volume: number;
};

export class Dashboard extends Component<DashboardProps> {
  state: LocalState = {
    isPlaying: false,
    volume: 0,
  };

  constructor(props: DashboardProps) {
    super(props);
  }

  public play(): void {
    if (this.sendByNetwork('Включи')) {
      this.setState({ ...this.state, isPlaying: true });
      return;
    }

    YandexStation.sendCommand({
      command: 'play',
    });
  }

  public stop(): void {
    if (this.sendByNetwork('Стоп')) {
      this.setState({ ...this.state, isPlaying: false });
      return;
    }

    YandexStation.sendCommand({
      command: 'stop',
    });
  }

  public prev(): void {
    if (this.sendByNetwork('Назад')) return;

    YandexStation.sendCommand({
      command: 'prev',
    });
  }

  public next(): void {
    if (this.sendByNetwork('Дальше')) return;

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

  public up(): void {
    if (this.sendByNetwork('Вверх')) return;

    YandexStation.sendCommand({
      command: 'sendText',
      text: 'Вверх',
    });
  }

  public down(): void {
    if (this.sendByNetwork('Вниз')) return;

    YandexStation.sendCommand({
      command: 'sendText',
      text: 'Вниз',
    });
  }

  public volume(volume: number): void {
    if (this.sendByNetwork(`Громкость ${volume}`)) return;

    YandexStation.sendCommand({
      command: 'setVolume',
      volume: volume / 10,
    });

    PlayerStateStorage.setVolume(volume);

    this.setState({ ...this.state, volume });
  }

  public async like(id: number): Promise<void> {
    if (this.sendByNetwork('Поставь лайк')) return;

    const [state, setState] = this.props.sharedState;
    if (!state.account) return;

    try {
      await YandexMusicApi.likeTrack(state.account.id, id);

      const likedTracks = [...state.likedTracks];
      likedTracks.push(id);

      setState({ likedTracks });
    } catch (e) {
      showMessage({
        message: 'Не удалось поставить лайк',
        type: 'danger',
      });
    }
  }

  public async dislike(id: number): Promise<void> {
    if (this.sendByNetwork('Поставь дизлайк')) return;

    const [state, setState] = this.props.sharedState;
    if (!state.account) return;

    try {
      await YandexMusicApi.dislikeTrack(state.account.id, id);

      const likedTracks = [...state.likedTracks];
      const likedTrackIndex = likedTracks.indexOf(id);

      if (likedTrackIndex > -1) {
        likedTracks.splice(likedTrackIndex, 1);
        setState({ likedTracks });
      }
    } catch (e) {
      showMessage({
        message: 'Не удалось поставить дизлайк',
        type: 'danger',
      });
    }
  }

  public isLiked(id: string): boolean {
    const [state] = this.props.sharedState;
    const intId = parseInt(id, 10);

    return Array.isArray(state.likedTracks) && [...state.likedTracks].includes(intId);
  }

  public sendByNetwork(command: string): boolean {
    const [state] = this.props.sharedState;

    if (state.deviceStatus === 'disconnected' && state.selectedDevice) {
      try {
        YandexStationNetwork.sendCommand(state.selectedDevice.id, command);
      } catch (e) {
        showMessage({
          message: 'Не удалось выполнить команду по сети',
          type: 'danger',
        });
      }

      return true;
    }

    return false;
  }

  disconnectedControl() {
    const isPlaying = this.state.isPlaying;

    return (
      <View style={styles.player}>
        <View style={styles.control}>
          <Button onPress={() => this.dislike(0)} style={styles.dislikeButton} small>
            <Icon style={styles.dislikeButtonIcon} name="ios-heart" />
          </Button>
          <Button onPress={() => this.like(0)} style={styles.likeButton} small>
            <Icon style={styles.likeButtonIcon} name="ios-heart-dislike" />
          </Button>
        </View>
        <View style={styles.control}>
          <Button onPress={() => this.up()} style={styles.controlButton} large>
            <Icon style={styles.controlIcon} name="ios-arrow-up" />
          </Button>
        </View>
        <View style={styles.control}>
          <Button onPress={() => this.prev()} style={styles.controlButton} large>
            <Icon style={styles.controlIcon} name="ios-arrow-back" />
          </Button>
          { isPlaying ?
            <Button onPress={() => this.stop()} style={styles.controlButton} large>
              <Icon style={styles.playPauseIcon} name="ios-pause" />
            </Button> :
            <Button onPress={() => this.play()} style={styles.controlButton} large>
              <Icon style={styles.playPauseIcon} name="ios-play" />
            </Button>
          }
          <Button onPress={() => this.next()} style={styles.controlButton}large>
            <Icon style={styles.controlIcon} name="ios-arrow-forward" />
          </Button>
        </View>
        <View style={styles.control}>
          <Button onPress={() => this.down()} style={styles.controlButton} large>
            <Icon style={styles.controlIcon} name="ios-arrow-down" />
          </Button>
        </View>
        <View style={styles.volume}>
          <VolumeControl
            onSlidingStart={() => {}}
            onSeek={this.volume.bind(this)}
            maxVolume={10}
            currentVolume={this.state.volume}
          />
        </View>
      </View>
    );
  }

  render() {
    const [state] = this.props.sharedState;
    const currentPlaying = state.currentPlaying;

    return (
      <SafeAreaView>
        <View style={styles.dashboard}>
          <Header />
          {state.deviceStatus === 'disconnected' ?
            <View style={styles.disconnectedMessage}>
              <Text style={styles.disconnectedText}>
                Не удалось подключиться к станции, приложение работает в урезанном режиме
              </Text>
            </View>
          : null}
          <View style={styles.container}>
            {state.deviceStatus === 'disconnected' ?
              this.disconnectedControl()
            : null}

            {currentPlaying.hasState && state.deviceStatus === 'connected' &&
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
                      <Icon style={styles.dislikeButtonIcon} name="ios-heart" />
                    </Button>
                    :
                    <Button onPress={() => this.like(currentPlaying.id as number)} style={styles.likeButton} small>
                      <Icon style={styles.likeButtonIcon} name="ios-heart-empty" />
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
                    <Icon style={styles.controlIcon} name="ios-arrow-back" />
                  </Button>
                  {!currentPlaying.playing &&
                    <Button onPress={() => this.play()} style={styles.controlButton} large>
                      <Icon style={styles.playPauseIcon} name="ios-play" />
                    </Button>
                  }
                  {currentPlaying.playing &&
                    <Button onPress={() => this.stop()} style={styles.controlButton} large>
                      <Icon style={styles.playPauseIcon} name="ios-pause" />
                    </Button>
                  }
                  <Button onPress={() => this.next()} style={styles.controlButton}large>
                    <Icon style={styles.controlIcon} name="ios-arrow-forward" />
                  </Button>
                </View>
                <View style={styles.volume}>
                  <VolumeControl
                    onSlidingStart={() => {}}
                    onSeek={this.volume.bind(this)}
                    maxVolume={10}
                    currentVolume={this.state.volume}
                  />
                </View>
              </View>
            }
            {!currentPlaying.hasState && state.deviceStatus === 'connected' &&
              <Text style={styles.noPlaying}>Сейчас ничего не играет</Text>
            }
          </View>
        </View>
      </SafeAreaView>
    );
  }

  componentDidMount(): void {
    PlayerStateStorage.getVolume().then((volume) => {
      this.setState({ ...this.state, volume });
    });
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  player: {
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
    width: 200,
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: 'transparent',
    marginLeft: 5,
    marginRight: 5,
    elevation: 0,
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
    elevation: 0,
  },
  likeButtonIcon: {
    color: '#000000',
    fontSize: 18,
  },
  dislikeButton: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  dislikeButtonIcon: {
    color: '#f50e0a',
    fontSize: 18,
  },
  noPlaying: {
    marginTop: 100,
    alignItems: 'center',
  },
  disconnectedMessage: {
    padding: 10,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fdf1e1',
  },
  disconnectedText: {
    color: '#866332',
    fontSize: 11,
    textAlign: 'center',
  },
  volume: {
    width: 200,
  },
});

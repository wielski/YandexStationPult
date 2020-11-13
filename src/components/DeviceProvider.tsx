import React, { Component } from 'react';
import { decode as Base64Decode } from 'base-64';
import { showMessage } from 'react-native-flash-message';

import { useSharedState } from '../store';
import { CurrentPlaying, CurrentState, Device } from '../models';

import GlagolApi from '../Api/GlagolApi';
import YandexStation from '../Api/YandexStation';
import YandexStationNetwork from '../Api/YandexStationNetwork';

interface DeviceProviderProps {
  sharedState: ReturnType<typeof useSharedState>,
  children: any,
};

class DeviceProvider extends Component<DeviceProviderProps> {
  reconnectInterval: NodeJS.Timeout | null = null;

  constructor(props: DeviceProviderProps) {
    super(props);
  }

  public async loadDevices(): Promise<void> {
    const [state, setState] = this.props.sharedState;

    const devices = await GlagolApi.getDeviceList();

    try {
      YandexStationNetwork.init(devices);
    } catch (e) {
      showMessage({
        message: 'Не удалось подключиться к станции по сети',
        type: 'danger',
      });
    }

    const newState: {
      devices: Device[],
      selectedDevice: Device | null;
    } = {
      devices,
      selectedDevice: null,
    };

    if (!state.selectedDevice && devices.length > 0) {
      newState.selectedDevice = devices[0];
    }

    setState(newState);

    if (newState.selectedDevice) {
      this.connectToDevice(newState.selectedDevice);
    }
  }

  public connectToDevice(device: Device): void {
    setTimeout(() => {
      const [state, setState] = this.props.sharedState;

      try {
        YandexStation.connectToDevice(device);
      } catch (e) {
        setState({ deviceStatus: 'disconnected' })
      }
    }, 500);
  }

  public connecting(bound?: Function): void {
    if (bound) {
      return;
    }

    const [state, setState] = this.props.sharedState;
    setState({ deviceStatus: 'connecting' });
  }

  public connected(bound?: Function): void {
    if (bound) {
      return;
    }

    const [state, setState] = this.props.sharedState;
    setState({ deviceStatus: 'connected' });

    try {
      // send handshake to get device state
      YandexStation.sendCommand({
        command : 'handshake',
      });
    } catch (e) {
      //
    }
  }

  public disconnected(bound?: Function): void {
    if (bound) {
      return;
    }

    const [state, setState] = this.props.sharedState;
    setState({ deviceStatus: 'disconnected' });
  }

  public setDeviceState(deviceState: CurrentState): void {
    if (typeof deviceState === 'function') {
      return;
    }

    let currentPlaying: CurrentPlaying = {
      hasState: false,
    };

    let currentPlayingTrackId: number | undefined = undefined;

    if (deviceState && deviceState.extra && deviceState.extra.appState) {
      try {
        const appStateString = Base64Decode(deviceState.extra.appState);
        const appStateJson = appStateString.substring(appStateString.indexOf('{'), appStateString.lastIndexOf('"}') + 2);
        const appState = JSON.parse(appStateJson);

        if (appState && typeof appState === 'object' && appState.id) {
          currentPlayingTrackId = appState.id;
        }
      } catch (e) {
        // TODO: Process error
      }
    }

    if (deviceState && deviceState.state && deviceState.state.playerState) {
      const playerState = deviceState.state.playerState;
      const extra = playerState.extra;

      currentPlaying = {
        hasState: true,
        playing: deviceState.state.playing,
        cover: extra && extra.coverURI ? `http://${extra.coverURI.replace(/%%/g, 'm1000x1000?webp=false')}` : '',
        title: playerState.title,
        subtitle: playerState.subtitle,
        duration: playerState.duration,
        progress: playerState.progress,
        volume: deviceState.state.volume,
        id: currentPlayingTrackId,
      };
    }

    if (typeof deviceState === 'object') {
      const [state, setState] = this.props.sharedState;
      setState({ currentPlaying, deviceStatus: 'connected' });
    }
  }

  public tryToReconnect(bound?: Function): void {
    if (bound) {
      return;
    }

    const [state] = this.props.sharedState;

    if (state.deviceStatus === 'disconnected' && state.selectedDevice) {
      this.connectToDevice(state.selectedDevice);
    }
  }

  componentDidMount(): void {
    YandexStation.on('connecting', this.connecting.bind(this));
    YandexStation.on('connected', this.connected.bind(this));
    YandexStation.on('disconnected', this.disconnected.bind(this));
    YandexStation.on('state', this.setDeviceState.bind(this));

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    setInterval(this.tryToReconnect.bind(this), 5000);

    setTimeout(() => {
      this.loadDevices();
    }, 500);
  }

  componentWillUnmount(): void {
    YandexStation.off('connecting', this.connecting.bind(this));
    YandexStation.off('connected', this.connected.bind(this));
    YandexStation.off('disconnected', this.disconnected.bind(this));
    YandexStation.off('state', this.setDeviceState.bind(this));

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
  }

  render() {
    return (
      this.props.children
    )
  }
}

export default (props: any) => {
  const sharedState = useSharedState();

  const trackState = () => {
    for (const v of Object.values(sharedState[0])) {
      v;
    }
  }

  trackState();

  return <DeviceProvider sharedState={sharedState} {...props} />;
};

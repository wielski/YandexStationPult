import React, { Component } from 'react';
import { View } from 'native-base';

import { useSharedState } from '../store';
import { debounce } from '../helpers';
import { CurrentPlaying, CurrentState, Device } from '../models';

import GlagolApi from '../Api/GlagolApi';
import YandexStation from '../Api/YandexStation';

interface DeviceProviderProps {
  sharedState: ReturnType<typeof useSharedState>,
  children: any,
};

const glagolApi = new GlagolApi();

class DeviceProvider extends Component<DeviceProviderProps> {
  constructor(props: DeviceProviderProps) {
    super(props);
  }

  public async loadDevices(): Promise<void> {
    const [state, setState] = this.props.sharedState;

    const devices = await glagolApi.getDeviceList();

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

    setState({ ...state, ...newState });

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
        setState({ ...state, deviceStatus: 'disconnected' })
      }
    }, 500);
  }

  public connecting(bound?: Function): void {
    if (bound) {
      return;
    }

    const [state, setState] = this.props.sharedState;
    setState({ ...state, deviceStatus: 'connecting' });
  }

  public connected(bound?: Function): void {
    if (bound) {
      return;
    }

    const [state, setState] = this.props.sharedState;
    setState({ ...state, deviceStatus: 'connected' });

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
    setState({ ...state, deviceStatus: 'disconnected' });
  }

  public setDeviceState(deviceState: CurrentState): void {
    if (typeof deviceState === 'function') {
      return;
    }

    let currentPlaying: CurrentPlaying = {
      hasState: false,
    };

    if (deviceState && deviceState.state && deviceState.state.playerState) {
      const playerState = deviceState.state.playerState;

      currentPlaying = {
        hasState: true,
        playing: deviceState.state.playing,
        cover: playerState.extra.coverURI ? `http://${playerState.extra.coverURI.replace(/%%/g, 'm1000x1000?webp=false')}` : '',
        title: playerState.title,
        subtitle: playerState.subtitle,
        duration: playerState.duration,
        progress: playerState.progress,
        volume: deviceState.state.volume,
      };
    }

    if (typeof deviceState === 'object') {
      const [state, setState] = this.props.sharedState;
      setState({ ...state, currentPlaying, deviceStatus: 'connected' });
    }
  }
  setDeviceStateDebounce = debounce(this.setDeviceState, 2000, { isImmediate: true });

  componentDidMount(): void {
    YandexStation.on('connecting', this.connecting.bind(this));
    YandexStation.on('connected', this.connected.bind(this));
    YandexStation.on('disconnected', this.disconnected.bind(this));
    YandexStation.on('state', this.setDeviceStateDebounce.bind(this));

    this.loadDevices();
  }

  componentWillUnmount(): void {
    YandexStation.off('connecting', this.connecting.bind(this));
    YandexStation.off('connected', this.connected.bind(this));
    YandexStation.off('disconnected', this.disconnected.bind(this));
    YandexStation.off('state', this.setDeviceStateDebounce.bind(this));
  }

  render() {
    return (
      <View>
        {this.props.children}
      </View>
    )
  }
}

export default (props: any) => {
  return <DeviceProvider sharedState={useSharedState()} {...props} />;
};

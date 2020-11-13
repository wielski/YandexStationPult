import React, { Component } from 'react';
import { Button, Icon, Picker, View } from 'native-base';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { useSharedState } from '../store';
import GlagolApi from '../Api/GlagolApi';
import YandexStation from '../Api/YandexStation';
import YandexStationNetwork from '../Api/YandexStationNetwork';
import { Device } from '../models';
import { navigate } from '../services/NavigationService';

interface HeaderProps {
  sharedState: ReturnType<typeof useSharedState>,
};

const plus = require('../../assets/plus.png');

export class Header extends Component<HeaderProps> {
  constructor(props: HeaderProps) {
    super(props);
  }

  async updateDevices(): Promise<void> {
    const [state, setState] = this.props.sharedState;
    const devices = await GlagolApi.getDeviceList();

    try {
      YandexStationNetwork.init(devices);
    } catch (e) {
      setState({ devices });
      showMessage({
        message: 'Не удалось подключиться к станции по сети',
        type: 'danger',
      });
      return;
    }

    showMessage({
      message: 'Список станций обновлен',
      type: 'none',
      position: 'bottom',
      floating: true,
    });

    setState({ devices });
  }

  setStation(id: string): void {
    const [state, setState] = this.props.sharedState;
    const device = state.devices.find((d) => d.id === id);

    if (device) {
      setState({ selectedDevice: device });
      this.connectToDevice(device);
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

  render() {
    const [state] = this.props.sharedState;

    let selectedDevice: string = 'no-station-selected';

    if (state.selectedDevice) {
      selectedDevice = state.selectedDevice.id;
    }

    return (
      <View style={styles.header}>
        <View style={styles.container}>
          <View style={styles.picker}>
            <Picker
              textStyle={styles.pickerText}
              iosHeader="Станция"
              headerBackButtonText="Назад"
              mode="dropdown"
              selectedValue={selectedDevice}
              onValueChange={(id) => this.setStation(id)}>
                <Picker.Item key="no-station-selected" label="Выберите станцию" value="no-station-selected" />
                {state.devices.map((device) =>
                  <Picker.Item key={device.id} label={device.name} value={device.id} />
                )}
            </Picker>
          </View>
          <View style={styles.statusBar}>
            {state.deviceStatus === 'connecting' &&
              <ActivityIndicator style={styles.statusConnecting} size="small" color="#6b6f75" />
            }
            {state.deviceStatus === 'connected' &&
              <Icon style={styles.statusConnected} name="ios-wifi" />
            }
            {state.deviceStatus === 'disconnected' &&
              <Icon style={styles.statusDisconnected} name="ios-alert" />
            }
            <Button onPress={() => this.updateDevices()} transparent>
              <Icon style={styles.buttonIcon} name="ios-refresh" />
            </Button>
            { state.info && state.info.uid &&
            <TouchableOpacity style={styles.account} onPress={() => {
              navigate('Account', {})
            }}>
              { state.info.has_plus &&
                <Image source={plus} style={styles.accountPlus}></Image>
              }
              <Image
                style={styles.accountImage}
                source={{
                  uri: state.info.avatar_url,
                }}
              />
            </TouchableOpacity>
            }
          </View>
        </View>
      </View>
    )
  }
}

export default () => {
  const sharedState = useSharedState();

  const trackState = () => {
    for (const v of Object.values(sharedState[0])) {
      v;
    }
  }

  trackState();

  return <Header sharedState={sharedState} />;
};

const styles = StyleSheet.create({
  header: {
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#ebeef2',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecf0',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: {
    width: '50%',
  },
  pickerText: {
    color: '#6b6f75',
  },
  buttonIcon: {
    color: '#6b6f75',
    fontSize: 14,
    padding: 0,
  },
  statusBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusConnecting: {
    padding: 0,
    paddingTop: 2,
  },
  statusConnected: {
    color: '#30d176',
    fontSize: 14,
    padding: 0,
    paddingTop: 2,
  },
  statusDisconnected: {
    color: '#cf2730',
    fontSize: 14,
    padding: 0,
    paddingTop: 2,
  },
  account: {
    marginRight: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountImage: {
    width: 25,
    height: 25,
    borderRadius: 25,
  },
  accountPlus: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

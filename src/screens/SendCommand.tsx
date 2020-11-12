import React, { Component } from 'react';

import { StyleSheet, View } from 'react-native';
import { Body, Button, CheckBox, Input, Item, ListItem, Text } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../Navigation';
import { useSharedState } from '../store';

import YandexStation from '../Api/YandexStation';
import YandexStationNetwork from '../Api/YandexStationNetwork';

type Props = StackScreenProps<RootStackParamList, 'SendCommand'>;
interface SendCommandProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

type State = {
  command: string;
  sendText: boolean;
  focus: boolean;
};

export class SendCommand extends Component<SendCommandProps> {
  state: State = {
    command: '',
    sendText: false,
    focus: false,
  };

  constructor(props: SendCommandProps) {
    super(props);
  }

  public sendText(): void {
    const [state] = this.props.sharedState;

    if (state.deviceStatus === 'disconnected' && state.selectedDevice) {
      try {
        YandexStationNetwork.sendCommand(state.selectedDevice.id, this.state.command, this.state.sendText);
      } catch (e) {
        // TODO: Process error
        console.log(e);
      }

      return;
    }

    const text = this.state.sendText ? `Повтори за мной "${this.state.command}"` : this.state.command;

    YandexStation.sendCommand({
      command: 'sendText',
      text,
    });
  }

  render() {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.content}>
            <Item style={styles.inputItem}>
              <Input
                placeholder="Введите текст команды"
                onFocus={() => {
                  this.setState({...this.state, focus: true });
                }}
                onBlur={() => {
                  this.setState({...this.state, focus: false});
                }}
                onChangeText={command => {
                  this.setState({...this.state, command });
                }}
                defaultValue={this.state.command}
                style={this.state.focus ? styles.inputFocused : styles.input} />
              </Item>

            <ListItem
              style={styles.checkboxItem}
              onPress={() => {
                this.setState({...this.state, sendText: !this.state.sendText });
              }}>
              <CheckBox checked={this.state.sendText} />
              <Body>
                <Text>Воспроизвести текст</Text>
              </Body>
            </ListItem>

            <View style={styles.control}>
              <Button onPress={() => this.sendText()} dark><Text>Отправить</Text></Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default (props: Props) => {
  const sharedState = useSharedState();

  const trackState = () => {
    for (const v of Object.values(sharedState[0])) {
      v;
    }
  }

  trackState();

  return <SendCommand sharedState={sharedState} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    height: '100%',
  },
  content: {
    width: '70%',
  },
  inputItem: {
    borderColor: 'transparent',
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ebeef2',
    color: '#242424',
  },
  inputFocused: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffdc5f',
    color: '#242424',
  },
  checkboxItem: {
    borderColor: 'transparent',
  },
  control: {
    justifyContent: 'center',
    marginTop: 10,
  }
});

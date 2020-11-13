import { debounce } from '../helpers';
import { CurrentState, Device } from '../models';
import WebSocketSecure, { NativeWebSocketModule } from '../modules/WebSocketSecure';

type ConnectedEvent = (bound?: any) => void;
type ConnectingEvent = (bound?: any) => void;
type DisconnectedEent = (bound?: any) => void;
type StateEvent = (currentState: CurrentState) => void;

type EventCallback = ConnectedEvent | ConnectingEvent | DisconnectedEent | StateEvent;
type Event = 'connecting' | 'connected' | 'disconnected' | 'state';

const errorsLog: string[] = [];

class YandexStation {
  private device: Device | null = null;
  private connection: WebSocket | WebSocketSecure | null = null;

  private eventListeners: {
    connecting: ConnectingEvent[],
    connected: ConnectedEvent[],
    disconnected: DisconnectedEent[],
    state: StateEvent[],
  } = {
    connecting: [],
    connected: [],
    disconnected: [],
    state: [],
  };

  getLog(): string[] {
    return [
      `[yandex-station]:`,
      ...errorsLog,
    ];
  }

  public connectToDevice(device: Device) {
    if (!device.ip || !device.port) {
      throw new Error('no ip or port provided');
    }

    this.device = device;

    this.debounceConnect(device);
  }

  public connect(device: Device): void {
    const sendConnectionState = debounce((type) => {
      switch (type) {
        case 'connected':
          this.eventListeners.connected.map((cb) => cb());
          break;
        case 'disconnected': 
          this.eventListeners.disconnected.map((cb) => cb());
          break;
      }
    }, 500);

    this.eventListeners.connecting.map((cb) => cb());

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    let connection: WebSocket | WebSocketSecure;

    if (NativeWebSocketModule) {
      errorsLog.push('[websocket]: using WSSecure module');
      connection = new WebSocketSecure(`wss://${device.ip}:${device.port}/`, [], {
        ca: device.glagol.security.server_certificate,
      });
    } else {
      errorsLog.push('[websocket]: using WS module');
      connection = new WebSocket(`wss://${device.ip}:${device.port}/`);
    }

    connection.onopen = () => {
      sendConnectionState('connected');
    };
    connection.onclose = () => {
      errorsLog.push('[websocket]: disconnected');
      sendConnectionState('disconnected');
    };
    connection.onmessage = (m) => {
      this.eventListeners.state.map((cb) => cb(JSON.parse(m.data) as CurrentState));
    };
    connection.onerror = (e) => {
      console.log('WSError', e);
      errorsLog.push('[websocket]: Error ' + JSON.stringify(e));
    };

    this.connection = connection;
  }
  debounceConnect = debounce(this.connect, 500);

  public on(event: Event, cb: EventCallback) {
    if (this.eventListeners[event].find(cb as ConnectedEvent)) {
      return;
    }

    switch (event) {
      case 'state':
        this.eventListeners.state.push(cb);
        break;
      default:
        this.eventListeners[event].push(cb as ConnectedEvent);
    }
  }

  public off(event: Event, cb: EventCallback) {
    const index = this.eventListeners[event].findIndex(cb as ConnectedEvent);

    if (index > -1) {
      this.eventListeners[event].splice(index, 1);
    }
  }

  public sendCommand(payload: object): void {
    if (this.device && !this.connection) {
      this.connectToDevice(this.device);
    }

    if (this.connection && this.device) {
      this.connection.send(JSON.stringify({
        conversationToken: this.device.token,
        id: this.getUUID(),
        sentTime: new Date().getMilliseconds() * 1000000,
        payload,
      }));
    }
  }

  private getUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default new YandexStation();

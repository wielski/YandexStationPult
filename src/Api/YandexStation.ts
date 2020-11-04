import { debounce } from '../helpers';
import { CurrentState, Device } from '../models';

type ConnectedEvent = (bound?: any) => void;
type ConnectingEvent = (bound?: any) => void;
type DisconnectedEent = (bound?: any) => void;
type StateEvent = (currentState: CurrentState) => void;

type EventCallback = ConnectedEvent | ConnectingEvent | DisconnectedEent | StateEvent;
type Event = 'connecting' | 'connected' | 'disconnected' | 'state';

class YandexStation {
  private device: Device | null = null;
  // private connection: TcpSocket | null = null;
  private connection: WebSocket | null = null;

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

    this.connection = new WebSocket(`wss://${device.ip}:${device.port}/`);

    this.connection.onopen = () => {
      sendConnectionState('connected');
    };
    this.connection.onclose = () => {
      sendConnectionState('disconnected');
    };
    this.connection.onmessage = (m) => {
      this.eventListeners.state.map((cb) => cb(JSON.parse(m.data) as CurrentState));
    };
    this.connection.onerror = (e) => {
      console.log('WSError', e);
    };
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
    // TODO: Send without connection (restricted yandex api)
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

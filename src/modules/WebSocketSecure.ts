import { NativeEventEmitter, EventSubscription, NativeModules } from 'react-native';
import EventTarget from 'event-target-shim';

export const NativeWebSocketModule = NativeModules.WebSocketSecureModule || NativeModules.WebSocketSecure;

const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;

const CLOSE_NORMAL = 1000;

const WEBSOCKET_EVENTS = ['close', 'error', 'message', 'open'];

let nextWebSocketId = 0;

class WebSocketEvent {
  public type!: string;

  constructor(type: string, eventInitDict?: object) {
    this.type = type.toString();
    Object.assign(this, eventInitDict);
  }
}

class WebSocketSecure extends EventTarget(WEBSOCKET_EVENTS) {
  public CONNECTING: number = CONNECTING;
  public OPEN: number = OPEN;
  public CLOSING: number = CLOSING;
  public CLOSED: number = CLOSED;

  private socketId: number;
  private eventEmitter: NativeEventEmitter;
  private subscriptions: Array<EventSubscription> = [];
  public binaryType?: BinaryType;

  public onclose?: Function;
  public onerror?: Function;
  public onmessage?: Function;
  public onopen?: Function;

  public extension?: string;
  public protocol?: string;
  public readyState: number = CONNECTING;
  public url?: string;

  constructor(
    url: string,
    protocols?: string | string[] | null,
    options?: {
      headers?: object,
      ca?: string,
      pfx?: string,
      passphrase?: string
    },
  ) {
    super();
    if (typeof protocols === 'string') {
      protocols = [protocols];
    }

    if (!Array.isArray(protocols)) {
      protocols = null;
    }

    this.eventEmitter = new NativeEventEmitter(NativeWebSocketModule);
    this.socketId = nextWebSocketId++;
    this._registerEvents();
    NativeWebSocketModule.connect(url, protocols, options, this.socketId);
  }

  close(code?: number, reason?: string): void {
    if (this.readyState === this.CLOSING || this.readyState === this.CLOSED) {
      return;
    }

    this.readyState = this.CLOSING;
    this._close(code, reason);
  }

  send(data: string): void {
    if (this.readyState === this.CONNECTING) {
      throw new Error('INVALID_STATE_ERR');
    }

    if (typeof data === 'string') {
      NativeWebSocketModule.send(data, this.socketId);
      return;
    }

    throw new Error('Unsupported data type');
  }

  ping(): void {
    if (this.readyState === this.CONNECTING) {
      throw new Error('INVALID_STATE_ERR');
    }

    NativeWebSocketModule.ping(this.socketId);
  }

  _close(code?: number, reason?: string): void {
    const statusCode = typeof code === 'number' ? code : CLOSE_NORMAL;
    const closeReason = typeof reason === 'string' ? reason : '';
    NativeWebSocketModule.close(statusCode, closeReason, this.socketId);
  }

  _unregisterEvents(): void {
    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];
  }

  _registerEvents(): void {
    this.subscriptions = [
      this.eventEmitter.addListener('websocketMessage', ev => {
        if (ev.id !== this.socketId) {
          return;
        }
        let data = ev.data;
        this.dispatchEvent(new WebSocketEvent('message', { data }));
      }),

      this.eventEmitter.addListener('websocketOpen', ev => {
        if (ev.id !== this.socketId) {
          return;
        }
        this.readyState = this.OPEN;
        this.protocol = ev.protocol;
        this.dispatchEvent(new WebSocketEvent('open'));
      }),

      this.eventEmitter.addListener('websocketClosed', ev => {
        if (ev.id !== this.socketId) {
          return;
        }
        this.readyState = this.CLOSED;
        this.dispatchEvent(
          new WebSocketEvent('close', {
            code: ev.code,
            reason: ev.reason,
          }),
        );
        this._unregisterEvents();
        this.close();
      }),

      this.eventEmitter.addListener('websocketFailed', ev => {
        if (ev.id !== this.socketId) {
          return;
        }
        console.log(ev);
        this.readyState = this.CLOSED;
        this.dispatchEvent(
          new WebSocketEvent('error', {
            message: ev.message,
          }),
        );
        this.dispatchEvent(
          new WebSocketEvent('close', {
            message: ev.message,
          }),
        );
        this._unregisterEvents();
        this.close();
      }),
    ];
  }
}

export default WebSocketSecure;

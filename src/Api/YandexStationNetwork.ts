import CookieManager from '@react-native-community/cookies';
import RNFetchBlob from 'rn-fetch-blob';
import AccessTokenStorage from './AccessTokenStorage';
import { Device } from '../models';

const API_BASE_URL = 'https://iot.quasar.yandex.ru/';

type Scenario = {
  id: string;
  name: string;
  deviceId: string;
  icon: string;
};

type DeviceMap = {
  id: string;
  quasarId: string;
}

const errorsLog: string[] = [];

class YandexStationNetwork {
  private scenarios: Record<string, Scenario> = {};

  getLog(): string[] {
    return [
      `[yandex-station-network]:`,
      ...errorsLog,
    ];
  }

  public async init(devices: Device[]): Promise<void> {
    let scenarios = await this.loadScenarios();
    let deviceMap = await this.loadDevices();
    const createScenarioFor: string[] = [];

    for (const device of devices) {
      const quasarDevice = deviceMap.find((m) => m.quasarId === device.id);

      if (quasarDevice && !scenarios.find((s) => s.name === this.encodeUUID(quasarDevice.id))) {
        createScenarioFor.push(quasarDevice.id);
      }
    }

    if (createScenarioFor.length > 0) {
      for (const deviceId of createScenarioFor) {
        await this.createEmptyScenario(deviceId);
      }

      scenarios = await this.loadScenarios();
    }

    for (const device of devices) {
      const quasarDevice = deviceMap.find((m) => m.quasarId === device.id);

      if (quasarDevice) {
        const scenario = scenarios.find((s) => s.name === this.encodeUUID(quasarDevice.id));

        if (scenario) {
          this.scenarios[device.id] = {
            id: scenario.id,
            name: this.encodeUUID(quasarDevice.id),
            deviceId: quasarDevice.id,
            icon: scenario.icon,
          };
        }
      }
    }
  }

  public async runScenario(scenarioId: string): Promise<boolean> {
    const runReq = await this.post(`m/user/scenarios/${scenarioId}/actions`);
    const runJson = await runReq.json();

    if (runJson.status !== 'ok') {
      return false;
    }

    return true;
  }

  public async sendCommand(deviceId: string, command: string, sayText?: boolean): Promise<boolean> {
    const scenario = this.scenarios[deviceId];

    if (!scenario) {
      errorsLog.push('no scenario found');
      throw new Error('no scenario found');
    }

    const payload = {
      name: scenario.name,
      icon: 'station',
      trigger_type: 'scenario.trigger.voice',
      requested_speaker_capabilities: [],
      devices: [{
        id: scenario.deviceId,
        capabilities: [{
          type: 'devices.capabilities.quasar.server_action',
          state: {
            instance: sayText ? 'phrase_action' : 'text_action',
            value: command,
          },
        }],
      }],
    };

    const req = await this.put(`m/user/scenarios/${scenario.id}`, payload);
    const json = await req.json();

    if (json.status !== 'ok') {
      return false;
    }

    const runReq = await this.post(`m/user/scenarios/${scenario.id}/actions`);
    const runJson = await runReq.json();

    if (runJson.status !== 'ok') {
      return false;
    }

    return true;
  }

  public async loadScenarios(): Promise<Scenario[]> {
    const req = await this.get('m/user/scenarios');
    const json = await req.json();

    if (!Array.isArray(json.scenarios)) {
      return [];
    }

    return json.scenarios.map((scenario: Scenario) => {
      return {
        id: scenario.id,
        name: scenario.name,
        icon: scenario.icon,
      };
    });
  }

  private async loadDevices(): Promise<DeviceMap[]> {
    const req = await this.get('m/user/devices');
    const json = await req.json();

    if (!Array.isArray(json.rooms)) {
      return [];
    }

    const deviceMap: DeviceMap[] = [];

    json.rooms.forEach((room: any) => {
      if (Array.isArray(room.devices)) {
        room.devices.forEach((device: any) => {
          if (device.quasar_info && device.quasar_info.device_id) {
            deviceMap.push({
              id: device.id,
              quasarId: device.quasar_info.device_id,
            });
          }
        });
      }
    });

    return deviceMap;
  }

  private async createEmptyScenario(deviceId: string): Promise<boolean> {
    const payload = {
      name: this.encodeUUID(deviceId),
      icon: 'station',
      trigger_type: 'scenario.trigger.voice',
      requested_speaker_capabilities: [],
      devices: [{
        id: deviceId,
        capabilities: [{
          type: 'devices.capabilities.quasar.server_action',
          state: {
            instance: 'text_action',
            value: 'пустышка',
          },
        }],
      }],
    };

    const req = await this.post('m/user/scenarios', payload);
    const json = await req.json();

    if (json.status === 'ok') {
      return true;
    }

    errorsLog.push('cant create empty scenario: ' + req.status);
    return false;
  }

  private async getCSRFToken(): Promise<string> {
    const req = () => RNFetchBlob.config({
      trusty : true
    }).fetch(
      'GET',
      'https://yandex.ru/quasar/iot',
    ).then(async (resp) => {
      const cookie = resp.info().headers['set-cookie'];
  
      if (cookie) {
        await CookieManager.setFromResponse(API_BASE_URL, cookie);
      }

      if (resp.info().status === 200) {
        const text = await resp.text();
        const match = text.match(/"csrfToken2":"(.+?)"/);

        if (match) {
          return match[1];
        }
      }

      throw resp;
    });

    return req();
  }

  private async loginByToken(): Promise<boolean> {
    const token = await AccessTokenStorage.getMainToken();

    if (!token) {
      throw new Error('no token provided');
    }

    await CookieManager.clearAll();

    // auth
    const payload = [
      { name: 'type', data: 'x-token' },
      { name: 'retpath', data: 'https://www.yandex.ru/androids.txt' },
    ];
    const headers = {
      'Ya-Consumer-Authorization': `OAuth ${token}`,
    };

    const response = await RNFetchBlob.config({
      trusty : true
    }).fetch(
      'POST',
      'https://mobileproxy.passport.yandex.net/1/bundle/auth/x_token/',
      headers,
      payload,
    );

    const resp = await response.json();

    // get session
    if (resp.status === 'ok' && resp.passport_host) {
      const host = resp.passport_host;

      const authResponse = await RNFetchBlob.config({
        trusty : true
      }).fetch(
        'GET',
        `${host}/auth/session/?track_id=${resp.track_id}`
      );

      const authCookie = authResponse.info().headers['set-cookie'];
  
      if (authCookie) {
        return true;
      }
    }

    return false;
  }

  private encodeUUID(uuid: string): string {
    const en = '0123456789abcdef-';
    const ru = 'оеаинтсрвлкмдпуяы';

    return `ПУ ${[Array.from(uuid).map((s) => ru[en.indexOf(s)]).join('')]}`;
  }

  private get(path: string): Promise<any> {
    return this.req('GET', path);
  }

  private post(path: string, payload?: object): Promise<any> {
    return this.req('POST', path, payload);
  }

  private put(path: string, payload?: object): Promise<any> {
    return this.req('PUT', path, payload);
  }

  private async req(method: 'GET' | 'POST' | 'PUT', path: string, payload?: object): Promise<any> {
    const headers: Record<string, string> = {};

    if (method !== 'GET') {
      headers['x-csrf-token'] = await this.getCSRFToken();
    }

    let stringPayload: string | undefined = undefined;

    if (payload) {
      stringPayload = JSON.stringify(payload);
    }

    const sendRequest = async () => RNFetchBlob.config({
      trusty : true
    }).fetch(
      method,
      `${API_BASE_URL}${path}`,
      headers,
      stringPayload,
    ).then(async (resp) => {
      if (resp.info().status === 200) {
        return resp;
      }

      throw resp;
    });

    return sendRequest().catch(async (e) => {
      if (e.info().status === 401) {
        const loggedIn = await this.loginByToken();

        if (loggedIn) {
          return sendRequest();
        }
      }

      errorsLog.push('Request error: ' + e.info().status);
      throw new Error(`Error ${e.info().status}`);
    });
  }
}

export default new YandexStationNetwork();

import Zeroconf from 'react-native-zeroconf';
import AccessTokenStorage from './AccessTokenStorage';
import { Device } from '../models';
import RNFetchBlob from 'rn-fetch-blob';

const GLAGOL_API_BASE_URL = 'https://quasar.yandex.net/glagol';

type LocalDevice = {
  port: number;
  txt: {
    deviceId: string;
    platform: string;
  },
  addresses: string[];
  name: string;
  fullName: string;
  host: string;
};

const zeroconf = new Zeroconf();

const foundDevicesLog: string[] = [];
const resolvedDevicesLog: LocalDevice[] = [];
const zeroconfErrorsLog: string[] = [];
const errorsLog: string[] = [];

class GlagolApi {
  private zeroconfTimeout: NodeJS.Timeout | null = null;

  constructor() {
    zeroconf.on('error', err => {
      console.log('[Zeroconf Error]', err);
      zeroconf.stop();
      zeroconf.removeDeviceListeners();

      zeroconfErrorsLog.push(String(err));
    });

    zeroconf.on('found', (found) => {
      foundDevicesLog.push(found);
    });
  }

  getLog(): string[] {
    const resolvedDevices = resolvedDevicesLog.map((d) => `${d.name} (${d.txt.deviceId}) - ${d.host}:${d.port}`);

    return [
      `[zeroconf-found]:`,
      ...foundDevicesLog,
      `[zeroconf-resolved]:`,
      ...resolvedDevices,
      `[zeroconf-errors]:`,
      ...zeroconfErrorsLog,
      `[glagol-errors]:`,
      ...errorsLog,
    ];
  };

  async getDeviceList(): Promise<Device[]> {
    const token = await AccessTokenStorage.getToken();

    if (!token) {
      throw new Error('No token provided');
    }

    return RNFetchBlob.config({
      trusty : true
    }).fetch(
      'GET',
      `${GLAGOL_API_BASE_URL}/device_list`,
      {
        'Authorization': `Oauth ${token}`,
        'Content-Type': 'application/json',
      }
    ).then(async (resp) => {
      if (resp.info().status == 200) {
        const json = await resp.json();

        if (json && json.devices && Array.isArray(json.devices) && json.devices.length > 0) {
          return json.devices;
        }

        errorsLog.push('No devices found');
        throw new Error('No devices found');
      }

      errorsLog.push('Cant load device list: ' + resp.info().status);
      throw new Error('Cant load device list');
    }).then((devices): Device[] => {
      return Promise.all(devices.map(async (device: Device) => {
        return {
          ...device,
          token: await this.getDeviceToken(device),
        };
      })) as unknown as Device[];
    }).then(async (devices) => {
      const localDevices = await this.getLocalDevices(devices);

      localDevices.forEach((d) => resolvedDevicesLog.push(d));

      return devices.map((device: Device) => {
        const localDevice = localDevices.find((d) => d.txt && d.txt.deviceId === device.id);

        return {
          ...device,
          ip: localDevice && localDevice.addresses && localDevice.addresses[0] ? localDevice.addresses[0] : undefined,
          port: localDevice && localDevice.port ? localDevice.port : undefined,
        };
      });
    });
  }

  async getDeviceToken(device: Device): Promise<string> {
    const token = await AccessTokenStorage.getToken();

    return RNFetchBlob.config({
      trusty : true
    }).fetch(
      'GET',
      `${GLAGOL_API_BASE_URL}/token?device_id=${device.id}&platform=${device.platform}`,
      {
        'Authorization': `Oauth ${token}`,
        'Content-Type': 'application/json',
      }
    ).then(async (resp) => {
      if (resp.info().status) {
        const json = await resp.json();

        if (json && json.token) {
          return json.token;
        }

        errorsLog.push('No token found for device: ' + JSON.stringify(json));
        throw new Error('No token found');
      }

      errorsLog.push('No token found for device: ' + resp.info().status);
      throw new Error('Cant load token');
    });
  }

  getLocalDevices(devices: Device[]): Promise<LocalDevice[]> {
    return new Promise((resolve, reject) => {
      const deviceIds = devices.map((d) => d.id);  
      const localDevices: LocalDevice[] = [];

      if (deviceIds.length === 0) {
        errorsLog.push('Device ids is empty');
        resolve([]);
        return;
      }

      zeroconf.on('resolved', (service) => {
        const localDevice = service as LocalDevice;

        if (localDevice.txt && deviceIds.includes(localDevice.txt.deviceId)) {
          localDevices.push(localDevice);
          deviceIds.splice(deviceIds.indexOf(localDevice.txt.deviceId), 1);

          if (deviceIds.length === 0) {
            resolve(localDevices);
            zeroconf.stop();
            zeroconf.removeDeviceListeners();
          }
        } else if(localDevice.name) {
          const id = localDevice.name.replace(/YandexIOReceiver-/g, '');

          if (deviceIds.includes(id)) {
            localDevice.txt.deviceId = id;

            localDevices.push(localDevice);
            deviceIds.splice(deviceIds.indexOf(id), 1);

            if (deviceIds.length === 0) {
              resolve(localDevices);
              zeroconf.stop();
              zeroconf.removeDeviceListeners();
            }
          }
        }
      });

      this.startScanning('yandexio').then(() => {
        if (deviceIds.length > 0) {
          this.startScanning('linkplay'); // support for irbis
        }
      });

      setTimeout(() => {
        resolve(localDevices);
        zeroconf.stop();
        zeroconf.removeDeviceListeners();
      }, 6000);
    });
  }

  startScanning(service: string): Promise<void> {
    return new Promise((resolve) => {
      zeroconf.scan(service, 'tcp', 'local.');

      if (this.zeroconfTimeout) {
        clearTimeout(this.zeroconfTimeout);
      }
  
      this.zeroconfTimeout = setTimeout(() => {
        zeroconf.stop();
        zeroconf.removeDeviceListeners();
        resolve();
      }, 3000);
    });
  }
}

export default new GlagolApi();

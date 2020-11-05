import AccessTokenStorage from './AccessTokenStorage';
import { Account } from '../models';

const API_BASE_URL = 'https://api.music.yandex.net/';

export default class YandexMusicApi {
  public async getAccount(): Promise<Account> {
    const accountStatus = await this.get('/account/status');

    return {
      id: accountStatus.account.uid,
      name: accountStatus.account.displayName,
    };
  }

  public async getLikedTracks(userId: number): Promise<number[]> {
    const likesTracks = await this.get(`/users/${userId}/likes/tracks?if-modified-since-revision=0`);

    return likesTracks.library.tracks.map((track: { id: string }) => parseInt(track.id, 10));
  }

  public async likeTrack(userId: number, trackId: number): Promise<void> {
    await this.post(`/users/${userId}/likes/tracks/add-multiple`, `track-ids=${trackId}`);
  }

  public async dislikeTrack(userId: number, trackId: number): Promise<void> {
    await this.post(`/users/${userId}/likes/tracks/remove`, `track-ids=${trackId}`);
  }

  private async post(path: string, payload: string): Promise<any> {
    const token = await AccessTokenStorage.getToken();

    return fetch(`${API_BASE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${token}`,
        'X-Yandex-Music-Client': 'YandexMusicAndroid',
        'User-Agent': 'Yandex-Music-API',
      },
      body: payload,
    }).then(async (resp) => {
      if (resp.ok) {
        const json = await resp.json();
        return json.result;
      }

      throw new Error(`Error ${resp.status}`);
    });
  }

  private async get(path: string): Promise<any> {
    const token = await AccessTokenStorage.getToken();

    return fetch(`${API_BASE_URL}/${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${token}`,
        'X-Yandex-Music-Client': 'YandexMusicAndroid',
        'User-Agent': 'Yandex-Music-API',
      },
    }).then(async (resp) => {
      if (resp.ok) {
        const json = await resp.json();
        return json.result;
      }

      throw new Error(`Error ${resp.status}`);
    });
  }
}

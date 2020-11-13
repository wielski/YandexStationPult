import AccessTokenStorage from './AccessTokenStorage';
import { Account, Track, Playlist } from '../models';

const API_BASE_URL = 'https://api.music.yandex.net/';

const mapTrack = (track: any): Track => {
  let subtitle: string = '';

  if (track.artists && Array.isArray(track.artists)) {
    subtitle = track.artists.map((a: any) => a.name).join(', ');
  }

  return {
    id: track.id as number,
    title: track.title as string,
    subtitle: subtitle as string,
    duration: track.durationMs as number,
    cover: track.coverUri as string,
  };
}

class YandexMusicApi {
  public async getAccount(): Promise<Account> {
    const accountStatus = await this.get('/account/status');

    return {
      id: accountStatus.account.uid,
      name: accountStatus.account.displayName,
    };
  }

  public async getLikedTrackIds(userId: number): Promise<number[]> {
    const likesTracks = await this.get(`/users/${userId}/likes/tracks?if-modified-since-revision=0`);

    return likesTracks.library.tracks.map((track: { id: string }) => parseInt(track.id, 10));
  }

  public async likeTrack(userId: number, trackId: number): Promise<void> {
    await this.post(`/users/${userId}/likes/tracks/add-multiple`, `track-ids=${trackId}`);
  }

  public async dislikeTrack(userId: number, trackId: number): Promise<void> {
    await this.post(`/users/${userId}/likes/tracks/remove`, `track-ids=${trackId}`);
  }

  public async getPlaylists(userId: number): Promise<Playlist[]> {
    const playlists = await this.get(`/users/${userId}/playlists/list`);

    if (Array.isArray(playlists)) {
      return playlists.map((playlist: any): Playlist => {
        return {
          id: playlist.uid,
          kind: playlist.kind,
          name: playlist.title,
          cover: playlist.ogImage,
          trackCount: playlist.trackCount,
        };
      });
    }

    return [];
  }

  public async getPlaylistTracks(userId: number, kind: number = 3): Promise<Track[]> {
    const response = await this.get(`/users/${userId}/playlists/${kind}`);

    if (Array.isArray(response.tracks)) {
      return response.tracks.map((t: any) => mapTrack(t.track));
    }

    return [];
  }

  public async searchTracks(query: string): Promise<Track[]> {
    const response = await this.get(`/search?text=${query}&nocorrect=true&type=track&page=0&playlist-in-best=false`);
    
    if (Array.isArray(response.tracks.results)) {
      return response.tracks.results.map(mapTrack);
    }

    return [];
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

export default new YandexMusicApi();

export type Account = {
  id: number;
  name: string;
};

export type Device = {
  activation_code: number;
  activation_region: string;
  config: {
    name: string;
  };
  glagol: {
    security:{
      server_certificate: string;
      server_private_key: string;
    }
  };
  id: string;
  name: string;
  platform: string;
  promocode_activated: string;
  tags: string[];
  token?: string;
  ip?: string;
  port?: number;
};

export type CurrentState = {
  extra: {
    appState: string;
    watchedVideoState: string;
  };
  id: string;
  sentTime: string;
  state: {
    aliceState: 'IDLE' | 'BUSY' | 'LISTENING';
    canStop: boolean;
    playerState: {
      duration: number;
      extra: {
        coverURI: string;
        stateType: 'music';
      };
      hasNext: false;
      hasPause: false;
      hasPlay: false;
      hasPrev: true;
      hasProgressBar: true;
      liveStreamText: string;
      progress: number;
      showPlayer: boolean;
      subtitle: string;
      title: string;
    };
    playing: boolean;
    timeSinceLastVoiceActivity: number;
    volume: number;
  };
}

export type CurrentPlaying = {
  hasState: false;
} | {
  hasState: true;
  playing: boolean;
  cover?: string | null;
  title?: string;
  subtitle?: string;
  duration?: number;
  progress?: number;
  volume?: number;
  id?: number;
};

export type Playlist = {
  id: number;
  kind: number;
  name: string;
  cover: string;
};

export type Track = {
  id: number;
  title: string;
  subtitle: string;
  duration: number;
  cover: string;
};

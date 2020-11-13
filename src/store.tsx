import { useReducer } from 'react';
import { createContainer } from 'react-tracked';
import { Device, CurrentState, CurrentPlaying, Account, AccountInfo } from './models';

type State = {
  devices: Device[],
  selectedDevice: Device | null,
  deviceStatus: 'connecting' | 'connected' | 'disconnected',
  deviceState: Partial<CurrentState>,
  currentPlaying: CurrentPlaying,
  authToken: string | null,
  mainToken: string | null,
  //
  account: Account | null,
  info: AccountInfo | null,
  likedTracks: number[],
};

const initialState: State = {
  devices: [],
  selectedDevice: null,
  deviceStatus: 'disconnected',
  deviceState: {},
  currentPlaying: { hasState: false },
  authToken: null,
  mainToken: null,
  // account info
  account: null,
  info: null,
  likedTracks: [],
};

const useMyState = () => useReducer(reducer, initialState);

export const reducer = (state: State, newState: Partial<State>) => {
  return {...state, ...newState};
};

export const {
  Provider: SharedStateProvider,
  useTracked: useSharedState,
} = createContainer(useMyState);

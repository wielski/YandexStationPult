import { useState } from 'react';
import { createContainer } from 'react-tracked';
import { Device, CurrentState, CurrentPlaying, Account } from './models';

const initialState: {
  devices: Device[],
  selectedDevice: Device | null,
  deviceStatus: 'connecting' | 'connected' | 'disconnected',
  deviceState: Partial<CurrentState>,
  currentPlaying: CurrentPlaying,
  authToken: string | null,
  //
  account: Account | null,
  likedTracks: number[],
} = {
  devices: [],
  selectedDevice: null,
  deviceStatus: 'disconnected',
  deviceState: {},
  currentPlaying: { hasState: false },
  authToken: null,
  // account info
  account: null,
  likedTracks: [],
};

const useMyState = () => useState(initialState);

export const {
  Provider: SharedStateProvider,
  useTracked: useSharedState,
} = createContainer(useMyState);

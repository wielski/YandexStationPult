import { useState } from 'react';
import { createContainer } from 'react-tracked';
import { Device, CurrentState, CurrentPlaying } from './models';

const initialState: {
  devices: Device[],
  selectedDevice: Device | null,
  deviceStatus: 'connecting' | 'connected' | 'disconnected',
  deviceState: Partial<CurrentState>,
  currentPlaying: CurrentPlaying,
  authToken: string | null,
} = {
  devices: [],
  selectedDevice: null,
  deviceStatus: 'disconnected',
  deviceState: {},
  currentPlaying: { hasState: false },
  authToken: null,
};

const useMyState = () => useState(initialState);

export const {
  Provider: SharedStateProvider,
  useTracked: useSharedState,
} = createContainer(useMyState);

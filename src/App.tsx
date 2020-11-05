import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, NavigationState, PartialState } from '@react-navigation/native';

import { SharedStateProvider } from './store';
import Navigator from './Navigation';
import DeviceProvider from './components/DeviceProvider';
import Footer from './components/Footer';

import { navigationRef } from './services/NavigationService';

export default function App() {
  const [routeName, setRouteName] = useState('');

  const getActiveRouteName = (state: NavigationState | PartialState<NavigationState>): string => {
    const route = state.routes[state?.index || 0];

    if (route.state) {
      return getActiveRouteName(route.state);
    }

    return route.name;
  };

  return (
    <SharedStateProvider>
      <StatusBar barStyle="dark-content" translucent={true} />
      <DeviceProvider>
        <NavigationContainer
        ref={navigationRef}
        onStateChange={(state) => {
          if (!state) return;
          setRouteName(getActiveRouteName(state));
        }}>
          <Navigator />
        </NavigationContainer>
        <Footer routeName={routeName} />
      </DeviceProvider>
    </SharedStateProvider>
  );
}

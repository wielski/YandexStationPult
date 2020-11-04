import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { SharedStateProvider } from './store';
import Navigator from './Navigation';
import DeviceProvider from './components/DeviceProvider';

export default function App() {
  return (
    <SharedStateProvider>
      <StatusBar barStyle="dark-content" translucent={true} />
      <DeviceProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </DeviceProvider>
    </SharedStateProvider>
  );
}

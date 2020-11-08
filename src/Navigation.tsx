import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
 
import Main from './screens/Main';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Playlists from './screens/Playlists';
import Playlist from './screens/Playlist';
import SendCommand from './screens/SendCommand';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Dashboard: undefined,
  Playlists: undefined,
  Playlist: {
    kind: number;
  },
  SendCommand: undefined,
};

const Stack = createStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{ gestureEnabled: true, headerShown: false }}
    >
      <Stack.Screen
        name="Main"
        component={Main}
        options={{ title: 'Main' }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="Playlists"
        component={Playlists}
        options={{ title: 'Playlists' }}
      />
      <Stack.Screen
        name="Playlist"
        component={Playlist}
        options={{ title: 'Playlist' }}
      />
      <Stack.Screen
        name="SendCommand"
        component={SendCommand}
        options={{ title: 'SendCommand' }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;

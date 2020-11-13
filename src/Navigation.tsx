import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
 
import Main from './screens/Main';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Playlists from './screens/Playlists';
import Playlist from './screens/Playlist';
import SendCommand from './screens/SendCommand';
import Account from './screens/Account';
import Home from './screens/Home';
import Log from './screens/Log';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Dashboard: undefined,
  Playlists: undefined,
  Playlist: {
    kind: number;
  },
  SendCommand: undefined,
  Account: undefined,
  Home: undefined,
  Log: undefined,
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
      <Stack.Screen
        name="Account"
        component={Account}
        options={{ title: 'Account' }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name="Log"
        component={Log}
        options={{ title: 'Log' }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
 
import Main from './screens/Main';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Dashboard: undefined,
};

const Stack = createStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{ gestureEnabled: false, headerShown: false }}
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
    </Stack.Navigator>
  );
};

export default RootStack;

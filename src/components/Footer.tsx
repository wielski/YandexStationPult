import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigate } from '../services/NavigationService';

type Props = {
  routeName: string;
};

const Tab = ({ name, icon, route, selected }: { name: string, icon: string, route: string, selected: boolean }) => {
  return (
    <TouchableOpacity style={selected ? styles.activeTab : styles.tab} onPress={() => navigate(route, {})}>
      <Icon style={selected ? styles.activeIcon : styles.icon} name={icon}></Icon>
      <Text style={selected ? styles.activeName : styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const Footer = (props: Props) => {
  if (['Main', 'Login'].includes(props.routeName) || props.routeName.length === 0) {
    return null;
  }

  let selected: string = '';

  if (props.routeName === 'Dashboard') {
    selected = 'Dashboard';
  }

  if (['Playlists'].includes(props.routeName)) {
    selected = 'Playlists';
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView>
        <View style={styles.tabs}>
          <Tab name="Пульт" icon="radio" route="Dashboard" selected={selected === 'Dashboard'}></Tab>
          <Tab name="Музыка" icon="play-circle" route="Playlists" selected={selected === 'Playlists'}></Tab>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ededed',
  },
  tabs: {
    borderTopColor: '#e8e8e8',
    borderTopWidth: 1,
    backgroundColor: '#ededed',
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tab: {
    borderRadius: 5,
    width: 70,
    flexDirection: 'column',
    alignItems: 'center',
  },
  activeTab: {
    borderRadius: 5,
    width: 70,
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  activeIcon: {
    fontSize: 32,
    color: '#6839cf',
  },
  name: {
    fontSize: 11,
  },
  activeName: {
    fontSize: 11,
    color: '#6839cf',
  }
});

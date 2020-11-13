import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

  let selected: string = props.routeName;

  if (['Playlists', 'Playlist'].includes(props.routeName)) {
    selected = 'Playlists';
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.scroll} horizontal={true} alwaysBounceHorizontal={false}>
          <View style={styles.tabs}>
            <Tab name="Пульт" icon="ios-radio" route="Dashboard" selected={selected === 'Dashboard'}></Tab>
            <Tab name="Музыка" icon="ios-play-circle" route="Playlists" selected={selected === 'Playlists'}></Tab>
            <Tab name="Мой дом" icon="ios-apps" route="Home" selected={selected === 'Home'}></Tab>
            <Tab name="Команды" icon="ios-send" route="SendCommand" selected={selected === 'SendCommand'}></Tab>
            <Tab name="Лог" icon="ios-bug" route="Log" selected={selected === 'Log'}></Tab>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ededed',
  },
  scroll: {
    minWidth: '100%',
    justifyContent: 'center',
  },
  tabs: {
    borderTopColor: '#e8e8e8',
    borderTopWidth: 1,
    backgroundColor: '#ededed',
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 60,
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
    color: '#000000',
  },
  activeName: {
    fontSize: 11,
    color: '#6839cf',
  }
});

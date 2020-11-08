import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Icon } from 'native-base';

type Props = {
  onClear: () => void,
  onSearch: (text: string) => void,
  style?: object,
};

const SearchBar = (props: Props) => {
  const [value, setValue] = useState('');

  const onChange = (text: string) => {
    setValue(text);

    if (!text || text.length === 0) {
      props.onClear();
    } else {
      props.onSearch(text);
    }
  }

  const onClear = () => {
    setValue('');
    props.onClear();
  }

  return (
    <View style={{...styles.searchBar, ...(props.style || {})}}>
      <TextInput
        style={styles.textInput}
        onChangeText={text => onChange(text)}
        value={value}
        placeholder="Поиск"
        placeholderTextColor="#7f8387"
      />
      { value.length > 0 ?
      <TouchableOpacity style={styles.clearButton} onPress={() => onClear()}>
        <Icon style={styles.clearButtonIcon} name="close"></Icon>
      </TouchableOpacity>
      : null}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchBar: {
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#ebeef2',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecf0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInput: {
    color: '#000',
    height: 50,
    padding: 10,
    width: '80%',
  },
  clearButton: {
    paddingRight: 20,
    justifyContent: 'center',
  },
  clearButtonIcon: {
    color: '#7f8387',
    fontSize: 24,
  },
});

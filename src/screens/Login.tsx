import React, { Component } from 'react';

import { StyleSheet, Text, View, Image } from 'react-native';
import { Item, Input, Button, Icon, Spinner } from 'native-base';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

import { YandexMusicAuth, CaptchaRequired, CaptchaWrong } from '../Api/YandexMusicAuth';
import AccessTokenStorage from '../Api/AccessTokenStorage';
import { useSharedState } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Login'>;
interface LoginProps extends Props {
  sharedState: ReturnType<typeof useSharedState>,
};

const authApi = new YandexMusicAuth();

export class Login extends Component<LoginProps> {
  state = {
    // params
    loading: false,
    emailFocus: false,
    passwordFocus: false,
    captchaFocus: false,
    error: undefined,
    // inputs
    email: '',
    password: '',
    // captcha required state
    x_captcha_url: undefined,
    x_captcha_key: undefined,
    x_captcha_answer: undefined,
    // token
    token: undefined,
  };

  constructor(props: LoginProps) {
    super(props);
  }

  setEmail(value: string): void {
    this.setState({
      ...this.state,
      email: value,
    });
  }

  setPassword(value: string): void {
    this.setState({
      ...this.state,
      password: value,
    });
  }

  async login(): Promise<void> {
    this.setState({
      ...this.state,
      loading: true,
    });

    const {email, password, x_captcha_answer, x_captcha_key} = this.state;

    authApi.generateToken(email, password, x_captcha_answer, x_captcha_key).then(token => {
      this.successLogin(token);
    }).catch(error => {
      if (error instanceof CaptchaRequired || error instanceof CaptchaWrong) {
        const { x_captcha_url, x_captcha_key, error_description } = error.body;

        this.setState({
          ...this.state,
          x_captcha_url,
          x_captcha_key,
          error: error_description,
        })
      } else {
        this.setState({
          ...this.state,
          loading: false,
          error,
        });
      }
    });
  }

  public async successLogin(token: string): Promise<void> {
    const [state, setState] = this.props.sharedState;
    const navigation = this.props.navigation;

    this.setState({
      ...this.state,
      loading: false,
      error: undefined,
      x_captcha_url: undefined,
      x_captcha_key: undefined,
      x_captcha_answer: undefined,
      token: token,
    });;
    setState({ ...state, authToken: token });

    await AccessTokenStorage.setToken(token);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logo}>
            <Icon name="ios-radio" style={styles.logoIcon} />
            <Text style={styles.logoText}>Станция</Text>
          </View>

          <Item style={styles.inputItem}>
            <Input
              placeholder="Email"
              onFocus={() => {
                this.setState({...this.state, emailFocus: true });
              }}
              onBlur={() => {
                this.setState({...this.state, emailFocus: false});
              }}
              onChangeText={email => this.setEmail(email)}
              defaultValue={this.state.email}
              style={this.state.emailFocus ? styles.inputFocused : styles.input} />
          </Item>

          <Item style={styles.inputItem}>
            <Input
              placeholder="Пароль"
              onFocus={() => {
                this.setState({...this.state, passwordFocus: true });
              }}
              onBlur={() => {
                this.setState({...this.state, passwordFocus: false});
              }}
              onChangeText={password => this.setPassword(password)}
              defaultValue={this.state.password}
              style={this.state.passwordFocus ? styles.inputFocused : styles.input}
              secureTextEntry={true} />
          </Item>

          { this.state.x_captcha_url &&
            <View>
              <Image
                style={styles.captcha}
                source={{
                  uri: this.state.x_captcha_url,
                }}
              />
              <Item style={styles.inputItem}>
                <Input
                  placeholder="Введите код с каптчи"
                  onFocus={() => {
                    this.setState({...this.state, captchaFocus: true });
                  }}
                  onBlur={() => {
                    this.setState({...this.state, captchaFocus: false});
                  }}
                  onChangeText={answer => {
                    this.setState({...this.state, x_captcha_answer: answer });
                  }}
                  defaultValue={this.state.x_captcha_answer}
                  style={this.state.captchaFocus ? styles.inputFocused : styles.input}
                  secureTextEntry={true} />
              </Item>
            </View>
          }

          <View style={styles.login}>
            <Button onPress={() => this.login()} style={styles.button}>
              <Text style={styles.buttonText}>Войти</Text>
            </Button>
          </View>
        </View>

        <Text>{ this.state.token }</Text>

        { this.state.loading ? <View style={styles.loading}><Spinner color="#ffdc5f" /></View> : null }
      </View>
    );
  }
}

export default (props: Props) => {
  return <Login sharedState={useSharedState()} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  content: {
    width: '70%',
    flex: 1,
  },
  logo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '300',
    fontSize: 24,
    color: '#ff0102',
  },
  logoAppend: {
    fontWeight: '400',
    fontSize: 24,
    color: '#242424',
  },
  logoIcon: {
    marginRight: 10,
    fontSize: 32,
  },
  inputItem: {
    borderColor: 'transparent',
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ebeef2',
    color: '#242424',
  },
  inputFocused: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffdc5f',
    color: '#242424',
  },
  login: {
    marginTop: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#6839cf',
    padding: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: '#ffffff',
  },
  captcha: {
    width: 150,
    height: 50,
    margin: 5,
  },
});

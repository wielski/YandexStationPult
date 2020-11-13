import RNFetchBlob from 'rn-fetch-blob';

type CaptchaBody = {
  x_captcha_url: string;
  x_captcha_key: string;
  error_description: string;
}

export class YandexMusicAuth {
  oauth_url = 'https://oauth.yandex.com';
  client_id = '23cabbbdc6cd418abb4b39c32c41195d';
  client_secret = '53bc75238f0c4d08a118e51fe9203300';
  headers = {
    'User-Agent': 'com.yandex.mobile.auth.sdk/5.151.60676 (Apple iPhone12,1; iOS 14.1)'
  };
  oauthHeaders = {
    'User-Agent': 'com.yandex.mobile.auth.sdk/5.151.60676 (Apple iPhone12,1; iOS 14.1)',
  };

  async generateMainToken(username: string, password: string) {
    const payload = {
      x_token_client_id: 'c0ebe342af7d48fbbbfcf2d2eedb8f9e',
      x_token_client_secret: 'ad0a908f0aa341a182a37ecd75bc319e',
      client_id: '23cabbbdc6cd418abb4b39c32c41195d',
      client_secret: '53bc75238f0c4d08a118e51fe9203300',
      display_language: 'ru',
      payment_auth_retpath: 'yandexmusic://am/payment_auth',
      login: username,
    };

    const response = await this.post(
      'https://mobileproxy.passport.yandex.net/2/bundle/mobile/start/?app_id=ru.yandex.mobile.music&app_version_name=5.08&manufacturer=Apple&device_name=iPhone&app_platform=iPhone&model=iPhone12%2C1',
      payload,
      this.headers
    );
    const json = await response.json();

    if (!json.track_id) throw new Error('cant process login');

    const loginPayload = {
      password_source: 'Login',
      password: password,
      track_id: json.track_id,
    };

    const loginResponse = await this.post(
      'https://mobileproxy.passport.yandex.net/1/bundle/mobile/auth/password/',
      loginPayload,
      this.headers,
    );
    const loginJson = await loginResponse.json();

    if (!loginJson.x_token) {
      throw new Error('cant get main token');
    }

    return loginJson.x_token;
  }

  async generateToken(username: string, password: string, x_captcha_answer?: string, x_captcha_key?: string) {
    const url = `${this.oauth_url}/token`;

    let data: {
      grant_type: 'password',
      client_id: string,
      client_secret: string,
      username: string,
      password: string,
      x_captcha_answer?: string,
      x_captcha_key?: string,
    } = {
      grant_type: 'password',
      client_id: this.client_id,
      client_secret: this.client_secret,
      username: username,
      password: password
    };

    if (x_captcha_answer && x_captcha_key) {
      data = {...data, x_captcha_answer, x_captcha_key}
    }

    return await this.post(url, data)
      .then(resp => resp.json())
      .then(json => json['access_token']);
  }

  serialize(obj: Record<string, any>) {
    let str = [];

    for (let p in obj) {
      if (typeof obj === 'object' && obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }

    return str.join('&');
  }

  handleCaptcha(errorMessage: string, json: CaptchaBody) {
    if (errorMessage.includes('Wrong')) {
      throw new CaptchaWrong(json);
    } else {
      throw new CaptchaRequired(json);
    }
  };

  post(url: string, data: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    const formData = Object.keys(data).map((key) => (
      { name: key, data: data[key] }
    ));

    return RNFetchBlob.config({
      trusty : true
    }).fetch(
      'POST',
      url,
      headers,
      formData,
    ).then((resp) => {
      if (!resp.info().status) {
        const json = resp.json();
        let message = json.error_description || 'Unknown HTTP Error';

        if (message.includes('CAPTCHA')) {
          return this.handleCaptcha(message, json);
        } else {
          throw new Error(message);
        }
      }

      return resp;
    });
  }
}

export class CaptchaRequired extends Error {
  public body!: CaptchaBody;

  constructor(body: CaptchaBody) {
    super();
    this.body = body
  }
}

export class CaptchaWrong extends Error {
  public body!: CaptchaBody;

  constructor(body: CaptchaBody) {
    super();
    this.body = body
  }
}

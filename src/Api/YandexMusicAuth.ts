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
    'User-Agent': 'com.yandex.mobile.auth.sdk/7.15.0.715001762'
  };

  async generateMainToken(username: string, password: string) {
    const payload = {
      x_token_client_id: 'c0ebe342af7d48fbbbfcf2d2eedb8f9e',
      x_token_client_secret: 'ad0a908f0aa341a182a37ecd75bc319e',
      client_id: 'f8cab64f154b4c8e96f92dac8becfcaa',
      client_secret: '5dd2389483934f02bd51eaa749add5b2',
      display_language: 'ru',
      force_register: 'false',
      is_phone_number: 'false',
      login: username,
    };

    const response = await this.post('https://mobileproxy.passport.yandex.net/2/bundle/mobile/start/', payload, this.headers);
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
    return fetch(url, {
      method: 'POST',
      body: this.serialize(data),
      headers: headers,
    }).then((resp) => {
      if (!resp.ok) {
        return resp.json().then(json => {
          let message = json.error_description || 'Unknown HTTP Error';

          if (message.includes('CAPTCHA')) {
            return this.handleCaptcha(message, json);
          } else {
            throw new Error(message);
          }
        });
      }

      return new Promise((resolve, reject) => {
        resolve(resp);
      })
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

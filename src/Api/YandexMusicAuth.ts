/**
 * Reference: https://github.com/MarshalX/yandex-music-api/blob/952145c3b8431385f2fe8273d52d8eb4e49fcceb/yandex_music/client.py#L89
 */

type CaptchaBody = {
  x_captcha_url: string;
  x_captcha_key: string;
  error_description: string;
}

export class YandexMusicAuth {
  oauth_url = 'https://oauth.yandex.com';
  client_id = '23cabbbdc6cd418abb4b39c32c41195d';
  client_secret = '53bc75238f0c4d08a118e51fe9203300';

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

  post(url: string, data: Record<string, any>): Promise<any> {
    return fetch(url, {
      method: 'POST',
      body: this.serialize(data)
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

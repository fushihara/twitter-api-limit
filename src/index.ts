const Twitter = require('twitter');
import { post as requestPost } from "request";
import { Config } from "./config";
import { api名とリミットの情報 } from "./type";
import { 最新ファイルと差分があればファイル保存 } from "./dataSave";
import { WwwServer } from "./wwwServer";

class Main {
  private readonly config: Config;
  private readonly wwwServer: WwwServer;
  constructor() {
    this.config = new Config();
    this.wwwServer = new WwwServer({ config: this.config });
    this.run();
  }
  async run() {
    console.log(`apiLimit取得開始。`)
    for (let v of this.config.apiKeys) {
      await this.ユーザ認証とアプリ認証両方のリミットを取得({
        api種類: v.type,
        consumer_key: v.consumer_key,
        consumer_secret: v.consumer_secret,
        access_token_key: v.access_token_key,
        access_token_secret: v.access_token_secret
      });
    }
    console.log(`apiLimit取得終了。次は1時間後です。`);
    setTimeout(() => { this.run(); }, 60 * 60 * 1000);
  }
  async ユーザ認証とアプリ認証両方のリミットを取得(args: { consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string, api種類: string }) {
    try {
      console.log(`ユーザ認証で${args.api種類} のapiリミット取得`);
      const ユーザ認証のリミット一覧 = await ユーザ認証でapiリミットを取得({
        consumer_key: args.consumer_key,
        consumer_secret: args.consumer_secret,
        access_token_key: args.access_token_key,
        access_token_secret: args.access_token_secret
      });
      最新ファイルと差分があればファイル保存({
        ログのjsonディレクトリ: this.config.ログのjsonのディレクトリ,
        apiの種類: `${args.api種類}-userOAuth`,
        apiの情報: ユーザ認証のリミット一覧
      });
    } catch (e) {
      console.log(`error ${e}`);
    }
    try {
      console.log(`アプリ認証で${args.api種類} のapiリミット取得`);
      const トークン = await アプリケーション認証のトークンを取得する({
        consumer_key: args.consumer_key,
        consumer_secret: args.consumer_secret
      });
      const アプリ認証のリミット一覧 = await アプリケーション認証でapiリミットを取得({
        consumer_key: args.consumer_key,
        consumer_secret: args.consumer_secret,
        bearer_token: トークン
      });
      最新ファイルと差分があればファイル保存({
        ログのjsonディレクトリ: this.config.ログのjsonのディレクトリ,
        apiの種類: `${args.api種類}-appOAuth`,
        apiの情報: アプリ認証のリミット一覧
      });
    } catch (e) {
      console.log(`error ${e}`);
    }
    /*
    console.log("アプリ認証のリミット一覧");
    アプリ認証のリミット一覧.forEach(a => console.log(`${a.limit数.toString().padStart(4, " ")} ${a.api名}`))
    console.log("ユーザ認証のリミット一覧");
    ユーザ認証のリミット一覧.forEach(a => console.log(`${a.limit数.toString().padStart(4, " ")} ${a.api名}`))
    */
  }
}
new Main();
async function 変更差分をスラックに通知する(args: { 最新のapi情報: api名とリミットの情報[], 一つ前のapi情報: api名とリミットの情報[] }) {

}
async function アプリケーション認証のトークンを取得する(args: { consumer_key: string, consumer_secret: string }): Promise<string> {
  const encode_secret = new Buffer(args.consumer_key + ':' + args.consumer_secret).toString('base64');
  var options = {
    url: 'https://api.twitter.com/oauth2/token',
    headers: {
      'Authorization': 'Basic ' + encode_secret,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
  };
  return new Promise<string>(resolve => {
    requestPost(options, (error, response, body) => {
      resolve(JSON.parse(body).access_token);
    });
  });
}
async function Twitterインスタンスからapiリミット取得(twitterインスタンス: any): Promise<api名とリミットの情報[]> {
  return new Promise<api名とリミットの情報[]>((resolve, reject) => {
    twitterインスタンス.get('application/rate_limit_status.json', {}, (error, tweets, response) => {
      // apiリミットの残り回数を表示
      {
        if (response.headers["x-rate-limit-remaining"] !== undefined && response.headers["x-rate-limit-reset"] !== undefined) {
          const 残り回数 = response.headers["x-rate-limit-remaining"] - 0;
          const リセット時刻 = new Date(response.headers["x-rate-limit-reset"] * 1000);
          let 時刻文字列 = "";
          時刻文字列 += リセット時刻.getHours().toString().padStart(2, "0") + ":";
          時刻文字列 += リセット時刻.getMinutes().toString().padStart(2, "0") + ":";
          時刻文字列 += リセット時刻.getSeconds().toString().padStart(2, "0");
          console.log(`apiの残り回数は${残り回数} 回。リセットされる時刻は ${時刻文字列} です。`);
        }
      }
      if (error) {
        if (error[0].code === 88 && response.headers["x-rate-limit-remaining"] === "0") {
          const apiがリセットされる時 = new Date(response.headers["x-rate-limit-reset"] * 1000);
          let 時刻文字列 = "";
          時刻文字列 += apiがリセットされる時.getHours().toString().padStart(2, "0") + ":";
          時刻文字列 += apiがリセットされる時.getMinutes().toString().padStart(2, "0") + ":";
          時刻文字列 += apiがリセットされる時.getSeconds().toString().padStart(2, "0");
          reject(new Error(`apiのリミットが期限切れです。リセットは ${時刻文字列} です。`));
        } else {
          reject(new Error(`apiコールでエラーが発生しました。\n ${JSON.stringify(error, null, "  ")}`));
        }
      }
      const results: api名とリミットの情報[] = [];
      for (let v of Object.values(tweets.resources)) {
        for (let w of Object.keys(v)) {
          const data = v[w];
          const key = w;
          const limit = data.limit;
          results.push({
            api名: key,
            limit数: limit
          });
        }
      }
      results.sort((a, b) => a.api名.localeCompare(b.api名));
      resolve(results);
    });
  });
}
async function アプリケーション認証でapiリミットを取得(args: { consumer_key: string, consumer_secret: string, bearer_token: string }): Promise<api名とリミットの情報[]> {
  const client = new Twitter({
    consumer_key: args.consumer_key,
    consumer_secret: args.consumer_secret,
    bearer_token: args.bearer_token
  });
  return Twitterインスタンスからapiリミット取得(client);
}
async function ユーザ認証でapiリミットを取得(args: { consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string }): Promise<api名とリミットの情報[]> {
  const client = new Twitter({
    consumer_key: args.consumer_key,
    consumer_secret: args.consumer_secret,
    access_token_key: args.access_token_key,
    access_token_secret: args.access_token_secret
  });
  return Twitterインスタンスからapiリミット取得(client);
}
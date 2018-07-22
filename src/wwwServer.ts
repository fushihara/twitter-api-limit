import * as express from "express";
import { readFileSync } from "fs";
import { join, posix } from "path";
import { Config } from "./config";
import { 最新ファイル読み込み } from "./dataSave";
import { api名とリミットの情報 } from "./type";


export class WwwServer {
  private config: Config;
  constructor(args: { config: Config }) {
    this.config = args.config;
    const app: express.Application = express();
    app.get(args.config.express.urlPrefix, (request: express.Request, response: express.Response) => {
      this.一般アプリでアプリ認証とユーザ認証の比較(response);
    });
    app.get(posix.join(args.config.express.urlPrefix, "typeA.html"), (request: express.Request, response: express.Response) => {
      this.一般アプリでアプリ認証とユーザ認証の比較(response);
    });
    app.get(posix.join(args.config.express.urlPrefix, "typeB.html"), (request: express.Request, response: express.Response) => {
      this.公式アプリでアプリ認証とユーザ認証の比較(response);
    });
    app.get(posix.join(args.config.express.urlPrefix, "typeC.html"), (request: express.Request, response: express.Response) => {
      this.アプリ認証で一般アプリと公式アプリの比較(response);
    });
    app.get(posix.join(args.config.express.urlPrefix, "typeD.html"), (request: express.Request, response: express.Response) => {
      this.ユーザ認証で一般アプリと公式アプリの比較(response);
    });
    app.listen(args.config.express.port, () => {
      console.log(`http://localhost:${args.config.express.port}${args.config.express.urlPrefix}`);
    });
  }
  private 一般アプリでアプリ認証とユーザ認証の比較(response: express.Response) {
    const 左データ = 最新ファイル読み込み({
      apiの種類: "unOfficialApp-appOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    const 右データ = 最新ファイル読み込み({
      apiの種類: "unOfficialApp-userOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    this.html返す({
      左: 左データ,
      右: 右データ,
      response: response
    });
  }
  private 公式アプリでアプリ認証とユーザ認証の比較(response: express.Response) {
    const 左データ = 最新ファイル読み込み({
      apiの種類: "officialApp-appOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    const 右データ = 最新ファイル読み込み({
      apiの種類: "officialApp-userOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    this.html返す({
      左: 左データ,
      右: 右データ,
      response: response
    });
  }
  private アプリ認証で一般アプリと公式アプリの比較(response: express.Response) {
    const 左データ = 最新ファイル読み込み({
      apiの種類: "unOfficialApp-appOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    const 右データ = 最新ファイル読み込み({
      apiの種類: "officialApp-appOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    this.html返す({
      左: 左データ,
      右: 右データ,
      response: response
    });
  }
  private ユーザ認証で一般アプリと公式アプリの比較(response: express.Response) {
    const 左データ = 最新ファイル読み込み({
      apiの種類: "unOfficialApp-userOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    const 右データ = 最新ファイル読み込み({
      apiの種類: "officialApp-userOAuth",
      ログのjsonのディレクトリ: this.config.ログのjsonのディレクトリ
    });
    this.html返す({
      左: 左データ,
      右: 右データ,
      response: response
    });
  }
  private html返す(args: { 左: api名とリミットの情報[] | null, 右: api名とリミットの情報[] | null, response: express.Response }) {
    if (args.右 === null || args.右.length === 0 || args.左 === null || args.左.length === 0) {
      // データなし扱い
    }
    let template = readFileSync(`./resource/htmlTemplates/index.html`).toString("utf-8");
    template = template.replace("[/* template:右 */]", JSON.stringify(args.右));
    template = template.replace("[/* template:左 */]", JSON.stringify(args.左));
    args.response.end(template);
  }
}
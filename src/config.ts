import { existsSync, readFileSync } from "fs-extra";
const filePath = "./config.json";
export class Config {
  readonly apiKeys: {
    type: string,
    consumer_key: string,
    consumer_secret: string,
    access_token_key: string,
    access_token_secret: string,
  }[] = [];
  readonly ログのjsonのディレクトリ: string;
  readonly gitのディレクトリ: string;
  readonly express: {
    port: number,
    urlPrefix: string
  };
  constructor() {
    if (existsSync(filePath) === false) {
      throw new Error(`config.jsonのファイルがありません。`);
    }
    const jsonText = readFileSync(filePath).toString("utf-8");
    const p = JSON.parse(jsonText);
    //apiKeyは必須
    if (p.apiKeys === undefined || (typeof p.apiKeys) !== "object" || !Array.isArray(p.apiKeys)) {
      throw new Error(`config.jsonにapiKeysの項目がありません`);
    }
    for (let q of p.apiKeys) {
      if (q.type === undefined || (typeof q.type) !== "string") {
        throw new Error(`apiKeys.typeの項目がありません`);
      }
      if (q.consumer_key === undefined || (typeof q.consumer_key) !== "string") {
        throw new Error(`apiKeys.consumer_keyの項目がありません`);
      }
      if (q.consumer_secret === undefined || (typeof q.consumer_secret) !== "string") {
        throw new Error(`apiKeys.consumer_secretの項目がありません`);
      }
      if (q.access_token_key === undefined || (typeof q.access_token_key) !== "string") {
        throw new Error(`apiKeys.access_token_keyの項目がありません`);
      }
      if (q.access_token_secret === undefined || (typeof q.access_token_secret) !== "string") {
        throw new Error(`apiKeys.access_token_secretの項目がありません`);
      }
      this.apiKeys.push({
        type: q.type,
        consumer_key: q.consumer_key,
        consumer_secret: q.consumer_secret,
        access_token_key: q.access_token_key,
        access_token_secret: q.access_token_secret
      });
    }
    // workingDirectoryも必須
    if (p.logJsonDirectory === undefined || (typeof p.logJsonDirectory) !== "string") {
      throw new Error(`config.jsonにlogJsonDirectory項目がありません`);
    }
    this.ログのjsonのディレクトリ = p.logJsonDirectory;
    // urlPrefix
    if (p.express !== undefined && (typeof p.express) == "object") {
      if (p.express.port !== undefined && typeof p.express.port == "number") {
        if (p.express.urlPrefix !== undefined && typeof p.express.urlPrefix == "string") {
          this.express = {
            port: p.express.port,
            urlPrefix: p.express.urlPrefix
          };
        }
      }
    }
  }
}
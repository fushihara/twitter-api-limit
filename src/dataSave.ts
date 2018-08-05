import { join, dirname, normalize } from "path";
import * as dateFormat from "dateformat";
import { writeFileSync, readFileSync, existsSync, statSync, readdirSync, ensureDirSync } from "fs-extra"
import { api名とリミットの情報 } from "./type";
export function 最新ファイル読み込み(args: { ログのjsonのディレクトリ: string, apiの種類: string }): api名とリミットの情報[] | null {
  // ./logs/officialApp-userOAuth/officialApp-userOAuth-2018-01-01-Sun-00-00-00.json
  // ./logs/officialApp-appOAuth/officialApp-appOAuth-2018-01-01-Sun-00-00-00.json
  // ディレクトリの有無を最初にチェック。無い時はnullを返す
  const ディレクトリのパス = join(args.ログのjsonのディレクトリ, args.apiの種類);
  if (existsSync(ディレクトリのパス) === false || statSync(ディレクトリのパス).isDirectory() === false) {
    return null;
  }
  const 最新ファイル = readdirSync(ディレクトリのパス).map<{ ファイル名: string, 日付: Date }>(a => {
    // ファイルである事を確認
    const ファイルのパス = join(ディレクトリのパス, a);
    if (existsSync(ファイルのパス) === false || statSync(ファイルのパス).isFile() === false) {
      return null;
    }
    if (a.match(/(\d{4})-(\d{2})-(\d{2})-...-(\d{2})-(\d{2})-(\d{2})\.json/) === null) {
      return null;
    }
    const ファイルの日付 = `${RegExp.$1}/${RegExp.$2}/${RegExp.$3} ${RegExp.$4}:${RegExp.$5}:${RegExp.$6}`;
    return {
      ファイル名: a,
      日付: new Date(ファイルの日付)
    }
  }).filter(a => a != null).reduce((a, b) => {
    if (a === null) { return b; }
    if (b === null) { return a; }
    // 一番新しい日付を返す。
    if (a.日付.getTime() < b.日付.getTime()) {
      return b;
    } else {
      return a;
    }
  }, null);
  if (最新ファイル === null) {
    return null;
  }
  return 指定ファイル読み込み(join(ディレクトリのパス, 最新ファイル.ファイル名));
}
export function 最新ファイルと差分があればファイル保存(args: { ログのjsonディレクトリ, apiの種類: string, apiの情報: api名とリミットの情報[] }): "新規保存" | "更新しない" | { 一つ前のapi情報: api名とリミットの情報[] } {
  const 最新ファイル情報 = 最新ファイル読み込み({
    apiの種類: args.apiの種類,
    ログのjsonのディレクトリ: args.ログのjsonディレクトリ
  });
  if (最新ファイル情報 !== null && 最新ファイル情報.length === args.apiの情報.length) {
    const 引数のデータ = args.apiの情報.map(a => a).sort((a, b) => a.api名.localeCompare(b.api名));
    const 最新ファイルのデータ = 最新ファイル情報.map(a => a).sort((a, b) => a.api名.localeCompare(b.api名));
    let 不一致あり: boolean = false;
    for (let i = 0; i < 引数のデータ.length; i++) {
      if (引数のデータ[i].api名 !== 最新ファイルのデータ[i].api名) {
        不一致あり = true;
        break;
      }
      if (引数のデータ[i].limit数 !== 最新ファイルのデータ[i].limit数) {
        不一致あり = true;
        break;
      }
    }
    if (不一致あり === false) {
      return "更新しない";
    }
  }
  // 不一致があるので保存する
  const 保存ファイルのパス = join(args.ログのjsonディレクトリ, args.apiの種類, `${args.apiの種類}-${dateFormat(new Date(), "yyyy-mm-dd-ddd-HH-MM-ss")}.json`);
  ファイル保存({
    apiの情報: args.apiの情報,
    ファイルのパス: 保存ファイルのパス
  });
  if (最新ファイル情報 === null) {
    return "新規保存"
  } else {
    return {
      一つ前のapi情報: 最新ファイル情報
    }
  }
}
function 指定ファイル読み込み(ファイルのパス): api名とリミットの情報[] {
  const rawText = readFileSync(ファイルのパス).toString("utf-8");
  const rawObj = JSON.parse(rawText);
  const result: api名とリミットの情報[] = [];
  if (rawObj == null || (typeof rawObj) !== "object" || Array.isArray(rawObj) === false) {
    throw new Error(`指定ファイル読み込み失敗`);
  }
  for (let v of rawObj) {
    const api名 = v.api名;
    const limit数 = v.limit数;
    if (api名 == null || typeof api名 !== "string") {
      continue;
    }
    if (limit数 === null || limit数 === undefined || typeof limit数 !== "number") {
      continue;
    }
    result.push({
      api名: api名,
      limit数: limit数
    });
  }
  return result;
}
function ファイル保存(args: { ファイルのパス: string, apiの情報: api名とリミットの情報[] }) {
  const フォルダパス = dirname(args.ファイルのパス);
  if (existsSync(フォルダパス) === false || statSync(フォルダパス).isDirectory() === false) {
    ensureDirSync(フォルダパス);
  }
  const saveString = JSON.stringify(args.apiの情報, null, "  ");
  writeFileSync(args.ファイルのパス, saveString);
}
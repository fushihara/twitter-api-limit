# 概要

twitterのapi limitを表示するアプリです。トークンは各自用意して下さい。

公式アプリと一般アプリ。アプリ認証とユーザー認証で使えるapi、apiLimit数にどれだけの違いがあるか。

デフォルトの設定では`./../save/`フォルダにファイルを保存するので注意。

#欲しい機能
- 変更があったらツイッターに通知する機能
- 変更があったらスラックに流す機能
- デプロイのgulpファイルで、ディレクトリごと消してしまう。ディレクトリが消えると、開いているbashで開き直す必要があるのでめんどい。
- デプロイ後にpm2をなんとかしたい。retartするか。デプロイ前にstopするか。
- デプロイ時にrm -rfしてるのが危なすぎるのでなんとかしたい。しかし削除は正当な処理なので、弾く訳にはいかない・・

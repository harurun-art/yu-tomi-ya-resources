# GitHub Pagesへの公開手順

資料保管所の機能が完成しました！最後に、このサイトをインターネット上に公開（デプロイ）するための手順をご案内します。今回は完全無料で運用できる GitHub Pages を利用します。

## 1. GitHubリポジトリの作成

1. [GitHub](https://github.com/) にログインします。（アカウントがない場合は作成してください）
2. 画面右上の **「+」** ボタンから **「New repository」** をクリックします。
3. `Repository name` に好きな名前（例: `resource-archive`）を入力します。
4. `Public` が選択されていることを確認し、そのまま一番下の **「Create repository」** をクリックします。
5. 作成された画面に表示されているリポジトリのURL（例: `https://github.com/あなたのユーザー名/resource-archive.git`）を控えておいてください。

---

## 2. `.env` ファイルの設定変更

ViteプロジェクトをGitHub Pagesで公開する場合、少し設定を変更する必要があります。
現在のプロジェクトにある `vite.config.js` を以下のように修正します（AIが後ほど自動で行うことも可能です）。

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ★ ここにリポジトリ名を追加します
  // 例: base: '/resource-archive/',
  base: '/あなたのリポジトリ名/',
})
```

※現在、環境変数として `.env` ファイルにスプレッドシートのURLを書き込んでいますが、`.env` ファイルは通常GitHubにはアップロードしません。しかし、今回はパスワード等の機密情報ではないため、ビルド時に埋め込む形で進めます。

---

## 3. GitHub Pages へのデプロイパッケージの追加

デプロイを簡単に行うために、`gh-pages` というツールをインストールします。
ターミナルで以下のコマンドを実行します。

```bash
npm install gh-pages --save-dev
```

次に `package.json` を開き、以下の設定を追加します。

```json
{
  "name": "resource-archive",
  // ★ 以下の3行を追加（ご自身のアカウントとリポジトリ名に合わせてください）
  "homepage": "https://あなたのユーザー名.github.io/あなたのリポジトリ名",
  
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    // ★ 以下の2つのスクリプトを追加
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

---

## 4. デプロイの実行

すべての準備が整ったら、以下のコマンドで一気にGitHubへプッシュし、公開します！

```bash
# GitHubのリポジトリと紐付け
git init
git add .
git commit -m "初期コミット: 資料保管所サイトの作成"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/あなたのリポジトリ名.git
git push -u origin main

# サイトのビルドと公開
npm run deploy
```

`Published` と表示されれば成功です！
`https://あなたのユーザー名.github.io/あなたのリポジトリ名` にアクセスすると、誰でも見られる形で公開されています。

---

以上の手順となります。
もし「この設定もAIに全てやってほしい」「GitHubの細かい手順がわからないから手伝ってほしい」などがありましたら、お気軽にお申し付けください！一緒に公開まで進めましょう！

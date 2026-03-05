# スプレッドシートへのデータ追加機能（GAS）の設定手順

サイトから新しい資料の情報を追加するには、Google スプレッドシート側でデータを受け取るためのプログラム（Google Apps Script = GAS）を設定する必要があります。

以下の手順に沿って設定をおこない、発行されたWeb URLを教えてください。

---

## 1. Google Apps Script の起動
1. 今回作成していただいた Google スプレッドシートを開きます。
2. 画面上部のメニューから **「拡張機能」 ＞ 「Apps Script」** をクリックします。
3. 新しいタブで Apps Script のエディタ画面が開きます。

## 2. スクリプトの貼り付け
1. 最初から入力されている `function myFunction() { ... }` というコードを**すべて消去**します。
2. 代わりに、以下のコードをコピーして貼り付けてください。

```javascript
function doPost(e) {
  // CORS対応（異なるドメインからのリクエストを許可）
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // リクエストから送られてきたJSONデータをパース
    var data = JSON.parse(e.postData.contents);
    
    // スプレッドシートの取得（現在アクティブなスプレッドシートの最初のシート）
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // データをシートの最終行に追加（順番はCSVと同じ）
    // [資料タイトル, 種類, カテゴリ, URL, 説明]
    sheet.appendRow([
      data.title,
      data.type,
      data.category,
      data.url,
      data.description
    ]);

    // 成功レスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// OPTIONSリクエスト（CORSのプレフライト）用の処理
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. 画面上部のフロッピーディスクのアイコン（💾）を押して、保存します。

## 3. Webアプリとしてデプロイ（公開）
1. 画面右上の青い **「デプロイ」** ボタンをクリックし、**「新しいデプロイ」** を選びます。
2. 左側の歯車アイコン（⚙️）をクリックし、**「ウェブアプリ」** を選択します。
3. 設定項目を以下のように変更します：
   - **説明**: `資料追加API` （好きな名前でOKです）
   - **実行するユーザー**: `自分（あなたのメールアドレス）`
   - **アクセスできるユーザー**: `全員` （※重要！ここを「全員」にしないとサイトから追加できません）
4. 右下の **「デプロイ」** をクリックします。

## 4. アクセス承認（初回のみ）
1. 初回のみ「アクセス承認」という青いダイアログが出ますので、**「アクセスを承認」** をクリックします。
2. ご自身のアカウントを選択します。
3. 「Google Verify...」のような警告画面が出た場合は、左下の **「詳細」 ＞ 「無題のプロジェクト（安全ではないページ）に移動」** をクリックします。
4. **「許可」** をクリックします。

## 5. Web App URL の取得
1. デプロイが完了すると、「ウェブアプリ」という項目の中に **URL（`https://script.google.com/macros/s/.../exec`）** が表示されます。
2. そのURLの右横にある「コピー」ボタンを押してコピーします。

---

**コピーしたURLを、このチャットに貼り付けて私に教えてください！**
（サイト側のプログラムにそのURLを組み込みます）

# 新規企画班ポータル: バックエンド（GAS）アップデート手順

ポータルの新機能（お知らせ、進捗、メンバー、カレンダーなど）を動かすためには、ベースとなるスプレッドシートとGAS（Google Apps Script）をアップデートする必要があります。

以下の手順に沿って設定を行ってください！

---

## 1. スプレッドシートの準備（シートの追加）

現在お使いのスプレッドシートを開き、画面下部の「＋」ボタンを押して、**以下の名前で新しいシート（タブ）を追加**してください。
※シート名（英語）は、**一言一句間違えずに**（大文字・小文字も含めて）設定してください。

1. **`Resources`** （※現在の資料が入っているシートの名前をこれに変更してください）
2. **`Members`** （※1行目にヘッダーを入れます：`名前`, `メールアドレス`, `担当部署`）
3. **`Announcements`** （※1行目にヘッダー：`日付`, `名前`, `内容`, `リンク`）
4. **`Activities`** （※1行目にヘッダー：`日時`, `名前`, `内容`）
5. **`Tasks`** （※1行目にヘッダー：`名前`, `タスク名`, `担当組`, `期限`, `ステータス`）
6. **`Projects`** （※1行目にヘッダー：`タイトル`, `責任者`, `概要`, `ステータス`）
7. **`Events`** （※1行目にヘッダー：`タイトル`, `日時`, `場所`）
8. **`Goals`** （※1行目にヘッダー：`内容`）

※ `Members` シートには、この後テスト用に数名分のデータを手入力しておいてください。

---

## 2. Google Apps Script のプログラムの更新

1. スプレッドシート上部のメニューから **「拡張機能」 ＞ 「Apps Script」** をクリックします。
2. 現在書かれているコード（文字）を**すべて消去**します。
3. 代わりに、以下の新しいコードをすべてコピーして貼り付けてください。

```javascript
/**
 * yu-tomi-ya-resources API Backend
 * 複数シート対応版 GASスクリプト
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'add';
    const sheetName = postData.sheetName || 'Resources'; 
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      if (sheetName === 'Resources') sheet = ss.getSheets()[0];
      else return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Sheet not found: ' + sheetName })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete') {
      const rowNumber = postData.rowNumber;
      if (!rowNumber) throw new Error('rowNumber is required for deletion');
      sheet.deleteRow(rowNumber);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Deleted' })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'add') {
      let rowData = [];
      const timestamp = new Date();

      switch (sheetName) {
        case 'Resources': rowData = [postData.title || '', postData.type || '', postData.category || '', postData.url || '', postData.description || '', postData.name || '']; break;
        case 'Announcements': rowData = [postData.date || Utilities.formatDate(timestamp, "JST", "yyyy-MM-dd"), postData.name || '', postData.content || '', postData.url || '']; break;
        case 'Activities': rowData = [Utilities.formatDate(timestamp, "JST", "yyyy-MM-dd HH:mm:ss"), postData.name || 'システム', postData.action || '']; break;
        case 'Tasks': rowData = [postData.name || '', postData.title || '', postData.team || '', postData.deadline || '', postData.status || 'todo']; break;
        case 'Projects': rowData = [postData.title || '', postData.leader || '', postData.description || '', postData.status || 'planning']; break;
        case 'Events': rowData = [postData.title || '', postData.datetime || '', postData.location || '']; break;
        case 'Goals': rowData = [postData.content || '']; break;
        default: throw new Error('Unknown sheet: ' + sheetName);
      }
      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'updateStatus') {
      const rowNumber = postData.rowNumber;
      const columnNumber = postData.columnNumber; 
      const newValue = postData.value;
      sheet.getRange(rowNumber, columnNumber).setValue(newValue);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheetName = e.parameter.sheetName || 'Resources';
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      if (sheetName === 'Resources') sheet = ss.getSheets()[0];
      else throw new Error('Sheet not found: ' + sheetName);
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] })).setMimeType(ContentService.MimeType.JSON);

    const headers = values[0];
    const data = values.slice(1).map((row, index) => {
      let obj = { id: index }; 
      headers.forEach((header, i) => { obj[header] = row[i]; });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. 画面上部のフロッピーディスクのアイコン（💾）を押して保存します。

---

## 3. 再デプロイ（発行）

コードを書き換えた後は、「再デプロイ」が必要です。

1. 画面右上の青い **「デプロイ」** ボタンをクリックし、**「デプロイを管理」** を選びます。
2. 左上の鉛筆アイコン（✏️ 編集）をクリックします。
3. バージョンのプルダウンを **「新バージョン」** に変更します。
4. **「デプロイ」** をクリックします。
5. （初回時と同じように承認ダイアログが出た場合は、再度アカウントを選び、「アクセスを承認」してください）

※ **Web AppのURLは前回と同じもの** がそのまま使われるはずです。もしURLが変わってしまった場合は、お手数ですが新しいURLをチャットで教えてください！

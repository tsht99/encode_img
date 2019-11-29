// htmlを出力する
function doGet(){
  return HtmlService.createHtmlOutputFromFile('index');
}

// フォルダから画像を取得してエンコードする
function encode_img(){
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート1');
  const folderId = PropertiesService.getScriptProperties().getProperty('folderId');
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  var file;
  var file_name;
  var blob;
  var encoded;
  var data = []; // encoded を分割して格納する
  var file_size;
  var i;
  var num; // encoded を分割する数
  
  while(files.hasNext()) {
    file = files.next();
    file_name = file.getName();
    file_size = Math.round(file.getSize() / 1024);
    blob = file.getBlob();
    encoded = Utilities.base64Encode(blob.getBytes());
    // 50000文字毎に区切る
    num = Math.ceil(encoded.length / 50000);
    for(i = 0; i < num; i++){
      data.push(encoded.substr(i * 50000, 50000));
    }
    sheet.insertRowAfter(1);
    sheet.getRange(2, 1, 1, 3).setValues([[file_name, file_size, '']]);
    sheet.getRange(2, 4, 1, data.length).setValues([data]);
    // folder.removeFile(file);
  }
  return;
}

// ファイル一覧を表示
function list_page(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート1');
  const LastRow = sheet.getLastRow();
  // ファイルが存在しないときは何も返さない
  if(LastRow == 1) return;
  const arr = sheet.getRange(2, 1, LastRow - 1, 1).getValues();
  var i;
  var out = '';
  for(i = 1; i <= arr.length; i++){
    out += '<input type="button" value="browse" onClick="browse_page(' + i + ')"> ' +arr[i-1][0] + '<br>';
  }
  out = '<div>' + out + '</div>';
  return out;
}

// シートの情報をhtmlにして返す
function browse_page(index){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート1');
  const LastRow = sheet.getLastRow();
  const LastCol = sheet.getLastColumn();
  if(index < 1 || index > LastRow - 1) return list_page();
  const arr = sheet.getRange(index + 1, 1, 1, LastCol).getValues();
  var data = '';
  for(var i = 3; i < LastCol; i++){
    data += arr[0][i];
  }
  const next = index - 1;
  const back = index + 1;
  const out = '<div>' +
              '<input type="button" value="list" onClick="list_page()"><br><br>' +
              'file_name<br>' + arr[0][0] + '<br><br>' +
              'file_size(KB)<br>' + arr[0][1] + '<br><br>' +
              'tag<br>' + arr[0][2] + '<br><br>' +
              '<img src=data:image/jpeg;base64,' + data + ' width="100%"><br><br>' +
              '<input type="button" value="back" onClick="browse_page(' + back  + 
              ')"> <input type="button" value="next" onClick="browse_page(' + next + ')"><br><br>' +
              '</div>';
  return out;
}

# CalcPartTimeJobsSalary
アルバイトの給料計算プログラム(GAS)  

Googleカレンダーをベースに給料計算を行う。  
指定したカレンダーに「バイト」or「バイト仮」の名称のイベントを作成することで、給料が自動的に計算される。

給料を計算後、プログラムは給料日に終日イベントを作成する。  
そのイベントの説明欄に計算された給料が記される。

# 仕様
## Input
- シフトの管理はGoogleカレンダーで行う。
- シフトのイベント名は「バイト」or「バイト仮」であること。  
![FireShot Capture 004 - Google カレンダー - 2024年 7月 - calendar google com](https://github.com/hyouhyan/CalcPartTimeJobsSalary/assets/76419486/3770ded5-9f7b-475c-bf76-e78e2f2e578d)
## Output
- 日給はイベントの説明欄に記載される。  
![スクリーンショット 2024-06-30 234719](https://github.com/hyouhyan/CalcPartTimeJobsSalary/assets/76419486/ad241f66-9ae0-4a7d-b776-120da43305aa)
- 月給は給料日に終日イベントが作成され、説明欄に記載される。  
![スクリーンショット 2024-06-30 234725](https://github.com/hyouhyan/CalcPartTimeJobsSalary/assets/76419486/2dbd4a1f-d42c-4c16-90e4-78fbfb354e16)

# 利用方法
## 1. Gasの各定数を設定

```javascript
// シフトを管理するカレンダーのID
const calendar = CalendarApp.getCalendarById('6jn0bhoia26rbctuvcordk9vgk@group.calendar.google.com');

// 祝日カレンダーのID(これは変更しない)
const jpHoliday = CalendarApp.getCalendarById("ja.japanese#holiday@group.v.calendar.google.com");

// 給料の定義
const salary = {
  "weekday": {"normal": 1030, "night": 1130},
  "weekend": {"normal": 1130, "night": 1130}
};

// 夜間手当支給開始時間の定義
const nightStartTime = 1700;

// 交通費(par 日)
const transpoEvery = 420;
// 交通費(par 月)
const transpoMonth = 0;
```

## 2. イベントトリガーを設定
お好みのタイミングでトリガーを設定してください。  
私は1時間おきに設定しています。  
![image](https://github.com/hyouhyan/CalcPartTimeJobsSalary/assets/76419486/9b1c8bfd-0b75-4fe0-94f8-668dcbbc362d)

トリガーに指定する関数は`runCalThisMonth`(今月分給料)もしくは、`runCalNextMonth`(来月分給料)です。  
お好みで選択してください。両方でも構いません。
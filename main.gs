const calendar = CalendarApp.getCalendarById('6jn0bhoia26rbctuvcordk9vgk@group.calendar.google.com');
const jpHoliday = CalendarApp.getCalendarById("ja.japanese.official#holiday@group.v.calendar.google.com");

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

function showSalary(startDate, endDate){
  // イベントを配列で取得
  let events = calendar.getEvents(startDate, endDate);

  // 労働時間を宣言
  let time = {
    "weekday": {"normal": 0, "night": 0},
    "weekend": {"normal": 0, "night": 0}
  }

  let total = 0;
  let kariTotal = 0;

  console.log(startDate + '\n' + endDate);

  for(let i = 0; i < events.length; i++){
    var title = events[i].getTitle();
    var startTime = events[i].getStartTime();
    var endTime = events[i].getEndTime();

    if(title == "バイト" || title == "バイト仮"){
      var normalTime = 0;
      var nightTime = 0;
      var totalTime = 0;

      // 夜勤の有無
      if(endTime.getHours() * 100 + endTime.getMinutes() > nightStartTime){
        if(startTime.getHours() * 100 + startTime.getMinutes() > nightStartTime){
          nightTime = (endTime.getHours() - startTime.getHours()) * 60 + endTime.getMinutes() - startTime.getMinutes();
        }else{
          normalTime = (Math.floor(nightStartTime / 100) - startTime.getHours()) * 60 - startTime.getMinutes() + nightStartTime % 100;
          nightTime = (endTime.getHours() - Math.floor(nightStartTime / 100)) * 60 + endTime.getMinutes() - nightStartTime % 100;
        }
      }else{
        normalTime = (endTime.getHours() - startTime.getHours()) * 60 + endTime.getMinutes() - startTime.getMinutes();
      }

      totalTime = normalTime + nightTime;

      // 労働基準法に基づき休憩時間
      // 6時間以上の時
      if(totalTime >= 6 * 60){
        normalTime -= 60;
      }

      console.log(title + "\n" + startTime + "\n" + endTime);
      console.log("normal time " + normalTime + "\n" + "night time " + nightTime);
      console.log(`normal ${Math.floor(normalTime / 60)}:${normalTime % 60} = ${normalTime * salary.weekend.normal / 60}`);
      console.log(`night ${Math.floor(nightTime / 60)}:${nightTime % 60} = ${nightTime * salary.weekend.night / 60}`)
      
      // 休日か否か
      if(isHoliday(startTime)){
        var todayTotal = ((normalTime * salary.weekend.normal + nightTime * salary.weekend.night) / 60);
      }else{
        var todayTotal = ((normalTime * salary.weekday.normal + nightTime * salary.weekday.night) / 60);
      }

      todayTotal += transpoEvery;
      var forShow = todayTotal;
      forShow.toFixed(2);
      events[i].setDescription(`給料: ${forShow}円`);

      if(title == "バイト仮") kariTotal += todayTotal;
      else total += todayTotal;

      // console.log("total " + total);
    }
  }
  total += transpoMonth;

  total = Math.ceil(total);
  kariTotal = Math.ceil(kariTotal);

  console.log(total);
  console.log(kariTotal);
  return {"total":total, "kariTotal":kariTotal};
}

function isHoliday(day){
  if(day.getDay() == 0 || day.getDay() == 6){
    return true;
  }
  if(jpHoliday.getEventsForDay(day).length > 0){
    return true;
  }
}

function runThisMonth(){
  let date = new Date();
  runByYM(date.getFullYear(), date.getMonth())
}

function runNextMonth(){
  let nowDate = new Date();
  nowDate.setDate(1);

  nowDate.setMonth(nowDate.getMonth() + 1);

  let year = nowDate.getFullYear(); 
  let month = nowDate.getMonth();

  runByYM(year, month)
}

function runTwoNextMonth(){
  let nowDate = new Date();
  nowDate.setDate(1);

  nowDate.setMonth(nowDate.getMonth() + 2);

  let year = nowDate.getFullYear(); 
  let month = nowDate.getMonth();

  runByYM(year, month)
}

function runLastMonth(){
  let nowDate = new Date();
  nowDate.setDate(1);

  nowDate.setMonth(nowDate.getMonth() - 1);

  let year = nowDate.getFullYear(); 
  let month = nowDate.getMonth();

  runByYM(year, month)
}

function runByYM(year = (new Date()).getFullYear(), month = (new Date()).getMonth()){
  let startDate = new Date();
  let endDate = new Date();

  let tmp = YMtoDate(year, month);

  startDate = tmp[0];
  endDate = tmp[1];

  return showSalary(startDate, endDate);
}

function YMtoDate(year, month){
  // console.log(year);
  // console.log(month);
  // 月初を取得
  let startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0);
  startDate.setMinutes(0);

  startDate.setFullYear(year);
  startDate.setMonth(month);

  // console.log(startDate);

  // 月末を取得
  let endDate = new Date();
  endDate.setDate(1);
  endDate.setFullYear(year);
  endDate.setMonth(startDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23);
  endDate.setMinutes(59);

  // console.log(endDate);

  return [startDate, endDate];
}

function writeToCal(year = (new Date()).getFullYear(), month = (new Date()).getMonth()){
  let startDate = new Date();
  let endDate = new Date();

  let tmp = YMtoDate(year, month);
  startDate = tmp[0];
  endDate = tmp[1];

  let salary = showSalary(startDate, endDate)

  if(salary.total != 0 || salary.kariTotal != 0){
    startDate.setMonth(startDate.getMonth() + 1);
    endDate.setMonth(endDate.getMonth() + 1);

    let day = startDate;
    let payday = null;
    let events = calendar.getEvents(startDate, endDate);

    for(let i = 0; i < events.length; i++){
      var title = events[i].getTitle();
      day = events[i].getStartTime();

      console.log(title);

      if(title == "給料日"){
        payday = events[i]
      }
    }
    if(payday === null){
      day.setDate(15);
      while(isHoliday(day)){
        day.setDate(day.getDate() - 1)
      }
      payday = calendar.createAllDayEvent("給料日", day);
    }

    startDate.setMonth(startDate.getMonth() - 1)

    payday.setDescription(`給料(${startDate.getMonth() + 1}月分): ${salary.total}円\n給料(${startDate.getMonth() + 1}月分)仮: ${salary.kariTotal}円`);
  }
}

function runCalThisMonth(){
  let nowDay = new Date();

  writeToCal(nowDay.getFullYear(), nowDay.getMonth());
}

function runCalNextMonth(){
  let nowDay = new Date();
  nowDay.setMonth(nowDay.getMonth() + 1);

  writeToCal(nowDay.getFullYear(), nowDay.getMonth());
}

function runCalTwoNextMonth(){
  let nowDay = new Date();
  nowDay.setMonth(nowDay.getMonth() + 2);

  writeToCal(nowDay.getFullYear(), nowDay.getMonth());
}


function doGet(){
  writeToCal();
}
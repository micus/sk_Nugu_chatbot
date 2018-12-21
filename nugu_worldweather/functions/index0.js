'use strict';
const request = require('request');
const cheerio = require('cheerio');
const Promise = require('promise');
const iconvlite = require('iconv-lite');

/**
 * [누구 템플레이트 설명]
 * 구글 cloud용으로 만들어진 단독 파일입니다.
 * exports.nugu_template 의 'nugu_template'는 설정된 이름에 맞추어서 바꾸어 주시면 됩니다.
 *
 * req.body는 SK nugu에서 들어오는 json입니다.
 */

exports.nugu_worldweather = (req, res) => {
  const appTitle = '세계의 날씨'; // 앱 타이틀을 적어주세요

  const requestBody = req.body; //request의 body부분
  const parameters = requestBody.action.parameters; // 파라메터 부분
  const context = requestBody.action.context; //컨텍스트, OAuth연결시 토큰이 들어옵니다
  const actionName = requestBody.action.actionName; // action의 이름
  console.log('requestBody ', requestBody);

  //마이크 오픈이라고 생각하는 것을 방지하기 위한 사용자 경험용 마지막 물음
  let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!', '또 궁금하신게 있으신가요?']


  const weatherCity = [{
    name: '서울',
    code: '226081',
    nation: '한국'
  },{
    name: '뉴욕',
    code: '349727',
    nation: '미국'
  },{
    name: '도쿄',
    code: '226396',
    nation: '일본'
  },{
    name: '오사카',
    code: '225007',
    nation: '일본'
  },{
    name: '프놈펜',
    code: '49785',
    nation: '캄보디아'
  },{
    name: '모스크바',
    code: '294021',
    nation: '러시아'
  },{
    name: '런던',
    code: '328328',
    nation: '영국'
  },{
    name: '카이로',
    code: '127164',
    nation: '이집트'
  },{
    name: '베이징',
    code: '101924',
    nation: '중국'
  },{
    name: '상하이',
    code: '106577',
    nation: '중국'
  },{
    name: '홍콩',
    code: '1123655',
    nation: ''
  },{
    name: '마닐라',
    code: '264885',
    nation: '필리핀'
  },{
    name: '리우 데 자네이루',
    code: '45449',
    nation: '브라질'
  },{
    name: '부에노스 아이레스',
    code: '7894',
    nation: '아르헨티나'
  },{
    name: '토론토',
    code: '55488',
    nation: '캐나다'
  },{
    name: '시드니',
    code: '22889',
    nation: '오스트레일리아'
  },{
    name: '로스 엔젤레스',
    code: '90012',
    nation: '미국'
  },{
    name: '샌프란시스코',
    code: '94103',
    nation: '미국'
  },{
    name: '워싱턴',
    code: '20006',
    nation: '미국'
  },{
    name: '로마',
    code: '213490',
    nation: '이탈리아'
  },{
    name: '파리',
    code: '623',
    nation: '프랑스'
  },{
    name: '베를린',
    code: '10178',
    nation: '독일'
  },{
    name: '리스본',
    code: '274087',
    nation: '포르투갈'
  },{
    name: '뉴델리',
    code: '187745',
    nation: '인도'
  },{
    name: '델리',
    code: '202396',
    nation: '인도'
  },{
    name: '호치민',
    code: '353981',
    nation: '베트남'
  },{
    name: '하노이',
    code: '353412',
    nation: '베트남'
  },{
    name: '멕시코시티',
    code: '242560',
    nation: '멕시코'
  },{
    name: '멜버른',
    code: '26216',
    nation: '오스트레일리아'
  },]
  //디버그 용, actionName을 표시합니다
  console.log(`request: ${JSON.stringify(actionName)}`);

  const apikey = 'tDSWJGo2Z0SUgyuswqTrALz5QkynxAjL'

  function getJson(cityJson, callback) {
    let url = 'http://dataservice.accuweather.com/currentconditions/v1/' + cityJson.code;

    const qs = {
      apikey: apikey,
      details: 'true',
      language: 'ko-KR'
    }
    //request를 이용하여 api요청, 혹은 웹 페이지를 요청합니다
    request({
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
      },
      qs: qs
    }, function(err, resp, body) {
      if (err) {
        callback(err, {
          'returnValue': 'fail'
        });
        return;
      }

      let tempJson = {}
      const origin = JSON.parse(body.toString())[0];
      tempJson.nowTemp = origin.Temperature.Metric.Value
      tempJson.situation = origin.WeatherText
      tempJson.uv = origin.UVIndexText
      tempJson.humidity = origin.RelativeHumidity

      //성공여부
      tempJson.returnValue = 'success';
      callback(null, tempJson);
    });
  }


  //Promise
  const asyncTask = (insertData) => new Promise(function(resolved, rejected) {
    getJson(insertData, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  //Array를 랜덤하게 바꿔주는 shuffle fucntion
  function shuffle(array) {
    var i = 0,
      j = 0,
      temp = null

    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1))
      temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  } // shuffle


  let output = {}; //parameter를 저장할 output변수, 자주 사용하는 관계로 상단에 선언합니다.

  /**
   * [makeJson description]
   * response에 보낼 json을 만드는 부분입니다.
   * parameter에 데이터를 저장을 합니다.
   */
  function makeJson(jsons) {
    /**
     * [makeJson 설명]
     * @json {jsons}
     * 안에는 누구로 보낼 json들이 있습니다
     * json안에는 파라메터들이 있으며, 각 파라메터는 sk nugu의 play에서 지정한
     * 이름과 동일해야 합니다.
     */
    let jsonReturn = {
      "version": "2.0",
      "resultCode": "OK",
      "directives": {
        "AudioPlayer": {
          "type": "AudioPlayer.Play",
          "audioitems": {
            "stream": {
              "url": "",
              "offsetInMilliseconds": "",
              "progressReport": {
                "progressReportDelayInMilliseconds": "",
                "progressReportIntervalInMilliseconds": ""
              },
              "token": "",
              "expectedPreviousToken": ""
            },
            "metadata": {}
          }
        }
      }

    }
    jsonReturn.output = jsons
    return res.send(jsonReturn);
  } //makeJson


  function worldweather_function() {
    console.log('selectLottoNum_function')
    const cityName = parameters.cityName.value
    let speechText = '';

    let cityJson = weatherCity.find(item => {
      return item.name == cityName;
    });

    return asyncTask(cityJson)
      .then(function(items) {
        console.log(items)
        //여기서 서버연결후 데이터 출력 items으로 가져옴
        let returnValue = items.returnValue; // success or fail

        if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등
          speechText = "서버에서 에러가 발생하였습니다. 다시 시도해 주세요.";
          output.worldweather = speechText;
        } else { // 서버가 움직인다면

          const temp = items.nowTemp
          const situation = items.situation
          const uv = items.uv
          const humidity = items.humidity

          speechText = [
            ('현재 ' + cityJson.nation + ', ' + cityJson.name + '의 온도는 ' + situation + '에 ' + temp +'도 이며 ' + '자외선은 ' + uv + ', 습도는 ' + humidity + '입니다. ')
          ]

          output.worldweather = shuffle(speechText)[0] + shuffle(lastTextArr)[0];
        }

        makeJson(output)

      });
  } //


  //액션 선언 모음, 여기서 액션을 선언해 줍니다.
  const ACTION_NOWWEATHER = 'action.worldweather';

  // Intent가 오는 부분, actionName으로 구분합니다.
  // case안에서 작동할 function을 적습니다.
  switch (actionName) {
    case ACTION_NOWWEATHER:
      return worldweather_function()
      break;

  }


}
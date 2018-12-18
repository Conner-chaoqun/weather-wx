// const weatherMap = {
//   'sunny': '晴',
//   'cloudy': '多云',
//   'overcast': '阴',
//   'lightrain': '小雨',
//   'heavyrain': '大雨',
//   'snow': '雪'
// }

const weatherMap = {
  '晴': 'sunny',
  '多云': 'cloudy',
  '阴': 'overcast',
  '小雨': 'lightrain',
  '大雨': 'heavryrain',
  '雪': 'snow'
}

const weatherColorMap = {
  '晴': '#cbeefd',
  '多云': '#deeef6',
  '阴': '#c6ced2',
  '小雨': '#bdd5e1',
  '大雨': '#c5ccd0',
  '雪': '#aae1fc'
}

const lifestyleMap = {
  'comf': '舒适度指数',
  'drsg': '穿衣指数',
  'flu': '感冒指数',
  'sport': '运动指数',
  'trav': '旅游指数',
  'uv': '紫外线指数',
  'cw': '洗车指数',
  'air': '空气指数'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""


Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherImg: '',
    lifestyle: '',
    hourlyWeather: [],
    todayDate: '',
    todayWind: '',
    city: '杭州市',
    locationTipsText: UNPROMPTED_TIPS,
    locationAuthType: UNPROMPTED
  },
  onPullDownRefresh(){
    this.getNowInfo(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
    //console.log('onload')
    this.qqmapsdk = new QQMapWX({
      key: '4J3BZ-A2LRQ-D655L-GEKFP-NUCD2-J3F4U'
    })
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED :UNPROMPTED,
          //locationTipsText: auth ? AUTHORIZED_TIPS : (auth === false) ? UNAUTHORIZED_TIPS : UNPROMPTED_TIPS
        })
        if(auth){
          this.getLocationAndWeather()
        }
        else{
          this.getNowInfo()
        }
      }
    })
    
  },

  // onShow(){
  //   console.log('onshow')
  //   wx.getSetting({
  //     success: res => {
  //       let auth = res.authSetting['scope.userLocation']
  //       console.log(auth)
  //       if (auth === true && this.data.locationAuthType !== AUTHORIZED){
  //         this.setData({
  //           locationTipsText: AUTHORIZED_TIPS,
  //           locationAuthType: AUTHORIZED
  //         })
  //         this.getLocation()
  //       }
        
  //     }
  //   })
  // },

  // onReady(){
  //   console.log('onready')
  // },

  // onHide(){
  //   console.log('onhide')
  // },

  // onUnload(){
  //   console.log('onunload')
  // },

  getNowInfo(callback){
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather',
      data: {
        location: this.data.city,
        key: 'HE1812162058071374',
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        console.log(res,this.data.city)
        let result = res.data.HeWeather6[0]
        console.log(result)
        this.setNow(result)
        // this.setHourlyWeather(result)
        this.setLifeStyle(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setNow(result){
    let temp = result.now.tmp
    let weather = result.now.cond_txt
    console.log(temp, weather)
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weather,
      nowWeatherImg: '/images/' + weatherMap[weather] + '-bg.png',
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setLifeStyle(result){
    let life = result.lifestyle
    let lifeStyle = []
    for (let i = 0; i < 8; i += 1) {
      lifeStyle.push({
        type: lifestyleMap[life[i].type],
        brf: life[i].brf,
        iconPath: '/images/' + life[i].type + '.png',
      })
    }
    this.setData({
      lifeStyle: lifeStyle
    })
  },

  setToday(result){
    let date = new Date()
    this.setData({
      todayDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '今天',
      todayWind: result.now.wind_dir + ' ' + result.now.wind_sc + '级',
    })  
  },

  onTapDayWeather(){
    wx.showToast()
    wx.navigateTo({
      url: '../list/list?city=' + this.data.city,
    })
  },

  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED) {
      wx.openSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation']
          if(auth){
            this.getLocationAndWeather()
          }
        }
      })
    }else{
      this.getLocationAndWeather()
    }
  },

  getLocationAndWeather(){
    wx.getLocation({
      success: res => {
        this.setData({
          //locationTipsText: AUTHORIZED_TIPS,
          locationAuthType: AUTHORIZED
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }, 
          success: res => {
            let city = res.result.address_component.city
            console.log(city)
            this.setData({
              city: city,
              locationTipsText: ''
            })
            this.getNowInfo()
          }
        })
      },
      fail: () => {
        this.setData({
          //locationTipsText: UNAUTHORIZED_TIPS,
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }  
})

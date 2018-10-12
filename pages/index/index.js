const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
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
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
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
    console.log('onload')
    this.qqmapsdk = new QQMapWX({
      key: '4J3BZ-A2LRQ-D655L-GEKFP-NUCD2-J3F4U'
    })
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED :UNPROMPTED,
          locationTipsText: auth ? AUTHORIZED_TIPS : (auth === false) ? UNAUTHORIZED_TIPS : UNPROMPTED_TIPS
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
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        console.log(res,this.data.city)
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherImg: '/images/' + weather + '-bg.png',
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

  setToday(result){
    let date = new Date()
    this.setData({
      todayDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '今天',
      todayTemp: result.today.minTemp + '° - ' + result.today.maxTemp + '°',
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
          locationTipsText: AUTHORIZED_TIPS,
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
          locationTipsText: UNAUTHORIZED_TIPS,
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }  
})

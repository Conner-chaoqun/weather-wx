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

Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherImg: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
  },
  onPullDownRefresh(){
    this.getNowInfo(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
    this.getNowInfo()
  },

  getNowInfo(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '北京市'
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        console.log(res)
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
      url: '../list/list',
    })
  }  
})

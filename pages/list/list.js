// pages/list/list.js
const dayMap = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']

const weatherMap = {
  '晴': 'sunny',
  '多云': 'cloudy',
  '阴': 'overcast',
  '小雨': 'lightrain',
  '大雨': 'heavryrain',
  '雪': 'snow'
}

Page({
  data: {
    weekWeather: [],
    city: '杭州市'
  },

  onPullDownRefresh(){
    this.getAllWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  },

  onLoad(options){
    console.log('onload')
    this.setData({
      city: options.city
    })
    this.getAllWeekWeather()
  },

  // onShow(){
  //   console.log('onshow')
  // },

  // onReady() {
  //   console.log('onready')
  // },

  // onHide() {
  //   console.log('onhide')
  // },

  // onUnload() {
  //   console.log('onunload')
  // },

  getAllWeekWeather(callback){
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather',
      data: {
        location: this.data.city,
        key: 'HE1812162058071374',
      },
      success: res => {
        console.log(this.data.city)
        let result = res.data.HeWeather6[0].daily_forecast
        console.log(result)
        this.setAllWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setAllWeekWeather(result){
    let weekweather = []
    for (let i = 0; i < 3; i++) {
      let date = new Date()
      console.log(date.getDay())
      date.setDate(date.getDate() + i)
      weekweather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].tmp_min}° - ${result[i].tmp_max}°`,
        iconPath: '/images/' + weatherMap[result[i].cond_txt_d] + '-icon.png',
      })
    }
    weekweather[0].day = '今天'
    this.setData({
      weekWeather: weekweather
    })
  }
})
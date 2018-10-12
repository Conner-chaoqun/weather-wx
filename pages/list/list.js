// pages/list/list.js
const dayMap = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
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
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: this.data.city
      },
      success: res => {
        console.log(this.data.city)
        let result = res.data.result
        //console.log(result)
        this.setAllWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setAllWeekWeather(result){
    let weekweather = []
    for (let i = 0; i < 7; i++) {
      let date = new Date()
      console.log(date.getDay())
      date.setDate(date.getDate() + i)
      weekweather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].minTemp}° - ${result[i].maxTemp}°`,
        iconPath: '/images/' + result[i].weather + '-icon.png',
      })
    }
    weekweather[0].day = '今天'
    this.setData({
      weekWeather: weekweather
    })
  }
})
<template>
  <div class="wrapper">
    <div class="songList">
      <div v-for="(item, index) in songList" :key="index" @click="select(item)">
        <div>
          <span>{{item.title}}</span>
          <span>{{item.author}}</span>
        </div>
      </div>
    </div>
    <div class="outer">
      <div class="wrap" :class="{'wrap-hidn': !isLock}">
        <div class="lock-wrap" >
          <div :class="isLock ? 'lock':'unlock'" @click="changeLock"></div>
        </div>
        <div class="hand" title="展开播放条"></div>
        <div class="player-wrap">
          <video muted="false" hidden="hidden">
            <audio v-if="flag"
                   ref="player"
                   src=""></audio>
          </video>
          <!--播放控件-->
          <div class="btns">
            <div class="btn-wrapper prev-btn" @click="prev"></div>
            <div class="btn-wrappe"
                 :class="status === 'pause'? 'play-btn' : 'pause-btn'"
                 @click="play"></div>
            <div class="btn-wrapper next-btn" @click="next"></div>
          </div>
          <!--音乐海报-->
          <div class="song-img">
                <img class= "img-wrapper" :src="img" alt="">
          </div>
          <!--进度条-->
          <div class="pro">
            <div class="song-info">
              <span class="singer-name">{{title}}</span>
              <span class="album-name">{{author}}</span>
            </div>
            <div class="time">
              <div class="time-wrapper" @mousedown="isClick" ref="timeWrapper">
                <div class="pro-bottom" ref="proBottom"></div>
                <div class="pro-top" ref="proTop">
                  <div class="slider-point" @mousedown="slider" ref="slider"></div>
                </div>
              </div>
              <div class="music-time">{{currentTime}}/{{totalTime}}</div>
            </div>
          </div>
          <!--功能按键-->
          <div class="func">
            <div class="volume" :class="{sound: volSound}">
              <div class="volume-wrapper" @mousedown="isVolClick" ref="volumeWrapper">
                <div class="volProgressBar"></div>
                <div class="volProgress" ref="volProgress">
                  <div class="volSlider-point" @mousedown="volSlider" ref="volSlider"></div>
                </div>
              </div>
            </div>
            <div class="icon icon-vol" @click="soundSwitch"></div>
            <div class="icon icon-loop"
                 :class="mode"
                 @click="changeMode"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
// import { mapState } from 'vuex'
// import { mapMutations } from 'vuex'

export default {
  name: 'music',
  data () {
    return {
      status: 'pause',
      isPlay: true,
      isLock: false,
      volSound: false,
      timer: null,
      drag: false,
      jump: false,
      flag: true,
      audio: '',
      index: 0, // 当前对应索引
      curIndex: '', // 改变后的索引
      len: 0, // 数据长度
      id: '',
      title: '',
      img: '',
      url: '',
      author: '',
      songList: [],
      musicList: '',
      currentTemp: '',
      totalTemp: '',
      totalTime: '00:00',
      currentTime: '00:00',
      per: 0,
      volPer: 0.6, // 音量大小
      modeNum: 0 // 0 为顺序 1为单曲循环 2为乱序
    }
  },
  computed: {
    mode () {
      if (this.modeNum === 0) {
        return 'icon-loop'
      }
      if (this.modeNum === 1) {
        return 'icon-one'
      }
      if (this.modeNum === 2) {
        return 'icon-shuffle'
      }
    }
  },
  async mounted () {
    await this.init()
    this.audio = this.$refs.player
    this.getIndex(0)
    this.$refs.volProgress.style.height = this.volPer * 100 + '%'
    this.$refs.volSlider.style.top = this.volPer * 100 + 'px' // 进度条的长度为100px
    this.timer = setInterval(() => {
      // 当鼠标拖动或点击时 停止给currentTime赋值
      if (!this.jump || !this.drag) {
        this.currentTemp = this.audio.currentTime
        this.currentTime = this.formatTime(this.currentTemp)
        this.per = this.currentTemp / this.totalTemp
        this.$refs.proTop.style.width = this.per * 100 + '%'
        this.$refs.slider.style.left = this.per * 500 + 'px' // 进度条的长度为500px
        this.audio.currentTime = this.currentTemp
      }
      if (this.audio.ended) {
        this.next()
      }
    }, 1000)
  },
  // 页面销毁清除定时器
  beforeDestroy () {
    clearInterval(this.timer)
    this.timer = null
  },

  methods: {
    // 获取数据初始化设置
    async init () {
      const getMusicList = url => axios.get(url)
      let url = 'https://www.easy-mock.com/mock/5caacd926a48d31d50b36e5c/music/musicData'
      let res = await getMusicList(url)
      if (res && res.data.data.code === 0) {
        this.musicList = res.data.data.musicList
        this.len = this.musicList.length
        this.musicList.forEach(ele => {
          let obj = {
            id: ele.id,
            title: ele.songname,
            img: ele.img,
            url: ele.url,
            author: ele.singername
          }
          this.songList.push(obj)
        })
        // 因为是异步请求，所以一开始播放器中是没有歌曲的，所有给了个v-if不然会插件默认会先生成播放器，导致报错
        this.flag = true
      }
    },
    // 获取图文信息
    detailData () {
      this.id = this.songList[this.index].id
      this.title = this.songList[this.index].title
      this.author = this.songList[this.index].author
      this.img = this.songList[this.index].img
      this.url = this.songList[this.index].url
      this.currentTemp = 0
      this.currentTime = this.formatTime(this.currentTime)
    },
    changeLock () {
      this.isLock = !this.isLock
    },
    play () {
      if (this.status === 'pause') {
        this.status = 'play'
      } else {
        this.status = 'pause'
      }
      this.isPlay = !this.isPlay
    },
    prev () {
      if (this.modeNum === 0 || this.modeNum === 1) {
        this.getIndex(-1)
      }
      if (this.modeNum === 2) {
        this.random()
      }
    },
    next () {
      if (this.modeNum === 0 || this.modeNum === 1) {
        this.getIndex(1)
      }
      if (this.modeNum === 2) {
        this.random()
      }
    },
    // 随机播放
    random () {
      let num = Math.random()
      num = Math.floor(num * this.len)
      this.getIndex(num)
    },
    // 控制index变化
    getIndex (val) {
      this.curIndex = (this.index + this.len + val) % (this.len)
      this.index = this.curIndex
    },
    // 时间转换格式
    formatTime (t) {
      t = Math.round(t)
      let m = Math.floor(t / 60)
      let s = t - m * 60
      if (m < 10) {
        m = '0' + m
      }
      if (s < 10) {
        s = '0' + s
      }
      return m + ':' + s
    },
    // 进度条 防止click 与 onmouse 事件冲突
    isClick () {
      let firstTime = new Date().getTime()
      document.onmouseup = () => {
        let lastTime = new Date().getTime()
        let time = lastTime - firstTime
        if (time < 200) {
          this.skip()
        }
      }
    },
    // 音量 防止click 与 onmouse 事件冲突
    isVolClick () {
      let firstTime = new Date().getTime()
      document.onmouseup = () => {
        let lastTime = new Date().getTime()
        let time = lastTime - firstTime
        if (time < 200) {
          this.volSkip()
        }
      }
    },
    // 进度条滑动
    slider (e) {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()
      this.drag = true
      let newPer
      let slider = this.$refs.slider
      let disX = e.clientX - slider.offsetLeft
      // 从未播放，拖动则加载歌曲资源
      if (!this.currentTemp) {
        this.audio.src = this.songList[this.curIndex].url
        // 元数据加载完毕
        this.audio.onloadedmetadata = () => {
          this.totalTemp = this.audio.duration
          this.totalTime = this.formatTime(this.totalTemp)
        }
      }

      document.onmousemove = (e) => {
        let left = e.clientX - disX
        newPer = left / 500
        if (newPer < 0) {
          newPer = 0
        }
        if (newPer > 1) {
          newPer = 1
        }
        this.per = newPer
        this.$refs.proTop.style.width = newPer * 100 + '%'
        this.$refs.slider.style.left = newPer * 500 + 'px' // 进度条的长度为500px
        this.currentTemp = this.per * this.totalTemp
        this.currentTime = this.formatTime(this.currentTemp)
      }
      document.onmouseup = (e) => {
        this.drag = false
        this.audio.currentTime = this.currentTemp
        // console.log('----' + this.per)
        if (this.status === 'play') {
          this.audio.play()
          if (newPer === 1) {
            this.next()
          }
        }
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    // 进度条点击
    skip (e) {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()
      let timeWrapper = this.$refs.timeWrapper
      let location = e.layerX
      let width = timeWrapper.clientWidth
      this.per = location / width
      this.jump = true
      // 从未播放，点击进度则加载歌曲资源
      if (!this.currentTemp) {
        this.audio.src = this.songList[this.curIndex].url
        // 元数据加载完毕
        this.audio.onloadedmetadata = () => {
          this.totalTemp = this.audio.duration
          this.totalTime = this.formatTime(this.totalTemp)
          this.currentTemp = this.per * this.totalTemp
          this.currentTime = this.formatTime(this.currentTemp)
          this.audio.currentTime = this.currentTemp
        }
      }
      this.currentTemp = this.per * this.totalTemp
      this.currentTime = this.formatTime(this.currentTemp)
      this.audio.currentTime = this.currentTemp
      this.$refs.proTop.style.width = this.per * 100 + '%'
      this.$refs.slider.style.left = this.per * 500 + 'px'
    },
    // 音量滑动
    volSlider (e) {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()
      let volPer
      let slider = this.$refs.volSlider
      let disY = e.clientY + slider.offsetTop // 因为方向改变 加号
      document.onmousemove = (e) => {
        let top = -(e.clientY - disY) // 因为方向改变 负号
        volPer = (top / 100)
        if (volPer < 0) {
          volPer = 0
        }
        if (volPer > 1) {
          volPer = 1
        }
        this.volPer = volPer
        this.audio.volume = volPer
        this.$refs.volProgress.style.height = volPer * 100 + '%'
        this.$refs.volSlider.style.top = volPer * 100 + 'px' // 进度条的长度为100px
      }
      document.onmouseup = (e) => {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    // 音量点击
    volSkip (e) {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()
      let volumeWrapper = this.$refs.volumeWrapper
      let location = 100 - e.layerY
      let height = volumeWrapper.clientHeight
      this.volPer = location / height
      this.audio.volume = this.volPer
      this.$refs.volProgress.style.height = this.volPer * 100 + '%'
      this.$refs.volSlider.style.top = this.volPer * 100 + 'px'
    },
    // 音量显示
    soundSwitch () {
      this.volSound = !this.volSound
    },
    // 改变播放模式
    changeMode () {
      this.modeNum += 1
      if (this.modeNum > 2) {
        this.modeNum = 0
      }
      if (this.modeNum === 1) {
        this.audio.loop = 'loop'
      } else {
        this.audio.loop = ''
      }
    },
    select (item) {
      console.log(item)
      // this.getIndex(item.id)
      this.curIndex = item.id
      this.index = item.id
    }
  },
  watch: {
    // 监听当前索引值的变化
    curIndex (newVal) {
      this.$nextTick(() => {
        // 页面信息渲染 图片 文字
        this.detailData()
        this.totalTime = '00:00'
        this.currentTime = '00:00'
        // 播放状态才获取资源  暂停状态下获取资源拖动为条件
        if (this.status === 'play') {
          this.audio.src = this.songList[newVal].url
          // 元数据加载完毕
          this.audio.onloadedmetadata = () => {
            this.totalTemp = this.audio.duration
            this.totalTime = this.formatTime(this.totalTemp)
          }
          // 歌曲准备就绪 缺少判断
          this.audio.play()
        }
        if (this.status === 'pause') {
          this.audio.currentTime = 0 // 防定时器有值
          this.totalTime = '00:00'
          this.currentTime = '00:00'
          this.currentTemp = 0
        }
      })
    },

    status (newVal) {
      this.$nextTick(() => {
        if (newVal === 'play') {
          // 当前歌曲播放过程中暂停后播放
          if (this.currentTemp) {
            this.audio.currentTemp = this.currentTemp
            this.audio.play()
          } else {
            // 切换下一首歌
            this.audio.src = this.songList[this.curIndex].url
            // 元数据加载完毕
            this.audio.onloadedmetadata = () => {
              this.totalTemp = this.audio.duration
              this.totalTime = this.formatTime(this.totalTemp)
            }
            this.audio.play()
          }
        }
        if (newVal === 'pause') {
          this.audio.pause()
        }
      })
    }
  }
}
</script>

<style scoped>
  .songList{
    width: 400px;
    height: 200px;
    border: 1px solid black;
  }
  .hand{
    position: absolute;
    top: -20px;
    width: 100%;
    height: 20px;
    cursor: pointer;
  }
  .lock-wrap{
    position: absolute;
    top: -14px;
    right: 15px;
    width: 52px;
    height: 67px;
    background-image: url("../assets/images/playbar.png");
    background-repeat: no-repeat;
    background-position: 0 -380px;
  }
  .lock{
    width: 18px;
    height: 18px;
    margin: 6px 0 0 17px;
    background-image: url("../assets/images/playbar.png");
    background-repeat: no-repeat;
    background-position: -100px -380px;
  }
  .lock:hover{
    background-position: -100px -400px
  }
  .unlock{
    width: 18px;
    height: 18px;
    margin: 6px 0 0 17px;
    background-image: url("../assets/images/playbar.png");
    background-repeat: no-repeat;
    background-position: -80px -380px;
  }
  .unlock:hover{
    background-position: -80px -400px;
  }
  .outer{
    position: fixed;
    zoom: 1;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    width: 100%;
    z-index: 1002;
  }
  .songList{
    position: absolute;
    left: 0;
    top: 0;
    width: 500px;
    height: 200px;
    border: 1px solid red
  }
  .wrap{
    position: absolute;
    top: -53px;
    left: 0;
    width: 100%;
    height: 53px;
    margin: 0 auto;
    color: #fff;
    background-image: url(../assets/images/playbar.png);
  }
  .wrap-hidn{
    top: -7px;
  }
  .wrap-hidn:hover{
    top: -53px;
    animation: show 0.5s ease;
  }
  @keyframes show {
    from {top :-7px}
    to{top: -53px}
  }
  .player-wrap{
    z-index: 15;
    width: 980px;
    height: 47px;
    margin: 0 auto;
  }
  /*播放控件*/
  .btns{
    float: left;
    width: 137px;
    padding: 10px 0 0 0;
  }
.btn-wrapper {
  cursor: pointer;
  border-radius: 50%;
  display: block;
  float: left;
  background-image: url("../assets/images/playbar.png");
  background-repeat: no-repeat;
}
  .prev-btn{
    width: 28px;
    height: 28px;
    margin-right: 8px;
    margin-top: 5px;
    background-position: 0px -130px;
  }
  .prev-btn:hover{
    background-position: -30px -130px;
  }
  .play-btn{
    float: left;
    display: block;
    width: 36px;
    height: 36px;
    margin-right: 8px;
    background-image: url("../assets/images/playbar.png");
    background-repeat: no-repeat;
    background-position: 0 -204px;
  }
  .pause-btn{
    float: left;
    width: 36px;
    height: 36px;
    margin-right: 8px;
    background-image: url("../assets/images/playbar.png");
    background-repeat: no-repeat;
    background-position: -40px -165px
  }
  .next-btn{
    display: block;
    width: 28px;
    height: 28px;
    margin-right: 8px;
    margin-top: 5px;
    background-position: -80px -130px;
  }
  .next-btn:hover{
    background-position: -110px -130px;
  }
  .playing{
    background-position: -40px -165px;
  }
/*  !*图片展示*!*/
  .song-img{
    margin: 13px 15px 0 0;
    width: 34px;
    height: 34px;
    float: left;
  }
  .img-wrapper{
    overflow: hidden;
    border-radius: 4px;
    width: 100%;
    heith: 100%
  }
  /*进度条*/
  .pro{
    margin-top: 5px;
    font-size: 12px;
    position: relative;
    width: 608px;
    float: left;
  }

  .song-info{
    float: left;
    height: 28px;
    line-height: 28px;
    display: block;
  }
  .album-name{
    display: inline-block;
    margin-left: 30px;
  }
  .time{
    float: left;
    position: absolute;
    top:23px;
    width: 665px;
    display: flex;
    flex-direction: row;
    margin-top: 3px;
  }
  .music-time{
    margin: 0 15px;
  }
  .time-wrapper{
    width: 510px;
    position: relative;
  }
  .pro-bottom{
    height: 6px;
    width: 500px;
    margin-right: 15px;
    position: absolute;
    top: 50%;
    background: #333333;
    transform: translateY(-50%);
    border-radius: 3px;
  }

  .pro-top{
    position: absolute;
    top: 50%;
    height: 6px;
    width: 0%;
    transform: translateY(-50%);
    background: #c20c0c;
  }
  .slider-point{
    position: absolute;
    left: -1px;
    transform: translateY(-36%);
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background-color: #fff;
  }
  .slider-point::after{
    content: '';
    display: block;
    background: red;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    width: 8px;
    height: 8px;
  }
  /*功能按键*/
  .func{
    position: relative;
    z-index: 10;
    width: 113px;
    padding-left: 13px;
    float: left;
    padding-top: 7px;
  }
  .icon{
    cursor: pointer;
    float: left;
    width: 25px;
    height: 25px;
    margin: 11px 10px 0 0;
    background-image: url("../assets/images/playbar.png");
    background-repeat: no-repeat;
  }
  .icon-vol{
    background-position: -2px -248px
  }
  .icon-vol:hover{
    background-position: -31px -248px;
  }
  .icon-loop{
    background-position: -3px -344px;
  }
  .icon-loop:hover{
    background-position: -33px -344px;
  }
  .icon-one{
    background-position: -66px -344px;
  }
  .icon-one:hover{
    background-position: -93px -344px;
  }
  .icon-shuffle{
    background-position: -66px -248px;
  }
  .icon-shuffle:hover{
    background-position: -93px -248px;
  }

  .volume{
    visibility: hidden;
    display: flex;
    position: absolute;
    top: -121px;
    left: 13px;
    height: 110px;
    padding-bottom: 10px;
    border: 1px solid black;
    transform: rotateZ(-180deg);
    background: #000000;
  }
  .volume-wrapper{
    height: 100px;
    width: 25px;
    position: relative;
  }
  .volProgressBar{
    height: 100px;
    width: 4px;
    position: absolute;
    left: 50%;
    margin-bottom: 25px;
    background: #000;
    transform: translateX(-50%);
  }
  .volProgress{
    position: absolute;
    left: 50%;
    width: 4px;
    height: 0%;
    transform: translateX(-50%);
    background: #c20c0c;
  }
  .volSlider-point{
    position: absolute;
    top: 0px;
    transform: translateX(-30%);
    height: 10px;
    width: 10px;
    border-radius: 50%;
    background-color: #ffffff;
  }
  .volSlider-point::after{
    content: '';
    display: block;
    background: red;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    width: 5px;
    height: 5px;
  }
  .sound{
    visibility: visible;
  }
</style>

<template>
  <div class="wrapper">
    <div class="wrap">
      <div class="player-wrap">
        <video muted="false" hidden="hidden">
          <audio v-if="flag"
                 ref="player"
                 src=""></audio>
        </video>
        <!--播放控件-->
        <div class="btns">
          <!-- <div class="btn-wrapper like-btn"></div>-->
          <div class="btn-wrapper prev-btn" @click="prev"></div>
          <div class="btn-wrapper play-btn" @click="play"></div>
          <div class="btn-wrapper next-btn" @click="next"></div>
          <!--      <div class="btn-wrapper list-btn"></div>-->
        </div>
        <!--音乐海报-->
        <div class="song-img">
          <div class="">
            <div class="img-wrapper">
              <img src="" alt="">
            </div>
          </div>
        </div>
        <!--进度条-->
        <div class="pro">
          <div clas="song-info">
            <span class="singer-name">Gemin</span>
            <span class="album-name">sfadfsafs</span>
          </div>
          <div class="time">
            <div class="time-wrapper" @mousedown="isClick" ref="timeWrapper">
              <div class="pro-bottom" ref="proBottom"></div>
              <div class="pro-top" ref="proTop">
                <div class="slider-point" @mousedown="slider" ref="slider"></div>
              </div>
            </div>
            <div class="all-time">{{currentTime}}/{{totalTime}}</div>
          </div>
        </div>
        <!--功能按键-->
        <div class="func">
          <div class="icon"></div>
          <div class="icon"></div>
          <div class="icon"></div>
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
    data() {
      return {
        status:'pause',
        audio:'',
        index:0,   //当前对应索引
        curIndex:'',//改变后的索引
        len:0,//数据长度
        url:'',
        timer:null,
        drag: false,
        flag:true,
        songList:[],
        musicList:'',
        currentTemp:'',
        totalTemp:'',
        totalTime:'00:00',
        currentTime:'00:00',
        per:0,
        volPer:0.6//音量大小
      }
    },

    async mounted () {
      await this.init()
      this.audio = this.$refs.player
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        //当鼠标拖动时 停止给currentTime赋值
        if(!this.drag) {
          this.currentTemp = this.audio.currentTime
          this.currentTime = this.formatTime(this.currentTemp)
          this.per = this.currentTemp / this.totalTemp
          this.$refs.proTop.style.width = this.per * 100 + '%'
          this.$refs.slider.style.left = this.per * 500 + 'px' //进度条的长度为500px
          this.audio.currentTime = this.currentTemp
        }
        if (this.audio.ended) {
          console.log("ended")
          this.next()
        }
      },1000)
      // console.log(this.songList[this.index].url)
      // console.log(audio.duration)
    },

    beforeDestroy() {
      clearInterval(this.timer);
      this.timer = null;
    },

    methods: {
      //获取数据初始化设置
      async init() {
        const getMusicList = url => axios.get(url)
        let url = 'https://www.easy-mock.com/mock/5caacd926a48d31d50b36e5c/music/musicData';
        let res = await getMusicList(url)
        if(res && res.data.data.code == 0){
          this.musicList = res.data.data.musicList;
          this.len = this.musicList.length
          this.musicList.forEach(ele => {
            let obj = {
              title:ele.songname,
              // pic:element.musicImgSrc,
              url:ele.url,
              author:ele.singername,
            }
            this.songList.push(obj);
          });
          //因为是异步请求，所以一开始播放器中是没有歌曲的，所有给了个v-if不然会插件默认会先生成播放器，导致报错
          this.flag = true;
        };
      },
      play(){
        if(this.status == 'pause') {
          this.status = 'play'
        }else{
          this.status = 'pause'
        }
      },
      prev () {
        this.getIndex(-1)
        this.url = this.songList[this.index].url
      },
      next () {
        this.getIndex(1)
        this.url = this.songList[this.index].url
      },
      //单曲播放
      single() {
        this.getIndex(0)
        this.url = this.songList[this.index].url
      },
      //随机播放
      random() {
        let num = Math.random()
        num = Math.floor(num * this.len)
        this.getIndex(num)
        this.url = this.songList[this.index].url
      },
      //控制index变化
      getIndex (val) {
        this.curIndex =(this.index + this.len + val) % (this.len)
        this.index = this.curIndex
      },
      //时间转换格式
      formatTime (t) {
        t = Math.round(t);
        var m = Math.floor(t / 60);
        var s = t - m * 60;
        if( m < 10) {
          m = '0' + m;
        }
        if( s < 10) {
          s = '0' + s;
        }
        return m + ':' + s
      },
      //进度条 防止click 与 onmouse 事件冲突
      isClick(){
        let firstTime = new Date().getTime()
        document.onmouseup =  () => {
          let lastTime = new Date().getTime()
          let time = lastTime - firstTime
          if (time < 200) {
            this.skip()
          }
        }
      },
      // 音量 防止click 与 onmouse 事件冲突
      isVolClick() {
        let firstTime = new Date().getTime()
        document.onmouseup =  () => {
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
        let _this = this
        document.onmousemove = (e) => {
          let left = e.clientX - disX
          newPer = left / 500
          if(newPer < 0){
            newPer = 0
          }
          if (newPer > 1) {
            newPer = 1
          }
          this.per = newPer
          this.$refs.proTop.style.width = newPer * 100 + '%'
          this.$refs.slider.style.left = newPer * 500 + 'px' //进度条的长度为500px
          this.currentTemp = this.per * this.totalTemp
          this.currentTime = this.formatTime(this.currentTemp)
        }
        document.onmouseup = (e) => {
          this.drag = false
          _this.audio.currentTime = this.currentTemp
          _this.audio.play()
          document.onmousemove = null;
          document.onmouseup = null;
        }
      },
      // 进度条点击
      skip(e) {
        e = e || window.event
        e.stopPropagation()
        e.preventDefault()
        let timeWrapper = this.$refs.timeWrapper
        let location = e .layerX
        let width = timeWrapper.clientWidth
        this.per = location / width
        this.audio.currentTime= this.per * this.totalTemp
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
        let disY = e.clientY + slider.offsetTop  //因为方向改变 加号
        document.onmousemove = (e) => {
          let top = - (e.clientY - disY) // 因为方向改变 负号
          volPer = (top / 100)
          if(volPer < 0){
            volPer = 0
          }
          if (volPer > 1) {
            volPer = 1
          }
          this.volPer = volPer
          this.audio.volume = volPer
          this.$refs.volProgress.style.height = volPer * 100 + '%'
          this.$refs.volSlider.style.top =  +volPer * 100 + 'px' //进度条的长度为100px
        }
        document.onmouseup = (e) => {
          document.onmousemove = null;
          document.onmouseup = null;
        }

      },
      //音量点击
      volSkip (e) {
        e = e || window.event
        e.stopPropagation()
        e.preventDefault()
        let volumeWrapper = this.$refs.volumeWrapper
        let location = 100 - e .layerY
        console.log(location)
        let height = volumeWrapper.clientHeight
        console.log(height)
        this.volPer = location / height
        this.audio.volume= this.volPer
        this.$refs.volProgress.style.height = this.volPer * 100 + '%'
        this.$refs.volSlider.style.top = this.volPer * 100 + 'px'
      }
    },

    watch:{
      // 监听音乐文件的变化
      url (newUrl){
        let _this = this
        _this.$nextTick(() => {
          if (_this.status == "pause") {
            _this.audio.src = newUrl
            _this.$refs.player.pause()
          } else {
            _this.audio.src = newUrl
            _this.audio.play()
            _this.totalTemp = _this.audio.duration
            _this.totalTime = _this.formatTime(_this.totalTemp)
          }
        })
      },
      //监听状态的改变
      status () {
        let _this = this
        _this.$nextTick(() => {
          if (_this.status == "play") {
            console.log("开始")
            // 同一首歌暂停后播放
            if(_this.currentTemp) {
              _this.audio.currentTime = _this.currentTemp
              _this.audio.play()
            }else{
              //歌曲切换后播放
              _this.audio.src = _this.songList[_this.index].url
              // 元数据加载完毕
              _this.audio.onloadedmetadata = () => {
                //获取歌曲总时间
                _this.totalTemp = _this.audio.duration
                _this.totalTime = _this.formatTime(_this.totalTemp)
                _this.audio.volume = this.volPer
              }
              this.$refs.volProgress.style.height = this.volPer * 100 + '%'
              this.$refs.volSlider.style.top =  this.volPer * 100 + 'px' //进度条的长度为100px
              _this.audio.play()
            }
          }
          if (_this.status == "pause") {
            console.log("暂停")
            _this.audio.pause()
          }
        })
      },
    }
  }
</script>

<style scoped>
  .wrapper{
    border: 1px solid black;
    position: fixed;
    zoom: 1;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    width: 100%;
    z-index: 1002;
  }
  .wrap{
    position: absolute;
    zoom: 1;
    top: -53px;
    left: 0;
    width: 100%;
    height: 53px;
    margin: 0 auto;
  }
  .player-wrap{
    z-index: 15;
    width: 980px;
    height: 47px;
    margin: 0 auto;
  }
  /*播放控件*/
  .btns{
    border: 1px solid black;
    float: left;
    width: 137px;
    padding: 6px 0 0 0;
  }
  .btn-wrapper{
    border: 1px solid black;
    border-radius: 50%;
    display: block;
    float: left;
    width: 28px;
    height: 28px;
    margin-right: 8px;
    margin-top: 5px;
  }
  /*  .prev-btn{*/
  /*    background-image: url("../assets/images/icon-prev.png");*/
  /*  }*/
  /*  .play-btn{*/
  /*    width: 25px;*/
  /*    height: 25px;*/
  /*    margin: 0 10px;*/
  /*    transform: scale(1.5);*/
  /*    background-size:50% 50%;*/
  /*    background-position-x: 7px;*/
  /*    background-image: url("../assets/images/icon-play.png");*/
  /*  }*/
  /*  .next-btn{*/
  /*    background-image: url("../assets/images/icon-next.png");*/
  /*  }*/
  /*  .playing{*/
  /*    background-image: url("../assets/images/icon-pause.png");*/
  /*    transform: scale(1.5);*/
  /*  }*/
  /*  !*图片展示*!*/
  .song-img{
    margin: 6px 15px 0 0;
    border: 1px solid black;
    width: 34px;
    height: 34px;
    float: left;
  }
  /*进度条*/
  .pro{
    font-size: 12px;
    border: 1px solid black;
    position: relative;
    width: 608px;
    float: left;
  }

  .song-info{
    float: left;
    height: 28px;
    overflow: hidden;
    color: #e8e8e8;
    text-shadow: 0 1px 0 #171717;
    line-height: 28px;
    display: block;
    border: 1px solid black;
  }
  .album-name{
    display: inline-block;
    margin-left: 30px;
  }
  .time{
    float: left;
    /*position: absolute;*/
    /*top:10px;*/
    width: 665px;
    display: flex;
    flex-direction: row;
    margin-top: 3px;
  }
  .all-time{
    margin: 0 20px;
  }
  .time-wrapper{
    width: 510px;
    border: 1px solid black;
    position: relative;
    overflow: hidden;
  }
  .pro-bottom{
    height: 6px;
    width: 500px;
    margin-right: 15px;
    position: absolute;
    top: 50%;
    background: red;
    transform: translateY(-50%);
  }

  .pro-top{
    position: absolute;
    top: 50%;
    height: 6px;
    width: 0%;
    transform: translateY(-50%);
    background: green;
  }
  .slider-point{
    position: absolute;
    left: 0px;
    transform: translateY(-25%);
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background-color: #fff;
  }

  /*功能按键*/
  .func{
    position: relative;
    z-index: 10;
    width: 113px;
    padding-left: 13px;
    float: left;
    border: 1px solid black;
  }
  .icon{
    float: left;
    width: 25px;
    height: 25px;
    margin: 11px 2px 0 0;
    border: 1px solid black;
  }
  .volume{
    display: flex;
    position: absolute;
    top: -117px;
    left: 30px;
    height: 110px;
    border: 1px solid black;
    transform: rotateZ(-180deg);

  }
  .volume-wrapper{
    height: 100px;
    width: 20px;
    position: relative;
  }
  .volProgressBar{
    height: 100px;
    width: 4px;
    position: absolute;
    left: 50%;
    margin-bottom: 10px;
    background: red;
    transform: translateX(-50%);
  }
  .volProgress{
    position: absolute;
    left: 50%;
    width: 4px;
    height: 0%;
    transform: translateX(-50%);
    background: green;
  }
  .volSlider-point{
    position: absolute;
    top: 0px;
    transform: translateX(-30%);
    height: 10px;
    width: 10px;
    border-radius: 50%;
    background-color: blue;
  }


</style>

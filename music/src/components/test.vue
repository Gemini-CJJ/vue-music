<template>
  <div class="music">
    <a-player v-if='isShow'
              :autoplay='true'
              :music="songList"></a-player>
  </div>
</template>
<script>
  import Axios from 'axios'
  import VueAplayer from 'vue-aplayer'
  export default{
    data(){
      return {
        musicList:[],
        songList:[],
        isShow:false
      }
    },
    mounted(){
      Axios.get('https://www.easy-mock.com/mock/5caacd926a48d31d50b36e5c/music/musicData').then(res=>{
        // let List = res.data.musicList;
        if (res && res.data.data.code == 0) {
          this.musicList = res.data.data.musicList;
          this.musicList.forEach(element => {
            let obj = {
              title:element.songname,
              // pic:element.musicImgSrc,
              url:element.url,
              author:element.singername,
            }
            this.songList.push(obj);
          });
          console.log(this.songList)
        }
        this.isShow = true;
      }).catch();
    },
    components: {
      'a-player': VueAplayer
    }
  }
</script>
<style>
  .music{
    margin:1rem 0;
  }
</style>

import Vue from 'vue'
import Router from 'vue-router'
import test from '@/components/test'
import temp from '@/components/temp'
import music from '@/components/music'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'music',
      component: music
    },
  ]
})

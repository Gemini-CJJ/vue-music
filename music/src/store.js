import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  status:'pause',
  index:0,   //当前对应索引
  curIndex:0,//改变后的索引
  len:10//数据长度

}

const mutations = {
  getIndex (state, val) {
    state.curIndex =(state.index + state.len + val) % (state.len)
    state.index = state.curIndex
  },

}

export default new Vuex.Store({
  state,
  mutations,
})

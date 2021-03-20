import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import Router from 'vue-router'
import {constantRouterMap} from './config/router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import * as echarts from 'echarts'
import axios from 'axios'
import VueAxios from "vue-axios";

Vue.config.productionTip = false
Vue.prototype.$echarts = echarts
Vue.prototype.$echarts.registerMap('china', require('./map/china-detail.json'))
Vue.prototype.$echarts.registerMap('world', require('./map/world.json'))
Vue.use(VueRouter)
const service = axios.create({
  // baseURL: 'https://localhost:44315/api',
  timeout: 9000
})
service.interceptors.response.use((response) => {
  return response.data
})
Vue.use(VueAxios, service)
let router = new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

Vue.use(Antd)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

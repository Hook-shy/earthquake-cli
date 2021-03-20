<template>
<a-card title="最近地震">
  <a-dropdown slot="extra" >
    <a class="ant-dropdown-link" @click="e => e.preventDefault()">
      {{['中国地震台网', '美国地质勘探局', '欧洲地中海地震中心'][dataSources]}} <a-icon type="down" />
    </a>
    <a-menu slot="overlay">
      <a-menu-item>
        <a @click="changeDataSources(0)">中国地震台网</a>
      </a-menu-item>
      <a-menu-item>
        <a @click="changeDataSources(1)">美国地质勘探局</a>
      </a-menu-item>
      <a-menu-item>
        <a @click="changeDataSources(2)">欧洲地中海地震中心</a>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
  <a-timeline mode="alternate">
    <a-timeline-item v-for="(item, index) in items" :key="index" :color="!item.icon?(item.data.level < 4.5? 'green':(item.data.level > 6?'red':'blue')): ''">
      <a-icon v-if="item.icon" slot="dot" :type="item.icon" style="font-size: 16px;" />
      <p v-if="item.icon" style="font-weight: bold; font-size: 1.5em;">{{item.time}}</p>
      <a-popover v-else :title="item.data.location" trigger="hover" placement="bottom">
        <div slot="content">
          <p>震级: {{item.data.level}} 级</p>
          <p>深度: {{item.data.depth}} km</p>
          <p>坐标: ({{item.data.longitude}}, {{item.data.latitude}})</p>
          <p>国家: {{item.data.country}}</p>
          <p>省: {{item.data.province}}</p>
          <p>市: {{item.data.city}}</p>
          <p>县: {{item.data.district}}</p>
          <p>镇: {{item.data.town}}</p>
          <p>地址: {{item.data.address}}</p>
        </div>
        <div>
          <p>{{item.time}}</p>
          <p>
            <span style="font-weight: bold">{{item.data.location}}</span>
            ({{item.data.longitude}}, {{item.data.latitude}}) 发生了 {{item.data.level}} 级地震, 震源深度 {{item.data.depth}} km
          </p>
        </div>

      </a-popover>

    </a-timeline-item>
  </a-timeline>
  <div style="text-align: center">
    <a-alert v-if="loadOver" message="没有更多了" type="info" show-icon style="display: inline-block"/>
    <a-button v-else type="primary" shape="round" :loading="loading" @click="loadMore">
      加载更多
    </a-button>
  </div>
  <a-back-top />
</a-card>
</template>

<script>
export default {
  name: "recent",
  data(){
    return{
      loading: true,
      loadOver: false,
      dataSources: 0,
      page: 0,
      size: 20,
      items: []
    }
  },
  methods:{
    changeDataSources(sources){
      if(this.dataSources !== sources){
        this.dataSources = sources
        this.loadOver = false
        this.page = 0
        this.items = []
        this.loadData()
      }
    },
    loadMore(){
      this.loadData()
    },
    loadData(){
      this.loading = true
      let that = this
      this.axios.post('/api/api/data/AllData', {
        dataSources: that.dataSources,
        page: that.page,
        size: that.size
      }).then(response => {
        let data = response.list.map(e=>{return {date: e.time.split('T')[0], time: e.time.split('T')[1], data: e}})
        let items = [{icon: 'clock-circle-o', time: data[0].date}, data[0]]
        for(let i = 1; i < data.length; i++){
          if(data[i].date !== data[i - 1].date){
            items.push({icon: 'clock-circle-o', time: data[i].date})
          }
          items.push(data[i])
        }
        if(items.length < that.size){
          that.loadOver = true
        }
        if(that.items.length > 0){
          if(that.items[that.items.length - 1].date === items[0].time){
            that.items = that.items.concat(items.slice(1, items.length - 1))
          }else {
            that.items = that.items.concat(items)
          }
        }else {
          that.items = items
        }
        that.loading = false
        that.page += 1
      }).catch(function () {
        that.$message.error('数据加载失败')
        that.loading = false
      })
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>

</style>
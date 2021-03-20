<template>
  <a-card :bordered="false">
    <a-spin :spinning="loading">
      <div>
        <div id="chart-bar" style="height: calc(100vh - 110px);"></div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0">
          <a-progress :stroke-color="{ '0%': '#108ee9', '100%': '#87d068', }" :percent="percent" size="small" style="margin-top: 0"/>
        </div>
        <div style="position: absolute; top: 0; left: 130px;">
          <a-form layout="inline">
            <a-form-item>
              <a-button type="primary" shape="circle" :icon="timer?'pause-circle':'play-circle'" @click="click"/>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" shape="circle" icon="redo" @click="restart"/>
            </a-form-item>
          </a-form>
        </div>
        <div style="position: absolute; top: 10px; left: 0;">
          <a-dropdown>
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
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script>

let optionBar = {
  title: {
    text: '中国各省地震累计次数',
    left: 'center'
  },
  // color: ['#66ccff', '#69f187', '#ff6666'],
  tooltip: {
    trigger: 'axis',
    axisPointer: { // 坐标轴指示器，坐标轴触发有效
      type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
    }
  },
  toolbox: {
    feature: {
      dataZoom: {
        xAxisIndex: 'none'
      },
      magicType: {
        type: ['line', 'bar']
      },
      restore: {},
      saveAsImage: {}
    }
  },
  grid: {
    top: 80,
    left: 120,
    right: 100,
    bottom: 50,
  },
  legend: {
    top: 40,
    data: ['有感地震', '中强地震', '巨大地震'],
  },
  // grid: {
  //     left: '3%',
  //     right: '4%',
  //     bottom: '3%',
  //     containLabel: true
  // },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: []
  },
  dataZoom: [{
    yAxisIndex: 0,
    type: 'inside',
    start: 20,
    end: 100
  }, {
    yAxisIndex: 0,
    start: 20,
    end: 100,
    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
    handleSize: '80%',
    handleStyle: {
      color: '#fff',
      shadowBlur: 3,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowOffsetX: 2,
      shadowOffsetY: 2
    }
  }],
  series: [{
    name: '有感地震',
    type: 'bar',
    stack: '总量',
    label: {
      show: true,
      position: 'insideRight'
    },
    data: []
  },
    {
      name: '中强地震',
      type: 'bar',
      stack: '总量',
      label: {
        show: true,
        position: 'insideRight'
      },
      data: []
    },
    {
      name: '巨大地震',
      type: 'bar',
      stack: '总量',
      label: {
        show: true,
        position: 'insideRight'
      },
      data: []
    }
  ]
};

let allData = []
let index = 0

export default {
  name: "rise",
  data(){
    return{
      loading: true,
      chartBar: null,
      timer: null,
      percent: 0,
      dataSources: 0
    }
  },
  methods: {
    changeDataSources(val){
      this.dataSources = Number(val)
      this.pause()
      this.restart()
      this.loadData()
    },
    click(){
      if(this.timer){
        this.pause()
      }else {
        this.play()
      }
    },
    loadData(){
      let that = this
      if(this.chartBar){
        this.loading = true
        this.axios.post('/api/api/data/ProvinceDayData', {DataSources: this.dataSources}).then(response => {
          let years = Array.from(new Set(response.small.map(d=>d.time).concat(response.medium.map(d=>d.time)).concat(response.large.map(d=>d.time))))
          years.sort((a, b)=>a-b)
          let provinces = Array.from(new Set(response.small.map(d=>d.province).concat(response.medium.map(d=>d.province)).concat(response.large.map(d=>d.province))))
          for(let i = 0; i < years.length; i++){
            if(i === 0){
              let yearData = provinces.map(e=>{return {province: e, small: response.small.filter(x=>x.time === years[i] && x.province === e),medium: response.medium.filter(x=>x.time === years[i] && x.province === e),large: response.large.filter(x=>x.time === years[i] && x.province === e)}})
              yearData = yearData.map(e=>{return{province: e.province, small: e.small.length?e.small[0].count:0, medium: e.medium.length?e.medium[0].count:0, large: e.large.length?e.large[0].count:0}})
              yearData.sort((a, b)=>a.small+ a.medium + a.large - b.small -b.medium -b.large)
              allData.push({
                year: `${Math.floor(years[i] / 10000)}-${Math.floor(years[i] / 100 % 100)}-${Math.floor(years[i] % 100)}`,
                yearData
              })
            }else {
              let yearData = provinces.map(e=>{return {province: e, small: response.small.filter(x=>x.time === years[i] && x.province === e),medium: response.medium.filter(x=>x.time === years[i] && x.province === e),large: response.large.filter(x=>x.time === years[i] && x.province === e)}})
              yearData = yearData.map(e=>{return{province: e.province, small: e.small.length?e.small[0].count:0, medium: e.medium.length?e.medium[0].count:0, large: e.large.length?e.large[0].count:0}})
              yearData = yearData.map(e=>{return{province: e.province, small: e.small + allData[i - 1].yearData.filter(f=>f.province===e.province)[0].small, medium: e.medium + allData[i - 1].yearData.filter(f=>f.province===e.province)[0].medium, large: e.large + allData[i - 1].yearData.filter(f=>f.province===e.province)[0].large}})
              yearData.sort((a, b)=>a.small+ a.medium + a.large - b.small -b.medium -b.large)
              allData.push({
                year: `${Math.floor(years[i] / 10000)}-${Math.floor(years[i] / 100 % 100)}-${Math.floor(years[i] % 100)}`,
                yearData
              })
            }
          }
          that.loading = false
          that.restart()
        }).catch(function () {
          that.$message.error('数据加载失败')
          that.loading = false
        })
      }
    },
    play(){
      let that = this
      that.timer = setInterval(function () {
        index += 10
        if(index < allData.length && index % 40 === 0){
          optionBar.yAxis.data = allData[index].yearData.map(e=>e.province)
          optionBar.series[0].data = allData[index].yearData.map(e=>e.small)
          optionBar.series[1].data = allData[index].yearData.map(e=>e.medium)
          optionBar.series[2].data = allData[index].yearData.map(e=>e.large)
          optionBar.title.text = allData[0].year + ' 至 ' + allData[index].year + ' 中国各省地震累计次数'
          that.chartBar.setOption(optionBar, true)
        }
        that.percent = (index / allData.length * 100).toFixed(2)
        if(index >= allData.length - 1){
          clearInterval(that.timer)
          that.timer = null
          index = 0
          that.percent = 100
        }
      }, 200)
    },
    pause(){
      clearInterval(this.timer)
      this.timer = null
    },
    restart(){
      index = 0
      this.percent = 0
      this.pause()
      optionBar.yAxis.data = allData.length ? allData[0].yearData.map(e=>e.province) : []
      optionBar.series[0].data = []
      optionBar.series[1].data = []
      optionBar.series[2].data = []
      optionBar.title.text = '各省地震累计次数'
      this.chartBar.setOption(optionBar, true)
    }
  },
  mounted() {
    let chartBar = this.$echarts.init(document.getElementById('chart-bar'), null, {renderer: 'canvas'});
    this.chartBar = chartBar
    window.onresize = function () {
      chartBar.resize()
    }
    chartBar.setOption(optionBar);
    this.loadData()
  }
}
</script>

<style scoped>

</style>
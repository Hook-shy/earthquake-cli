<template>
  <a-card :bodyStyle="{margin: 0, padding: 0}">
    <a-row>
      <a-col :xs="24" :sm="24" :xxl="4">
        <a-row>
          <a-col :xs="12" :sm="12" :md="6" :lg="24">
            <a-card :bordered="false" :loading="loadingStatistic">
              <a-statistic title="数据总量(自2012年)" :value="totalData.total||0" suffix="条" :value-style="{ color: '#343131' }">
                <template #prefix>
                  <a-icon type="database"/>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="6" :lg="6" :xl="4" :xxl="11">
            <a-card :bordered="false" :loading="loadingStatistic">
              <a-statistic title="今日新增" :value="totalData.day||0" suffix="条" :value-style="{ color: '#ff4683' }">
                <template #prefix>
                  <a-icon type="arrow-up"/>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="6" :lg="6" :xl="4" :xxl="11">
            <a-card :bordered="false" :loading="loadingStatistic">
              <a-statistic title="本月新增" :value="totalData.month||0" suffix="条" :value-style="{ color: '#aa09ff' }">
                <template #prefix>
                  <a-icon type="arrow-up"/>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="6" :lg="6" :xl="4" :xxl="11">
            <a-card :bordered="false" :loading="loadingStatistic">
              <a-statistic title="有感地震" :value="totalData.small||0" suffix="次" :value-style="{ color: '#5470c6' }">
                <template #prefix>
                  <a-icon type="project"/>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="6" :lg="6" :xl="4" :xxl="11">
            <a-card :bordered="false" :loading="loadingStatistic">
              <a-statistic title="中强地震" :value="totalData.medium||0" suffix="次" :value-style="{ color: '#91cc75' }">
                <template #prefix>
                  <a-icon type="project"/>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="6" :lg="6" :xl="4" :xxl="11">
            <a-card :bordered="false" :loading="loadingStatistic" v-if="!loadingStatistic">
              <a-statistic title="巨大地震" :value="totalData.large||0" suffix="次" :value-style="{ color: '#fac858' }">
                <template #prefix>
                  <a-icon type="project"/>
                </template>
              </a-statistic>
            </a-card>
          </a-col>
        </a-row>
      </a-col>
      <a-col :xs="24" :sm="24" :xxl="15">
        <a-card :bordered="false" :bodyStyle="{margin: 0, padding: 0}">
          <a-spin :spinning="loading">
            <div id="chart-main" style="height: calc(80vh - 50px);"></div>
            <div style="position: absolute; left: 20px; top: 30px;" >
              <a-breadcrumb>
                <a-breadcrumb-item>
                  <a>{{['中国地震台网', '美国地质勘探局', '欧洲地中海地震中心'][dataSources]}}</a>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a href="#" @click="changeDataSources(0)">
                        中国地震台网
                      </a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="#" @click="changeDataSources(1)">
                        美国地质勘探局
                      </a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="#" @click="changeDataSources(2)">
                        欧洲地中海地震中心
                      </a>
                    </a-menu-item>
                  </a-menu>
                </a-breadcrumb-item>
                <a-breadcrumb-item v-for="(item, index) in chartStack" :key="item.name">
                  <a href="#" rel="noopener noreferrer" @click="changeChart(index)">{{item.name}}</a>
                </a-breadcrumb-item>
              </a-breadcrumb>
              <br>
              <a-button type="primary" shape="circle" icon="left" :disabled="chartStack.length <= 1" @click="back"/>
            </div>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="24" :xxl="5">
        <a-card :bordered="false" :bodyStyle="{margin: 0, padding: 0}">
          <a-spin :spinning="loading">
            <div id="chart-bar" style="height: calc(80vh - 50px);"></div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
    <a-row>
      <a-card :bordered="false" :bodyStyle="{margin: 0, padding: 0}">
        <a-spin :spinning="loading">
          <div id="chart-trend" style="height: 20vh;"></div>
        </a-spin>
      </a-card>
    </a-row>
  </a-card>
</template>

<script>

let optionMain = {
  backgroundColor: '#fafafa',
  title: {
    text: '地震分布',
    left: 'center',
  },
  toolbox: {
    feature: {
      restore: {},
      saveAsImage: {}
    }
  },
  legend: {
    right: '0',
    top: '30',
    data: ['地震次数', '最近地震点'],
  },
  tooltip: {
    formatter: function (params) {
      if (params.seriesName === '地震次数') {
        return params.seriesName + '<br />' + params.name + '：' + (params.value?params.value:0) + '次'
      } else {
        return `${params.seriesName}<br>${params.data.value[2]}<br>${params.name}<br>级别: ${params.data.value[3]}级<br>深度: ${params.data.value[4]}km<br>坐标: ${params.data.value[0]}, ${params.data.value[1]}`
      }
    }
  },
  visualMap: [{
    min: 0,
    max: 1500,
    left: 'left',
    top: 'bottom',
    text: ['次数'],
    calculable: true,
    show: true
  },
    {
      left: 'right',
      top: 'center',
      dimension: 4,
      seriesIndex: 1,
      min: 0,
      max: 100,
      calculable: true,
      text: ['深度'],
      inRange: {
        symbolSize: [10, 50]
      },

    },
    {
      left: 'right',
      top: 'bottom',
      dimension: 3,
      seriesIndex: 1,
      min: 1,
      max: 10,
      calculable: true,
      text: ['级别'],
      inRange: {
        color: ['#00ccff', '#b300ff']
      },
    }

  ],
  geo: {
    map: 'china',
    roam: true,
    zoom: 1.23,
    label: {
      normal: {
        show: true,
        // fontSize: '10',
        color: 'rgba(0,0,0,0.7)'
      }
    },
    // itemStyle: {
    //   normal: {
    //     borderColor: 'rgba(0, 0, 0, 0.2)'
    //   },
    //   emphasis: {
    //     areaColor: '#66CCFF',
    //     shadowOffsetX: 0,
    //     shadowOffsetY: 0,
    //     shadowBlur: 20,
    //     borderWidth: 0,
    //     shadowColor: 'rgba(0, 0, 0, 0.5)'
    //   }
    // }
  },
  series: [{
    name: '地震次数',
    type: 'map',
    geoIndex: 0,
    data: []
  },
    {
      name: '最近地震点',
      type: 'scatter',
      coordinateSystem: 'geo',
      data: [],
      symbolSize: 10,
    }
  ]
}

let optionBar = {
  // color: ['#66ccff', '#69f187', '#ff6666'],
  title: {
    text: '各地区地震次数',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { // 坐标轴指示器，坐标轴触发有效
      type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
    }
  },
  grid: {
    top: 60,
    right: 50,
    left: 100
  },
  toolbox: {
    left: 'right',
    bottom: 0,
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
  legend: {
    top: 30,
    data: ['有感地震', '中强地震', '巨大地震'],
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: []
  },
  dataZoom: [{
    left: 0,
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
    data: []
  },
    {
      name: '中强地震',
      type: 'bar',
      stack: '总量',
      data: []
    },
    {
      name: '巨大地震',
      type: 'bar',
      stack: '总量',
      data: []
    }
  ]
};

let optionTrend = {
  title: {
    text: '历年地震趋势图',
    left: 'center',
    top: 0
  },
  grid: {
    left: 50,
    right: 50,
    top: 30,
    bottom: 70
  },
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  toolbox: {
    left: 'left',
    top: 'top',
    feature: {
      dataZoom: {
        yAxisIndex: 'none'
      },
      magicType: {
        type: ['line', 'bar']
      },
      restore: {},
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%']
  },
  dataZoom: [{
    type: 'inside',
    start: 0,
    end: 10
  }, {
    start: 0,
    end: 10,
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
    name: '地震次数',
    type: 'line',
    smooth: true,
    symbol: 'none',
    sampling: 'average',
    itemStyle: {
      color: 'rgb(255, 70, 131)'
    },
    data: [],
    markLine: {
      data: [
        {type: 'average', name: '平均值'}
      ]
    }
  }]
};

export default {
  name: "home",
  data() {
    return {
      totalData: {},
      loadingStatistic: true,
      loading: true,
      chartBar: null,
      chartMain: null,
      chartTrend: null,
      dataSources: 0,
      chartStack: [{
        name: '中国',
        adCode: '100000'
      }],
      tempData: null,
    }
  },
  methods: {
    changeDataSources(source){
      if(this.dataSources !== source){
        this.dataSources = source
        this.chartStack = this.chartStack.slice(0, 1)
        this.loadData()
        this.loadStatisticData()
      }
    },
    changeChart(index){
      if(index !== this.chartStack.length - 1){
        this.chartStack = this.chartStack.slice(0, index + 1)
        this.loadData()
      }
    },
    back(){
      if(this.chartStack.length > 1){
        this.chartStack.pop()
        this.loadData()
      }
    },
    loadData(){
      let that = this
      this.loading = true
      let args = {
        dataSources: that.dataSources,
        adCode: that.chartStack[that.chartStack.length - 1].adCode.toString(),
        country: that.chartStack[0].name
      }
      if(this.chartStack.length >= 2){
        args.province = that.chartStack[1].name
      }
      if(this.chartStack.length >= 3){
        args.city = that.chartStack[2].name
      }
      if(this.chartStack.length >= 4){
        args.district = that.chartStack[3].name
      }
      if(that.chartStack.length !== 1){
        args.adCode = args.adCode.substring(0, (that.chartStack.length - 1) * 2) + '0000000000'
        args.adCode = args.adCode.substring(0, 6)
      }
      if(this.$echarts.getMap(args.adCode)){
        this.drawChartMain(args)
      }else {
        this.axios.get(`/api/map/${args.adCode}.json`).then(mapJson=>{
          that.$echarts.registerMap(args.adCode, mapJson)
          this.drawChartMain(args)
        }).catch(function () {
          that.$message.error('数据加载失败')
          that.loading = false
        })
      }
    },
    drawChartMain(args){
      let that = this
      that.axios.post('/api/api/data/HomeData', args).then(response => {
        that.loading = false
        if(response.bar && response.points && response.trend){
          // 地图
          optionMain.geo.map = args.adCode
          optionMain.visualMap[0].max = Math.max.apply(null, response.bar.map(d=>d.small + d.medium + d.large))
          optionMain.title.text = that.chartStack[that.chartStack.length - 1].name + '地震分布'
          optionMain.series[0].data = response.bar.map(d => {
            return {name: d.name, value: d.small + d.medium + d.large, code: d.code}
          });
          optionMain.series[1].data = response.points.map(l => {
            return {
              name: l.location,
              value: [l.longitude, l.latitude, l.time, l.level, l.depth]
            }
          })
          // 条形图
          let dataBar = response.bar
          dataBar.sort((a, b) => a.small + a.medium + a.large - b.small - b.medium - b.large)
          optionBar.title.text = that.chartStack[that.chartStack.length - 1].name + '各地区地震次数'
          optionBar.yAxis.data = dataBar.map(d => d.name ? d.name : '其他')
          optionBar.series[0].data = dataBar.map(d => {return {value: d.small, code: d.code}})
          optionBar.series[1].data = dataBar.map(d => {return {value: d.medium, code: d.code}})
          optionBar.series[2].data = dataBar.map(d => {return {value: d.large, code: d.code}})
          // 折线图
          let dataTrend = response.trend
          dataTrend.sort((a, b) => a.time - b.time)
          optionTrend.title.text = that.chartStack[that.chartStack.length - 1].name + '历年地震趋势图'
          optionTrend.xAxis.data = dataTrend.map(r => `${Math.floor(r.time / 10000)}-${Math.floor(r.time / 100 % 100)}-${Math.floor(r.time % 100)}`)
          optionTrend.series[0].data = dataTrend.map(r => r.count)
          that.chartMain.setOption(optionMain, true)
          that.chartBar.setOption(optionBar, true)
          if(that.chartTrend && that.chartTrend.dispose){
            that.chartTrend.dispose()
            that.chartTrend = that.$echarts.init(document.getElementById('chart-trend'), null, {renderer: 'canvas'})
          }
          that.chartTrend.setOption(optionTrend, true)
        }else {
          that.$message.error('数据加载失败')
        }
      }).catch(function () {
        that.$message.error('数据加载失败')
        that.loading = false
      })
    },
    loadStatisticData(){
      let that = this
      this.loadingStatistic = true
      this.axios.post('/api/api/data/TotalStatistics', {DataSources: this.dataSources}).then(response => {
        this.totalData = response
        this.loadingStatistic = false
      }).catch(function () {
        that.$message.error('数据加载失败')
        that.loadingStatistic = false
      })
    }
  },
  mounted() {
    let that = this
    let chartMain = this.$echarts.init(document.getElementById('chart-main'), null, {renderer: 'canvas'});
    let chartBar = this.$echarts.init(document.getElementById('chart-bar'), null, {renderer: 'canvas'});
    let chartTrend = this.$echarts.init(document.getElementById('chart-trend'), null, {renderer: 'canvas'})
    this.chartMain = chartMain
    this.chartBar = chartBar
    this.chartTrend = chartTrend
    window.onresize = function () {
      chartMain.resize()
      chartBar.resize()
      that.chartTrend.resize()
    }
    chartBar.setOption(optionBar);
    chartMain.setOption(optionMain);
    optionTrend.series[0].areaStyle = {
      color: this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        offset: 0,
        color: 'rgb(255, 158, 68)'
      }, {
        offset: 1,
        color: 'rgb(255, 70, 131)'
      }])
    }
    chartTrend.setOption(optionTrend)
    this.loadStatisticData()
    this.loadData()
    chartMain.on('click', function (a) {
      if(a.seriesName === '地震次数' && a.value){
        that.chartStack.push({
          name: a.name,
          adCode: a.data.code
        })
        that.loadData()
      }
    })
    chartBar.on('click', function (a) {
      if(that.chartStack.length < 4){
        that.chartStack.push({
          name: a.name,
          adCode: a.data.code
        })
        that.loadData()
      }
    })
  }
}
</script>

<style scoped>

</style>
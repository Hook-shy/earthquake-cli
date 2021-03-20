<template>
  <a-card :bordered="false">
        <a-form layout="inline">
          <a-form-item label="数据源">
            <a-select default-value="0" style="width: 150px" v-model="args.dataSources">
              <a-select-option :value="0">
                中国地震台网
              </a-select-option>
              <a-select-option :value="1">
                美国地质勘探局
              </a-select-option>
              <a-select-option :value="2">
                欧洲地中海地震中心
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="时间段">
            <a-config-provider :locale="zhCN">
              <a-range-picker @change="changeTime"/>
            </a-config-provider>
          </a-form-item>
          <a-form-item label="级别">
            <a-slider range :default-value="[0, 10]" :min="0" :max="10" :step="0.1" style="width: 200px" @change="changeLevel"/>
          </a-form-item>
          <a-form-item label="深度">
            <a-slider range :default-value="[0, 500]" :min="0" :max="500" style="width: 200px" @change="changeDepth"/>
          </a-form-item>
          <a-form-item label="经度">
            <a-slider range :default-value="[-180, 180]" :min="-180" :max="180" :step="0.01" style="width: 200px" @change="changeLongitude"/>
          </a-form-item>
          <a-form-item label="纬度">
            <a-slider range :default-value="[-90, 90]" :min="-90" :max="90" :step="0.01" style="width: 200px" @change="changeLatitude"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" icon="search" @click="submitClick">
              查询
            </a-button>
          </a-form-item>
        </a-form>
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" force-render>
            <span slot="tab">
              <a-icon type="database" />
              数据
            </span>
            <a-table
                :columns="columns"
                :scroll="{ x: 1800}"
                size="middle"
                :pagination="false"
                :dataSource="dataSource"
                :loading="loading"
            >
              <span slot="source" slot-scope="source">
                <a-tag v-if="source.level < 4.5" color="green">
                  有感
                </a-tag>
                <a-tag v-else-if="source.level > 6" color="volcano">
                  巨大
                </a-tag>
                <a-tag v-else color="geekblue">
                  中强
                </a-tag>
                {{source.text}}
              </span>
              <span slot="level" slot-scope="level">
                <a-progress :percent="level * 10" :format="percent => `${percent / 10}级`" :strokeColor="level < 4.5 ? '#b7eb8f' : level > 6 ? '#ffbd9a' : '#adc6ff'"/>
              </span>
              <span slot="depth" slot-scope="depth">
                <a-progress :percent="depth / maxDepth * 100 - 10" :format="percent => `${depth}`" style="margin-right: 10em"/>
              </span>
            </a-table>
            <br>
            <a-config-provider :locale="zhCN">
              <a-pagination size="small" :total="total" show-size-changer show-quick-jumper :pageSizeOptions="['10', '30', '50', '100']" @change="changePage" @showSizeChange="changeSize"/>
            </a-config-provider>
          </a-tab-pane>
          <a-tab-pane key="2" force-render>
            <span slot="tab">
              <a-icon type="area-chart" />
              地图
            </span>
            <div id="chart-main" style="height: calc(100vh - 200px)"></div>
          </a-tab-pane>
        </a-tabs>
    <a-back-top />
  </a-card>
</template>

<script>
import zhCN from 'ant-design-vue/es/locale-provider/zh_CN'
const countNameZH = require('../map/country-name-zh.json')

const columns = [
  {
    title: '数据源',
    dataIndex: 'source',
    key: 'source',
    scopedSlots: { customRender: 'source' },
    width: '13em'
  },
  {
    title: '震发时刻',
    dataIndex: 'time',
    key: 'time',
    width: '14em'
  },
  {
    title: '经度',
    dataIndex: 'longitude',
    key: 'longitude',
    sorter: (a, b) => a.longitude - b.longitude,
    width: '6em'
  },
  {
    title: '纬度',
    dataIndex: 'latitude',
    key: 'latitude',
    sorter: (a, b) => a.latitude - b.latitude,
    width: '6em'
  },
  {
    title: '震级',
    dataIndex: 'level',
    key: 'level',
    sorter: (a, b) => a.level - b.level,
    scopedSlots: { customRender: 'level' },
    width: '15em'
  },
  {
    title: '深度(km)',
    dataIndex: 'depth',
    key: 'depth',
    sorter: (a, b) => a.depth - b.depth,
    scopedSlots: {customRender: 'depth'},
    width: '15em'
  },
  {
    title: '参考位置',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: '国家',
    dataIndex: 'country',
    key: 'country',
  },
  {
    title: '省',
    dataIndex: 'province',
    key: 'province',
  },
  {
    title: '市',
    dataIndex: 'city',
    key: 'city',
  },
  {
    title: '县',
    dataIndex: 'district',
    key: 'district',
  },
  {
    title: '镇',
    dataIndex: 'town',
    key: 'town',
  }
]

let optionMain = {
  backgroundColor: '#fafafa',
  title: {
    show: false,
    text: '全球地震分布',
    left: 'center',
  },
  legend: {
    left: 'left',
    data: ['地震点'],
  },
  toolbox: {
    feature: {
      restore: {},
      saveAsImage: {}
    }
  },
  tooltip: {
    formatter: function (params) {
      if (params.seriesName === '地震次数') {
        return countNameZH[params.name]
      } else {
        return `${params.data.value[2]}<br>${params.name}<br>级别: ${params.data.value[3]}级<br>深度: ${params.data.value[4]}km<br>坐标: ${params.data.value[0]}, ${params.data.value[1]}`
      }
    }
  },
  visualMap: [
    {
      left: 'right',
      top: 'bottom',
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
      left: 'left',
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
    map: 'world',
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
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: [],
      symbolSize: 10,
    }
  ]
}


export default {
  name: "search",
  data(){
    return {
      zhCN,
      chartMain: null,
      columns: columns,
      loading: false,
      dataSource: [],
      args:{
        startTime: new Date(2000, 1, 1),
        endTime: new Date(),
        dataSources: 0,
        minLevel: 0,
        maxLevel: 10,
        minDepth: 0,
        maxDepth: 500,
        minLongitude: -180,
        maxLongitude: 180,
        minLatitude: -90,
        maxLatitude: 90,
        page: 1,
        size: 10
      },
      total: 0,
      maxDepth: 100,
    }
  },
  methods:{
    changeTime(){
      console.log(arguments[1])
      this.args.startTime = new Date(arguments[1][0])
      this.args.endTime = new Date(arguments[1][1])
    },
    changeLevel(val){
      this.args.minLevel = val[0]
      this.args.maxLevel = val[1]
    },
    changeDepth(val){
      this.args.minDepth = val[0]
      this.args.maxDepth = val[1]
    },
    changeLongitude(val){
      this.args.minLongitude = val[0]
      this.args.maxLongitude = val[1]
    },
    changeLatitude(val){
      this.args.minLatitude = val[0]
      this.args.maxLatitude = val[1]
    },
    changeSize(page, size){
      this.args.page = page
      this.args.size = size
      this.submit()
    },
    changePage(page, size){
      this.args.page = page
      this.args.size = size
      this.submit()
    },
    submitClick(){
      this.args.page = 1
      this.submit()
    },
    submit(){
      let that = this
      that.loading = true
      this.axios.post('/api/api/data/AllData', {
        startTime: that.args.startTime,
        endTime: that.args.endTime,
        dataSources: that.args.dataSources,
        minLevel: that.args.minLevel,
        maxLevel: that.args.maxLevel,
        minDepth: that.args.minDepth,
        maxDepth: that.args.maxDepth,
        minLongitude: that.args.minLongitude,
        maxLongitude: that.args.maxLongitude,
        minLatitude: that.args.minLatitude,
        maxLatitude: that.args.maxLatitude,
        page: that.args.page - 1,
        size: that.args.size
      }).then(response => {
        that.dataSource = response.list.map(n=>{return{
          source: {text: ['中国地震台网', '美国地质勘探局', '欧洲地中海地震中心'][that.args.dataSources], level: n.level},
          time: new Date(n.time).toLocaleString(),
          longitude: n.longitude,
          latitude: n.latitude,
          level: n.level,
          depth: n.depth,
          location: n.location,
          country: n.country,
          province: n.province,
          city: n.city,
          district: n.district,
          town: n.town
        }})
        that.maxDepth = Math.max.apply(null, response.list.map(n=>n.depth))
        that.total = response.total
        that.loading = false

        optionMain.series[1].data = response.list.map(l => {
          return {
            name: l.location,
            value: [l.longitude, l.latitude, l.time, l.level, l.depth]
          }
        })
        that.chartMain.setOption(optionMain, true)
      }).catch(function () {
        that.$message.error('数据加载失败')
        that.loading = false
      })
    },
    onSelectChange(){}
  },
  mounted() {
    let chartMain = this.$echarts.init(document.getElementById('chart-main'), null, { renderer: 'canvas' });
    this.chartMain = chartMain
    window.onresize = function () {
      chartMain.resize()
    }
    chartMain.setOption(optionMain);
    this.submit()
  }
}
</script>

<style scoped>

</style>
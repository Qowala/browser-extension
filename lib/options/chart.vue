<template lang="html">
  <div style="position: relative;">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart'
import { format } from 'date-fns'
import { today, yesterday, lastSevenDays, formatTime, formatTimeShort } from '../utils'

export default {
  data () {
    return {
      chart: null
    }
  },
  methods: {
    createChart: function () {
      return new Chart(this.$refs.canvas, {
        type: 'line',
        data: {
          labels: lastSevenDays().map(d => {
            switch (d) {
              case today():
                return 'Today'
              case yesterday():
                return 'Yesterday'
              default:
                return format(d, 'ddd D MMM')
            }
          }),
          datasets: this.websites.filter(x => !this.disabledDomains.includes(x.hostname)).map(site => ({
            type: 'line',
            fill: false,
            label: `Time spent on ${site.name}`,
            data: this.genData(site),
            borderColor: site.color,
            backgroundColor: site.color
          })).filter(x => x.data && true)
        },
        options: {
          legend: {
            display: false
          },
          tooltips: {
            displayColors: false,
            callbacks: {
              title: function (tooltipItem, data) {
                return data.datasets[tooltipItem.datasetIndex].label || ''
              },
              label: function (tooltip, data) {
                return formatTime(Number.parseInt(tooltip.yLabel))
              }
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: formatTimeShort
              }
            }]
          }
        }
      })
    },
    genData (site) {
      const res = lastSevenDays().map(d => site.navigationStats[d] || 0)
      return res.filter(x => x !== 0).length ? res : null
    }
  },
  props: {
    websites: Array,
    disabledDomains: {
      type: Array,
      default: []
    }
  },
  watch: {
    websites: function (value) {
      this.websites = value
      if (this.websites) {
        this.createChart()
      }
    },
    disabledDomains: function (value) {
      this.disabledDomains = value
      if (this.websites) {
        this.createChart()
      }
    }
  }
}
</script>

<style lang="css">
</style>

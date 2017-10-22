<template lang="html">
  <canvas ref="canvas" width="1000" height="250"></canvas>
</template>

<script>
import Chart from 'chart'
import { format } from 'date-fns'
import { today, yesterday, lastSevenDays, formatTime } from '../utils'

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
          datasets: this.websites.map(site => {
            console.log(site)
            const data = {
              type: 'line',
              fill: false,
              label: `Time spent on ${site.name}`,
              data: this.genData(site),
              borderColor: site.color,
              backgroundColor: site.color
            }
            return data.data ? data : null
          }).filter(x => x !== null)
        },
        options: {
          tooltips: {
            displayColors: false,
            callbacks: {
              label: function (tooltip, data) {
                return formatTime(tooltip.y)
              }
            }
          }
        }
      })
    },
    genData (site) {
      const res = lastSevenDays().map(d => site.navigationStats[d] || 0)
      return res.filter(x => x !== 0).length ? res : null
    }
  },
  props: [ 'websites' ],
  watch: {
    websites: function (value) {
      this.websites = value
      if (this.websites) {
        this.createChart()
      }
    }
  }
}
</script>

<style lang="css">
</style>

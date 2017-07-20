<template lang="html">
  <canvas ref="canvas" width="1000" height="250"></canvas>
</template>

<script>
import Chart from 'chart'

export default {
  data () {
    return {
      chart: null,
      period: 7 // number of days to show
    }
  },
  computed: {
    statsBySite: function () {
      const res = {}
      for (const date in this.stats) {
        for (const site in this.stats[date]) {
          res[site] = res[site] || { hostname: site, data: [] }
          res.site.data.push({
            value: this.stats[date][site],
            date
          })
        }
      }
      return res
    }
  },
  methods: {
    createChart: function () {
      console.log(this)
      const stats = this.stats
      return new Chart(this.$refs.canvas, {
        type: 'line',
        data: {
          datasets: stats.map(stats => {
            return {
              type: 'line',
              label: `Time spent on ${stats.hostname}`,
              data: stats.data.map(d => d.value)
            }
          })
        }
      })
    }
  },
  created: function () {
    this.chart = this.createChart()
  },
  props: [ 'stats' ]
}
</script>

<style lang="css">
</style>

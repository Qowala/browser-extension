<template lang="html">
  <canvas ref="canvas" width="1000" height="250"></canvas>
</template>

<script>
import Chart from 'chart'

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
          datasets: this.websites.map(site => {
            return {
              type: 'line',
              label: `Time spent on ${site.name}`,
              data: this.genData(site),
              borderColor: site.themeColor,
              backgroundColor: site.themeColor
            }
          })
        }
      })
    },
    genData (site) {
      return [ Math.floor(Math.random() * 150), Math.floor(Math.random() * 150), Math.floor(Math.random() * 150), Math.floor(Math.random() * 150) ]
    }
  },
  props: [ 'websites' ],
  watch: {
    websites: (value) => {
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

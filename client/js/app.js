var app = angular.module('evoApp', [])

app.controller('MainController', MainController)

function MainController ($window, $scope) {
  var $ctrl = this
  var socket = $window.io()

  $ctrl.getImage = getImage

  socket.on('data', function (data) {
    $ctrl.data = data
    $ctrl.lastUpdate = new Date().getTime()
    $scope.$apply()
  })

  socket.on('initialchartdata', function (data) {
    var chartdata = []
    $ctrl.lastChartUpdate = new Date().getTime()

    data.forEach(function (game) {
      var series = {
        name: game._id,
        data: []
      }

      game.data.forEach(function (point) {
        series.data.push([new Date(point.time).getTime(), point.amount])
      })

      chartdata.push(series)
    })

    window.$(function () {
      window.Highcharts.stockChart('container', {
        rangeSelector: {
          buttons: [{
            count: 1,
            type: 'hour',
            text: '1H',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
            }
          }, {
            count: 5,
            type: 'hour',
            text: '5H',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
            }
          }, {
            count: 10,
            type: 'hour',
            text: '10H',
            dataGrouping: {
              forced: true,
              units: [['minute', [15]]]
            }
          }, {
            count: 1,
            type: 'day',
            text: '1D',
            dataGrouping: {
              forced: true,
              units: [['hour', [1]]]
            }
          }, {
            count: 3,
            type: 'day',
            text: '3D',
            dataGrouping: {
              forced: true,
              units: [['hour', [1]]]
            }
          }, {
            type: 'all',
            text: 'All',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
            }
          }],
          selected: 5
        },
        yAxis: {
          labels: {
            formatter: function () {
              return '$' + this.value
            }
          }
        },
        tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>${point.y}</b>',
          valueDecimals: 0,
          split: true
        },
        series: chartdata
      })
    })

    $scope.$apply()
  })

  socket.on('chartdata', function (data) {
    var newdata = []
    data.forEach(function (game) {
      newdata.push([new Date(game.data[game.data.length - 1].time).getTime(), game.data[game.data.length - 1].amount])
    })
    newdata.forEach((elem, i) => {
      window.$('#container').highcharts().series[i].addPoint(elem, false)
    })
    window.$('#container').highcharts().redraw()
  })

  function getImage (image) {
    return {
      'background-image': 'linear-gradient(rgba(0, 0, 0, 0.1),rgba(0, 0, 0, 0.1)), url(' + image + ')'
    }
  }
}

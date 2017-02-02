var app = angular.module('evoApp', ['timer'])

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
    $ctrl.lastChartUpdate = new Date().getTime()

    // amounts chart
    var chartdata = []
    data.chartData.forEach(function (game) {
      var series = {
        name: game._id,
        data: []
      }

      game.data.forEach(function (point) {
        series.data.push([new Date(point.time).getTime(), point.amount])
      })

      chartdata.push(series)
    })

    // difference chart
    var chartdiffdata = {
      name: data.chartDiffData.gamea + ' vs ' + data.chartDiffData.gameb,
      data: []
    }
    data.chartDiffData.difference.forEach(function (point) {
      chartdiffdata.data.push([point.time, point.amount])
    })

    // apply charts
    window.$(function () {
      window.Highcharts.stockChart('container', {
        title: {text: 'Total Donations'},
        rangeSelector: {
          buttons: [{
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
              units: [['minute', [5]]]
            }
          }, {
            count: 1,
            type: 'day',
            text: '1D',
            dataGrouping: {
              forced: true,
              units: [['minute', [1]]]
            }
          }, {
            count: 3,
            type: 'day',
            text: '3D',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
            }
          }, {
            count: 5,
            type: 'day',
            text: '5D',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
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
        legend: {
          enabled: true
        },
        tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>${point.y}</b>',
          valueDecimals: 0,
          split: true
        },
        series: chartdata
      })

      window.Highcharts.stockChart('diffcontainer', {
        title: {text: chartdiffdata.name + ' - Difference'},
        rangeSelector: {
          buttons: [{
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
              units: [['minute', [5]]]
            }
          }, {
            count: 1,
            type: 'day',
            text: '1D',
            dataGrouping: {
              forced: true,
              units: [['minute', [1]]]
            }
          }, {
            count: 3,
            type: 'day',
            text: '3D',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
            }
          }, {
            count: 5,
            type: 'day',
            text: '5D',
            dataGrouping: {
              forced: true,
              units: [['minute', [5]]]
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
        legend: {
          enabled: true
        },
        tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>${point.y}</b>',
          valueDecimals: 0,
          split: true
        },
        series: [chartdiffdata]
      })
    })

    $scope.$apply()
  })

  socket.on('chartdata', function (data) {
    var newdata = []
    var newdiffdata = []
    $ctrl.lastChartUpdate = new Date().getTime()
    data.chartData.forEach(function (game) {
      newdata.push([new Date(game.data[game.data.length - 1].time).getTime(), game.data[game.data.length - 1].amount])
    })
    newdiffdata.push([data.chartDiffData.difference[data.chartDiffData.difference.length - 1].time, data.chartDiffData.difference[data.chartDiffData.difference.length - 1].amount])

    newdata.forEach((elem, i) => {
      window.$('#container').highcharts().series[i].addPoint(elem, false)
    })
    newdiffdata.forEach((elem, i) => {
      window.$('#diffcontainer').highcharts().series[i].addPoint(elem, false)
    })
    window.$('#container').highcharts().redraw()
    window.$('#diffcontainer').highcharts().redraw()
    $scope.$apply()
  })

  function getImage (image) {
    return {
      'background-image': 'linear-gradient(rgba(0, 0, 0, 0.1),rgba(0, 0, 0, 0.1)), url(' + image + ')'
    }
  }
}

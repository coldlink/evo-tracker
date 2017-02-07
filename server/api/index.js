'use strict'

const Current = require('./current.model')
const Donation = require('./donation.model')
const _ = require('lodash')

let API = function () {
  const update = () => {
    let proms = []

    proms.push(new Promise((resolve, reject) => {
      Current
        .findById(Buffer.alloc(12, 1))
        .exec()
        .then(doc => {
          this.data = doc.data
          resolve(true)
        })
        .catch(reject)
    }))

    proms.push(new Promise((resolve, reject) => {
      let agg = Donation
        .aggregate([{
          $group: {
            _id: '$gameName',
            data: {
              $push: { time: '$time', amount: '$amount' }
            }
          }
        }])
        .exec()

      agg
        .then(res => {
          this.chartData = res
          resolve(true)
        })
        .catch(err => reject(err))
    }))

    // marvel pokken 2 game difference over time
    proms.push(new Promise((resolve, reject) => {
      let agg = Donation
        .aggregate([{
          $match: {
            gameId: { $in: [2016214, 2016203] }
          }
        }, {
          $group: {
            _id: '$gameName',
            data: {
              $push: { time: '$time', amount: '$amount' }
            },
            maxAmount: {
              $max: '$amount'
            }
          }
        }, {
          $sort: {
            _id: -1
          }
        }])

      agg
        .then(res => {
          let difference = []
          for (let i = 0; i < res[0].data.length; i++) {
            if (res[0].data[i].time.getTime() === res[1].data[i].time.getTime()) {
              difference.push({
                time: res[0].data[i].time.getTime(),
                amount: res[0].data[i].amount - res[1].data[i].amount
              })
            }
          }

          this.chartDiffData = {
            gamea: res[0]._id,
            gameb: res[1]._id,
            difference: _.orderBy(difference, ['time'], ['asc'])
          }

          resolve(true)
        })
        .catch(err => reject(err))
    }))

    Promise
      .all(proms)
      .then(values => {
        console.log('set values')
      })
      .catch(err => {
        console.log(err)
      })
  }

  update()

  setTimeout(() => {
    update()
  }, 1 * 60 * 1000)
}

API.prototype.getData = function () {
  console.log('getData')
  return this.data
}

API.prototype.getChartData = function () {
  console.log('getChartData')
  return { chartData: this.chartData, chartDiffData: this.chartDiffData }
}

module.exports = new API()

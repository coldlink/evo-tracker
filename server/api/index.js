'use strict'

const request = require('request')
const Donation = require('./model')
const _ = require('lodash')
const ids = [2016203, 2016199, 2016214, 2016208, 2016223, 2016217, 2016188, 2016212, 2016219]

const generosityApiUrl = 'https://www.generosity.com/generosity/api/fundraisers/'

let API = function () {
  const init = () => {
    let promises = []

    _.each(ids, id => {
      promises.push(new Promise((resolve, reject) => {
        request({
          url: `${generosityApiUrl}${id}.json`
        }, (err, response, body) => {
          if (err) {
            return reject(err)
          }
          try {
            let data = JSON.parse(body)
            resolve({
              game: data.fundraiser.title.split(':')[1].substring(1),
              amount: Number(data.fundraiser.balance.replace('$', '').replace(',', '')),
              donations_count: data.fundraiser.donations_count,
              average: Number(data.fundraiser.balance.replace('$', '').replace(',', '')) / data.fundraiser.donations_count,
              image: data.fundraiser.compressed_image_url,
              id: data.fundraiser.id,
              url: `https://www.generosity.com${data.fundraiser.url}`,
              lastDonation: data.fundraiser.donations[0]
            })
          } catch (err) {
            console.log(body)
            console.log(err)
            reject(999)
          }
        })
      }))
    })

    Promise
      .all(promises)
      .then((values) => {
        this.data = values
        setDB()
      })
      .catch((err) => {
        console.log(err)
        if (err === 999) {
          setTimeout(() => init(), 1 * 60 * 1000)
        }
      })
  }

  const updatedb = () => {
    let promises = []
    let currentTime = new Date().getTime()

    _.each(this.data, data => {
      promises.push(new Promise((resolve, reject) => {
        // donation db
        let donation = new Donation({
          gameId: data.id,
          gameName: data.game,
          amount: data.amount,
          time: currentTime
        })

        // save
        let save = donation
          .save()

        save
          .then(() => resolve(true))
          .catch(err => reject(err))
      }))
    })

    Promise
      .all(promises)
      .then(values => {
        return setDB()
      })
      .catch(err => {
        console.log(err)
      })
  }

  const setDB = () => {
    let proms = []

    proms.push(new Promise((resolve, reject) => {
      let agg = Donation
        .aggregate([{
          $group: {
            _id: '$gameName',
            data: {
              $push: {time: '$time', amount: '$amount'}
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

    // top 2 game difference over time
    proms.push(new Promise((resolve, reject) => {
      let agg = Donation
      .aggregate([{
        $group: {
          _id: '$gameName',
          data: {
            $push: {time: '$time', amount: '$amount'}
          },
          maxAmount: {
            $max: '$amount'
          }
        }
      }, {
        $sort: {
          maxAmount: -1
        }
      }, {
        $limit: 2
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
        console.log('setDB')
      })
      .catch(err => {
        console.log(err)
      })
  }

  // init
  init()

  // set interval
  setInterval(() => {
    console.log('init')
    init()
  }, 2 * 60 * 1000)

  // set interval to update db every 5 mins
  setInterval(() => {
    console.log('updatedb')
    updatedb()
  }, 5 * 60 * 1000)
}

API.prototype.getData = function () {
  console.log('getData')
  return this.data
}

API.prototype.getChartData = function () {
  console.log('getChartData')
  return {chartData: this.chartData, chartDiffData: this.chartDiffData}
}

module.exports = new API()

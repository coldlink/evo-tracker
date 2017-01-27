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
  }, 1 * 60 * 1000)

  // set interval to update db every 5 mins
  setInterval(() => {
    console.log('updatedb')
    updatedb()
  }, 1 * 60 * 1000)
}

API.prototype.getData = function () {
  console.log('getData')
  return this.data
}

API.prototype.getChartData = function () {
  console.log('getChartData')
  return this.chartData
}

module.exports = new API()

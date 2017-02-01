'use strict'

const request = require('request')
const Donation = require('./donation.model')
const Current = require('./current.model')
const _ = require('lodash')
const ids = [2016203, 2016199, 2016214, 2016208, 2016223, 2016217, 2016188, 2016212, 2016219]

const generosityApiUrl = 'https://www.generosity.com/generosity/api/fundraisers/'

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
        Current
          .findOneAndUpdate({_id: Buffer.alloc(12, 1)}, {data: values}, {upsert: true})
          .exec()
          .then(() => {
            console.log('Current data updated:', new Date().getTime())
          })
          .catch(handlerErr)
      })
      .catch((err) => {
        console.log(err)
        setTimeout(handlerErr)
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
        console.log('Donation data updated:', new Date().getTime())
      })
      .catch(err => {
        console.log(err)
      })
}

const handlerErr = err => {
  console.log(err)
  return setTimeout(() => init(), 1 * 60 * 1000)
}

// init
init()
updatedb()

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


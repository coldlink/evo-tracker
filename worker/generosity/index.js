'use strict'

const request = require('request')
const Donation = require('./donation.model')
const Current = require('./current.model')
const _ = require('lodash')
const ids = [2016203, 2016199, 2016214, 2016208, 2016223, 2016217, 2016188, 2016212, 2016219]

const generosityApiUrl = 'https://www.generosity.com/generosity/api/fundraisers/'

let Generosity = function () {
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
          .findOneAndUpdate({_id: 0}, new Current({data: values}, {upsert: true}))
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


  const handlerErr = err => {
    console.log(err)
    return setTimeout(() => init(), 1 * 60 * 1000)
  }
}

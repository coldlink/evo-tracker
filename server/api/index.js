'use strict'

const request = require('request')
const ids = [2016203, 2016199, 2016214, 2016208, 2016223, 2016217, 2016188, 2016212, 2016219]

const generosityApiUrl = 'https://www.generosity.com/generosity/api/fundraisers/'

let API = function () {
  const init = () => {
    let promises = []

    ids.forEach(id => {
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
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // init
  init()

  // set interval
  setInterval(() => {
    console.log('init')
    init()
  }, 60000)
}

API.prototype.getData = function () {
  console.log('getData')
  return this.data
}

module.exports = new API()

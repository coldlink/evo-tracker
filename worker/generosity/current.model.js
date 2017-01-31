'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let CurrentSchema = new Schema({
  data: [{
    game: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    donations_count: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }]
})

module.exports = mongoose.model('Current', CurrentSchema)

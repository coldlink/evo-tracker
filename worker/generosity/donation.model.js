'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let DonationSchema = new Schema({
  gameId: {
    type: Number,
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('Donation', DonationSchema)

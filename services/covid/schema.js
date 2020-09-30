const { Schema } = require('mongoose')
const mongoose = require('mongoose')

const covidSchema = new Schema (
    {
        newCases: {
            type: String
        }
    },
    { timestamps: true }
)

const covidModel = mongoose.model('Covid', covidSchema)

module.exports = covidModel
const hueToXy = require('@q42philips/hue-color-converter')
const colorNameToHex = require('colornames')
const hexToRgb = require('hex-rgb')
const fp = require('lodash/fp')

/**
 *
 * @param {string} colorname - e.g. black, jade, blue, green
 * @returns {*|number[]}
 */
const xy = (colorname) => {
    const hex = colorNameToHex(colorname)
    const rgb = hexToRgb(hex)
    const xy = hueToXy.calculateXY(...rgb)
    return xy
}

module.exports = xy
const colornameToXy = require('colorname-to-xy')
const _ = require('lodash')
const hexToXy = require('hex-to-xy')
const isHexcolor = require('is-hexcolor')

global.bridgeIp = process.env.HUE_BRIDGE_IP 
global.appKey = process.env.HUE_APP_KEY

const {setState, getState, rename, getAllLights} = require("./lib/rest")

function createHue() {
// TODO idea: Allow user to chain multiple commands to modify the state before finally dispatching. (e.g. build a object gradually, then dispatch and reset the object to an empty state.)

    const lights = [1, 2, 3, 4, 5]

    return {
        getLights(cb) {
            getAllLights((lights) => {
                this._lights = (() => {
                    return Object.keys(lights).map(x => parseInt(x))
                })()
            })
        },
        light: changeLight,
        lights: () => changeLight(lights)
    }
}

const hue = createHue({ip: process.env.HUE_BRIDGE_IP, username: process.env.HUE_USERNAME})
hue.setState = setState
hue.getState = getState

/**
 *
 * @param {Array<number>|number} lightNumbers - one or several light numbers
 * @returns {*}
 */
function changeLight(lightNumbers) {

    if (!lightNumbers.length) lightNumbers = [lightNumbers]

    let intervalMode = false
    let interval = 1000
    let repeatTimes = 0

    const commandQueue = []

    commandQueue.add = function (command) {
        const obj = Object.assign({}, command)
        if (intervalMode) {
            obj.interval = interval
        }
        this.push(obj)
    }

    const debouncedExecuteCommandQueue = _.debounce(executeCommandQueue, 100)

    function executeCommandQueue() {

        // const state = Object.assign({}, ...commandQueue)
        // setState(lightNumbers, state)

        setStateDelayed(commandQueue)

        function setStateDelayed(commandQueue, index = 0) {

            if (commandQueue[index]) {

                _.forEach(lightNumbers, x => {
                    setState(x, commandQueue[index])
                })

                _.delay(() => setStateDelayed(commandQueue, index + 1), commandQueue[index].interval)

            } else if (repeatTimes > 0) {
                --repeatTimes
                setStateDelayed(commandQueue)
            }
        }
    }

    return {
        /**
         * Any methods chained after interval() will be executed one by one with the specified interval in ms.
         */
        interval(ms) {
            intervalMode = true
            interval = ms
            return this
        },
        on() {
            if (intervalMode) {
                commandQueue.add({on: true})
                debouncedExecuteCommandQueue()
                return this
            }

            lightNumbers.forEach(x => setState(x, {on: true}))
            return this
        },
        off() {
            if (intervalMode) {
                commandQueue.add({on: false})
                debouncedExecuteCommandQueue()
                return this
            }

            lightNumbers.forEach(x => setState(x, {on: false}))
            return this
        },

        /**
         *
         * @param {string} colorvalue
         * @returns {color}
         */
        color(colorvalue) {
            if (!colorvalue) {
                throw new Error("Specify a colorname as first argument to .color()")
            }

            const xy = (() => {
                if (/^\w+$/.test(colorvalue)) {
                    return colornameToXy(colorvalue)
                } else if (isHexcolor(colorvalue)) {
                    return hexToXy(colorvalue)
                }
            })()

            console.warn(xy)

            if (intervalMode) {
                commandQueue.add({xy: xy})
                debouncedExecuteCommandQueue()
                return this
            }

            lightNumbers.forEach(x => setState(x, {xy: xy}))
            return this
        },
        // This might be problematic
        pause(ms) {
            const cache = interval
            interval = ms
            intervalMode = true
            commandQueue.add({})
            interval = cache
            return this
        },
        effect() {
            return this
        },
        repeat(numTimes = 1) {
            repeatTimes += numTimes
        },
        /**
         * Should repeat the preceding command chain and reverse them
         */
        repeatReverse() {
            repeatTimes += 1
            reverse = true
        },
        /**
         *  Assemble subsequent calls into a single state object
         *  merge; combine; gather;
         */
        merge() {
        },
        /**
         * Dispatch the assembled state object
         */
        dispatch() {
        },
        /**
         * Reset intervals and similar
         */
        reset() {
            intervalMode = false
            interval = 3000
            repeatTimes = 0
            // Empty the array
            commandQueue.splice(0)
        },
        getState() {
            lightNumbers.forEach(x => {
                getState(x,)
            })
            return this
        },
        setState(newState) {
            lightNumbers.forEach(x => {
                setState(x, newState)
            })
            return this
        }
    }
}

module.exports = hue

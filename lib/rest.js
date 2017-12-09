const request = require('request')

function setState(lightNumber, state) {
    const url = `http://${bridgeIp}/api/${appKey}/lights/${lightNumber}/state`

    request({
        method: 'PUT',
        url: url,
        json: state
    }, function (err, res, body) {
        if (err) {
            console.warn(chalk.red(err))
        }
        console.log(body)
    })
}

function getState(lightNumber) {
    const url = `http://${bridgeIp}/api/${appKey}/lights/${lightNumber}`

    request({
        method: 'GET',
        url: url
    }, function (err, res, body) {
        if (err) {
            console.warn(chalk.red(err))
        }
        console.log(JSON.stringify(res, null, 2))
    })
}

function rename(lightNumber, newName) {
    const url = `http://${bridgeIp}/api/${appKey}/lights/${lightNumber}`

    request({
        method: 'PUT',
        url: url,
        json: {"name": newName}
    }, function (err, res, body) {
        if (err) {
            console.warn(chalk.red(err))
        }
        console.log(JSON.stringify(res, null, 2))
    })
}

function getAllLights(cb) {
    const url = `http://${bridgeIp}/api/${appKey}/lights`

    request({
        method: 'GET',
        url: url
    }, function (err, res, body) {
        if (err) {
            console.warn(chalk.red(err))
        }
        cb(JSON.parse(res.body))
    })
}

module.exports = {setState, getState, rename, getAllLights}
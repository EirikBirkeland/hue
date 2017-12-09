const request = require('request')
const _ = require('lodash')
const chalk = require('chalk')
const program = require('commander')

const bridgeIp = "10.0.0.156"
const appKey = "Jb0vWghsDm-46tZMxXASnnCyCd441Bi4uA9kdGbH"
const colornameToXy = require('colorname-to-xy')

// Note: --ct and --color conflict, and the Hue hub seems to decide to prefer --color over --ct.
program
   .version('0.0.1')
   .option('-o, --toggleOn', 'Turn light on or off')
   .option('-c, --color [color name]', 'Change to the specified color')
   .option('-C, --ct <n>', 'Mired color temperature (int 153 to 500)', parseInt)
   .option('-b, --bri <n>', 'Brightness (int 0 to 254)', parseInt)
   .option('-h, --hue <n>', 'Hue of the light (int 0 to 65535)', parseInt)
   .option('-g, --getLights', 'Get all lights')
   .option('-f, --filter [property]', 'Property to retrieve')
   .option('-i, --ip', 'IP for Hue bridge')
   .option('-u, --username', 'Username for Hue bridge')
   .option('-s, --sat <n>', 'Saturation of the light (int 0 to 254)', parseInt)
   .option('-n, --number <a>..<b>', 'Light to change or ALL')
   .option('-s, --state [JSON]', `JSON state object - for anything that isn't covered by this API. Example: '{hue:"1000"}'`, JSON.parse)
   .parse(process.argv)


// console.log(program.state)

if (!process.argv.slice(2).length) {
   program.outputHelp()
   process.exit(0)
}

const fullPath = `http://${program.ip || bridgeIp}/api/${program.username || appKey}/lights/${program.number}/state`

const body = Object.assign(_.pickBy({
   toggleOn: program.toggleOn,
   bri: program.bri,
   hue: program.hue,
   sat: program.sat,
   ct: program.ct,
   xy: program.color ? colornameToXy(program.color) : null
}, _.identity), program.state)

if (program.getLights) {
   getLights(program.number)
} else if (program.number && program.number.length) {
   _.forEach(program.number, lightNumber => {
      sendReq(body, lightNumber)
   })
}

function sendReq(body, lightNumber) {
   const url = `http://${bridgeIp}/api/${appKey}/lights/${lightNumber}/state`

   request({
      method: 'PUT',
      url: url,
      json: body
   }, function (err, res, body) {
      if (err) {
         console.warn(chalk.red(err))
      }
   })
}

function getLights(lightNumber) {
   const url = `http://${bridgeIp}/api/${appKey}/lights`

   request({
      method: 'GET',
      url: url
   }, function (err, res, body) {
      if (err) {
         console.warn(chalk.red(err))
      }

      let obj = JSON.parse(body)
      if (lightNumber && lightNumber.length) {
         obj = obj[lightNumber[0]]

         // console.log(program.filter)

         if (program.filter && program.filter == "color") {
            const hue = parseInt(obj.state.hue / 256)
            const sat = obj.state.sat
            const lightness = 60

            switch (hue) {
               case 184:
                  console.log("blue")
                  break
               case 100:
                  console.log("green")
                  break
               case 49:
                  console.log("yellow")
                  break
               case 0:
                  console.log("red")
                  break
               default:
                  console.log(hue)
            }
         } else {
            console.log(JSON.stringify(obj, null, 3))
         }
      }

   })
}
import * as fs from "fs"
import * as Particle from "particle-api-js"
import chalk from "chalk"

const particle = new Particle()
let token: string

async function auth() {
  const response = await particle.login({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  })

  token = response.body.access_token
}

async function getVarNumber(name: string): Promise<number> {
  const response = await particle.getVariable({
    auth: token,
    deviceId: process.env.DEVICE_ID,
    name
  })
  return response.body.result
}

async function getVarBool(name: string): Promise<boolean> {
  const response = await particle.getVariable({
    auth: token,
    deviceId: process.env.DEVICE_ID,
    name
  })
  return response.body.result
}

async function logData() {
  const time = new Date().toLocaleString()

  let data: string
  try {
    const batLvl = await getVarNumber("batLvl")
    const slrLvl = await getVarNumber("slrLvl")
    const power = await getVarBool("power")

    data = [time, batLvl, slrLvl, power].join("\t")
    console.log(
      chalk.gray(time),
      chalk.green(batLvl.toString()),
      chalk.yellow(slrLvl.toString()),
      power ? chalk.bgGreen(" LIGHTS ON ") : chalk.gray("off")
    )
  } catch (e) {
    data = time
    console.log(chalk.gray(time))
  }

  fs.appendFile("./data.tsv", data + "\n", err => {
    if (err) throw err
  })
}

export default async function poll() {
  await auth()
  logData()
  setInterval(logData, 5 * 60 * 1000)
}
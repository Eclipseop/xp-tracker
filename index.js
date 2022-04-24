const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI
const token = process.env.token
const org = process.env.org
const bucket = 'rspeer3'

const client = new InfluxDB({url: process.env.host, token: token})


const {Point} = require('@influxdata/influxdb-client')

const hiscores = require('osrs-json-hiscores');

const loadData = async () => {
    const skills = await hiscores.getStats('rspeer3');

    const point = generatePoint(skills.main.skills);

    const writeApi = client.getWriteApi(org, bucket)
    writeApi.useDefaultTags({host: 'host1'})
    writeApi.writePoint(point)

    writeApi
        .close()
        .then(() => {
            console.log('FINISHED')
        })
        .catch(e => {
            console.error(e)
            console.log('Finished ERROR')
        })
}

const generatePoint = (skills) => {
    const point = new Point('xp')

    for (let key of Object.keys(skills)) {
        const skill = skills[key]
        point.intField(key, skill.xp)
    }

    return point;
}

setInterval(loadData, 300000)
import { SSMClient } from '@aws-sdk/client-ssm'
import { fromEnv } from '@bifravst/from-env'
import { validateWithTypeBox } from '@hello.nrfcloud.com/proto'
import {
	lwm2mToSenML,
	SenML,
	type SenMLType,
} from '@hello.nrfcloud.com/proto-map/senml'
import { getDeviceCredentials } from '../settings/credentials.js'
import { getAccountId } from '../settings/nrfcloud.js'
import { endpoint } from './constants.js'
import { convertLocationsAPIResponse } from './convertLocationsApiResponse.js'
import { convertWaterLevelsAPIResponse } from './convertWaterLevelsAPIResponse.js'
import {
	fetchAndParseXML,
	stationInfo,
	waterLevelInfo,
} from './fetchAndParseXML.js'
import { getFetchIntervalForAPI } from './getFetchInterval.js'
import { publishPayload } from './publishPayload.js'
import type { Station, StationWaterLevel, WaterLevel } from './Station.js'
import { waterLevelObjectToLwM2M } from './waterLevelObjectToLwM2M.js'

const { stackName } = fromEnv({
	stackName: 'STACK_NAME',
})(process.env)

const ssm = new SSMClient({})

const creds = await getDeviceCredentials({ ssm, stackName })
const accountId = await getAccountId({ ssm, stackName })

const getLocation = async () => {
	const res = await fetchAndParseXML(
		stationInfo,
		`${endpoint}/tideapi.php?tide_request=stationlist&type=perm`,
	)
	if ('error' in res) {
		console.error(res.error)
		return res
	}
	return convertLocationsAPIResponse(res.value)
}

const isValid = validateWithTypeBox(SenML)

const getWaterLevelsForStation = async (
	station: Station,
	from: string,
	to: string,
) => {
	const res = await fetchAndParseXML(
		waterLevelInfo,
		`${endpoint}/tideapi.php?tide_request=locationdata&lat=${station.location.lat}&lon=${station.location.lng}&datatype=OBS&lang=en&place=&dst=1&refcode=CD&tzone=0&fromtime=${from}&totime=${to}&interval=10`,
	)
	if ('error' in res) {
		console.error(res.error)
		return []
	}
	const converted = convertWaterLevelsAPIResponse(res.value)
	if ('error' in converted) {
		console.error(converted.error)
		return []
	}
	return converted
}

export const handler = async (): Promise<void> => {
	const stations = await getLocation()
	if ('error' in stations) {
		return
	}
	const waterLevelMeasurements: Array<StationWaterLevel> = []
	const { from, to } = getFetchIntervalForAPI()
	for (const station of stations) {
		console.debug('Fetching water levels for station', station.stationCode)
		const readings = await getWaterLevelsForStation(station, from, to)
		if (readings.length === 0) {
			console.debug(`No readings found for station ${station.stationCode}!`)
			continue
		}
		const reading = readings.pop() as WaterLevel
		waterLevelMeasurements.push({
			station,
			waterLevel: reading,
		})
	}

	console.debug('measurements', JSON.stringify(waterLevelMeasurements))

	await Promise.allSettled(waterLevelMeasurements.map(publishMeasurement))
}

const publishMeasurement = async (measurement: StationWaterLevel) => {
	const lwm2mObjects = waterLevelObjectToLwM2M(measurement)
	const senMLPayloads: Array<SenMLType> = []
	for (const o of lwm2mObjects) {
		const maybeAsSenML = lwm2mToSenML(o)
		if ('errors' in maybeAsSenML) {
			console.error(JSON.stringify(maybeAsSenML.errors))
			console.error(`Could not convert LwM2M object`)
			return
		}
		senMLPayloads.push(maybeAsSenML.senML)
	}
	const maybeValidSenML = isValid(senMLPayloads.flat())
	if ('errors' in maybeValidSenML) {
		console.error(JSON.stringify(maybeValidSenML.errors))
		console.error(`Invalid SenML message`)
		return
	}
	const station = creds.find(
		(cred) => cred.station === measurement.station.stationCode,
	)
	if (station === undefined) {
		console.error(
			`Could not find credentials for station ${measurement.station.stationCode}`,
		)
		return
	}
	await publishPayload({
		credentials: station,
		payload: maybeValidSenML.value,
		accountId,
		debug: console.debug,
	})
}

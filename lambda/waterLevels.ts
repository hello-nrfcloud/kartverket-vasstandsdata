import { SSMClient } from '@aws-sdk/client-ssm'
import { convertLocationsAPIResponse } from './convertLocationsApiResponse.js'
import { waterLevelObjectToLwM2M } from './waterLevelObjectToLwM2M.js'
import { lwm2mToSenML, type SenMLType } from '@hello.nrfcloud.com/proto-map'
import { validateWithTypeBox } from '@hello.nrfcloud.com/proto'
import { SenML } from '@hello.nrfcloud.com/proto-map'
import { publishPayload as publishPayload } from './publishPayload.js'
import {
	fetchAndParseXML,
	stationInfo,
	waterLevelInfo,
} from './fetchAndParseXML.js'
import { convertWaterLevelsAPIResponse } from './convertWaterLevelsAPIResponse.js'
import { getFetchIntervalForAPI } from './getFetchInterval.js'
import { getDeviceCredentials } from '../settings/credentials.js'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { getAccountId } from '../settings/nrfcloud.js'
import type { Station, StationWaterLevel, WaterLevel } from './Station.js'

const { stackName } = fromEnv({
	stackName: 'STACK_NAME',
})(process.env)

const ssm = new SSMClient({})

const creds = await getDeviceCredentials({ ssm, stackName })
const accountId = await getAccountId({ ssm, stackName })

const getLocation = async () => {
	const res = await fetchAndParseXML(
		stationInfo,
		'http://api.sehavniva.no/tideapi.php?tide_request=stationlist&type=perm',
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
		`https://api.sehavniva.no/tideapi.php?tide_request=locationdata&lat=${station.location.lat}&lon=${station.location.lng}&datatype=OBS&lang=en&place=&dst=1&refcode=CD&tzone=0&fromtime=${from}&totime=${to}&interval=10`,
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
		const readings = await getWaterLevelsForStation(station, from, to)
		if (readings.length === 0) {
			console.debug(`No readings found for station ${station.stationCode}!`)
			continue
		}
		waterLevelMeasurements.push({
			station,
			waterLevel: readings.pop() as WaterLevel,
		})
	}

	// get stations and keys from AWS parameter store
	for (const station of creds) {
		const stationObject = waterLevelMeasurements.find(
			(obj) => obj.station.stationCode === station.station,
		)
		if (stationObject === undefined) {
			return
		}
		const lwm2mObjects = waterLevelObjectToLwM2M(stationObject)
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
		await publishPayload({
			credentials: station,
			payload: maybeValidSenML.value,
			accountId,
		})
	}
}

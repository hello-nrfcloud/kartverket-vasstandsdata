import {
	LwM2MObjectID,
	type LwM2MObjectInstance,
} from '@hello.nrfcloud.com/proto-map/lwm2m'
import type { StationWaterLevel } from './Station.ts'
import { toTime } from './toTime.ts'

export const waterLevelObjectToLwM2M = (
	sw: StationWaterLevel,
): LwM2MObjectInstance<LwM2MObjectInstance>[] => {
	return [
		{
			ObjectID: LwM2MObjectID.Geolocation_14201,
			ObjectVersion: '1.0',
			Resources: {
				'0': sw.station.location.lat,
				'1': sw.station.location.lng,
				'6': 'Fixed',
				'3': 1,
				'99': toTime(sw.waterLevel.time),
			},
		},
		{
			ObjectID: LwM2MObjectID.SeaWaterLevel_14230,
			ObjectVersion: '1.0',
			Resources: {
				'0': sw.waterLevel.level,
				'1': sw.station.stationCode,
				'99': toTime(sw.waterLevel.time),
			},
		},
	]
}

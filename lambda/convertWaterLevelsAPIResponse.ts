import type { Static } from '@sinclair/typebox'
import type { waterLevelInfo } from './fetchAndParseXML.js'
import type { WaterLevel } from './Station.js'

export const convertWaterLevelsAPIResponse = (
	data: Static<typeof waterLevelInfo>,
): Array<WaterLevel> | { error: Error } => {
	const waterLevels: Array<WaterLevel> = []
	for (const waterlevel of data.tide.locationdata[0]?.data[0]?.waterlevel ??
		[]) {
		waterLevels.push({
			level: waterlevel.$.value,
			time: waterlevel.$.time,
		})
	}
	if (waterLevels.length === 0)
		return { error: new Error('No waterlevel measurements found.') }
	return waterLevels
}

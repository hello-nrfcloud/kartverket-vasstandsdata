import type { Station } from './Station.js'
import { getFetchInterval } from './getFetchInterval.js'

export type WaterLevel = {
	level: number
	time: Date
}

export type StationWaterLevel = {
	station: Station
	waterLevel: WaterLevel
}

export const getWaterLevelMeasurements =
	({
		getWaterLevelsForStation,
	}: {
		getWaterLevelsForStation: (
			station: Station,
			from: Date,
			to: Date,
		) => Promise<Array<WaterLevel>>
	}) =>
	async (stations: Array<Station>): Promise<Array<StationWaterLevel>> => {
		const result = []
		const { from, to } = getFetchInterval()
		for (const station of stations) {
			const waterLevels = await getWaterLevelsForStation(station, from, to)
			const waterLevel = waterLevels.pop()
			if (waterLevel === undefined) continue
			result.push({
				station,
				waterLevel,
			})
		}
		return result
	}

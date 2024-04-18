export type Station = {
	stationCode: string
	location: {
		lat: number
		lng: number
	}
}

export type WaterLevel = {
	level: number
	time: Date
}

export type StationWaterLevel = {
	station: Station
	waterLevel: WaterLevel
}

export type StationWaterLevelReadings = {
	stationCode: string
	location: { lat: number; lng: number }
	readings: Array<{
		level: number
		time: Date
	}>
}

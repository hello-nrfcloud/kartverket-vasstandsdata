import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	getWaterLevelMeasurements,
	type StationWaterLevel,
} from './getWaterLevelInfo.js'

void describe('getWaterLevelInfo()', () => {
	void it('should return a list with waterlevelinfo from the different stations', async () => {
		const res: Array<StationWaterLevel> = [
			{
				station: {
					stationCode: 'ANX',
					location: { lat: 69.326067, lng: 16.134848 },
				},
				waterLevel: {
					level: 108.2,
					time: new Date('2024-03-01T09:00:00+01:00'),
				},
			},
			{
				station: {
					stationCode: 'BGO',
					location: { lat: 60.398046, lng: 5.320487 },
				},
				waterLevel: {
					level: 82.8,
					time: new Date('2024-03-01T09:00:00+01:00'),
				},
			},
			{
				station: {
					stationCode: 'BOO',
					location: { lat: 67.29233, lng: 14.39977 },
				},
				waterLevel: {
					level: 124.9,
					time: new Date('2024-03-01T09:00:00+01:00'),
				},
			},
			{
				station: {
					stationCode: 'BRJ',
					location: { lat: 60.492094, lng: 6.893949 },
				},
				waterLevel: {
					level: 85.8,
					time: new Date('2024-03-01T09:00:00+01:00'),
				},
			},
		]

		const stations = [
			{
				stationCode: 'ANX',
				location: { lat: 69.326067, lng: 16.134848 },
			},
			{
				stationCode: 'BGO',
				location: { lat: 60.398046, lng: 5.320487 },
			},
			{
				stationCode: 'BOO',
				location: { lat: 67.29233, lng: 14.39977 },
			},
			{
				stationCode: 'BRJ',
				location: { lat: 60.492094, lng: 6.893949 },
			},
		]
		const waterLevelStations = [
			{
				level: 85.8,
				time: new Date('2024-03-01T09:00:00+01:00'),
			},
			{
				level: 124.9,
				time: new Date('2024-03-01T09:00:00+01:00'),
			},
			{
				level: 82.8,
				time: new Date('2024-03-01T09:00:00+01:00'),
			},
			{
				level: 108.2,
				time: new Date('2024-03-01T09:00:00+01:00'),
			},
		]
		const getWaterLevels = getWaterLevelMeasurements({
			getWaterLevelsForStation: async () => waterLevelStations,
		})
		assert.deepEqual(await getWaterLevels(stations), res)
	})
})

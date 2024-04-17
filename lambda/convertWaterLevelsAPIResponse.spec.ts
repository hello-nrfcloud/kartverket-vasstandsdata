import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { convertWaterLevelsAPIResponse } from './convertWaterLevelsAPIResponse.js'
import { parsedApiResponseWaterLevelConverted } from './testData/parsedApiResponseWaterLevelConverted.js'

void describe('convertWaterLevelsApiResponse', () => {
	void it('should convert waterlevel api response to type WaterLevel[]', () => {
		const apiResponse = parsedApiResponseWaterLevelConverted
		const converted = convertWaterLevelsAPIResponse(apiResponse)
		const expectedRes = [
			{ level: 81.6, time: new Date('2024-03-01T08:00:00.000Z') },
			{ level: 79.1, time: new Date('2024-03-01T08:10:00.000Z') },
			{ level: 77.2, time: new Date('2024-03-01T08:20:00.000Z') },
			{ level: 75.6, time: new Date('2024-03-01T08:30:00.000Z') },
			{ level: 74.5, time: new Date('2024-03-01T08:40:00.000Z') },
			{ level: 73.9, time: new Date('2024-03-01T08:50:00.000Z') },
			{ level: 73.7, time: new Date('2024-03-01T09:00:00.000Z') },
		]
		assert.deepEqual(converted, expectedRes)
	})
})

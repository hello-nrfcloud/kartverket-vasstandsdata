import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { convertDataTypesFromAPI } from './convertDataTypesFromAPI.js'
import parsedApiResponseLocation from './testData/parsedApiResponseLocation.json' assert { type: 'json' }
import { parsedApiResponseLocationConverted } from './testData/parsedApiResponseLocationConverted.js'
import parsedApiResponseWaterLevel from './testData/parsedApiResponseWaterLevel.json' assert { type: 'json' }
import { parsedApiResponseWaterLevelConverted } from './testData/parsedApiResponseWaterLevelConverted.js'

void describe('convertDataTypesFromAPI', () => {
	void it('should convert the coordinates from string to number', () => {
		assert.deepEqual(
			convertDataTypesFromAPI(parsedApiResponseLocation),
			parsedApiResponseLocationConverted,
		)
	})
	void it('should convert values from string to numbers, and date from string to Date type.', () => {
		assert.deepEqual(
			convertDataTypesFromAPI(parsedApiResponseWaterLevel),
			parsedApiResponseWaterLevelConverted,
		)
	})
})

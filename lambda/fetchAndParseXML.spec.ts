import { readFile } from 'fs/promises'
import nock from 'nock'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { endpoint } from './constants.ts'
import {
	fetchAndParseXML,
	stationInfo,
	waterLevelInfo,
} from './fetchAndParseXML.ts'
import { parsedApiResponseLocationConverted } from './testData/parsedApiResponseLocationConverted.ts'
import { parsedApiResponseWaterLevelConverted } from './testData/parsedApiResponseWaterLevelConverted.ts'

void describe('fetchXML', () => {
	void it('should fetch XML data and parse it for stationInfo', async () => {
		const scope = nock(endpoint)
		const testData = await readFile(
			path.join('lambda', 'testData', 'responseLocations.xml'),
		)
		const content = testData.toString()
		scope
			.get('/tideapi.php?tide_request=stationlist&type=perm')
			.reply(200, content)
		const res = await fetchAndParseXML(
			stationInfo,
			`${endpoint}/tideapi.php?tide_request=stationlist&type=perm`,
		)
		assert.equal(scope.isDone(), true)
		assert.equal('error' in res, false)
		assert.deepEqual(
			'value' in res && res.value,
			parsedApiResponseLocationConverted,
		)
	})
	void it('should fetch XML data and parse it for water level data from one station (ANX)', async () => {
		const scope = nock(endpoint)
		const waterLevelData = await readFile(
			path.join('lambda', 'testData', 'responseWaterLevel.xml'),
		)
		const waterLevelcontent = waterLevelData.toString()
		scope
			.get(
				'/tideapi.php?tide_request=locationdata&lat=69.326067&lon=16.134848&datatype=OBS&lang=en&place=&dst=1&refcode=CD&fromtime=2024-03-01T09:00&totime=2024-03-01T11:00&interval=10',
			)
			.reply(200, waterLevelcontent)
		const res = await fetchAndParseXML(
			waterLevelInfo,
			`${endpoint}/tideapi.php?tide_request=locationdata&lat=69.326067&lon=16.134848&datatype=OBS&lang=en&place=&dst=1&refcode=CD&fromtime=2024-03-01T09:00&totime=2024-03-01T11:00&interval=10`,
		)
		assert.equal(scope.isDone(), true)
		assert.equal('error' in res, false)
		assert.deepEqual(
			'value' in res && res.value,
			parsedApiResponseWaterLevelConverted,
		)
	})
	void it('should return error if there is no data', async () => {
		const scope = nock(endpoint)
		const testData = await readFile(
			path.join('lambda', 'testData', 'noData.xml'),
		)
		const content = testData.toString()
		scope
			.get(
				'/tideapi.php?tide_request=locationdata&lat=69.326067&lon=16.134848&datatype=OBS&lang=en&place=&tzone=0&dst=1&refcode=CD&fromtime=2024-03-01T09:00&totime=2024-03-01T11:00&interval=10',
			)
			.reply(200, content)
		const res = await fetchAndParseXML(
			waterLevelInfo,
			`${endpoint}/tideapi.php?tide_request=locationdata&lat=69.326067&lon=16.134848&datatype=OBS&lang=en&place=&tzone=0&dst=1&refcode=CD&fromtime=2024-03-01T09:00&totime=2024-03-01T11:00&interval=10`,
		)
		assert.equal(scope.isDone(), true)
		assert.deepEqual(res, { error: new Error('No data') })
	})
})

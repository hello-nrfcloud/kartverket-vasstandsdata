import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import xml2js from 'xml2js'
import { convertLocationsAPIResponse } from './convertLocationsApiResponse.js'

export const parser = new xml2js.Parser()

void describe('getStations()', () => {
	void it('should return a list of the different stations', () => {
		const expectedRes = [
			{
				location: { lat: 69.326067, lng: 16.134848 },
				stationCode: 'ANX',
			},
			{
				location: { lat: 60.398046, lng: 5.320487 },
				stationCode: 'BGO',
			},
			{
				location: { lat: 67.29233, lng: 14.39977 },
				stationCode: 'BOO',
			},
			{
				location: { lat: 60.492094, lng: 6.893949 },
				stationCode: 'BRJ',
			},
		]
		const getLoc = convertLocationsAPIResponse({
			tide: {
				stationinfo: [
					{
						location: [
							{
								$: {
									name: 'Andenes',
									code: 'ANX',
									latitude: 69.326067,
									longitude: 16.134848,
									type: 'PERM',
								},
							},
							{
								$: {
									name: 'Bergen',
									code: 'BGO',
									latitude: 60.398046,
									longitude: 5.320487,
									type: 'PERM',
								},
							},
							{
								$: {
									name: 'Bodø',
									code: 'BOO',
									latitude: 67.29233,
									longitude: 14.39977,
									type: 'PERM',
								},
							},
							{
								$: {
									name: 'Bruravik',
									code: 'BRJ',
									latitude: 60.492094,
									longitude: 6.893949,
									type: 'PERM',
								},
							},
						],
					},
				],
			},
		})
		assert.deepEqual(getLoc, expectedRes)
	})
})

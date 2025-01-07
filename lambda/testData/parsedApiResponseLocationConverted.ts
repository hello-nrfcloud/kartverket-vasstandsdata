import { endpoint } from '../constants.ts'

export const parsedApiResponseLocationConverted = {
	tide: {
		$: {
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'xsi:noNamespaceSchemaLocation': `${endpoint}/stationinfo.xsd`,
		},
		meta: [
			{
				$: {
					licenseurl: 'http://kartverket.no/data/lisens/',
				},
			},
		],
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
}

import {
	packLayer,
	type PackedLayer,
} from '@bifravst/aws-cdk-lambda-helpers/layer'
import type pJson from '../package.json'

const dependencies: Array<keyof (typeof pJson)['dependencies']> = [
	'xml2js',
	'@hello.nrfcloud.com/proto-map',
	'@hello.nrfcloud.com/proto',
	'mqtt',
	'@bifravst/aws-ssm-settings-helpers',
	'@bifravst/from-env',
]

export const packBaseLayer = async (): Promise<PackedLayer> =>
	packLayer({
		id: 'baseLayer',
		dependencies,
	})

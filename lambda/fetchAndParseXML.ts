import { validateWithTypeBox } from '@hello.nrfcloud.com/proto'
import { Type, type Static, type TObject } from '@sinclair/typebox'
import { convertDataTypesFromAPI } from './convertDataTypesFromAPI.js'
import xml2js from 'xml2js'

export const parser = new xml2js.Parser()

export const fetchAndParseXML = async <Schema extends TObject>(
	schema: Schema,
	url: string,
): Promise<{ value: Static<Schema> } | { error: Error }> => {
	const res = await fetch(url)
	const content = await res.text()
	if (content.includes('nodata')) {
		return { error: new Error('No data') }
	}
	try {
		const data = await parser.parseStringPromise(content)
		const convertedData = convertDataTypesFromAPI(data)
		const maybeValidatedData = validateWithTypeBox(schema)(convertedData)
		if ('errors' in maybeValidatedData) {
			console.error(JSON.stringify(maybeValidatedData.errors))
			console.error(`Invalid message`)
			return { error: new Error('Validation of data failed.') }
		}
		return maybeValidatedData
	} catch {
		return { error: new Error('Parsing failed.') }
	}
}

export const stationInfo = Type.Object({
	tide: Type.Object({
		stationinfo: Type.Array(
			Type.Object({
				location: Type.Array(
					Type.Object({
						$: Type.Object({
							name: Type.String({ minLength: 1 }), // e.g. Andenes
							code: Type.String({ minLength: 1 }), // e.g. ANX
							latitude: Type.Number({ minimum: -90, maximum: 90 }), // e.g. 69.326067
							longitude: Type.Number({ minimum: -180, maximum: 180 }), // e.g. 16.134848
							type: Type.String({ minLength: 1 }), // e.g. PERM
						}),
					}),
				),
			}),
		),
	}),
})

export type stationInfoType = Static<typeof stationInfo>

export const waterLevelInfo = Type.Object({
	tide: Type.Object({
		locationdata: Type.Array(
			Type.Object({
				location: Type.Array(
					Type.Object({
						$: Type.Object({
							code: Type.String({ minLength: 1 }), // e.g. ANX
							latitude: Type.Number({ minimum: -90, maximum: 90 }), // e.g. 69.326067
							longitude: Type.Number({ minimum: -180, maximum: 180 }), // e.g. 16.134848
						}),
					}),
				),
				data: Type.Array(
					Type.Object({
						waterlevel: Type.Array(
							Type.Object({
								$: Type.Object({
									value: Type.Number({ minimum: -50, maximum: 500 }), // e.g. 76.4
									time: Type.Date(), // e.g. 2024-03-01T09:00:00+01:00
								}),
							}),
						),
					}),
				),
			}),
		),
	}),
})

export type waterLevelInfoType = Static<typeof waterLevelInfo>

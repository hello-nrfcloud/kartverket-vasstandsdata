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

const code = Type.String({
	minLength: 1,
	examples: ['ANX'],
	title: 'Station code',
})
const latitude = Type.Number({
	minimum: -90,
	maximum: 90,
	examples: [69.326067],
})
const longitude = Type.Number({
	minimum: -180,
	maximum: 180,
	examples: [16.134848],
})

export const stationInfo = Type.Object({
	tide: Type.Object({
		stationinfo: Type.Array(
			Type.Object({
				location: Type.Array(
					Type.Object({
						$: Type.Object({
							name: Type.String({ minLength: 1, examples: ['Andenes'] }),
							code,
							latitude,
							longitude,
							type: Type.String({ minLength: 1, examples: ['PERM'] }),
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
							code,
							latitude,
							longitude,
						}),
					}),
				),
				data: Type.Array(
					Type.Object({
						waterlevel: Type.Array(
							Type.Object({
								$: Type.Object({
									value: Type.Number({
										minimum: -50,
										maximum: 500,
										examples: [76.4],
									}),
									time: Type.Date({ examples: ['2024-03-01T09:00:00+01:00'] }),
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

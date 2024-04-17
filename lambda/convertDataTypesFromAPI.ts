import {
	type stationInfoType,
	type waterLevelInfoType,
} from './fetchAndParseXML.js'
export type stationInfoTypeFromAPI = {
	tide: {
		stationinfo: {
			location: {
				$: {
					name: string
					code: string
					latitude: string | number
					longitude: string | number
					type: string
				}
			}[]
		}[]
	}
}
export type waterLevelInfoTypeFromApi = {
	tide: {
		locationdata: {
			location: {
				$: {
					code: string
					latitude: string | number
					longitude: string | number
				}
			}[]
			data: {
				waterlevel: {
					$: {
						value: string | number
						time: string | Date
					}
				}[]
			}[]
		}[]
	}
}

export const convertDataTypesFromAPI = (
	data: stationInfoTypeFromAPI | waterLevelInfoTypeFromApi,
): stationInfoType | waterLevelInfoType | { error: Error } => {
	if ('stationinfo' in data.tide) {
		for (const location of data.tide.stationinfo[0]?.location ?? []) {
			location.$.latitude = Number(location.$.latitude)
			location.$.longitude = Number(location.$.longitude)
		}
		return data as unknown as stationInfoType
	} else if ('locationdata' in data.tide) {
		for (const waterLevelLocation of data.tide.locationdata[0]?.location ??
			[]) {
			waterLevelLocation.$.latitude = Number(waterLevelLocation.$.latitude)
			waterLevelLocation.$.longitude = Number(waterLevelLocation.$.longitude)
		}
		for (const waterLevelData of data.tide.locationdata[0]?.data[0]
			?.waterlevel ?? []) {
			waterLevelData.$.value = Number(waterLevelData.$.value)
			waterLevelData.$.time = new Date(waterLevelData.$.time)
		}
		return data as unknown as waterLevelInfoType
	}
	return { error: new Error('Error: wrong format') }
}

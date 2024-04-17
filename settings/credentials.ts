import type { SSMClient } from '@aws-sdk/client-ssm'
import { get } from '@bifravst/aws-ssm-settings-helpers'

export type Credentials = {
	station: string
	deviceId: string
	certificate: string
	privateKey: string
}

const CREDENTIALS_SCOPE = 'credentials'

export const getDeviceCredentials = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<Array<Credentials>> => {
	const settings = await get(ssm)({ stackName, scope: CREDENTIALS_SCOPE })()

	const credentialData: Record<string, Record<string, string>> = {}

	for (const [name, value] of Object.entries(settings)) {
		const [station, property] = name.split('/', 2)
		if (station === undefined) continue
		if (property === undefined) continue
		if (credentialData[station] === undefined) credentialData[station] = {}
		credentialData[station]![property] = value
	}

	return Object.entries(credentialData)
		.map(([station, { deviceId, certificate, privateKey }]) => {
			if (certificate === undefined) return undefined
			if (privateKey === undefined) return undefined
			if (deviceId === undefined) return undefined
			return {
				station,
				deviceId,
				privateKey,
				certificate,
			}
		})
		.filter((d) => d !== undefined) as Array<Credentials>
}

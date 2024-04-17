import type { SSMClient } from '@aws-sdk/client-ssm'
import { get as getSSMSettings } from '@bifravst/aws-ssm-settings-helpers'

const NRFCLOUD_SCOPE = 'nrfcloud'
const NRFCLOUD_CONTEXT = 'account'

export const getAccountId = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<string> => {
	const settingsReader = getSSMSettings(ssm)({
		stackName,
		scope: NRFCLOUD_SCOPE,
		context: NRFCLOUD_CONTEXT,
	})
	const p = await settingsReader()
	const { accountId } = p
	if (accountId === undefined) throw new Error(`No accountId configured!`)
	return accountId
}

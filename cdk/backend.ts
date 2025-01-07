import { IAMClient } from '@aws-sdk/client-iam'
import { ensureGitHubOIDCProvider } from '@bifravst/ci'
import pJSON from '../package.json' assert { type: 'json' }
import { BackendApp } from './BackendApp.ts'
import { packBackendLambdas } from './lambdas.ts'
import { packBaseLayer } from './layer.ts'

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'hello-nrfcloud',
	repo: repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ?? 'backend',
}

const iam = new IAMClient({})

new BackendApp({
	lambdaSources: await packBackendLambdas(),
	layer: await packBaseLayer(),
	repository,
	gitHubOICDProviderArn: await ensureGitHubOIDCProvider({
		iam,
	}),
	isTest: process.env.IS_TEST === '1',
	version: (() => {
		const v = process.env.VERSION
		const defaultVersion = '0.0.0-development'
		if (v === undefined)
			console.warn(`VERSION is not defined, using ${defaultVersion}!`)
		return v ?? defaultVersion
	})(),
})

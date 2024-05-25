import type { App } from 'aws-cdk-lib'
import {
	Stack,
	aws_lambda as Lambda,
	Duration,
	aws_events as Events,
	aws_events_targets as EventTargets,
	CfnOutput,
} from 'aws-cdk-lib'
import { STACK_NAME } from './stackConfig.js'
import type { BackendLambdas } from './lambdas.js'
import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import { PackedLambdaFn } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { LambdaSource } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { ContinuousDeployment } from './resources/ContinuousDeployment.js'

export class BackendStack extends Stack {
	constructor(
		parent: App,
		{
			lambdaSources,
			layer,
			repository,
			gitHubOICDProviderArn,
		}: {
			lambdaSources: BackendLambdas
			layer: PackedLayer
			repository: {
				owner: string
				repo: string
			}
			gitHubOICDProviderArn: string
		},
	) {
		super(parent, STACK_NAME)

		const baseLayer = new Lambda.LayerVersion(this, 'baseLayer', {
			layerVersionName: `${Stack.of(this).stackName}-baseLayer`,
			code: new LambdaSource(this, {
				id: 'baseLayer',
				zipFile: layer.layerZipFile,
				hash: layer.hash,
			}).code,
			compatibleArchitectures: [Lambda.Architecture.ARM_64],
			compatibleRuntimes: [Lambda.Runtime.NODEJS_20_X],
		})

		const getWaterLevels = new PackedLambdaFn(
			this,
			'getWaterLevels',
			lambdaSources.waterLevels,
			{
				layers: [baseLayer],
				timeout: Duration.seconds(60),
				memorySize: 1024,
			},
		)

		const rule = new Events.Rule(this, 'rule', {
			description: `Rule to schedule waterLevel lambda invocations`,
			schedule: Events.Schedule.rate(Duration.hours(1)),
		})
		rule.addTarget(new EventTargets.LambdaFunction(getWaterLevels.fn))

		const cd = new ContinuousDeployment(this, {
			repository,
			gitHubOICDProviderArn,
		})
		new CfnOutput(this, 'cdRoleArn', {
			exportName: `${this.stackName}:cdRoleArn`,
			description: 'Role ARN to use in the deploy GitHub Actions Workflow',
			value: cd.role.roleArn,
		})
	}
}

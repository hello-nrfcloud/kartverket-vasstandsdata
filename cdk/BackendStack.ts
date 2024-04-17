import {
	App,
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
import {
	LambdaLogGroup,
	LambdaSource,
} from '@bifravst/aws-cdk-lambda-helpers/cdk'
import { ContinuousDeployment } from './resources/ContinuousDeployment.js'
import { Permissions } from '@bifravst/aws-ssm-settings-helpers/cdk'

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

		const getWaterLevels = new Lambda.Function(this, 'getWaterLevels', {
			handler: lambdaSources.waterLevels.handler,
			code: new LambdaSource(this, lambdaSources.waterLevels).code,
			runtime: Lambda.Runtime.NODEJS_20_X,
			layers: [baseLayer],
			timeout: Duration.seconds(60),
			memorySize: 1024,
			initialPolicy: [Permissions(Stack.of(this))],
			environment: {
				STACK_NAME: Stack.of(this).stackName,
				VERSION: this.node.getContext('version'),
			},
			...new LambdaLogGroup(this, 'getWaterLevelsLogs'),
		})

		const rule = new Events.Rule(this, 'rule', {
			description: `Rule to schedule waterLevel lambda invocations`,
			schedule: Events.Schedule.rate(Duration.hours(1)),
		})
		rule.addTarget(new EventTargets.LambdaFunction(getWaterLevels))

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

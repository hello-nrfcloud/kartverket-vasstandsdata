# `hello.nrfcloud.com/map` backend

[![GitHub Actions](https://github.com/hello-nrfcloud/kartverket-vasstand/workflows/Test%20and%20Release/badge.svg)](https://github.com/hello-nrfcloud/kartverket-vasstand/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Publishes the seawater levels from [kartverket.no](https://www.kartverket.no/)
as custom devices on `hello.nrfcloud.com/map`.

## Installation in your AWS account

### Setup

Provide your AWS credentials, for example using the `.envrc` (see
[the example](.envrc.example)).

### Install the dependencies

```bash
npm ci
```

### Deploy

```bash
npx cdk bootstrap # if this is the first time you use CDK in this account
npx cdk deploy
```

### Configure

Configure the nRF Cloud team ID:

```bash
aws ssm put-parameter --name /${STACK_NAME:-kartverket-vasstand}/nrfcloud/account/accountId --type String --value "<team ID>"
```

Configure the station credentials:

```bash
aws ssm put-parameter --name /${STACK_NAME:-kartverket-vasstand}/credentials/<station>/deviceId --type String --value "<deviceId>"
aws ssm put-parameter --name /${STACK_NAME:-kartverket-vasstand}/credentials/<station>/certificate --type String --value "<certificate>"
aws ssm put-parameter --name /${STACK_NAME:-kartverket-vasstand}/credentials/<station>/privateKey --type String --value "<privateKey>"
```

## Continuous Deployment using GitHub Actions

After deploying the stack manually once,

- configure a GitHub Actions environment named `production`
- create the secret `AWS_ROLE` with the value
  `arn:aws:iam::<account ID>:role/<stack name>-cd` and a variable (use the
  `cdRoleArn` stack output)
- create the variable `AWS_REGION` with the value `<region>` (your region)
- create the variable `STACK_NAME` with the value `<stack name>` (your stack
  name)

to enable continuous deployment.

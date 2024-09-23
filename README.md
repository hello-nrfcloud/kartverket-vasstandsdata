# Custom sensor data on `hello.nrfcloud.com/map`

[![GitHub Actions](https://github.com/hello-nrfcloud/kartverket-vasstand/workflows/Test%20and%20Release/badge.svg)](https://github.com/hello-nrfcloud/kartverket-vasstand/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Publishes the seawater levels from [kartverket.no](https://www.kartverket.no/)
as custom devices on
[hello.nrfcloud.com/map](https://hello.nrfcloud.com/map/#id:flashing-entozoic-filatory!s:model:kartverket-vasstandsdata!m:4.257012404239944:65.99607475371971,16.771625841773357!t:describe-model:di;14230;0).

This project serves as an example of how arbitrary device data can be visualized
on `hello.nrfcloud.com/map` by leveraging LwM2M data objects.

To describe the seawater level readings, the object
[`14230`](https://github.com/hello-nrfcloud/proto-map/blob/v5.3.0/lwm2m/14230.xml)
has been registered in the
[protocol repository](https://github.com/hello-nrfcloud/proto-map/).

In addition, the device has been described in the model definition
[`kartverket-vasstandsdata`](https://github.com/hello-nrfcloud/proto-map/tree/v5.3.0/models/kartverket-vasstandsdata)
in the same repository.

For each water level station (e.g. `BGO` or `TRD`) a device has been
[registered](https://hello.nrfcloud.com/map/#add-device).

Using the credentials created during the registration process, the code in this
repository now connects to the
[API for water level data](https://vannstand.kartverket.no/tideapi_en.html) and
fetches the most recent measurements.

The measurements are then converted to the LwM2M object `14230`, serialized as
[SenML](https://datatracker.ietf.org/doc/html/rfc8428) and published on the
[nRF Cloud MQTT API](https://docs.nordicsemi.com/bundle/nrf-cloud/page/APIs/MQTT/MQTTOverview.html).

The `hello.nrfcloud.com/map` backend
[converts](https://github.com/hello-nrfcloud/map-backend/blob/v1.3.3/features/SenMLMQTTIngest.feature.md)
these messages then back to LwM2M object so it can be
[displayed on the map](https://hello.nrfcloud.com/map/#id:flashing-entozoic-filatory!s:model:kartverket-vasstandsdata!m:4.257012404239944:65.99607475371971,16.771625841773357!t:describe-model:di;14230;0).

## Installation in your AWS account

### Setup

[Provide your AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html).

Install the dependencies:

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

#### Station IDs

| Station ID |
| ---------- |
| `ANX`      |
| `BGO`      |
| `BOO`      |
| `BRJ`      |
| `HFT`      |
| `HAR`      |
| `HEI`      |
| `HRO`      |
| `HVG`      |
| `KAB`      |
| `KSU`      |
| `LEH`      |
| `MSU`      |
| `MAY`      |
| `NVK`      |
| `NYA`      |
| `OSC`      |
| `OSL`      |
| `RVK`      |
| `SBG`      |
| `SIE`      |
| `SOY`      |
| `SVG`      |
| `TRG`      |
| `TOS`      |
| `TRD`      |
| `TAZ`      |
| `VAW`      |
| `VIK`      |
| `AES`      |

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

import type { SenMLType } from '@hello.nrfcloud.com/proto-map/senml'
import { connect } from 'mqtt'
import type { Credentials } from '../settings/credentials.js'

const amazonRootCA1 =
	'-----BEGIN CERTIFICATE-----\n' +
	'MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF\n' +
	'ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6\n' +
	'b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL\n' +
	'MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv\n' +
	'b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj\n' +
	'ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM\n' +
	'9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw\n' +
	'IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6\n' +
	'VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L\n' +
	'93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm\n' +
	'jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC\n' +
	'AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA\n' +
	'A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI\n' +
	'U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs\n' +
	'N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv\n' +
	'o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU\n' +
	'5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy\n' +
	'rqXRfboQnoZsG4q5WTP468SQvvG5\n' +
	'-----END CERTIFICATE-----\n'

export const publishPayload = async ({
	credentials: { deviceId, certificate, privateKey },
	payload,
	accountId,
	debug,
}: {
	credentials: Credentials
	payload: SenMLType
	accountId: string
	debug?: (...args: any[]) => void
}): Promise<void> =>
	new Promise<void>((resolve, reject) => {
		debug?.(deviceId, `Connecting to mqtt.nrfcloud.com`)
		const client = connect({
			host: 'mqtt.nrfcloud.com',
			port: 8883,
			rejectUnauthorized: true,
			clientId: deviceId,
			protocol: 'mqtts',
			protocolVersion: 4,
			key: privateKey,
			cert: certificate,
			ca: amazonRootCA1,
			clean: true,
			connectTimeout: 10 * 1000,
		})

		client.on('offline', () => {
			debug?.(deviceId, `Offline`)
			reject(new ConnectError(deviceId))
		})
		client.on('disconnect', () => {
			debug?.(deviceId, `Disconnected from mqtt.nrfcloud.com`)
		})
		client.on('error', (err) => {
			debug?.(deviceId, `Error`, err)
			reject(new ConnectError(deviceId))
		})
		client.on('connect', () => {
			debug?.(deviceId, `Connected to mqtt.nrfcloud.com`)
			const topic = `prod/${accountId}/m/d/${deviceId}/d2c/senml`
			debug?.(deviceId, `Publishing to ${topic}`)
			const t2 = setTimeout(() => {
				reject(new PublishTimeoutError(deviceId))
			}, 60 * 1000)
			client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
				clearTimeout(t2)
				if (err !== undefined) {
					reject(err)
				}
				debug?.(deviceId, `Published payload`, JSON.stringify(payload))
				client.end()
				resolve()
			})
		})
	})

class PublishTimeoutError extends Error {
	constructor(deviceId: string) {
		super(`Timed out publishing for device ${deviceId}!`)
	}
}

class ConnectError extends Error {
	constructor(deviceId: string) {
		super(`Failed to connect ${deviceId}!`)
	}
}

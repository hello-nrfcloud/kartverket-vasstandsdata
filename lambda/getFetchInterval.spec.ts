import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getFetchIntervalForAPI } from './getFetchInterval.js'

void describe('getFetchInterval', () => {
	void it('should return a fetch interval of one hour back in time in UTC time.', () => {
		const expectedRes = { from: '2024-03-15T10:27', to: '2024-03-15T12:27' }
		//Fri Mar 15 2024 13:27:17 GMT+0100
		assert.deepEqual(
			getFetchIntervalForAPI(new Date(1710505637000)),
			expectedRes,
		)
	})
})

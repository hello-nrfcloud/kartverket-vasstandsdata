/**
 * Convert the date to a LwM2M time value (Unix epoch in seconds).
 */
export const toTime = (date: Date): number => Math.floor(date.getTime() / 1000)

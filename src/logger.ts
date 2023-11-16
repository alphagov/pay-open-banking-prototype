import { createLogger,format, transports } from 'winston'

const logger = createLogger()

logger.add(new transports.Console({
    format: format.combine(
        format.timestamp({ format: 'HH:mm:ss' }),
        format.colorize(),
        format.simple()
    )
}))

export default logger
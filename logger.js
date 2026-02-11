const LogLevel = {
	DEBUG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4,
}

const f = false
const a = true

const Channel = {
	Network: f,
	Entities: f,
	Players: f,
	Replicator: f,
	EntReg: a,
	Control: f,
	Player: f,
	AiState: f,
	Inventory: f,
	DataStore: f,
	Action: a,
	InventoryTrackers: f,
	Attack: f,
	ClientHitboxRegistry: f,
	States: a,
	Path: f,
}

class Logger {
	static _minLevel = LogLevel.DEBUG
	static _sink = console.log
	static _defaultChannel = "Default"

	static setDefaultChannel(channel) {
		Logger._defaultChannel = channel
	}

	static setSink(sink) {
		Logger._sink = sink
	}

	static setMinLevel(level) {
		Logger._minLevel = level
	}

	static enableChannel(channel) {
		Channel[channel] = true
	}

	static disableChannel(channel) {
		Channel[channel] = false
	}

	static isChannelEnabled(channel) {
		return Channel[channel] === true
	}

	static _shouldLog(channel, level) {
		if (!Channel[channel]) {
			return false
		}
		if (level < Logger._minLevel) {
			return false
		}
		return true
	}

	static log(channel, level, ...args) {
		if (!Logger._shouldLog(channel, level)) {
			return
		}
		Logger._sink(channel, level, ...args)
	}

	static debug(channel, ...args) {
		Logger.log(channel, LogLevel.DEBUG, ...args)
	}

	static info(channel, ...args) {
		Logger.log(channel, LogLevel.INFO, ...args)
	}

	static warn(channel, ...args) {
		Logger.log(channel, LogLevel.WARN, ...args)
	}

	static error(channel, ...args) {
		Logger.log(channel, LogLevel.ERROR, ...args)
	}

	static debugDefault(...args) {
		Logger.log(Logger._defaultChannel, LogLevel.DEBUG, ...args)
	}

	static infoDefault(...args) {
		Logger.log(Logger._defaultChannel, LogLevel.INFO, ...args)
	}

	static warnDefault(...args) {
		Logger.log(Logger._defaultChannel, LogLevel.WARN, ...args)
	}

	static errorDefault(...args) {
		Logger.log(Logger._defaultChannel, LogLevel.ERROR, ...args)
	}
}

module.exports = {
	Logger,
	LogLevel,
	Channel,
}

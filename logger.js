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

const Logger = {}

Logger._minLevel = LogLevel.DEBUG
Logger._sink = console.log
Logger._defaultChannel = "Default"

function Logger.setDefaultChannel(channel) {
	Logger._defaultChannel = channel
}

function Logger.setSink(sink) {
	Logger._sink = sink
}

function Logger.setMinLevel(level) {
	Logger._minLevel = level
}

function Logger.enableChannel(channel) {
	Channel[channel] = true
}

function Logger.disableChannel(channel) {
	Channel[channel] = false
}

function Logger.isChannelEnabled(channel) {
	return Channel[channel] === true
}

function Logger._shouldLog(channel, level) {
	if (!Channel[channel]) {
		return false
	}
	if (level < Logger._minLevel) {
		return false
	}
	return true
}

function Logger.log(channel, level, ...args) {
	if (!Logger._shouldLog(channel, level)) {
		return
	}
	Logger._sink(channel, level, ...args)
}

function Logger.debug(channel, ...args) {
	Logger.log(channel, LogLevel.DEBUG, ...args)
}

function Logger.info(channel, ...args) {
	Logger.log(channel, LogLevel.INFO, ...args)
}

function Logger.warn(channel, ...args) {
	Logger.log(channel, LogLevel.WARN, ...args)
}

function Logger.error(channel, ...args) {
	Logger.log(channel, LogLevel.ERROR, ...args)
}

function Logger.debugDefault(...args) {
	Logger.log(Logger._defaultChannel, LogLevel.DEBUG, ...args)
}

function Logger.infoDefault(...args) {
	Logger.log(Logger._defaultChannel, LogLevel.INFO, ...args)
}

function Logger.warnDefault(...args) {
	Logger.log(Logger._defaultChannel, LogLevel.WARN, ...args)
}

function Logger.errorDefault(...args) {
	Logger.log(Logger._defaultChannel, LogLevel.ERROR, ...args)
}

module.exports = {
	Logger,
	LogLevel,
	Channel,
}

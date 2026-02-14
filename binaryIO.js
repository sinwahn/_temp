const __BinaryContainer_decoder_utf = new TextDecoder('utf-8')
const __BinaryContainer_decoder_ascii = new TextDecoder('ascii')
const __BinaryContainer_encoder = new TextEncoder()

function clearBinaryHexData(hexString) {
	return hexString
		.replace(/\s+/g, '')
		.replace(/^0x/i, '')
		.replace(/[^0-9a-fA-F]/g, '')
}

class BinaryContainer {
	constructor() {
		this.data = null
		this.view = null
		this.size = 0
		this.capacity = 0
	}

	create(capacity) {
		this.data = new Uint8Array(capacity)
		this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength)
		this.capacity = capacity
	}

	reserve(newCapacity) {
		if (newCapacity > this.capacity) {
			const newData = new Uint8Array(newCapacity)
			newData.set(this.data.subarray(0, this.capacity), 0)
			this.data = newData
			this.view = new DataView(newData.buffer, newData.byteOffset, newData.byteLength)
			this.capacity = newCapacity
		}
	}

	reallocate(newCapacity) {
		const newData = new Uint8Array(newCapacity)
		newData.set(this.data.subarray(0, this.size), 0)
		this.data = newData
		this.view = new DataView(newData.buffer, newData.byteOffset, newData.byteLength)
		this.capacity = newCapacity
	}

	toHex() {
		let result = ''
		for (let i = 0; i < this.size; i++) {
			const byte = this.data[i]
			const hex = byte.toString(16).padStart(2, '0')
			result += hex + ' '
		}
		return result
	}

	assignHex(hexStr) {
		const clean = clearBinaryHexData(hexStr)
		if (clean.length % 2 !== 0)
			throw new Error("Hex string has odd length")

		const buf = new Uint8Array(clean.length / 2)
		for (let i = 0; i < clean.length; i += 2)
			buf[i / 2] = parseInt(clean.slice(i, i + 2), 16)
		
		this.data = buf
		this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
		this.size = buf.length
		this.capacity = buf.length
		return this
	}

	toAscii() {
		return __BinaryContainer_decoder_ascii.decode(this.data.subarray(0, this.size))
	}

	assignAscii(str) {
		const bytes = new Uint8Array(str.length)
		for (let i = 0; i < str.length; i++) {
			bytes[i] = str.charCodeAt(i) & 0xFF
		}

		this.data = bytes
		this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
		this.size = bytes.length
		this.capacity = bytes.length
		return this
	}
}

class BinaryReader extends BinaryContainer {
	constructor(data = null) {
		super()
		if (data) {
			this.data = data
			this.view = new DataView(data.buffer, data.byteOffset, data.byteLength)
			this.size = data.length
		}
		this.position = 0
	}

	skip(bytes) {
		this.position += bytes
		if (this.position > this.size)
			throw new Error("Cannot skip past end of buffer")
		return this
	}

	align(alignment) {
		const offset = this.position % alignment
		if (offset !== 0)
			this.position += alignment - offset
		return this
	}

	tell() { return this.position }

	seek(pos) {
		if (pos < 0 || pos > this.size) {
			throw new Error(`Invalid seek position: ${pos}`)
		}
		this.position = pos
		return this
	}

	setBuffer(data) {
		this.data = data
		this.view = new DataView(data.buffer, data.byteOffset, data.byteLength)
		this.position = 0
		this.size = data.length
	}

	readU8() {
		const value = this.data[this.position]
		this.position += 1
		return value
	}

	readU16() {
		const value = this.view.getUint16(this.position, true)
		this.position += 2
		return value
	}

	readU32() {
		const value = this.view.getUint32(this.position, true)
		this.position += 4
		return value
	}

	readI8() {
		const value = this.view.getInt8(this.position)
		this.position += 1
		return value
	}

	readI16() {
		const value = this.view.getInt16(this.position, true)
		this.position += 2
		return value
	}

	readI32() {
		const value = this.view.getInt32(this.position, true)
		this.position += 4
		return value
	}

	readF32() {
		const value = this.view.getFloat32(this.position, true)
		this.position += 4
		return value
	}

	readF64() {
		const value = this.view.getFloat64(this.position, true)
		this.position += 8
		return value
	}

	readStringOfSize(size) {
		const value = __BinaryContainer_decoder_utf.decode(this.data.subarray(this.position, this.position + size))
		this.position += size
		return value
	}

	readStringU8() {
		const size = this.readU8()
		return this.readStringOfSize(size)
	}

	readStringU16() {
		const size = this.readU16()
		return this.readStringOfSize(size)
	}

	readStringU32() {
		const size = this.readU32()
		return this.readStringOfSize(size)
	}

	readString() {
		return this.readStringU32()
	}

	readCString() {
		const start = this.position
		let cursor = start

		while (cursor < this.size && this.data[cursor] !== 0)
			cursor += 1

		if (cursor === this.size)
			throw new Error('string is not null-terminated')

		const value = __BinaryContainer_decoder_utf.decode(this.data.subarray(start, cursor))
		this.position = cursor + 1
		return value
	}

	readBool() {
		return this.readU8() !== 0
	}

	readVector2F32() {
		return {
			x: this.readF32(),
			y: this.readF32()
		}
	}

	readVector2I16() {
		return {
			x: this.readI16(),
			y: this.readI16()
		}
	}

	readVector2I32() {
		return {
			x: this.readI32(),
			y: this.readI32()
		}
	}

	readVector3F32() {
		return {
			x: this.readF32(),
			y: this.readF32(),
			z: this.readF32()
		}
	}

	readVector3I16() {
		return {
			x: this.readI16(),
			y: this.readI16(),
			z: this.readI16()
		}
	}

	readVector3I32() {
		return {
			x: this.readI32(),
			y: this.readI32(),
			z: this.readI32()
		}
	}
	
	readVector4F32() {
		return {
			x: this.readF32(),
			y: this.readF32(),
			z: this.readF32(),
			w: this.readF32()
		}
	}
	
	readVector4I16() {
		return {
			x: this.readI16(),
			y: this.readI16(),
			z: this.readI16(),
			w: this.readI16()
		}
	}

	readVector4I32() {
		return {
			x: this.readI32(),
			y: this.readI32(),
			z: this.readI32(),
			w: this.readI32()
		}
	}

	readColor3F32() {
		return {
			r: this.readF32(),
			g: this.readF32(),
			b: this.readF32()
		}
	}

	readColor3U8() {
		return {
			r: this.readU8() / 255,
			g: this.readU8() / 255,
			b: this.readU8() / 255
		}
	}

	readCFrame() {
		const x = this.readF32()
		const y = this.readF32()
		const z = this.readF32()
		const rx = this.readF32()
		const ry = this.readF32()
		const rz = this.readF32()

		return {
			position: { x, y, z },
			rotation: { x: rx, y: ry, z: rz }
		}
	}

	readVarInt() {
		let value = 0
		let shift = 0
		
		while (true) {
			const byte = this.readU8()
			value += (byte & 127) << shift
			if ((byte & 128) === 0) {
				break
			}
			shift += 7
		}
		
		return value
	}
}

class BinaryWriter extends BinaryContainer {
	constructor() {
		super()
	}

	_reserveGrow(size) {
		const currentSize = this.size
		const currentCapacity = this.capacity
		const newSize = currentSize + size

		if (newSize > currentCapacity) {
			const newData = new Uint8Array(newSize)
			if (this.data) {
				newData.set(this.data.subarray(0, currentSize), 0)
			}
			this.data = newData
			this.view = new DataView(newData.buffer, newData.byteOffset, newData.byteLength)
			this.size = newSize
			this.capacity = newSize
		} else {
			this.size = newSize
		}

		return currentSize
	}

	writeU8(value) {
		const currentSize = this._reserveGrow(1)
		this.data[currentSize] = value
		return this
	}

	writeU16(value) {
		const currentSize = this._reserveGrow(2)
		this.view.setUint16(currentSize, value, true)
		return this
	}

	writeU32(value) {
		const currentSize = this._reserveGrow(4)
		this.view.setUint32(currentSize, value, true)
		return this
	}

	writeI8(value) {
		const currentSize = this._reserveGrow(1)
		this.view.setInt8(currentSize, value)
		return this
	}

	writeI16(value) {
		const currentSize = this._reserveGrow(2)
		this.view.setInt16(currentSize, value, true)
		return this
	}

	writeI32(value) {
		const currentSize = this._reserveGrow(4)
		this.view.setInt32(currentSize, value, true)
		return this
	}

	writeF32(value) {
		const currentSize = this._reserveGrow(4)
		this.view.setFloat32(currentSize, value, true)
		return this
	}

	writeF64(value) {
		const currentSize = this._reserveGrow(8)
		this.view.setFloat64(currentSize, value, true)
		return this
	}

	writeBool(value) {
		this.writeU8(value ? 1 : 0)
		return this
	}

	writeStringOfSize(source, stringSize) {
		const currentSize = this._reserveGrow(stringSize)
		const encoded = __BinaryContainer_encoder.encode(source)
		this.data.set(encoded.subarray(0, stringSize), currentSize)
		return this
	}

	writeStringU8(source) {
		const encoded = __BinaryContainer_encoder.encode(source)
		this.writeU8(encoded.length)
		const currentSize = this._reserveGrow(encoded.length)
		this.data.set(encoded, currentSize)
		return this
	}

	writeStringU16(source) {
		const encoded = __BinaryContainer_encoder.encode(source)
		this.writeU16(encoded.length)
		const currentSize = this._reserveGrow(encoded.length)
		this.data.set(encoded, currentSize)
		return this
	}

	writeStringU32(source) {
		const encoded = __BinaryContainer_encoder.encode(source)
		this.writeU32(encoded.length)
		const currentSize = this._reserveGrow(encoded.length)
		this.data.set(encoded, currentSize)
		return this
	}

	writeString(source) {
		return this.writeStringU32(source)
	}

	writeCString(source) {
		const encoded = __BinaryContainer_encoder.encode(source)
		const currentSize = this._reserveGrow(encoded.length + 1)
		this.data.set(encoded, currentSize)
		this.data[currentSize + encoded.length] = 0
		return this
	}

	writeVector2F32(value) {
		this.writeF32(value.x)
		this.writeF32(value.y)
		return this
	}

	writeVector2I16(value) {
		this.writeI16(value.x)
		this.writeI16(value.y)
		return this
	}

	writeVector2I32(value) {
		this.writeI32(value.x)
		this.writeI32(value.y)
		return this
	}

	writeVector3F32(value) {
		this.writeF32(value.x)
		this.writeF32(value.y)
		this.writeF32(value.z)
		return this
	}

	writeVector3I16(value) {
		this.writeI16(value.x)
		this.writeI16(value.y)
		this.writeI16(value.z)
		return this
	}

	writeVector3I32(value) {
		this.writeI32(value.x)
		this.writeI32(value.y)
		this.writeI32(value.z)
		return this
	}
	
	writeVector4F32(v) {
		this.writeF32(v.x)
		this.writeF32(v.y)
		this.writeF32(v.z)
		this.writeF32(v.w)
		return this
	}
	
	writeVector4I16(v) {
		this.writeI16(v.x)
		this.writeI16(v.y)
		this.writeI16(v.z)
		this.writeI16(v.w)
		return this
	}
	
	writeVector4I32(v) {
		this.writeI32(v.x)
		this.writeI32(v.y)
		this.writeI32(v.z)
		this.writeI32(v.w)
		return this
	}

	writeColor3F32(value) {
		this.writeF32(value.r)
		this.writeF32(value.g)
		this.writeF32(value.b)
		return this
	}

	writeColor3U8(value) {
		this.writeU8(Math.round(value.r * 255))
		this.writeU8(Math.round(value.g * 255))
		this.writeU8(Math.round(value.b * 255))
		return this
	}

	writeColor4F32(c) {
		this.writeF32(c.r)
		this.writeF32(c.g)
		this.writeF32(c.b)
		this.writeF32(c.a)
		return this
	}

	writeColor4U8(c) {
		this.writeU8(Math.round(c.r * 255))
		this.writeU8(Math.round(c.g * 255))
		this.writeU8(Math.round(c.b * 255))
		this.writeU8(Math.round(c.a * 255))
		return this
	}

	writeCFrame(value) {
		const pos = value.position
		const rot = value.rotation

		this.writeF32(pos.x)
		this.writeF32(pos.y)
		this.writeF32(pos.z)
		this.writeF32(rot.x)
		this.writeF32(rot.y)
		this.writeF32(rot.z)
		return this
	}

	writeVarInt(value) {
		let size = 0
		let temp = value

		while (temp >= 128) {
			size += 1
			temp = temp >> 7
		}
		size += 1

		const currentSize = this._reserveGrow(size)
		let bitPosition = 0

		temp = value
		while (temp >= 128) {
			const byte = (temp & 127) | 128
			this.data[currentSize + bitPosition] = byte
			bitPosition += 1
			temp = temp >> 7
		}

		this.data[currentSize + bitPosition] = temp
		return this
	}

	padToAlignment(alignment = 4, fill = 0) {
		const offset = this.size % alignment
		if (offset !== 0) {
			const bytesToAdd = alignment - offset
			for (let i = 0; i < bytesToAdd; i++)
				this.writeU8(fill)
		}
		return this
	}

	writeByteRepeated(source, count) {
		const encoded = __BinaryContainer_encoder.encode(source.repeat(count))
		const currentSize = this._reserveGrow(encoded.length)
		this.data.set(encoded, currentSize)
		return this
	}

	writeZeros(count) {
		const currentSize = this._reserveGrow(count)
		this.data.fill(0, currentSize, currentSize + count)
		return this
	}

	toString() {
		return __BinaryContainer_decoder_utf.decode(this.data.subarray(0, this.size))
	}
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = { BinaryContainer, BinaryReader, BinaryWriter, clearBinaryHexData }
}

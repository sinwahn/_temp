function clearBinaryHexData(hexString) {
	return hexString
		.replace(/\s+/g, '')
		.replace(/^0x/i, '')
		.replace(/[^0-9a-fA-F]/g, '')
}

class BinaryContainer {
	constructor() {
		this.data = null
		this.size = 0
		this.capacity = 0
	}

	create(capacity) {
		this.data = Buffer.alloc(capacity)
		this.capacity = capacity
	}

	reserve(newCapacity) {
		if (newCapacity > this.capacity) {
			const newData = Buffer.alloc(newCapacity)
			this.data.copy(newData, 0, 0, this.capacity)
			this.data = newData
			this.capacity = newCapacity
		}
	}

	reallocate(newCapacity) {
		const newData = Buffer.alloc(newCapacity)
		this.data.copy(newData, 0, 0, this.size)
		this.data = newData
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
		this.data = bc.data;
		this.size = bc.size;
		this.capacity = bc.capacity;
		
		const clean = clearBinaryHexData(hexStr)
		if (clean.length % 2 !== 0)
			throw new Error("Hex string has odd length")

		const buf = Buffer.alloc(clean.length / 2)
		for (let i = 0; i < clean.length; i += 2)
			buf[i / 2] = parseInt(clean.slice(i, i + 2), 16)
		return this;
	}

	toAscii() {
		return this.data.toString('ascii', 0, this.size)
	}

	assignAscii(str) {
		// (characters > 127 become ? or are lost)
		const bytes = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) {
			const code = str.charCodeAt(i);
			bytes[i] = code & 0xFF; // keep only lower 8 bits
		}

		this.data.set(bytes, 0);
		this.size = bytes.length;
		return this;
	}
}

class BinaryReader extends BinaryContainer {
	constructor(data = null) {
		super()
		this.data = data
		this.position = 0
		this.size = data ? data.length : 0
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
		this.position = 0
		this.size = data.length
	}

	readU8() {
		const value = this.data.readUInt8(this.position)
		this.position += 1
		return value
	}

	readU16() {
		const value = this.data.readUInt16LE(this.position)
		this.position += 2
		return value
	}

	readU32() {
		const value = this.data.readUInt32LE(this.position)
		this.position += 4
		return value
	}

	readI8() {
		const value = this.data.readInt8(this.position)
		this.position += 1
		return value
	}

	readI16() {
		const value = this.data.readInt16LE(this.position)
		this.position += 2
		return value
	}

	readI32() {
		const value = this.data.readInt32LE(this.position)
		this.position += 4
		return value
	}

	readF32() {
		const value = this.data.readFloatLE(this.position)
		this.position += 4
		return value
	}

	readF64() {
		const value = this.data.readDoubleLE(this.position)
		this.position += 8
		return value
	}

	readString(size) {
		const value = this.data.toString('utf8', this.position, this.position + size)
		this.position += size
		return value
	}

	readCString() {
		const start = this.position
		
		while (this.position < this.size && this.data[this.position] !== 0) {
			this.position += 1
		}
		
		if (this.position === this.size) {
			throw new Error('string is not null-terminated')
		}
		
		const value = this.data.toString('utf8', start, this.position)
		this.position += 1
		return value
	}

	readStringU8() {
		const size = this.readU8()
		return this.readString(size)
	}

	readStringU16() {
		const size = this.readU16()
		return this.readString(size)
	}

	readStringU32() {
		const size = this.readU32()
		return this.readString(size)
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
		this.data = null
	}

	_reserveGrow(size) {
		const currentSize = this.size
		const currentCapacity = this.capacity
		const newSize = currentSize + size

		if (newSize > currentCapacity) {
			const newData = Buffer.alloc(newSize)
			if (this.data) {
				this.data.copy(newData, 0, 0, currentSize)
			}
			this.data = newData
			this.size = newSize
			this.capacity = newSize
		} else {
			this.size = newSize
		}

		return currentSize
	}

	writeString(source) {
		const stringSize = Buffer.byteLength(source, 'utf8')
		const currentSize = this._reserveGrow(stringSize)
		this.data.write(source, currentSize, stringSize, 'utf8')
		return this
	}

	writeByteRepeated(source, count) {
		this.writeString(source.repeat(count))
		return this
	}

	writeCString(source) {
		const stringSize = Buffer.byteLength(source, 'utf8')
		const currentSize = this._reserveGrow(stringSize + 1)
		this.data.write(source, currentSize, stringSize, 'utf8')
		this.data.writeUInt8(0, currentSize + stringSize)
		return this
	}

	writeU8(value) {
		const currentSize = this._reserveGrow(1)
		this.data.writeUInt8(value, currentSize)
		return this
	}

	writeU16(value) {
		const currentSize = this._reserveGrow(2)
		this.data.writeUInt16LE(value, currentSize)
		return this
	}

	writeU32(value) {
		const currentSize = this._reserveGrow(4)
		this.data.writeUInt32LE(value, currentSize)
		return this
	}

	writeI8(value) {
		const currentSize = this._reserveGrow(1)
		this.data.writeInt8(value, currentSize)
		return this
	}

	writeI16(value) {
		const currentSize = this._reserveGrow(2)
		this.data.writeInt16LE(value, currentSize)
		return this
	}

	writeI32(value) {
		const currentSize = this._reserveGrow(4)
		this.data.writeInt32LE(value, currentSize)
		return this
	}

	writeF32(value) {
		const currentSize = this._reserveGrow(4)
		this.data.writeFloatLE(value, currentSize)
		return this
	}

	writeF64(value) {
		const currentSize = this._reserveGrow(8)
		this.data.writeDoubleLE(value, currentSize)
		return this
	}

	writeBool(value) {
		this.writeU8(value ? 1 : 0)
		return this
	}

	writeStringU8(source) {
		this.writeU8(Buffer.byteLength(source, 'utf8'))
		this.writeString(source)
		return this
	}

	writeStringU16(source) {
		this.writeU16(Buffer.byteLength(source, 'utf8'))
		this.writeString(source)
		return this
	}

	writeStringU32(source) {
		this.writeU32(Buffer.byteLength(source, 'utf8'))
		this.writeString(source)
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
		this.writeU8(value.r * 255)
		this.writeU8(value.g * 255)
		this.writeU8(value.b * 255)
		return this
	}

	writeColor4F32(c) {
		this.writeF32(c.r)
		this.writeF32(c.g)
		this.writeF32(c.b)
		this.writeF32(c.a)
		return this;
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
			this.data.writeUInt8(byte, currentSize + bitPosition)
			bitPosition += 1
			temp = temp >> 7
		}

		this.data.writeUInt8(temp, currentSize + bitPosition)
		return this
	}

	padToAlignment(alignment = 4, fill = 0) {
		const offset = this.size % alignment
		if (offset !== 0) {
			const bytesToAdd = alignment - offset
			for (let i = 0; i < bytesToAdd; i++)
				this.writeU8(fill);
		}
		return this
	}

	writeZeros(count) {
		for (let i = 0; i < count; i++)
			this.writeU8(0)
		return this
	}

	toString() {
		return this.data.toString('utf8', 0, this.size)
	}
}

module.exports = { BinaryContainer, BinaryReader, BinaryWriter }

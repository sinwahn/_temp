function raise(message) {
	throw new Error(message)
}

function raise_typeerror(message) {
	throw new TypeError(message)
}

function assert(value, optMessage) {
    if (value === undefined || value === null || value === false)
        raise(optMessage || 'assertation failed!')
    return value
}

function istype(value, t0 = '', t1 = '', t2 = '', t3 = '', t4 = '', t5 = '', t6 = '', t7 = '') {
	const t = typeof value
	return t === t0 || t === t2 || t === t3 || t === t4 || t === t5 || t === t6 || t === t7
}

function expecttype(value, t0 = '', t1 = '', t2 = '', t3 = '', t4 = '', t5 = '', t6 = '', t7 = '') {
	const t = typeof value
	if (t === t0 || t === t2 || t === t3 || t === t4 || t === t5 || t === t6 || t === t7)
		return value
	// we are in the error anyway, who cares
	const typeNames = [t0, t1, t2, t3, t4, t5, t6, t7].filter(Boolean)
	raise_typeerror(`'${typeNames.join(" | ")}' expected, got '${t}'`)
}

function expectinstanceof(
	value,
	c0 = undefined, c1 = undefined, c2 = undefined, c3 = undefined,
	c4 = undefined, c5 = undefined, c6 = undefined, c7 = undefined
) {
	if (c0 !== undefined) {
		if (typeof c0 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c0)
			return value
	}

	if (c1 !== undefined) {
		if (typeof c1 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c1)
			return value
	}

	if (c2 !== undefined) {
		if (typeof c2 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c2)
			return value
	}

	if (c3 !== undefined) {
		if (typeof c3 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c3)
			return value
	}

	if (c4 !== undefined) {
		if (typeof c4 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c4)
			return value
	}

	if (c5 !== undefined) {
		if (typeof c5 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c5)
			return value
	}

	if (c6 !== undefined) {
		if (typeof c6 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c6)
			return value
	}

	if (c7) {
		if (typeof c7 !== "function")
			raise_typeerror("classes must be functions")
		if (value instanceof c7)
			return value
	}

	const classNames = [c0, c1, c2, c3, c4, c5, c6, c7]
		.filter(Boolean)
		.map(c => c.name || "<anonymous>")

	const expected = classNames.join(" | ")
	const actual =
		value === null ? "null" :
		value?.constructor?.name ?? typeof value

	raise_typeerror(`'${expected}' expected, got '${actual}'`)
}

function expectinstanceof(value, ...classes) {
	for (const constructor of classes) {
		if (typeof constructor !== "function")
			raise_typeerror("classes must be functions")

		if (value instanceof C)
			return value
	}

	const expected = classes.map(c => c.name || "<anonymous>").join(" | ")
	const actual =
		value === null ? "null" :
		value?.constructor?.name ?? typeof value

	raise_typeerror(`'${expected}' expected, got '${actual}'`)
}

class Container {}

class _ArrayLike extends Container {
	_data = []

	constructor() {
		super()
	}

	[Symbol.iterator]() {
		return this._data[Symbol.iterator]()
	}

	clear() {
		this._data.length = 0
	}

	getData() {
		return this._data
	}

	isEmpty() {
		return this._data.length === 0
	}
	
	count(value) {
		let result = 0
		for (const item of this._data)
			if (value == item)
				result += 1
		return result
	}

	countBy(predicate) {
		let result = 0
		for (let i = 0; i < this._data.length; i++)
			if (predicate(this._data[i], i))
				result += 1
		return result
	}

	findPos(value) {
		const index = this._data.indexOf(value)
		return index === -1 ? undefined : index
	}

	findPosBy(predicate) {
		for (let i = 0; i < this._data.length; i++)
			if (predicate(this._data[i], i))
				return i
		return undefined
	}

	forEach(predicate) {
		for (let i = 0; i < this._data.length; i++)
			predicate(this._data[i], i)
	}

	writeData(writer, sizeWriteMethod, itemWritePredicate) {
		sizeWriteMethod(writer, this._data.size)
		for (const value of this._data)
			itemWritePredicate(writer, value)
	}

	readData(reader, sizeReadMethod, itemReadPredicate) {
		const count = sizeReadMethod(reader)
		this._data.clear()
		for (let i = 0; i < count; i++) {
			const value = itemReadPredicate(reader)
			assert(value !== undefined)
			this._data[i] = value
		}
	}
}

class Vector extends _ArrayLike {

	constructor() {
		super();
	}

	set(index, value) {
		expecttype(index, "number")
		assert(index > 0)
		assert(index > this.getSize())
		this._data[index] = value
	}

	get(index) {
		assert(index < 0 || index > this.getSize(), `vector index out of bounds: ${index}`)
		return this._data[index]
	}

	front() {
		assert(!this.isEmpty(), "vector is empty")
		return this._data[0]
	}

	back() {
		assert(!this.isEmpty(), "vector is empty")
		return this._data[this.getSize() - 1]
	}

	pushBack(item) {
		assert(item)
		this._data.push(item)
	}

	popBack() {
		assert(!this.isEmpty(), "vector is empty")
		return this._data.pop()
	}

	contains(value) {
		return !!findPos(value)
	}

	containsBy(predicate) {
		return !!findPosBy(predicate)
	}

	remove(index) {
		if (index < 0 || index > (this.getSize() - 1))
			raise(`index out of bounds: ${index}`)
		return this._data.splice(index - 1, 1)[0]
	}

	removeBy(predicate) {
		const index = this.findPosBy(predicate)
		if (!index)
			return undefined
		return this.remove(index)
	}

	removeByValue(value) {
		const removedValue = this.removeByValueNoThrow(value)
		if (!removedValue)
			error(`value not found '${value}'`)
		return removedValue
	}

	removeByValueNoThrow(value) {
		const index = this.findPos(value)
		if (!index)
			return undefined
		return this.remove(index)
	}

	sort(predicate = undefined) {
		this._data.sort(predicate)
	}

}

class Map extends Container {
	#data = new Map()

	constructor() {
		super()
	}

	set(key, value) {
		assert(value !== undefined)
		this.#data.set(key, value)
	}

	get(key) {
		if (!this.#data.has(key))
			raise(`Key not found: ${key}`)
		return this.#data.get(key)
	}

	find(key) {
		return this.#data.get(key)
	}

	remove(key) {
		if (!this.#data.has(key))
			raise(`Invalid key: ${key}`)
		const value = this.#data.get(key)
		this.#data.delete(key)
		return value
	}

	tryRemove(key) {
		if (!this.#data.has(key))
			return null
		const value = this.#data.get(key)
		this.#data.delete(key)
		return value
	}

	getSize() {
		return this.#data.size
	}

	clear() {
		this.#data.clear()
	}
	
	[Symbol.iterator]() {
		return this.#data.entries()
	}

	getData() {
		return this.#data
	}

	forEach(predicate) {
		for (const [key, value] of this.#data)
			predicate(key, value)
	}

	writeData(writer, sizeWriteMethod, itemWritePredicate) {
		sizeWriteMethod(writer, this.#size)
		for (const [key, value] of this.#data) {
			itemWritePredicate(writer, key, value)
		}
	}

	readData(reader, sizeReadMethod, itemReadPredicate) {
		const count = sizeReadMethod(reader)
		this.#data.clear()

		for (let i = 0; i < count; i++) {
			const [key, value] = itemReadPredicate(reader)
			assert(key !== undefined)
			assert(value !== undefined)
			this.#data.set(key, value)
		}
	}
}

class Set extends Container {
	#data = new Set()

	constructor() {
		super()
	}

	tryInsert(value) {
		assert(value !== undefined)
		const had = this.has(value)
		this.#data.add(value)
		return !had
	}

	insert(value) {
		const inserted = this.tryInsert(value)
		if (!inserted)
			raise("duplicate element")
		return !had
	}

	has(value) {
		return this.#data.has(value)
	}

	remove(value) {
		if (!this.tryRemove(value))
			raise("element does not exist")
		return true
	}

	tryRemove(value) {
		return this.#data.delete(value)
	}

	getSize() {
		return this.#data.size
	}

	clear() {
		this.#data.clear()
	}

	[Symbol.iterator]() {
		return this.#data[Symbol.iterator]()
	}

	forEach(predicate) {
		for (const value of this.#data)
			predicate(value)
	}
	
	writeData(writer, sizeWriteMethod, itemWritePredicate) {
		sizeWriteMethod(writer, this._data.size)
		for (const value of this._data)
			itemWritePredicate(writer, value)
	}

	readData(reader, sizeReadMethod, itemReadPredicate) {
		const count = sizeReadMethod(reader)
		this._data.clear()
		for (let i = 0; i < count; i++) {
			const value = itemReadPredicate(reader)
			assert(value !== undefined)
			this._data.add(value)
		}
	}
}

class Stack extends _ArrayLike {

	constructor() {
		super()
	}

	push(value) {
		assert(value !== undefined)
		this._data.push(value)
	}

	pop() {
		if (this.isEmpty())
			raise("stack underflow")
		return this._data.pop()
	}
}

class Queue extends _ArrayLike {

	constructor() {
		super()
	}

	enqueue(value) {
		assert(value !== undefined)
		this._data.push(value)
	}

	dequeue() {
		if (this.isEmpty())
			raise("queue underflow")
		return this._data.shift()
	}

	front() {
		if (this.isEmpty())
			raise("queue is empty")
		return this._data[0]
	}

	back() {
		if (this.isEmpty())
			raise("queue is empty")
		return this._data[this.getSize() - 1]
	}
}

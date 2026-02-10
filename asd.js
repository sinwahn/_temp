function raise(message) {
	throw new Error(message)
}

function raise_typeerror(message) {
	throw new TypeError(message)
}

function assert(value, message) {
    if (value === undefined || value === null || value === false)
        throw message;
    return value;
}

function istype(value, ...typeNames) {
    return typeNames.includes(typeof value);
}

function expecttype(value, ...typeNames) {
	if (typeNames.includes(typeof value))
		return value
	raise_typeerror(`'${typeNames.join(" | ")}' expected, got '${typeof value}'`)
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

class Map extends Collection {
	#data = new Map();   // using JS Map for true key-value (any key type)
	#size = 0;

	constructor() {
		super();
		this.#size = 0;
	}

	// Prevent direct property assignment (similar to __newindex protection)
	set(key, value) {
		assert(value !== undefined)
		const hadKey = this.#data.has(key)
		this.#data.set(key, value)
		if (!hadKey)
			this.#size++
	}

	get(key) {
		if (!this.#data.has(key))
			raise(`Key not found: ${key}`);
		return this.#data.get(key);
	}

	find(key) {
		return this.#data.get(key);
	}

	remove(key) {
		if (!this.#data.has(key))
			raise(`Invalid key: ${key}`);
		const value = this.#data.get(key);
		this.#data.delete(key);
		this.#size--;
		return value;
	}

	tryRemove(key) {
		if (!this.#data.has(key))
			return null;
		const value = this.#data.get(key);
		this.#data.delete(key);
		this.#size--;
		return value;
	}

	getSize() {
		return this.#size;
	}

	clear() {
		this.#data.clear();
		this.#size = 0;
	}
	
	[Symbol.iterator]() {
		return this.#data.entries();
	}

	getData() {
		return this.#data;
	}

	writeData(writer, sizeWriteMethod, itemWritePredicate) {
		sizeWriteMethod(writer, this.#size);
		for (const [key, value] of this.#data) {
			itemWritePredicate(writer, key, value);
		}
	}

	readData(reader, sizeReadMethod, itemReadPredicate) {
		const count = sizeReadMethod(reader);
		this.#data.clear();
		this.#size = count;

		for (let i = 0; i < count; i++) {
			const [key, value] = itemReadPredicate(reader);
			assert(key !== undefined)
			assert(value !== undefined)
			this.#data.set(key, value);
		}
	}
}

class Vector extends Collection {
	#data = [];

	constructor() {
		super();
	}

	set(index, value) {
		expecttype(index, "number")
		assert(index > 0)
		assert(index > this.getSize())
		this.#data[index] = value;
	}

	get(index) {
		if (index < 0 || index > this.getSize())
			raise(`index out of bounds: ${index}`);
		return this.#data[index];
	}

	getSize() {
		return this.#data.length;
	}

	front() {
		return this.#data[0];
	}

	back() {
		return this.#data[this.getSize() - 1];
	}

	pushBack(item) {
		assert(item)
		this.#data.push(item);
	}

	popBack() {
		assert(this.getSize() > 0);
		return this.#data.pop();
	}

	forEach(predicate) {
		for (let i = 0; i < this.#data.length; i++)
			predicate(this.#data[i], i)
	}

	contains(value) {
		return !!findPos(value)
	}

	containsBy(predicate) {
		return !!findPosBy(predicate)
	}

	count(value) {
		let result = 0
		for (const item of this.#data)
			if (value == item)
				result += 1
		return result
	}

	countBy(predicate) {
		let result = 0
		for (let i = 0; i < this.#data.length; i++)
			if (predicate(this.#data[i], i))
				result += 1
		return result
	}

	remove(index) {
		if (index < 0 || index > (this.getSize() - 1))
			raise(`index out of bounds: ${index}`);
		return this.#data.splice(index - 1, 1)[0];
	}

	removeBy(predicate) {
		const index = this.findPosBy(predicate);
		if (!index)
			return undefined;
		return this.remove(index);
	}

	removeByValue(value) {
		const removedValue = this.removeByValueNoThrow(value);
		if (!removedValue)
			error(`value not found '${value}'`)
		return removedValue;
	}

	removeByValueNoThrow(value) {
		const index = this.findPos(value);
		if (!index)
			return undefined;
		return this.remove(index);
	}

	findPos(value) {
		const index = this.#data.indexOf(value);
		return index === -1 ? undefined : index;
	}

	findPosBy(predicate) {
		for (let i = 0; i < this.#data.length; i++)
			if (predicate(this.#data[i], i))
				return i;
		return undefined;
	}

	sort(predicate = undefined) {
		this.#data.sort(predicate);
	}

	clear() {
		this.#data.length = 0;
	}

	getData() {
		return this.#data;
	}

	[Symbol.iterator]() {
		return this.#data[Symbol.iterator]();
	}

	writeData(writer, sizeWriteMethod, itemWritePredicate) {
		sizeWriteMethod(writer, this.getSize());
		for (const value of this.#data)
			itemWritePredicate(writer, value);
	}

	readData(reader, sizeReadMethod, itemReadPredicate) {
		const count = sizeReadMethod(reader);
		for (let i = 0; i < count; i++) {
			const value = itemReadPredicate(reader);
			assert(value !== undefined)
			this.#data[i] = value;
		}
	}
}

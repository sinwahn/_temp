/**
 * Represents a path in a virtual or real filesystem
 */
class Path {
	constructor(segments) {
		this.segments = Array.isArray(segments) ? segments : [segments];
	}

	static from(...parts) {
		const segments = parts.flatMap(part => {
			if (part instanceof Path) return part.segments;
			if (typeof part === 'string') return part.split('/').filter(s => s.length > 0);
			throw new Error(`Invalid path part: ${part}`);
		});
		return new Path(segments);
	}

	join(...parts) {
		return Path.from(this, ...parts);
	}

	withExtension(ext) {
		const segments = [...this.segments];
		const last = segments[segments.length - 1];
		segments[segments.length - 1] = `${last}.${ext}`;
		return new Path(segments);
	}

	get parent() {
		if (this.segments.length <= 1) return null;
		return new Path(this.segments.slice(0, -1));
	}

	get basename() {
		return this.segments[this.segments.length - 1] || '';
	}

	toString() {
		return this.segments.join('/');
	}

	/**
	 * Calculate relative path from this path to target path
	 */
	relativeTo(targetPath) {
		const from = this.parent ? this.parent.segments : [];
		const to = targetPath.segments;

		let commonLength = 0;
		const minLength = Math.min(from.length, to.length);
		
		for (let i = 0; i < minLength; i++) {
			if (from[i] === to[i]) {
				commonLength++;
			} else {
				break;
			}
		}

		const upSteps = from.length - commonLength;
		const downSteps = to.slice(commonLength);

		const relativeParts = [
			...Array(upSteps).fill('..'),
			...downSteps
		];

		return relativeParts.length > 0 ? relativeParts.join('/') : '.';
	}

	equals(other) {
		if (!(other instanceof Path)) return false;
		if (this.segments.length !== other.segments.length) return false;
		return this.segments.every((seg, i) => seg === other.segments[i]);
	}
}

/**
 * Represents a document in the filesystem with metadata
 */
class Document {
	constructor(path, entity) {
		this.path = path;
		this.entity = entity;
	}

	/**
	 * Create a markdown link from this document to another
	 */
	linkTo(targetDocument, customLabel = null) {
		const label = customLabel || targetDocument.entity?.name || targetDocument.path.basename;
		const relativePath = this.path.relativeTo(targetDocument.path);
		return `[${label}](${relativePath})`;
	}

	get id() {
		return this.entity?.id;
	}

	get name() {
		return this.entity?.name || this.path.basename;
	}
}

/**
 * Virtual filesystem for managing documents and their relationships
 */
class VirtualFilesystem {
	constructor(rootPath = '') {
		this.root = rootPath ? Path.from(rootPath) : new Path([]);
		this.documents = new Map(); // id -> Document
	}

	/**
	 * Register a document at a specific path
	 */
	registerDocument(folderName, entity, extension) {
		const safeName = this._sanitizeFilename(entity.name);
		const path = this.root
			.join(folderName)
			.join(safeName)
			.withExtension(extension);

		const document = new Document(path, entity);
		this.documents.set(entity.id, document);
		return document;
	}

	/**
	 * Get a document by entity ID
	 */
	getDocument(id) {
		return this.documents.get(id);
	}

	/**
	 * Check if a document exists
	 */
	hasDocument(id) {
		return this.documents.has(id);
	}

	/**
	 * Get all documents in a specific folder
	 */
	getDocumentsInFolder(folderName) {
		const folderPath = this.root.join(folderName);
		return Array.from(this.documents.values()).filter(doc => 
			doc.path.parent?.equals(folderPath)
		);
	}

	/**
	 * Sanitize a filename to be filesystem-safe
	 */
	_sanitizeFilename(name) {
		return name.replace(/[^a-z0-9_\-\.]/gi, '_');
	}

	/**
	 * Get all documents
	 */
	getAllDocuments() {
		return Array.from(this.documents.values());
	}
}

/**
 * Context for rendering a document with linking capabilities
 */
class DocumentContext {
	constructor(currentDocument, filesystem) {
		this.currentDocument = currentDocument;
		this.filesystem = filesystem;
	}

	/**
	 * Create a link to another entity
	 */
	linkTo(entityId, customLabel = null) {
		const targetDocument = this.filesystem.getDocument(entityId);
		
		if (!targetDocument) {
			console.warn(`No document found for entity: ${entityId}`);
			return customLabel || entityId;
		}

		return this.currentDocument.linkTo(targetDocument, customLabel);
	}

	/**
	 * Create links to multiple entities
	 */
	linkToMany(entityIds, options = {}) {
		const { prefix = '- ', separator = '\n' } = options;
		
		return entityIds
			.map(id => `${prefix}${this.linkTo(id)}`)
			.join(separator);
	}

	get path() {
		return this.currentDocument.path;
	}

	get entity() {
		return this.currentDocument.entity;
	}
}

module.exports = {
	Path,
	Document,
	VirtualFilesystem,
	DocumentContext
};

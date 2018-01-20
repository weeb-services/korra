class GenerationError extends Error {
    constructor(message, url, status) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.url = url;
        this.status = status;
    }
}

module.exports = GenerationError;

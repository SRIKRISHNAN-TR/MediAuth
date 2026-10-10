"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const errorHandler = (err, req, res, next) => {
    console.error('💥 Error:', err.message);
    if (err.name === 'ValidationError') {
        (0, apiResponse_1.sendError)(res, 'Validation failed', 400, err.message);
        return;
    }
    if (err.name === 'CastError') {
        (0, apiResponse_1.sendError)(res, 'Resource not found', 404);
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        (0, apiResponse_1.sendError)(res, 'Invalid token', 401);
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, apiResponse_1.sendError)(res, 'Token expired', 401);
        return;
    }
    (0, apiResponse_1.sendError)(res, 'Internal server error', 500, err.message);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
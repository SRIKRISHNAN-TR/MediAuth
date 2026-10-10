"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await (0, db_1.default)();
    app_1.default.listen(PORT, () => {
        console.log(`🚀 MediAuth AI Backend running on http://localhost:${PORT}`);
        console.log(`🤖 AI Mode: ${process.env.USE_MOCK_AI === 'true' ? 'Mock (set USE_MOCK_AI=false for Gemini)' : 'Gemini API'}`);
    });
};
startServer();
//# sourceMappingURL=server.js.map
import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 MediAuth AI Backend running on http://localhost:${PORT}`);
    console.log(`🤖 AI Mode: ${process.env.USE_MOCK_AI === 'true' ? 'Mock (set USE_MOCK_AI=false for Gemini)' : 'Gemini API'}`);
  });
};

startServer();

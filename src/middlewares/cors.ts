import cors from "cors";

export const corsMiddleware = cors({
    origin: ["http://localhost:5173", "https://circle-app-chba.vercel.app"],
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
import cors from "cors";

export const corsMiddleware = cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
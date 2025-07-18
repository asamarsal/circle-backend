import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    limit: 5,
    message: {
      message: 'Terlalu banyak permintaan, silahkan coba lagi setelah 15 menit'
    },
  });

export default limiter;
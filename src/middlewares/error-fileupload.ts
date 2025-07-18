import multer from "multer";

export const handleUploadError = (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: "File kebesaran. Maksimal 100KB" 
        });
      }
      return res.status(400).json({ message: err.message });
    }
  
    if (err) {
      try {
        const parsedError = JSON.parse(err.message);
        return res.status(parsedError.status).json({ 
          message: parsedError.message 
        });
      } catch {
        return res.status(400).json({ 
          message: "Error saat upload file" 
        });
      }
    }
    next();
};
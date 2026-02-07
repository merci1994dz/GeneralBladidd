import { Request, Response, NextFunction } from "express";
import zlib from "zlib";

export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Skip compression for small responses or non-JSON
  const originalJson = res.json;
  res.json = function(body: any) {
    const jsonString = JSON.stringify(body);
    
    // Only compress if response is larger than 1KB
    if (jsonString.length < 1024) {
      return originalJson.call(this, body);
    }
    
    // Check if client supports gzip
    if (acceptEncoding.includes('gzip')) {
      const compressed = zlib.gzipSync(jsonString);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Vary', 'Accept-Encoding');
      return res.send(compressed);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
}

import { Request, Response } from 'express';
import { BuildService } from '../services/buildService';
import { extname } from 'path';
import { lookup } from 'mime-types';

const buildService = new BuildService();

export class PrototypeHostingController {
  async servePrototype(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Extract the file path from the URL after the prototype ID
      const fullPath = req.path;
      const prototypePrefix = `/prototype/${id}`;
      const requestPath = fullPath.startsWith(prototypePrefix) 
        ? fullPath.substring(prototypePrefix.length + 1) // +1 for the trailing slash
        : '';

      console.log(`Serving prototype ${id}, path: ${requestPath}`);

      const fileBuffer = await buildService.servePrototype(id, requestPath);

      if (!fileBuffer) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Determine content type
      const ext = extname(requestPath || 'index.html');
      const contentType = lookup(ext) || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      
      // Add CORS headers for web assets
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      res.send(fileBuffer);
    } catch (error: any) {
      console.error('Error serving prototype:', error);
      res.status(500).json({ error: 'Failed to serve prototype' });
    }
  }
}
import { Response } from 'express';
import { PrototypeService } from '../services/prototypeService';
import { AuthRequest } from '../types/auth';
import { CreatePrototypeRequest, UpdatePrototypeRequest } from '../types/prototype';
import { isValidGitHubUrl } from '../utils/github';

const prototypeService = new PrototypeService();

export class PrototypeController {
  async createPrototype(req: AuthRequest, res: Response) {
    try {
      const { name, description, gitHubRepoUrl } = req.body as CreatePrototypeRequest;
      
      if (!name || !gitHubRepoUrl) {
        return res.status(400).json({
          error: 'Name and GitHub repository URL are required',
        });
      }

      if (!isValidGitHubUrl(gitHubRepoUrl)) {
        return res.status(400).json({
          error: 'Invalid GitHub repository URL format',
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const prototype = await prototypeService.createPrototype(
        { name, description, gitHubRepoUrl },
        req.user.email
      );

      res.status(201).json(prototype);
    } catch (error: any) {
      console.error('Error creating prototype:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getPrototypes(req: AuthRequest, res: Response) {
    try {
      const { my } = req.query;
      const createdBy = my === 'true' && req.user ? req.user.email : undefined;
      
      const prototypes = await prototypeService.getPrototypes(createdBy);
      res.json(prototypes);
    } catch (error: any) {
      console.error('Error fetching prototypes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getPrototype(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.email;
      
      const prototype = await prototypeService.getPrototypeById(id, userId);
      res.json(prototype);
    } catch (error: any) {
      console.error('Error fetching prototype:', error);
      const status = error.message === 'Prototype not found' ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async updatePrototype(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdatePrototypeRequest;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const prototype = await prototypeService.updatePrototype(id, updateData, req.user.email);
      res.json(prototype);
    } catch (error: any) {
      console.error('Error updating prototype:', error);
      const status = error.message.includes('not found') || error.message.includes('unauthorized') ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async deletePrototype(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await prototypeService.deletePrototype(id, req.user.email);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting prototype:', error);
      const status = error.message.includes('not found') || error.message.includes('unauthorized') ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async rebuildPrototype(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get the prototype to verify ownership
      const prototype = await prototypeService.getPrototypeById(id, req.user.email);
      
      // Update status to building
      await prototypeService.updateBuildStatus(id, 'building');

      // TODO: Trigger actual build process here
      // For now, just return success
      res.json({ 
        message: 'Rebuild triggered successfully',
        prototypeId: id,
        status: 'building'
      });
    } catch (error: any) {
      console.error('Error rebuilding prototype:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }
}
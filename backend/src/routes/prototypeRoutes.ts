import { Router } from 'express';
import { PrototypeController } from '../controllers/prototypeController';
import { mockAuth, optionalAuth } from '../middleware/auth';

const router = Router();
const prototypeController = new PrototypeController();

// Public routes (with optional auth for filtering)
router.get('/', optionalAuth, prototypeController.getPrototypes);
router.get('/:id', optionalAuth, prototypeController.getPrototype);

// Protected routes (require authentication)
router.post('/', mockAuth, prototypeController.createPrototype);
router.put('/:id', mockAuth, prototypeController.updatePrototype);
router.delete('/:id', mockAuth, prototypeController.deletePrototype);
router.post('/:id/rebuild', mockAuth, prototypeController.rebuildPrototype);

export default router;
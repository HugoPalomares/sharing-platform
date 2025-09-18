import { Router } from 'express';
import { PrototypeHostingController } from '../controllers/prototypeHostingController';

const router = Router();
const prototypeHostingController = new PrototypeHostingController();

// Serve prototype files - catch all paths after /:id
router.get('/:id', prototypeHostingController.servePrototype);
router.get('/:id/**', prototypeHostingController.servePrototype);

export default router;
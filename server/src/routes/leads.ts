import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/leadController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/errorHandler';
import { LeadSource, LeadStatus } from '../types';

const router = Router();

// All lead routes require auth
router.use(authenticate);

const leadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('source')
    .isIn(Object.values(LeadSource))
    .withMessage(`Source must be one of: ${Object.values(LeadSource).join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(LeadStatus))
    .withMessage(`Status must be one of: ${Object.values(LeadStatus).join(', ')}`),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
];

// CSV export — before /:id to avoid route conflict
router.get('/export/csv', exportLeadsCSV);

router.get('/', getLeads);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid lead ID')], validate, getLeadById);
router.post('/', leadValidation, validate, createLead);
router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID'), ...leadValidation.map((v) => v.optional())],
  validate,
  updateLead
);
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validate,
  deleteLead
);

export default router;

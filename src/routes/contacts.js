import express from 'express';
import { 
  getContacts, 
  getContact, 
  createContact, 
  updateContact, 
  deleteContact 
} from '../controllers/contactsController.js';

const router = express.Router();

// GET /api/contacts - Get all contacts
router.get('/', getContacts);

// GET /api/contacts/:id - Get a specific contact
router.get('/:id', getContact);

// POST /api/contacts - Create a new contact
router.post('/', createContact);

// PUT /api/contacts/:id - Update a contact
router.put('/:id', updateContact);

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', deleteContact);

export default router; 
import sql from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all contacts (simplified for now)
export const getContacts = async (req, res) => {
  try {
    // For now, return empty array until we implement proper user management
    res.json([]);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      message: 'An error occurred while retrieving contacts'
    });
  }
};

// Get a single contact by ID (simplified for now)
export const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    res.status(404).json({ 
      error: 'Contact not found',
      message: 'The requested contact could not be found'
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact',
      message: 'An error occurred while retrieving the contact'
    });
  }
};

// Create a new contact (simplified for now)
export const createContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      status = 'active',
      tags = [],
      businessName,
      notes
    } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name and email are required'
      });
    }

    // For now, return the data as if it was created
    const newContact = {
      id: uuidv4(),
      name,
      email,
      phone,
      website,
      status,
      tags,
      businessName,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      error: 'Failed to create contact',
      message: 'An error occurred while creating the contact'
    });
  }
};

// Update a contact (simplified for now)
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // For now, return the updated data
    const updatedContact = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ 
      error: 'Failed to update contact',
      message: 'An error occurred while updating the contact'
    });
  }
};

// Delete a contact (simplified for now)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    res.json({ 
      message: 'Contact deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      error: 'Failed to delete contact',
      message: 'An error occurred while deleting the contact'
    });
  }
};

// Bulk update contacts
export const bulkUpdateContacts = async (req, res) => {
  try {
    const { userId } = req;
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Please provide an array of contact IDs'
      });
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updates[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update',
        message: 'Please provide at least one field to update'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(ids, userId);

    const query = `
      UPDATE contacts 
      SET ${updateFields.join(', ')}
      WHERE id = ANY($${paramIndex}) AND user_id = $${paramIndex + 1}
      RETURNING id
    `;

    const result = await sql.unsafe(query, updateValues);

    res.json({ 
      message: `${result.length} contacts updated successfully`,
      updatedCount: result.length
    });
  } catch (error) {
    console.error('Error bulk updating contacts:', error);
    res.status(500).json({ 
      error: 'Failed to bulk update contacts',
      message: 'An error occurred while updating contacts'
    });
  }
};

// Bulk delete contacts
export const bulkDeleteContacts = async (req, res) => {
  try {
    const { userId } = req;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Please provide an array of contact IDs'
      });
    }

    const result = await sql`
      DELETE FROM contacts 
      WHERE id = ANY(${ids}) AND user_id = ${userId}
      RETURNING id
    `;

    res.json({ 
      message: `${result.length} contacts deleted successfully`,
      deletedCount: result.length
    });
  } catch (error) {
    console.error('Error bulk deleting contacts:', error);
    res.status(500).json({ 
      error: 'Failed to bulk delete contacts',
      message: 'An error occurred while deleting contacts'
    });
  }
}; 
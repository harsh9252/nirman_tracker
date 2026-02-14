const Lead = require('../models/Lead');
const Client = require('../models/Client');

class LeadController {
  // Get all leads
  static getAllLeads(req, res) {
    Lead.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  }

  // Get lead by ID
  static getLeadById(req, res) {
    const { id } = req.params;

    Lead.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(results[0]);
    });
  }

  // Create new lead
  static createLead(req, res) {
    const leadData = req.body;

    Lead.create(leadData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: 'Lead saved successfully',
        id: result.insertId
      });
    });
  }

  // Update lead with conversion logic
  static updateLead(req, res) {
    const { id } = req.params;
    const leadData = req.body;

    // First, get the current lead to check its status
    Lead.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      const currentLead = results[0];

      // Validation: Prevent editing converted or lost leads
      if (currentLead.is_converted) {
        return res.status(400).json({
          error: 'Cannot edit a converted lead. This lead has already been converted to a client.'
        });
      }

      if (currentLead.is_lost) {
        return res.status(400).json({
          error: 'Cannot edit a lost lead. This lead has been marked as lost.'
        });
      }

      // Check if status is changing to "Close - Lost"
      const isMarkingAsLost = leadData.lead_status === 'Close - Lost' &&
        currentLead.lead_status !== 'Close - Lost';

      if (isMarkingAsLost) {
        // Mark lead as lost
        const lostReason = leadData.lost_reason || 'No reason provided';

        Lead.markAsLost(id, lostReason, (lostErr, lostResult) => {
          if (lostErr) {
            return res.status(500).json({ error: 'Failed to mark lead as lost: ' + lostErr.message });
          }

          if (lostResult.affectedRows === 0) {
            return res.status(400).json({ error: 'Lead has already been converted or lost' });
          }

          // Also update the lead data
          Lead.update(id, leadData, (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ error: updateErr.message });
            }

            res.json({
              message: 'Lead marked as lost',
              lost: true
            });
          });
        });
      } else {
        // Normal update
        Lead.update(id, leadData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lead not found' });
          }

          res.json({ message: 'Lead updated successfully' });
        });
      }
    });
  }

  // Delete lead with validation
  static deleteLead(req, res) {
    const { id } = req.params;

    // Check if lead can be deleted
    Lead.canDelete(id, (err, canDelete, lead) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!canDelete) {
        if (lead.is_converted) {
          return res.status(400).json({
            error: 'Cannot delete a converted lead. This lead has been converted to a client.'
          });
        }
        if (lead.is_lost) {
          return res.status(400).json({
            error: 'Cannot delete a lost lead. This lead is kept for historical tracking.'
          });
        }
      }

      // Proceed with deletion
      Lead.delete(id, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Lead not found' });
        }


        res.json({ message: 'Lead deleted successfully' });
      });
    });
  }

  // Convert lead to client
  static convertToClient(req, res) {
    const { id } = req.params;

    // First, get the lead data
    Lead.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      const lead = results[0];

      // Check if lead is already converted
      if (lead.is_converted) {
        return res.status(400).json({
          error: 'Lead has already been converted to a client',
          clientId: lead.client_id
        });
      }

      // Check if lead is lost
      if (lead.is_lost) {
        return res.status(400).json({
          error: 'Cannot convert a lost lead to a client'
        });
      }

      // Create client from lead data
      Client.createFromLead(lead, id, (clientErr, clientResult) => {
        if (clientErr) {
          return res.status(500).json({
            error: 'Failed to create client: ' + clientErr.message
          });
        }

        const clientId = clientResult.insertId;

        // Mark lead as converted
        Lead.markAsConverted(id, clientId, (convertErr, convertResult) => {
          if (convertErr) {
            // If marking as converted fails, we should ideally rollback the client creation
            // For now, just return an error
            return res.status(500).json({
              error: 'Client created but failed to mark lead as converted: ' + convertErr.message,
              clientId: clientId
            });
          }

          if (convertResult.affectedRows === 0) {
            return res.status(400).json({
              error: 'Lead has already been converted or lost',
              clientId: clientId
            });
          }

          res.json({
            message: 'Lead successfully converted to client',
            clientId: clientId,
            leadId: id
          });
        });
      });
    });
  }
}

module.exports = LeadController;

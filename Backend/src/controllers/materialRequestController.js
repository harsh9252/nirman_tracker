const MaterialRequest = require('../models/MaterialRequest');
const MaterialInventory = require('../models/MaterialInventory');
const Notification = require('../models/Notification');
const pushNotificationService = require('../services/pushNotificationService');
const NotificationController = require('./notificationController');

const materialRequestController = {
    createRequest: (req, res) => {
        const requestData = {
            ...req.body,
            requested_by: req.user.id
        };

        MaterialRequest.create(requestData, (err, result) => {
            if (err) {
                console.error('Error creating material request:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const requestId = result.insertId;

            // Handle Notification if assigned_to is provided
            if (requestData.assigned_to) {
                const notificationData = {
                    user_id: requestData.assigned_to,
                    title: 'New Material Request',
                    message: `You have been assigned a new material request: ${requestData.material_name} (${requestData.quantity} ${requestData.unit})`,
                    type: 'material_request_assigned',
                    related_id: requestId,
                    assignByName: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim(),
                    is_read: false,
                    created_at: new Date()
                };

                Notification.create(notificationData, (notifErr, notifResult) => {
                    if (!notifErr) {
                        const notifId = notifResult.insertId;
                        Notification.getById(notifId, (err2, results) => {
                            if (!err2 && results && results.length > 0) {
                                const notification = results[0];
                                if (global.io) {
                                    global.io.to(`user_${requestData.assigned_to}`).emit('new-notification', {
                                        notification: notification,
                                        unreadCount: 1
                                    });
                                }
                                // Send push notification
                                pushNotificationService.sendNotificationToUser(requestData.assigned_to, {
                                    id: notification.id,
                                    title: notification.title,
                                    message: notification.message,
                                    type: notification.type,
                                    url: '/project-management' // Or a specific link if available
                                }).catch(e => console.error('Push notification error:', e));
                            }
                        });
                    }
                });
            }

            res.status(201).json({ message: 'Material request created successfully', id: requestId });
        });
    },

    getProjectRequests: (req, res) => {
        const { projectId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role?.toLowerCase() === 'admin';

        MaterialRequest.findByProjectId(projectId, (err, results) => {
            if (err) {
                console.error(`Error fetching material requests for project ${projectId}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (isAdmin) {
                return res.json(results);
            }

            // Filter for regular users: visible only to assignee or requester
            const filtered = results.filter(r => r.assigned_to === userId || r.requested_by === userId);
            res.json(filtered);
        });
    },

    getMyRequests: (req, res) => {
        const userId = req.user.id;
        const isAdmin = req.user.role?.toLowerCase() === 'admin';

        if (isAdmin) {
            MaterialRequest.findAllPending((err, results) => {
                if (err) {
                    console.error('Error fetching all pending material requests:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json(results);
            });
        } else {
            MaterialRequest.findByAssigneeId(userId, (err, results) => {
                if (err) {
                    console.error(`Error fetching material requests for user ${userId}:`, err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json(results);
            });
        }
    },

    updateStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Arrived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        MaterialRequest.updateStatus(id, status, (err, result) => {
            if (err) {
                console.error(`Error updating material request ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Automatically create inventory entry if marked as Arrived
            if (status === 'Arrived') {
                MaterialRequest.findById(id, (fetchErr, request) => {
                    if (fetchErr || !request) {
                        console.error('Error fetching request for inventory entry:', fetchErr);
                        return; // Still return success for status update
                    }

                    const inventoryData = {
                        project_id: request.project_id,
                        material_name: request.material_name,
                        quantity: request.quantity,
                        unit: request.unit,
                        type: 'In',
                        transaction_date: new Date().toISOString().split('T')[0],
                        description: `Auto-procured from Arrived Request #${id}`,
                        created_by: req.user.id
                    };

                    MaterialInventory.create(inventoryData, (invErr) => {
                        if (invErr) {
                            console.error('Error creating linked inventory entry:', invErr);
                        }
                    });
                });
            }

            res.json({ message: 'Material request status updated successfully' });
        });
    },

    deleteRequest: (req, res) => {
        const { id } = req.params;
        MaterialRequest.delete(id, (err, result) => {
            if (err) {
                console.error(`Error deleting material request ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Material request deleted successfully' });
        });
    }
};

module.exports = materialRequestController;

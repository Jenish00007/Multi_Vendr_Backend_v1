const express = require('express');
const router = express.Router();
const deliverymanController = require('../controller/deliveryman.controller');
const { upload } = require('../multer');
const { isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', 
    upload.fields([
        { name: 'deliverymanImage', maxCount: 1 },
        { name: 'identityImage', maxCount: 1 }
    ]),
    deliverymanController.register
);
router.post('/login', deliverymanController.login);

// Admin routes
router.get('/all', isAdmin, deliverymanController.getAllDeliverymen);
router.put('/approve/:deliverymanId', isAdmin, deliverymanController.approveDeliveryman);
router.delete('/reject/:deliverymanId', isAdmin, deliverymanController.rejectDeliveryman);

module.exports = router; 
const express = require("express");
const router = express.Router();
const { upload } = require("../multer");
const { isAuthenticated, isAdmin, isDeliveryMan } = require("../middleware/auth");
const {
    registerDeliveryMan,
    loginDeliveryMan,
    getAllDeliveryMen,
    approveDeliveryMan,
    rejectDeliveryMan,
    getDeliveryManDetails,
    updateDeliveryManProfile,
    updateDeliveryManPassword,
    logoutDeliveryMan,
    editDeliveryMan,
    deleteDeliveryMan,
    getDeliveryManOrders,
    acceptOrder,
    ignoreOrder,
    verifyToken
} = require("../controller/deliveryman");

// Public routes
router.post("/register", upload.single("idProof"), registerDeliveryMan);
router.post("/login", loginDeliveryMan);
router.get("/logout", logoutDeliveryMan);

// Protected routes (requires authentication)
router.get("/me", isDeliveryMan, getDeliveryManDetails);
router.get("/orders", isDeliveryMan, getDeliveryManOrders);
router.post("/orders/:orderId/accept", isDeliveryMan, acceptOrder);
router.post("/orders/:orderId/ignore", isDeliveryMan, ignoreOrder);
router.put("/update-profile", isDeliveryMan, updateDeliveryManProfile);
router.put("/update-password", isDeliveryMan, updateDeliveryManPassword);

// Admin routes
router.get("/all", isAuthenticated, isAdmin, getAllDeliveryMen);
router.put("/approve/:id", isAuthenticated, isAdmin, approveDeliveryMan);
router.delete("/reject/:id", isAuthenticated, isAdmin, rejectDeliveryMan);
router.put("/edit/:id", isAuthenticated, isAdmin, upload.single("idProof"), editDeliveryMan);
router.delete("/delete/:id", isAuthenticated, isAdmin, deleteDeliveryMan);

// Verify token route
router.get('/verify-token', verifyToken);

module.exports = router; 
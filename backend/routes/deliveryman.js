const express = require("express");
const router = express.Router();
const { upload } = require("../multer");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
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
    deleteDeliveryMan
} = require("../controller/deliveryman");

// Public routes
router.post("/register", upload.single("idProof"), registerDeliveryMan);
router.post("/login", loginDeliveryMan);
router.get("/logout", logoutDeliveryMan);

// Protected routes (requires authentication)
router.get("/me", getDeliveryManDetails);
router.put("/update-profile", updateDeliveryManProfile);
router.put("/update-password",updateDeliveryManPassword);

// Admin routes
router.get("/all", getAllDeliveryMen);
router.put("/approve/:id", approveDeliveryMan);
router.delete("/reject/:id", rejectDeliveryMan);
router.put("/edit/:id", upload.single("idProof"), editDeliveryMan);
router.delete("/delete/:id", deleteDeliveryMan);

module.exports = router; 
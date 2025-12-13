const express = require("express");
const router = express.Router();
const { upload, handleMulterError } = require("../multer");
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
    verifyToken,
    updateExpoPushToken
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
router.put("/expo-push-token", isDeliveryMan, updateExpoPushToken);

// Admin routes
router.get("/all", isAuthenticated, isAdmin("Admin"), getAllDeliveryMen);
router.put("/approve/:id", isAuthenticated, isAdmin("Admin"), approveDeliveryMan);
router.delete("/reject/:id", isAuthenticated, isAdmin("Admin"), rejectDeliveryMan);
router.put("/edit/:id", isAuthenticated, isAdmin("Admin"), upload.single("idProof"), handleMulterError, editDeliveryMan);
router.delete("/delete/:id", isAuthenticated, isAdmin("Admin"), deleteDeliveryMan);

// Admin register route
router.post("/admin-register", 
  (req, res, next) => {
    console.log("=== Admin register route hit ===");
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);
    console.log("Request URL:", req.url);
    console.log("Request headers authorization:", req.headers.authorization ? "Present" : "Missing");
    next();
  },
  isAuthenticated, 
  (req, res, next) => {
    console.log("Authentication passed, user:", req.user?.email, "role:", req.user?.role);
    next();
  },
  isAdmin("Admin"), 
  (req, res, next) => {
    console.log("Admin check passed");
    next();
  },
  upload.single("idProof"), 
  (req, res, next) => {
    console.log("File upload completed, file:", req.file ? "Present" : "Missing");
    if (req.file) {
      console.log("File details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        key: req.file.key,
        location: req.file.location
      });
    }
    next();
  },
  handleMulterError, 
  registerDeliveryMan
);

// Verify token route
router.get('/verify-token', verifyToken);

// Test route to verify routing works
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Delivery man routes are working' });
});

module.exports = router; 
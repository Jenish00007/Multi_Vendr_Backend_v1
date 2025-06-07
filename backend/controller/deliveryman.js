const DeliveryMan = require("../model/deliveryman");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");

// Register delivery man
exports.registerDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, password, phoneNumber, address, vehicleType, vehicleNumber, licenseNumber } = req.body;

        // Check if delivery man already exists
        const existingDeliveryMan = await DeliveryMan.findOne({ email });
        if (existingDeliveryMan) {
            return next(new ErrorHandler("Email already registered", 400));
        }

        // Get the S3 URL from the uploaded file
        let idProofUrl = "";
        if (req.file) {
            idProofUrl = req.file.location || req.file.key;
            
            if (!idProofUrl) {
                return next(new ErrorHandler("Failed to upload ID proof", 400));
            }
        }

        // Create new delivery man
        const deliveryMan = await DeliveryMan.create({
            name,
            email,
            password,
            phoneNumber,
            address,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            idProof: idProofUrl,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful! Waiting for admin approval.",
            deliveryMan,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Login delivery man
exports.loginDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password is entered by user
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email & password", 400));
        }

        // Finding user in database
        const deliveryMan = await DeliveryMan.findOne({ email }).select("+password");

        if (!deliveryMan) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }

        // Check if delivery man is approved
        if (!deliveryMan.isApproved) {
            return next(new ErrorHandler("Your account is pending approval", 401));
        }

        // Check if password is correct
        const isPasswordMatched = await deliveryMan.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }

        sendToken(deliveryMan, 200, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get all delivery men (Admin)
exports.getAllDeliveryMen = catchAsyncErrors(async (req, res, next) => {
    const deliveryMen = await DeliveryMan.find();
    res.status(200).json({
        success: true,
        deliveryMen,
    });
});

// Approve delivery man (Admin)
exports.approveDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    const deliveryMan = await DeliveryMan.findById(req.params.id);

    if (!deliveryMan) {
        return next(new ErrorHandler("Delivery man not found", 404));
    }

    deliveryMan.isApproved = true;
    await deliveryMan.save();

    res.status(200).json({
        success: true,
        message: "Delivery man approved successfully",
    });
});

// Reject delivery man (Admin)
exports.rejectDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    const deliveryMan = await DeliveryMan.findById(req.params.id);

    if (!deliveryMan) {
        return next(new ErrorHandler("Delivery man not found", 404));
    }

    await deliveryMan.remove();

    res.status(200).json({
        success: true,
        message: "Delivery man rejected and removed successfully",
    });
});

// Get delivery man details
exports.getDeliveryManDetails = catchAsyncErrors(async (req, res, next) => {
    const deliveryMan = await DeliveryMan.findById(req.deliveryMan.id);

    res.status(200).json({
        success: true,
        deliveryMan,
    });
});

// Update delivery man profile
exports.updateDeliveryManProfile = catchAsyncErrors(async (req, res, next) => {
    const newDeliveryManData = {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
    };

    const deliveryMan = await DeliveryMan.findByIdAndUpdate(
        req.deliveryMan.id,
        newDeliveryManData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        deliveryMan,
    });
});

// Update delivery man password
exports.updateDeliveryManPassword = catchAsyncErrors(async (req, res, next) => {
    const deliveryMan = await DeliveryMan.findById(req.deliveryMan.id).select("+password");

    // Check previous password
    const isMatched = await deliveryMan.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    deliveryMan.password = req.body.newPassword;
    await deliveryMan.save();

    sendToken(deliveryMan, 200, res);
});

// Logout delivery man
exports.logoutDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

// Edit delivery man (Admin)
exports.editDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, phoneNumber, address, vehicleType, vehicleNumber, licenseNumber, isApproved } = req.body;
        const deliveryManId = req.params.id;

        const deliveryMan = await DeliveryMan.findById(deliveryManId);

        if (!deliveryMan) {
            return next(new ErrorHandler("Delivery man not found", 404));
        }

        // Update fields if provided
        if (name) deliveryMan.name = name;
        if (email) {
            // Check if email is already taken by another delivery man
            const existingDeliveryMan = await DeliveryMan.findOne({ email, _id: { $ne: deliveryManId } });
            if (existingDeliveryMan) {
                return next(new ErrorHandler("Email already registered", 400));
            }
            deliveryMan.email = email;
        }
        if (phoneNumber) deliveryMan.phoneNumber = phoneNumber;
        if (address) deliveryMan.address = address;
        if (vehicleType) deliveryMan.vehicleType = vehicleType;
        if (vehicleNumber) deliveryMan.vehicleNumber = vehicleNumber;
        if (licenseNumber) deliveryMan.licenseNumber = licenseNumber;
        if (isApproved !== undefined) deliveryMan.isApproved = isApproved;

        // Update ID proof if new file is uploaded
        if (req.file) {
            const idProofUrl = req.file.location || req.file.key;
            if (!idProofUrl) {
                return next(new ErrorHandler("Failed to upload ID proof", 400));
            }
            deliveryMan.idProof = idProofUrl;
        }

        await deliveryMan.save();

        res.status(200).json({
            success: true,
            message: "Delivery man updated successfully",
            deliveryMan
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Delete delivery man (Admin)
exports.deleteDeliveryMan = catchAsyncErrors(async (req, res, next) => {
    try {
        const deliveryManId = req.params.id;

        const deliveryMan = await DeliveryMan.findById(deliveryManId);

        if (!deliveryMan) {
            return next(new ErrorHandler("Delivery man not found", 404));
        }

        await deliveryMan.deleteOne();

        res.status(200).json({
            success: true,
            message: "Delivery man deleted successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}); 
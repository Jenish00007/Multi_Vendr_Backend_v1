const Deliveryman = require('../model/deliveryman.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new delivery man
exports.register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            deliverymanType,
            zone,
            vehicle,
            identityType,
            storeId,
            phone,
            password
        } = req.body;

        // Check if delivery man already exists
        const existingDeliveryman = await Deliveryman.findOne({ email });
        if (existingDeliveryman) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new delivery man
        const deliveryman = new Deliveryman({
            firstName,
            lastName,
            email,
            deliverymanType,
            zone,
            vehicle,
            deliverymanImage: req.files.deliverymanImage[0].path,
            identityType,
            storeId,
            identityImage: req.files.identityImage[0].path,
            phone,
            password: hashedPassword
        });

        await deliveryman.save();

        res.status(201).json({
            message: 'Registration successful. Waiting for admin approval.',
            deliveryman: {
                id: deliveryman._id,
                firstName: deliveryman.firstName,
                lastName: deliveryman.lastName,
                email: deliveryman.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in registration', error: error.message });
    }
};

// Login delivery man
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find delivery man
        const deliveryman = await Deliveryman.findOne({ email });
        if (!deliveryman) {
            return res.status(404).json({ message: 'Delivery man not found' });
        }

        // Check if approved
        if (!deliveryman.isApproved) {
            return res.status(403).json({ message: 'Your registration is pending approval' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, deliveryman.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: deliveryman._id, role: 'deliveryman' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            deliveryman: {
                id: deliveryman._id,
                firstName: deliveryman.firstName,
                lastName: deliveryman.lastName,
                email: deliveryman.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
};

// Get all delivery men (for admin)
exports.getAllDeliverymen = async (req, res) => {
    try {
        const deliverymen = await Deliveryman.find()
            .select('-password')
            .populate('storeId', 'name');
        res.status(200).json(deliverymen);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery men', error: error.message });
    }
};

// Approve delivery man (admin only)
exports.approveDeliveryman = async (req, res) => {
    try {
        const { deliverymanId } = req.params;
        
        const deliveryman = await Deliveryman.findById(deliverymanId);
        if (!deliveryman) {
            return res.status(404).json({ message: 'Delivery man not found' });
        }

        deliveryman.isApproved = true;
        await deliveryman.save();

        res.status(200).json({ message: 'Delivery man approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving delivery man', error: error.message });
    }
};

// Reject delivery man (admin only)
exports.rejectDeliveryman = async (req, res) => {
    try {
        const { deliverymanId } = req.params;
        
        const deliveryman = await Deliveryman.findById(deliverymanId);
        if (!deliveryman) {
            return res.status(404).json({ message: 'Delivery man not found' });
        }

        await Deliveryman.findByIdAndDelete(deliverymanId);

        res.status(200).json({ message: 'Delivery man rejected and removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting delivery man', error: error.message });
    }
}; 
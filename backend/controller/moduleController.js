const Module = require('../model/Module');
const Category = require('../model/Category');
const Subcategory = require('../model/Subcategory');

// Create a new module
exports.createModule = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? req.file.path : '';

        const module = new Module({
            name,
            description,
            image
        });

        await module.save();
        res.status(201).json({
            success: true,
            data: module
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all modules
exports.getAllModules = async (req, res) => {
    try {
        const modules = await Module.find();
        res.status(200).json({
            success: true,
            data: modules
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get module by ID
exports.getModuleById = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({
                success: false,
                error: 'Module not found'
            });
        }
        res.status(200).json({
            success: true,
            data: module
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update module
exports.updateModule = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = { name, description };
        
        if (req.file) {
            updateData.image = req.file.path;
        }

        const module = await Module.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!module) {
            return res.status(404).json({
                success: false,
                error: 'Module not found'
            });
        }

        res.status(200).json({
            success: true,
            data: module
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete module
exports.deleteModule = async (req, res) => {
    try {
        const module = await Module.findByIdAndDelete(req.params.id);
        
        if (!module) {
            return res.status(404).json({
                success: false,
                error: 'Module not found'
            });
        }

        // Delete associated categories and subcategories
        await Category.deleteMany({ module: req.params.id });
        await Subcategory.deleteMany({ category: { $in: await Category.find({ module: req.params.id }).select('_id') } });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 
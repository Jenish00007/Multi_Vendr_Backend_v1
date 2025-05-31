import React, { useEffect, useState } from "react";
import { Plus, Package, Image, DollarSign, Tag, Box, X } from "lucide-react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateProduct = () => {
    const navigate = useNavigate();
    const { seller } = useSelector((state) => state.seller);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        subcategory: "",
        tags: "",
        originalPrice: "",
        discountPrice: "",
        stock: ""
    });
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (formData.category) {
            fetchSubcategories(formData.category);
        } else {
            setSubcategories([]);
            setFormData(prev => ({ ...prev, subcategory: "" }));
        }
    }, [formData.category]);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${server}/categories`);
            setCategories(response.data.data || []);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            toast.error(error.response?.data?.error || "Error fetching categories");
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${server}/subcategories`);
            const filteredSubcategories = response.data.data.filter(
                sub => sub.category._id === categoryId
            );
            setSubcategories(filteredSubcategories);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            toast.error(error.response?.data?.error || "Error fetching subcategories");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fixed number input handler with more lenient validation
    const handleNumberInputChange = (e) => {
        const { name, value } = e.target;
        if (value === "") {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }
        if (/^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        let files = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.category || !formData.subcategory || 
            !formData.originalPrice || !formData.discountPrice || !formData.stock || images.length === 0) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("description", formData.description);
            submitData.append("category", formData.category);
            submitData.append("subcategory", formData.subcategory);
            submitData.append("tags", formData.tags);
            submitData.append("originalPrice", formData.originalPrice);
            submitData.append("discountPrice", formData.discountPrice);
            submitData.append("stock", formData.stock);
            submitData.append("shopId", seller._id);
            images.forEach((image) => {
                submitData.append("images", image);
            });
            const config = { headers: { "Content-Type": "multipart/form-data" } };
            const response = await axios.post(
                `${server}/product/create-product`,
                submitData,
                config
            );
            if (response.data.success) {
                toast.success("Product created successfully!");
                setFormData({
                    name: "",
                    description: "",
                    category: "",
                    subcategory: "",
                    tags: "",
                    originalPrice: "",
                    discountPrice: "",
                    stock: ""
                });
                setImages([]);
                navigate("/dashboard-products");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const InputWrapper = ({ children, icon: Icon, label, required = false }) => (
        <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <Icon className="text-lg text-blue-600" />
                {label}
                {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            {children}
        </div>
    );

    const discount = formData.originalPrice && formData.discountPrice ? 
        Math.round(((formData.originalPrice - formData.discountPrice) / formData.originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Floating particles background effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>
            <div className="relative max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-transform duration-300">
                        <Package className="text-3xl text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                        Create New Product
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Bring your product to life with our intuitive creation tool
                    </p>
                </div>
                {/* Main Form */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 md:p-12">
                        <div className="space-y-8">
                            {/* Product Details Section */}
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">
                                    Product Information
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-600">Product Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-600">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col col-span-2">
                                        <label className="mb-1 text-sm font-medium text-gray-600">Subcategory</label>
                                        <select
                                            name="subcategory"
                                            value={formData.subcategory}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.category}
                                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select a subcategory</option>
                                            {subcategories.map((subcat) => (
                                                <option key={subcat._id} value={subcat._id}>
                                                    {subcat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-8">
                                    <label className="mb-1 text-sm font-medium text-gray-600">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 resize-none"
                                    />
                                </div>
                                <div className="flex flex-col mt-8">
                                    <label className="mb-1 text-sm font-medium text-gray-600">Tags (e.g. electronics, gadgets, accessories)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800"
                                    />
                                </div>
                            </div>
                            {/* Pricing Section */}
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">
                                    Pricing & Inventory
                                </h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-600">Original Price (e.g. 1000)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                            <input
                                                type="text"
                                                name="originalPrice"
                                                value={formData.originalPrice}
                                                onChange={handleNumberInputChange}
                                                required
                                                className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-600">Discount Price (e.g. 900)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                            <input
                                                type="text"
                                                name="discountPrice"
                                                value={formData.discountPrice}
                                                onChange={handleNumberInputChange}
                                                required
                                                className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-600">Stock Quantity (e.g. 50)</label>
                                        <input
                                            type="text"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleNumberInputChange}
                                            required
                                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800"
                                        />
                                    </div>
                                </div>
                                {/* Price preview */}
                                {formData.originalPrice && formData.discountPrice && (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Price Preview:</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-green-600">₹{formData.discountPrice}</span>
                                            <span className="text-lg text-gray-500 line-through">₹{formData.originalPrice}</span>
                                            {discount > 0 && (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm font-medium">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Image Upload Section */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">
                                    Product Images
                                </h2>
                                {/* <InputWrapper icon={Image} label="Upload Images" required> */}
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group-hover:scale-[1.02]">
                                            <Image className="mx-auto text-4xl text-gray-400 mb-4 group-hover:text-blue-500 transition-colors" />
                                            <p className="text-gray-600 font-medium mb-2">Drag & drop images here, or click to browse</p>
                                            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                                        </div>
                                    </div>
                                {/* </InputWrapper> */}
                                {/* Image Preview Grid */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg transform hover:scale-110"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                                                        Main
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Submit Button */}
                            <div className="pt-8 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.name || !formData.description || !formData.category || !formData.subcategory || !formData.originalPrice || !formData.discountPrice || !formData.stock || images.length === 0}
                                    className={`w-full py-4 px-8 rounded-xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg ${
                                        isSubmitting || !formData.name || !formData.description || !formData.category || !formData.subcategory || !formData.originalPrice || !formData.discountPrice || !formData.stock || images.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25 hover:shadow-xl'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating Product...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <Plus className="w-5 h-5" />
                                            Create Product
                                        </div>
                                    )}
                                </button>
                                {/* Form validation hints */}
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        {!formData.name || !formData.description || !formData.category || !formData.subcategory || !formData.originalPrice || !formData.discountPrice || !formData.stock || images.length === 0
                                            ? 'Please fill in all required fields and upload at least one image'
                                            : 'All fields completed! Ready to create your product.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                {/* Footer section with tips */}
                <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Image className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">High Quality Images</h3>
                        <p className="text-sm text-gray-600">Upload clear, well-lit photos from multiple angles to showcase your product.</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Detailed Description</h3>
                        <p className="text-sm text-gray-600">Write compelling descriptions with key features and benefits.</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Competitive Pricing</h3>
                        <p className="text-sm text-gray-600">Research market prices to set competitive and attractive pricing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
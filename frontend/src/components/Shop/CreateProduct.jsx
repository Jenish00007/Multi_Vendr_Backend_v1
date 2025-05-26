import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/actions/product";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import { FiPackage } from "react-icons/fi";

const CreateProduct = () => {
    const { seller } = useSelector((state) => state.seller);
    const { success, error } = useSelector((state) => state.products);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [originalPrice, setOriginalPrice] = useState();
    const [discountPrice, setDiscountPrice] = useState();
    const [stock, setStock] = useState();

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (success) {
            toast.success("Product created successfully!");
            navigate("/dashboard");
            window.location.reload();
        }
    }, [dispatch, error, success]);

    const handleImageChange = (e) => {
        e.preventDefault();
        let files = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...files]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newForm = new FormData();

        images.forEach((image) => {
            newForm.append("images", image);
        });
        newForm.append("name", name);
        newForm.append("description", description);
        newForm.append("category", category);
        newForm.append("tags", tags);
        newForm.append("originalPrice", originalPrice);
        newForm.append("discountPrice", discountPrice);
        newForm.append("stock", stock);
        newForm.append("shopId", seller._id);
        dispatch(createProduct(newForm));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <FiPackage className="text-4xl sm:text-5xl text-blue-600" />
                </div>
                <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                    Create New Product
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Add a new product to your shop
                </p>
            </div>
            <div className="mt-6 sm:mt-8 mx-auto w-full">
                <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-10 shadow-2xl rounded-xl sm:rounded-2xl transform transition-all hover:scale-[1.01]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Left Column */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Product Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="appearance-none block w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter your product name..."
                                        />
                                    </div>
                                </div>

                                {/* Original Price */}
                                <div>
                                    <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
                                        Original Price
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            value={originalPrice}
                                            onChange={(e) => setOriginalPrice(e.target.value)}
                                            className="appearance-none block w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter original price..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Tags */}
                                <div>
                                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                        Tags
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="tags"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="appearance-none block w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter your product tags..."
                                        />
                                    </div>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                                        Product Stock <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            name="stock"
                                            required
                                            value={stock}
                                            onChange={(e) => setStock(e.target.value)}
                                            className="appearance-none block w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter stock quantity..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Second Row - Category and Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                    <select
                                        className="appearance-none block w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose a category</option>
                                        {categoriesData &&
                                            categoriesData.map((i) => (
                                                <option value={i.title} key={i.title}>
                                                    {i.title}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Discount Price */}
                            <div>
                                <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">
                                    Price (With Discount) <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        required
                                        value={discountPrice}
                                        onChange={(e) => setDiscountPrice(e.target.value)}
                                        className="appearance-none block w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter discounted price..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description - Full Width */}
                        <div className="w-full">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="appearance-none block w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your product description..."
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                Product Images <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    type="file"
                                    id="images"
                                    multiple
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {images &&
                                    images.map((i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={URL.createObjectURL(i)}
                                                alt=""
                                                className="h-[100px] sm:h-[120px] w-full object-cover rounded-lg shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImages(images.filter((img) => img !== i))}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <AiOutlinePlusCircle className="transform rotate-45" />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                Create Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
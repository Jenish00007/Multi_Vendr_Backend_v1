import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const HeroSection = () => {
    const [heroContent, setHeroContent] = useState({
        title: '',
        subtitle: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const response = await axios.get('http://localhost:8000/v2/settings/config');
                if (response.data.success) {
                    setHeroContent(response.data.data.homepageContent);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch hero content');
                setLoading(false);
            }
        };

        fetchHeroContent();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 min-h-[400px] flex items-center justify-center">
                {error}
            </div>
        );
    }

    return (
        <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center md:text-left"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {heroContent?.title}
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
                            {heroContent?.subtitle}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            {heroContent?.description}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Shop Now
                        </motion.button>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative"
                    >
                            <img
                                src={heroContent?.banner}
                            alt={heroContent?.title}
                            className="rounded-lg shadow-xl w-full h-[400px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection; 
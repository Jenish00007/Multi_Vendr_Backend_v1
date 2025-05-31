import React, { useEffect, useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ProductDetails from "../components/Products/ProductDetails";
import { useParams, useSearchParams } from 'react-router-dom';
import SuggestedProduct from "../components/Products/SuggestedProduct";
import { useSelector } from 'react-redux';

const ProductDetailsPage = () => {
    const { allProducts } = useSelector((state) => state.products);
    const { allEvents } = useSelector((state) => state.events);
    const { id } = useParams();
    const [data, setData] = useState(null)
    const [searchParams] = useSearchParams();
    const eventData = searchParams.get("isEvent");

    // const productName = name.replace(/-/g, " ");

    useEffect(() => {
        if (!id) return;

        if (eventData !== null) {
            const foundData = allEvents?.find((i) => i?._id === id);
            setData(foundData || null);
        } else {
            const foundData = allProducts?.find((i) => i?._id === id);
            setData(foundData || null);
        }
        /* `window.scrollTo(0, 0)` is a JavaScript method that scrolls the window to the top of the page.
        In this code, it is used inside the `useEffect` hook to scroll the window to the top whenever
        the component is rendered. This ensures that when the user navigates to the
        `ProductDetailsPage`, the page starts at the top rather than at the previous scroll position. */
        window.scrollTo(0, 0)
    }, [allProducts, allEvents, id, eventData]);

    return (
        <div>
            <Header />
            <ProductDetails data={data} />
            {
                !eventData && data && (
                    <SuggestedProduct data={data} />
                )
            }
            <Footer />
        </div>
    )
}

export default ProductDetailsPage

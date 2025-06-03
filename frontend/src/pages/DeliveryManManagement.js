import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../server';
import { toast } from 'react-toastify';

const DeliveryManManagement = () => {
    const [deliverymen, setDeliverymen] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        fetchDeliverymen();
    }, []);

    const fetchDeliverymen = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${server}/api/v2/deliveryman/all`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setDeliverymen(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching delivery men');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (deliverymanId) => {
        try {
            await axios.put(
                `${server}/api/v2/deliveryman/approve/${deliverymanId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            toast.success('Delivery man approved successfully');
            fetchDeliverymen();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error approving delivery man');
        }
    };

    const handleReject = async (deliverymanId) => {
        if (window.confirm('Are you sure you want to reject this delivery man?')) {
            try {
                await axios.delete(
                    `${server}/api/v2/deliveryman/reject/${deliverymanId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
                toast.success('Delivery man rejected successfully');
                fetchDeliverymen();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error rejecting delivery man');
            }
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Delivery Man Management</h1>
            
            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliverymen.map((deliveryman) => (
                        <div key={deliveryman._id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    src={deliveryman.deliverymanImage}
                                    alt={deliveryman.firstName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {deliveryman.firstName} {deliveryman.lastName}
                                    </h2>
                                    <p className="text-gray-600">{deliveryman.email}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <p><span className="font-semibold">Type:</span> {deliveryman.deliverymanType}</p>
                                <p><span className="font-semibold">Zone:</span> {deliveryman.zone}</p>
                                <p><span className="font-semibold">Vehicle:</span> {deliveryman.vehicle}</p>
                                <p><span className="font-semibold">Phone:</span> {deliveryman.phone}</p>
                                <p><span className="font-semibold">Status:</span> 
                                    <span className={`ml-2 px-2 py-1 rounded ${
                                        deliveryman.isApproved 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {deliveryman.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                {!deliveryman.isApproved && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(deliveryman._id)}
                                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(deliveryman._id)}
                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Identity Document</h3>
                                <img
                                    src={deliveryman.identityImage}
                                    alt="Identity Document"
                                    className="w-full h-32 object-cover rounded"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeliveryManManagement; 
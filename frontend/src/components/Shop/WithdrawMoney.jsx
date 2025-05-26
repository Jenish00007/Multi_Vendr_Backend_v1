import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { AiOutlineDelete } from "react-icons/ai";
import { FaMoneyBillWave } from "react-icons/fa";

// Custom toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  style: {
    background: "#fff",
    color: "#333",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "500",
  },
};

const WithdrawMoney = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const [paymentMethod, setPaymentMethod] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankCountry: "",
    bankSwiftCode: null,
    bankAccountNumber: null,
    bankHolderName: "",
    bankAddress: "",
  });

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const withdrawMethod = {
      bankName: bankInfo.bankName,
      bankCountry: bankInfo.bankCountry,
      bankSwiftCode: bankInfo.bankSwiftCode,
      bankAccountNumber: bankInfo.bankAccountNumber,
      bankHolderName: bankInfo.bankHolderName,
      bankAddress: bankInfo.bankAddress,
    };

    setPaymentMethod(false);

    await axios
      .put(
        `${server}/shop/update-payment-methods`,
        {
          withdrawMethod,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Withdraw method added successfully! 🎉", {
          ...toastConfig,
          icon: "✅",
        });
        dispatch(loadSeller());
        setBankInfo({
          bankName: "",
          bankCountry: "",
          bankSwiftCode: null,
          bankAccountNumber: null,
          bankHolderName: "",
          bankAddress: "",
        });
      })
      .catch((error) => {
        toast.error(error.response.data.message || "Something went wrong!", {
          ...toastConfig,
          icon: "❌",
        });
      });
  };

  const deleteHandler = async () => {
    await axios
      .delete(`${server}/shop/delete-withdraw-method`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Withdraw method deleted successfully! 🗑️", {
          ...toastConfig,
          icon: "✅",
        });
        dispatch(loadSeller());
      })
      .catch((error) => {
        toast.error("Failed to delete withdraw method!", {
          ...toastConfig,
          icon: "❌",
        });
      });
  };

  const error = () => {
    toast.error("You don't have enough balance to withdraw! 💸", {
      ...toastConfig,
      icon: "⚠️",
    });
  };

  const withdrawHandler = async () => {
    if (withdrawAmount < 50 || withdrawAmount > availableBalance) {
      toast.error(`You can't withdraw ₹${withdrawAmount}! Minimum amount is ₹50`, {
        ...toastConfig,
        icon: "⚠️",
      });
    } else {
      const amount = withdrawAmount;
      await axios
        .post(
          `${server}/withdraw/create-withdraw-request`,
          { amount },
          { withCredentials: true }
        )
        .then((res) => {
          toast.success(`Withdraw request of ₹${amount} is successful! 💰`, {
            ...toastConfig,
            icon: "✅",
          });
        })
        .catch((error) => {
          toast.error("Failed to process withdraw request!", {
            ...toastConfig,
            icon: "❌",
          });
        });
    }
  };

  const availableBalance = seller?.availableBalance.toFixed(2);

  return (
    <div className="w-full min-h-[90vh] p-8 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto bg-white h-full rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center space-x-3">
            <FaMoneyBillWave className="text-3xl text-green-500" />
            <h5 className="text-2xl font-semibold text-gray-800">
              Available Balance: <span className="text-green-600">₹{availableBalance}</span>
            </h5>
          </div>
          
          <button
            className={`px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              availableBalance < 50 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => (availableBalance < 50 ? error() : setOpen(true))}
          >
            Withdraw Money
          </button>
        </div>
      </div>

      {open && (
        <div className="w-full h-screen z-[9999] fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`w-[95%] 800px:w-[50%] bg-white shadow-2xl rounded-xl ${
            paymentMethod ? "h-[80vh] overflow-y-scroll" : "h-[unset]"
          } min-h-[40vh] p-6 relative`}>
            <div className="w-full flex justify-end mb-4">
              <RxCross1
                size={25}
                onClick={() => setOpen(false) || setPaymentMethod(false)}
                className="cursor-pointer hover:text-red-500 transition-colors"
              />
            </div>
            
            {paymentMethod ? (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-center text-gray-800">
                  Add New Withdraw Method
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankInfo.bankName}
                      onChange={(e) =>
                        setBankInfo({ ...bankInfo, bankName: e.target.value })
                      }
                      placeholder="Enter your Bank name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankInfo.bankCountry}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankCountry: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter your bank Country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Swift Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankInfo.bankSwiftCode}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankSwiftCode: e.target.value,
                        })
                      }
                      placeholder="Enter your Bank Swift Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={bankInfo.bankAccountNumber}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankAccountNumber: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter your bank account number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankInfo.bankHolderName}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankHolderName: e.target.value,
                        })
                      }
                      placeholder="Enter your bank Holder name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankInfo.bankAddress}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankAddress: e.target.value,
                        })
                      }
                      placeholder="Enter your bank address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Add Withdraw Method
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-center text-gray-800">
                  Withdraw Money
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Amount to Withdraw
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={withdrawHandler}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawMoney;

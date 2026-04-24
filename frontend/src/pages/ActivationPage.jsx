import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { server } from "../server";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (activation_token) {
      axios
        .post(`${server}/user/activation`, { activation_token })
        .then(() => {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        })
        .catch((err) => {
          setStatus("error");
          setErrorMsg(err?.response?.data?.message || "Token is expired or invalid.");
        });
    }
  }, [activation_token, navigate]); // FIXED: navigate added to dependency array

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-[#3321c8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Activating your account...</h2>
            <p className="text-gray-400 mt-2 text-sm">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Account Activated!</h2>
            <p className="text-gray-500 mt-2 text-sm">Your account has been created successfully.</p>
            <p className="text-gray-400 mt-1 text-xs">Redirecting to login...</p>
            <button onClick={() => navigate("/login")} className="mt-6 bg-[#3321c8] text-white px-8 py-2.5 rounded-lg font-medium">Login Now</button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Activation Failed</h2>
            <p className="text-red-500 mt-2 text-sm">{errorMsg}</p>
            <button onClick={() => navigate("/sign-up")} className="mt-6 bg-[#3321c8] text-white px-8 py-2.5 rounded-lg font-medium">Register Again</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivationPage;

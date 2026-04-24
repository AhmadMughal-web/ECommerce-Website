import React, { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import styles from "../styles/style";

const FaqPage = () => {
  return (
    <div>
      <Header activeHeading={5} />
      <Faq />
      <Footer />
    </div>
  );
};

const Faq = () => {
  const [acivetab, setActiveTab] = useState(0);
  const toogleTab = (tab) => {
    if (acivetab === tab) {
      setActiveTab(0);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className={`${styles.section} my-8 `}>
      <h2 className="text-3xl font-bold text-gray-900 mb-8 ">FAQ</h2>
      <div className="mx-auto space-y-4">
        {/* SINGLE FAQ */}
        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(1)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 1 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 1 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>

        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(2)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 2 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 2 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>

        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(3)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 3 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 3 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>

        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(4)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 4 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 4 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>

        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(5)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 5 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 5 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>

        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(6)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 6 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 6 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>

        <div className="border-b  border-gray-900 pb-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => toogleTab(7)}
          >
            <span className="text-lg font-medium text-gray-900">
              How I track my order?
            </span>
            {acivetab === 7 ? (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {acivetab === 7 && (
            <div className="mt-4">
              <p className="text-base text-gray-500">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Blanditiis expedita facere officia quidem reiciendis doloribus
                aliquid animi corrupti similique{" "}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;

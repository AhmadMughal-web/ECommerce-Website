import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/style";

const DropDown = ({ categoriesData, setDropDown }) => {
  const navigate = useNavigate();

  const submitHandler = (i) => {
    navigate(`/products?category=${i.title}`);
    setDropDown(false);
  };

  return (
    <div className="pb-4 w-[250px] bg-white absolute z-30 rounded-b-md shadow-sm">
      {categoriesData &&
        categoriesData.map((i, index) => (
          <div
            key={index}
            className={`${styles.normalFlex}`}
            onClick={() => submitHandler(i)}
          >
            <img
              src={i.image_Url}
              alt=""
              style={{
                width: "25px",
                height: "25px",
                objectFit: "contain",
                marginLeft: "10px",
                userSelect: "none",
              }}
            />
            <h3 className="m-2 cursor-pointer select-none">{i.title}</h3>
          </div>
        ))}
    </div>
  );
};

export default DropDown;

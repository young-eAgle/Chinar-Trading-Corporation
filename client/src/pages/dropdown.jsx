import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";

const Dropdown = ({ isDropDownOpen }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories") // Fixed URL
      .then((response) => {
        console.log("API Response:", response.data);

        // If response is an object (single category), convert it into an array
        const apiData = Array.isArray(response.data) ? response.data : [response.data];

        // Transform data to get categories with subcategories
        const formattedCategories = apiData.map((item) => ({
          category: item.category,
          subcategories: Object.values(item.subcategories || {}) // Extract subcategories object
            .flat() // Flatten arrays
            .flat(), // Flatten again to get strings
        }));

        setCategories(formattedCategories);
      })
      .catch((error) => console.error("Error fetching categories:", error));

    
  }, []);

  const handleCategoryClick = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  return (
    <div
      className={`bg-gray-300 relative transition-all transform duration-1000 drop-down categories rounded-sm w-[280px] xl:w-62 p-4 overflow-hidden overflow-y-auto max-h-[500px] top-full xl:left-18 ${
        isDropDownOpen ? "max-h-[50rem]" : "max-h-0"
      }`}
    >
      <ul>
        {categories.map((categoryData, index) => (
          <div key={index}>
            {/* Parent Category */}
            <div
              className="single-category transition-transform duration-1000 flex items-center justify-between ml-4 gap-4 py-2 cursor-pointer hover:bg-gray-900 hover:text-white hover: p-2 hover:rounded"
              onClick={() => handleCategoryClick(index)}
            >
              <li className="text-sm">{categoryData.category}</li>
              <i
                className={`text-[14px] fa-solid fa-chevron-right transition-transform ${
                  expandedCategory === index ? "rotate-90" : ""
                }`}
              ></i>
            </div>

            {/* Subcategories */}
            {expandedCategory === index &&
              categoryData.subcategories.map((subcategory, subIndex) => (
                <ul key={subIndex} className="ml-8 mt-2 hover:underline">
                  <li className="text-sm text-gray-600 py-1 cursor-pointer hover:text-black">
                    {subcategory}
                  </li>
                </ul>
              ))}

            <div className="h-[1px] bg-gray-400 my-2"></div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;













// import { useState,useEffect } from "react";
// import axios from 'axios';
// import React  from "react";

// // const categories = [
// //   {
// //     name: "Air Conditioner",
// //     hasSubcategories: true,
// //     subcategories: ["Fresh Fruits", "Fresh Vegetables", "Herbs & Seasonings"],
// //   },
// //   { name: "Air Conditioner", hasSubcategories: false, subcategories: [] },
// //   {
// //     name: "Washing Machine",
// //     hasSubcategories: true,
// //     subcategories: ["Fresh Fruits", "Fresh Vegetables", "Herbs & Seasonings"],
// //   },
// //   {
// //     name: "Air Conditioner",
// //     hasSubcategories: true,
// //     subcategories: ["Fresh Fruits", "Fresh Vegetables", "Herbs & Seasonings"],
// //   },
// //   { name: "Air Conditioner", hasSubcategories: false, subcategories: [] },
// //   {
// //     name: "Washing Machine",
// //     hasSubcategories: true,
// //     subcategories: ["Fresh Fruits", "Fresh Vegetables", "Herbs & Seasonings"],
// //   },
// // ];


// const Dropdown = (isDropDownOpen) => {
//   const [expandedCategory, setExpandedCategory] = useState(null);
//   const [categories,setCategories] = useState([]);

//   useEffect(()=>{
//     axios.get("http:localhost:5000/api/categories")
//     .then((response)=>setCategories(response.data))
//     .catch((error)=> console.error("Error fetching categories:", error));

//     console.log("These are the categories: ",categories);
//   },[])

//   const handleCategoryClick = (index) => {
//     setExpandedCategory(expandedCategory === index ? null : index);
//   };
// //   className={` transition-all duration-500  drop-down categories border w-60 h-[30rem] p-4 overflow-auto ml-19   `}
//   return (
//     <div className={` bg-gray-300 relative  transition-all transform duration-1000    drop-down categories  rounded-sm  w-[280px] xl:w-62 p-4 overflow-hidden top-full  xl:left-18
//      ${isDropDownOpen ? "max-h-[50rem]" : "max-h-0"}   `}>
//       <ul>
//         {categories.map((category, index) => {
        
//         return(
//           <div key={index}>
//             {/* Parent Category.. */}

//             <div
//               className="single-category transition-transform duration-1000 flex items-center justify-between ml-4 gap-4 py-2 cursor-pointer  hover:bg-gray-900 hover:text-white hover: p-2 hover:rounded"
//               onClick={() => handleCategoryClick(index)}
//             >
//               <li className="text-sm">{category.category}</li>

//               {/* {category.hasSubcategories && ( */}
//                 <i
//                   className={`text-[14px] fa-solid fa-chevron-right transition-transform ${
//                     expandedCategory === index ? "rotate-90" : ""
//                   }`}
//                 ></i>
//               {/* )} */}
//             </div>

//             {/* Sub Category */}

//             {expandedCategory === index && (category.subcategories || []).map((subcategory, subIndex)=>{
//                 return(


//                     <ul className="ml-8 mt-2 hover:underline ">
                 
//                     <li
//                       key={subIndex}
//                       className="text-sm text-gray-600 py-1 cursor-pointer hover:text-black"
//                     >
//                       {subcategory}
//                     </li>
                   
                 
//                 </ul>
//                 )
//             })}

            

//             {/* {expandedCategory === index &&
//               category.subcategories.length > 0 && (
//                 <ul className="ml-8 mt-2">
//                   {categories.subcategories.map((subcategory, subIndex) => {
//                    return(
//                     <li
//                       key={subIndex}
//                       className="text-sm text-gray-600 py-1 cursor-pointer hover:text-black"
//                     >
//                       {subcategory}
//                     </li>
//                     );
//                   })}
//                 </ul> */}
//               {/* )} */}
//               <div className="h-[1px] bg-gray-400 my-2 "></div>
//           </div>

          
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export default Dropdown;

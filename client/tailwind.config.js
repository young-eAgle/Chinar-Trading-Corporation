



/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Adjust the paths as needed
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 10s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};






















// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Adjust this based on your file structure
//   theme: {
//     extend: {
//       animation: {
//         marquee: 'marquee 10s linear infinite',
//       },
//       keyframes: {
//         marquee: {
//           '0%': { transform: 'translateX(0%)' },
//           '100%': { transform: 'translateX(-50%)' },
//         },
//       },
//     },
//   },
//   plugins: [],
// };


// export default {
//     theme: {
//       extend: {
//         animation: {
//           scroll: "scroll 20s linear infinite",
//         },
//         keyframes: {
//           scroll: {
//             "0%": { transform: "translateX(0)" },
//             "100%": { transform: "translateX(-100%)" },
//           },
//         },
//       },
//     },
//     plugins: [tailwindcss()],
//   };


//   export default {


//     theme:{
//         extend:{
//             animation:{
//                 "loop-scroll": "loop-scroll 20s linear infinite"
//             },
//             keyframes:{
//                 "loop-scroll" : {
//                     from : { transform: "translateX(0)"},
//                     to   : { transform: "translateX(-100%)"},
//                 },

//             },
//         },
//     },
//     plugins :[tailwindcss()],
//   }



// import { defineConfig } from 'vite'

// export default {
//   content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensure your file paths match your project structure
//   theme: {
//     extend: {
//       animation: {
//         scroll: "scroll 20s linear infinite",
//       },
//       keyframes: {
//         scroll: {
//           "0%": { transform: "translateX(0)" },
//           "100%": { transform: "translateX(-100%)" },
//         },
//       },
//     },
//   },
//   plugins: [],
// };

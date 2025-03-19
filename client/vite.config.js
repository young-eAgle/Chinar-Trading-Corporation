import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true, // Allow access from network
    allowedHosts: ["6dd4-37-111-154-198.ngrok-free.app"],
   } // Add your Ngrok host here
})




// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// });












// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from 'tailwindcss';
// import autoprefixer from 'autoprefixer';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   css: {
//     postcss: {
//       plugins: [
//         tailwindcss({
//           content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Adjust this based on your project
//           theme: {
//             extend: {
//               animation: {
//                 marquee: 'marquee 10s linear infinite',
//               },
//               keyframes: {
//                 marquee: {
//                   '0%': { transform: 'translateX(0%)' },
//                   '100%': { transform: 'translateX(-50%)' },
//                 },
//               },
//             },
//           },
//           plugins: [],
//         }),
//         autoprefixer(),
//       ],
//     },
//   },
// });

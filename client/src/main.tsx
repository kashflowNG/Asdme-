import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Service worker temporarily disabled to force cache refresh
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         console.log('[SW] Service Worker registered:', registration.scope);
//       })
//       .catch((error) => {
//         console.log('[SW] Service Worker registration failed:', error);
//       });
//   });
// }
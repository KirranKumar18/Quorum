import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the document title programmatically to ensure it updates
document.title = "Quorum - Connect & Collaborate";

createRoot(document.getElementById("root")!).render(<App />);

/// <reference types="vite/client" />

import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import MainLayout from "./components/MainLayout.tsx" // Import the layout
import Taxonomy from "./page/taxonomy.tsx"
import JobPosting from "./components/JobPosting.tsx";
import About from "./page/about.tsx"
import Explore from "./page/explore.tsx"
import Version from "./page/version.tsx"
import "./i18/config"
import "./index.css"


const container = document.getElementById("app")
if (container === null) {
    throw new Error("Root is null")
}

const root = createRoot(container)

root.render(
    <BrowserRouter>
        <Routes>
            {/* Routes without the new header */}
            <Route index element={<Navigate to="/taxonomy" replace />} /> {/* Redirect root to taxonomy */}
            <Route path="/page/taxonomy.html" element={<Navigate to="/taxonomy" replace />} />
            <Route path="/page/explore.html" element={<Navigate to="/explore" replace />} />
            <Route path="/page/version.html" element={<Navigate to="/version" replace />} />
            <Route path="/page/about.html" element={<Navigate to="/about" replace />} />
            <Route path="/explore/:concept?" element={<Explore />} />
            <Route path="/version" element={<Version />} />
            <Route path="/about" element={<About />} />

            {/* Routes with the new header */}
            <Route element={<MainLayout />}>
                <Route path="/taxonomy/:concept?" element={<Taxonomy />} />
                <Route path="/jobs" element={<JobPosting />} />
                {/* Add other routes here if they should also use MainLayout */}
            </Route>
        </Routes>
    </BrowserRouter>
)

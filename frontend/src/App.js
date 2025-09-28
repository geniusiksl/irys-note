import React from "react";
import { NotionClone } from "./components";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NotionClone />} />
        <Route path="/page/:pageId" element={<NotionClone />} />
        <Route path="/public/:publicId" element={<NotionClone />} />
        <Route path="/private/:transactionId" element={<NotionClone />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
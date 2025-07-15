import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { NotionClone } from './components';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NotionClone />} />
          <Route path="/page/:pageId" element={<NotionClone />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
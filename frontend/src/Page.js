import React, { useState } from 'react';
import { irysService } from './irysService';

function PageEditor({ pageId, initialContent }) {
  const [content, setContent] = useState(initialContent || '');

  // Сохранить в Irys
  const handleSave = async () => {
    const pageData = { id: pageId, content };
    const result = await irysService.savePageToIrys(pageData);
    localStorage.setItem(`uploadId_${pageId}`, result.id);
    alert('Сохранено в Irys!');
  };

  // Загрузить из Irys
  const handleLoad = async () => {
    const uploadId = localStorage.getItem(`uploadId_${pageId}`);
    if (!uploadId) return alert('Нет uploadId для этой страницы');
    const page = await irysService.loadPageFromIrys(uploadId);
    setContent(page.content);
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        cols={50}
      />
      <br />
      <button onClick={handleSave}>Сохранить в Irys</button>
      <button onClick={handleLoad}>Загрузить из Irys</button>
    </div>
  );
}

export default PageEditor;
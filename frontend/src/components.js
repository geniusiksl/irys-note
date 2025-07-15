import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Trash2, 
  GripVertical,
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  Image,
  List,
  CheckSquare,
  Quote,
  Divider,
  Type,
  Hash,
  MoreHorizontal,
  Search,
  Settings,
  Star,
  Clock,
  User,
  Home,
  Edit3
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Mock data for the Notion clone
const mockPages = {
  'home': {
    id: 'home',
    title: 'Getting Started',
    icon: '👋',
    cover: null,
    blocks: [
      {
        id: 'b1',
        type: 'heading1',
        content: 'Welcome to Notion Clone',
        properties: {}
      },
      {
        id: 'b2',
        type: 'paragraph',
        content: 'This is a Notion clone built with React and IrysSDK for decentralized data storage.',
        properties: {}
      },
      {
        id: 'b3',
        type: 'heading2',
        content: 'Key Features',
        properties: {}
      },
      {
        id: 'b4',
        type: 'bulletList',
        content: 'Block-based content editing',
        properties: {}
      },
      {
        id: 'b5',
        type: 'bulletList',
        content: 'Hierarchical page structure',
        properties: {}
      },
      {
        id: 'b6',
        type: 'bulletList',
        content: 'Drag and drop functionality',
        properties: {}
      },
      {
        id: 'b7',
        type: 'bulletList',
        content: 'Real-time collaboration (coming soon)',
        properties: {}
      },
      {
        id: 'b8',
        type: 'divider',
        content: '',
        properties: {}
      },
      {
        id: 'b9',
        type: 'callout',
        content: 'All your data is stored securely on the Irys network - a decentralized, permanent storage solution.',
        properties: { emoji: '💡' }
      }
    ]
  },
  'page1': {
    id: 'page1',
    title: 'My First Page',
    icon: '📝',
    cover: null,
    blocks: [
      {
        id: 'p1b1',
        type: 'heading1',
        content: 'My First Page',
        properties: {}
      },
      {
        id: 'p1b2',
        type: 'paragraph',
        content: 'This is an example page. You can create any content here!',
        properties: {}
      }
    ]
  },
  'page2': {
    id: 'page2',
    title: 'Meeting Notes',
    icon: '📋',
    cover: null,
    blocks: [
      {
        id: 'p2b1',
        type: 'heading1',
        content: 'Team Meeting - June 2025',
        properties: {}
      },
      {
        id: 'p2b2',
        type: 'paragraph',
        content: 'Date: June 15, 2025',
        properties: {}
      },
      {
        id: 'p2b3',
        type: 'heading2',
        content: 'Agenda',
        properties: {}
      },
      {
        id: 'p2b4',
        type: 'todoList',
        content: 'Review project progress',
        properties: { checked: true }
      },
      {
        id: 'p2b5',
        type: 'todoList',
        content: 'Discuss upcoming features',
        properties: { checked: false }
      },
      {
        id: 'p2b6',
        type: 'todoList',
        content: 'Plan next sprint',
        properties: { checked: false }
      }
    ]
  }
};

const mockWorkspace = {
  id: 'workspace1',
  name: 'My Workspace',
  pages: [
    { id: 'home', title: 'Getting Started', icon: '👋', children: [] },
    { id: 'page1', title: 'My First Page', icon: '📝', children: [] },
    { id: 'page2', title: 'Meeting Notes', icon: '📋', children: [] }
  ]
};

// Block Types Configuration
const blockTypes = {
  paragraph: { icon: '¶', label: 'Text', description: 'Just start writing with plain text.' },
  heading1: { icon: '#', label: 'Heading 1', description: 'Big section heading.' },
  heading2: { icon: '##', label: 'Heading 2', description: 'Medium section heading.' },
  heading3: { icon: '###', label: 'Heading 3', description: 'Small section heading.' },
  bulletList: { icon: '•', label: 'Bulleted list', description: 'Create a simple bulleted list.' },
  numberedList: { icon: '1.', label: 'Numbered list', description: 'Create a list with numbering.' },
  todoList: { icon: '☐', label: 'To-do list', description: 'Track tasks with a to-do list.' },
  quote: { icon: '"', label: 'Quote', description: 'Capture a quote.' },
  divider: { icon: '—', label: 'Divider', description: 'Visually divide blocks.' },
  callout: { icon: '💡', label: 'Callout', description: 'Make writing stand out.' },
  code: { icon: '{  }', label: 'Code', description: 'Capture a code snippet.' }
};

// Individual Block Component
const Block = ({ block, updateBlock, deleteBlock, insertBlock, isEditing, setEditingBlock }) => {
  const [content, setContent] = useState(block.content);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const textareaRef = useRef(null);
  const blockRef = useRef(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      updateBlock(block.id, { content });
      insertBlock(block.id, 'paragraph');
      setEditingBlock(null);
    }
    if (e.key === 'Escape') {
      setEditingBlock(null);
    }
  };

  const handleBlur = () => {
    updateBlock(block.id, { content });
    setEditingBlock(null);
  };

  const handleBlockTypeChange = (newType) => {
    updateBlock(block.id, { type: newType });
    setShowBlockMenu(false);
  };

  const handleTodoToggle = () => {
    updateBlock(block.id, { 
      properties: { 
        ...block.properties, 
        checked: !block.properties.checked 
      } 
    });
  };

  const renderBlockContent = () => {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full bg-transparent border-none outline-none resize-none overflow-hidden"
          style={{ 
            minHeight: '1.5rem',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit'
          }}
          autoFocus
        />
      );
    }

    const baseClasses = "w-full bg-transparent border-none outline-none cursor-text hover:bg-gray-50 p-1 rounded";
    
    switch (block.type) {
      case 'heading1':
        return (
          <h1 className={`text-3xl font-bold ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
            {content || 'Heading 1'}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className={`text-2xl font-bold ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
            {content || 'Heading 2'}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className={`text-xl font-bold ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
            {content || 'Heading 3'}
          </h3>
        );
      case 'bulletList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <div className={`flex-1 ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
              {content || 'List item'}
            </div>
          </div>
        );
      case 'numberedList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">1.</span>
            <div className={`flex-1 ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
              {content || 'List item'}
            </div>
          </div>
        );
      case 'todoList':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.properties.checked || false}
              onChange={handleTodoToggle}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div 
              className={`flex-1 ${baseClasses} ${block.properties.checked ? 'line-through text-gray-500' : ''}`}
              onClick={() => setEditingBlock(block.id)}
            >
              {content || 'To-do item'}
            </div>
          </div>
        );
      case 'quote':
        return (
          <blockquote className={`border-l-4 border-gray-300 pl-4 italic ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
            {content || 'Quote'}
          </blockquote>
        );
      case 'divider':
        return <hr className="my-4 border-gray-300" />;
      case 'callout':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">{block.properties.emoji || '💡'}</span>
            <div className={`flex-1 ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
              {content || 'Callout text'}
            </div>
          </div>
        );
      case 'code':
        return (
          <pre className={`bg-gray-100 border border-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto ${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
            {content || 'Code block'}
          </pre>
        );
      default:
        return (
          <div className={`${baseClasses}`} onClick={() => setEditingBlock(block.id)}>
            {content || 'Type \'/\' for commands'}
          </div>
        );
    }
  };

  return (
    <div 
      ref={blockRef}
      className="group relative flex items-start gap-2 py-1 hover:bg-gray-50 rounded"
      onMouseEnter={() => setShowBlockMenu(true)}
      onMouseLeave={() => setShowBlockMenu(false)}
    >
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-gray-200 rounded">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => insertBlock(block.id, 'paragraph')}
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        {renderBlockContent()}
      </div>
      
      {showBlockMenu && (
        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 hover:bg-gray-200 rounded"
            onClick={() => deleteBlock(block.id)}
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};

// Block Type Selector Component
const BlockTypeSelector = ({ onSelect, onClose, position }) => {
  const [filter, setFilter] = useState('');
  
  const filteredTypes = Object.entries(blockTypes).filter(([key, config]) =>
    config.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div 
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-80"
      style={{ top: position.y, left: position.x }}
    >
      <input
        type="text"
        placeholder="Search for a block type..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 border border-gray-200 rounded mb-2 text-sm"
        autoFocus
      />
      <div className="max-h-64 overflow-y-auto">
        {filteredTypes.map(([key, config]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-3"
          >
            <span className="text-lg w-8 text-center">{config.icon}</span>
            <div>
              <div className="font-medium text-sm">{config.label}</div>
              <div className="text-xs text-gray-500">{config.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ workspace, currentPageId, onPageSelect, onNewPage }) => {
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpanded = (pageId) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const filteredPages = workspace.pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            {workspace.name.charAt(0)}
          </div>
          <span className="font-semibold text-gray-800">{workspace.name}</span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-left text-sm">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-left text-sm">
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>
          <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-left text-sm">
            <Clock className="w-4 h-4" />
            <span>Recent</span>
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pages</span>
            <button
              onClick={onNewPage}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-1">
            {filteredPages.map((page) => (
              <div key={page.id}>
                <div 
                  className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                    currentPageId === page.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => onPageSelect(page.id)}
                >
                  <span className="text-sm">{page.icon}</span>
                  <span className="text-sm flex-1 truncate">{page.title}</span>
                  {page.children && page.children.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(page.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {expandedPages.has(page.id) ? 
                        <ChevronDown className="w-3 h-3" /> : 
                        <ChevronRight className="w-3 h-3" />
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">User</div>
            <div className="text-xs text-gray-500">user@example.com</div>
          </div>
          <button className="p-1 hover:bg-gray-200 rounded">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Page Editor Component
const PageEditor = ({ page, onPageUpdate }) => {
  const [editingBlock, setEditingBlock] = useState(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [currentBlocks, setCurrentBlocks] = useState(page.blocks || []);

  const updateBlock = (blockId, updates) => {
    const newBlocks = currentBlocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setCurrentBlocks(newBlocks);
    onPageUpdate({ ...page, blocks: newBlocks });
  };

  const deleteBlock = (blockId) => {
    const newBlocks = currentBlocks.filter(block => block.id !== blockId);
    setCurrentBlocks(newBlocks);
    onPageUpdate({ ...page, blocks: newBlocks });
  };

  const insertBlock = (afterBlockId, type = 'paragraph') => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: '',
      properties: {}
    };
    
    const afterIndex = currentBlocks.findIndex(block => block.id === afterBlockId);
    const newBlocks = [
      ...currentBlocks.slice(0, afterIndex + 1),
      newBlock,
      ...currentBlocks.slice(afterIndex + 1)
    ];
    
    setCurrentBlocks(newBlocks);
    onPageUpdate({ ...page, blocks: newBlocks });
    setEditingBlock(newBlock.id);
  };

  const handlePageTitleChange = (e) => {
    onPageUpdate({ ...page, title: e.target.value });
  };

  const handleBlockTypeSelect = (blockType) => {
    if (editingBlock) {
      updateBlock(editingBlock, { type: blockType });
    }
    setShowBlockSelector(false);
  };

  return (
    <div className="flex-1 bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{page.icon}</span>
            <input
              type="text"
              value={page.title}
              onChange={handlePageTitleChange}
              className="text-4xl font-bold bg-transparent border-none outline-none flex-1 placeholder-gray-400"
              placeholder="Untitled"
            />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-1">
            {currentBlocks.map((block) => (
              <Block
                key={block.id}
                block={block}
                updateBlock={updateBlock}
                deleteBlock={deleteBlock}
                insertBlock={insertBlock}
                isEditing={editingBlock === block.id}
                setEditingBlock={setEditingBlock}
              />
            ))}
            
            {/* Add new block button */}
            <div className="flex items-center gap-2 py-4">
              <button
                onClick={() => insertBlock(currentBlocks[currentBlocks.length - 1]?.id || 'new', 'paragraph')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Click to add a block</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Block Type Selector */}
      {showBlockSelector && (
        <BlockTypeSelector
          onSelect={handleBlockTypeSelect}
          onClose={() => setShowBlockSelector(false)}
          position={blockSelectorPosition}
        />
      )}
    </div>
  );
};

// Main Notion Clone Component
export const NotionClone = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  
  const [workspace, setWorkspace] = useState(mockWorkspace);
  const [pages, setPages] = useState(mockPages);
  const [currentPageId, setCurrentPageId] = useState(pageId || 'home');
  const [currentPage, setCurrentPage] = useState(pages[currentPageId] || pages.home);

  useEffect(() => {
    if (pageId && pages[pageId]) {
      setCurrentPageId(pageId);
      setCurrentPage(pages[pageId]);
    } else {
      navigate('/page/home');
    }
  }, [pageId, pages, navigate]);

  const handlePageSelect = (selectedPageId) => {
    navigate(`/page/${selectedPageId}`);
  };

  const handleNewPage = () => {
    const newPageId = uuidv4();
    const newPage = {
      id: newPageId,
      title: 'Untitled',
      icon: '📄',
      cover: null,
      blocks: [
        {
          id: uuidv4(),
          type: 'paragraph',
          content: '',
          properties: {}
        }
      ]
    };
    
    setPages(prev => ({ ...prev, [newPageId]: newPage }));
    setWorkspace(prev => ({
      ...prev,
      pages: [...prev.pages, { id: newPageId, title: 'Untitled', icon: '📄', children: [] }]
    }));
    
    navigate(`/page/${newPageId}`);
  };

  const handlePageUpdate = (updatedPage) => {
    setPages(prev => ({ ...prev, [updatedPage.id]: updatedPage }));
    setCurrentPage(updatedPage);
    
    // Update workspace pages list
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === updatedPage.id 
          ? { ...page, title: updatedPage.title, icon: updatedPage.icon }
          : page
      )
    }));
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        workspace={workspace}
        currentPageId={currentPageId}
        onPageSelect={handlePageSelect}
        onNewPage={handleNewPage}
      />
      
      <PageEditor
        page={currentPage}
        onPageUpdate={handlePageUpdate}
      />
    </div>
  );
};
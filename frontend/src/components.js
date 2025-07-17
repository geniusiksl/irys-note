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
  Edit3,
  Database,
  Cloud,
  Shield,
  Zap,
  Wallet,
  X,
  FolderPlus,
  Folder,
  BookOpen,
  Heart,
  Archive,
  Layout,
  Sparkles,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { irysService } from './irysService';

// Mock data for the Notion clone
const mockProjects = {
  'personal': {
    id: 'personal',
    name: 'Personal',
    icon: '👤',
    color: '#3B82F6',
    pages: ['home', 'page1']
  },
  'work': {
    id: 'work',
    name: 'Work Projects',
    icon: '💼',
    color: '#10B981',
    pages: ['page2']
  },
  'learning': {
    id: 'learning',
    name: 'Learning & Development',
    icon: '📚',
    color: '#8B5CF6',
    pages: []
  }
};

const mockPages = {
  'home': {
    id: 'home',
    title: 'Getting Started',
    icon: '👋',
    cover: null,
    projectId: 'personal',
    isFavorite: false,
    lastModified: Date.now(),
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
        content: 'Block-based content editing with slash commands',
        properties: {}
      },
      {
        id: 'b5',
        type: 'bulletList',
        content: 'Hierarchical page structure with projects',
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
        content: 'Real-time auto-save with wallet integration',
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
        content: 'Connect your wallet to store your data permanently on the Irys decentralized network. Your content will be immutable and accessible anywhere.',
        properties: { emoji: '🔐' }
      },
      {
        id: 'b10',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxwcm9kdWN0aXZpdHklMjB3b3Jrc3BhY2V8ZW58MHx8fGJsdWV8MTc1MjU4ODE4N3ww&ixlib=rb-4.1.0&q=85',
        properties: { caption: 'Clean, organized workspace - just like your Notion clone' }
      }
    ]
  },
  'page1': {
    id: 'page1',
    title: 'My First Page',
    icon: '📝',
    cover: null,
    projectId: 'personal',
    isFavorite: true,
    lastModified: Date.now() - 86400000, // 1 day ago
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
        content: 'This is an example page. You can create any content here using the slash commands!',
        properties: {}
      },
      {
        id: 'p1b3',
        type: 'heading2',
        content: 'Try these commands:',
        properties: {}
      },
      {
        id: 'p1b4',
        type: 'bulletList',
        content: 'Type "/" to see all available block types',
        properties: {}
      },
      {
        id: 'p1b5',
        type: 'bulletList',
        content: 'Type "/h1" for a heading',
        properties: {}
      },
      {
        id: 'p1b6',
        type: 'bulletList',
        content: 'Type "/todo" for a to-do list',
        properties: {}
      }
    ]
  },
  'page2': {
    id: 'page2',
    title: 'Meeting Notes',
    icon: '📋',
    cover: null,
    projectId: 'work',
    isFavorite: false,
    lastModified: Date.now() - 172800000, // 2 days ago
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
  projects: mockProjects,
  recentPages: ['home', 'page1', 'page2'],
  favorites: ['page1']
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
  code: { icon: '{  }', label: 'Code', description: 'Capture a code snippet.' },
  image: { icon: '🖼️', label: 'Image', description: 'Upload or embed an image.' }
};

// Wallet Connection Modal Component
const WalletConnectModal = ({ isOpen, onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      const result = await irysService.connectWallet();
      if (result.success) {
        onConnect(result.address);
        onClose();
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Irys Decentralized Storage</h3>
              <p className="text-sm text-gray-600">Connect your wallet to store data permanently</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Why connect your wallet?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Permanent, immutable storage on Irys network</li>
                  <li>• Your data is accessible from anywhere</li>
                  <li>• No central authority can delete your content</li>
                  <li>• Cryptographically secured with your wallet</li>
                </ul>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect MetaMask</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Continue without wallet (localStorage only)
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>By connecting your wallet, you agree to store data on the Irys network.</p>
        </div>
      </div>
    </div>
  );
};

// Individual Block Component
const Block = ({ block, updateBlock, deleteBlock, insertBlock, isEditing, setEditingBlock }) => {
  const [content, setContent] = useState(block.content);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [typeSelectorPosition, setTypeSelectorPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);
  const blockRef = useRef(null);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    
    // Check for slash command
    if (newContent === '/') {
      const rect = e.target.getBoundingClientRect();
      setTypeSelectorPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
      setShowTypeSelector(true);
    } else if (showTypeSelector && !newContent.startsWith('/')) {
      setShowTypeSelector(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showTypeSelector) {
        setShowTypeSelector(false);
        return;
      }
      updateBlock(block.id, { content });
      insertBlock(block.id, 'paragraph');
      setEditingBlock(null);
    }
    if (e.key === 'Escape') {
      setShowTypeSelector(false);
      setEditingBlock(null);
    }
    if (e.key === 'Backspace' && content === '' && block.type !== 'paragraph') {
      updateBlock(block.id, { type: 'paragraph' });
    }
  };

  const handleBlur = () => {
    if (!showTypeSelector) {
      updateBlock(block.id, { content });
      setEditingBlock(null);
    }
  };

  const handleBlockTypeChange = (newType) => {
    updateBlock(block.id, { type: newType, content: content.replace('/', '') });
    setShowTypeSelector(false);
  };

  const handleTodoToggle = () => {
    updateBlock(block.id, { 
      properties: { 
        ...block.properties, 
        checked: !block.properties.checked 
      } 
    });
  };

  const handleClick = () => {
    setEditingBlock(block.id);
  };

  const renderBlockContent = () => {
    if (isEditing) {
      return (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full bg-transparent border-none outline-none resize-none overflow-hidden min-h-[1.5rem]"
            style={{ 
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit'
            }}
            placeholder="Type '/' for commands"
          />
          {showTypeSelector && (
            <BlockTypeSelector
              onSelect={handleBlockTypeChange}
              onClose={() => setShowTypeSelector(false)}
              position={typeSelectorPosition}
            />
          )}
        </div>
      );
    }

    const baseClasses = "w-full bg-transparent border-none outline-none cursor-text hover:bg-gray-50 p-1 rounded min-h-[1.5rem]";
    
    switch (block.type) {
      case 'heading1':
        return (
          <h1 className={`text-3xl font-bold ${baseClasses}`} onClick={handleClick}>
            {content || 'Heading 1'}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className={`text-2xl font-bold ${baseClasses}`} onClick={handleClick}>
            {content || 'Heading 2'}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className={`text-xl font-bold ${baseClasses}`} onClick={handleClick}>
            {content || 'Heading 3'}
          </h3>
        );
      case 'bulletList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1 select-none">•</span>
            <div className={`flex-1 ${baseClasses}`} onClick={handleClick}>
              {content || 'List item'}
            </div>
          </div>
        );
      case 'numberedList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1 select-none">1.</span>
            <div className={`flex-1 ${baseClasses}`} onClick={handleClick}>
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
              className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div 
              className={`flex-1 ${baseClasses} ${block.properties.checked ? 'line-through text-gray-500' : ''}`}
              onClick={handleClick}
            >
              {content || 'To-do item'}
            </div>
          </div>
        );
      case 'quote':
        return (
          <blockquote className={`border-l-4 border-gray-300 pl-4 italic ${baseClasses}`} onClick={handleClick}>
            {content || 'Quote'}
          </blockquote>
        );
      case 'divider':
        return <hr className="my-4 border-gray-300" />;
      case 'callout':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 my-2">
            <span className="text-xl select-none">{block.properties.emoji || '💡'}</span>
            <div className={`flex-1 ${baseClasses}`} onClick={handleClick}>
              {content || 'Callout text'}
            </div>
          </div>
        );
      case 'code':
        return (
          <pre className={`bg-gray-100 border border-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto ${baseClasses}`} onClick={handleClick}>
            {content || 'Code block'}
          </pre>
        );
      case 'image':
        return (
          <div className="my-4">
            {content ? (
              <div className="space-y-2">
                <img 
                  src={content} 
                  alt={block.properties.caption || 'Image'}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div 
                  className="hidden border-2 border-dashed border-red-300 rounded-lg p-4 text-center text-red-600"
                  onClick={handleClick}
                >
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Failed to load image</p>
                  <p className="text-xs">Click to edit URL</p>
                </div>
                {block.properties.caption && (
                  <p className="text-sm text-gray-600 italic text-center">
                    {block.properties.caption}
                  </p>
                )}
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${baseClasses}`}
                onClick={handleClick}
              >
                <div className="text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-2" />
                  <p>Click to add an image</p>
                  <p className="text-sm">Paste a URL or upload an image</p>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className={`${baseClasses}`} onClick={handleClick}>
            {content || "Type '/' for commands"}
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
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => insertBlock(block.id, 'paragraph')}
          title="Add block below"
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
            title="Delete block"
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
  const selectorRef = useRef(null);
  
  const filteredTypes = Object.entries(blockTypes).filter(([key, config]) =>
    config.label.toLowerCase().includes(filter.toLowerCase()) ||
    config.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      ref={selectorRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-80 max-h-96 overflow-y-auto"
      style={{ 
        top: Math.min(position.y, window.innerHeight - 400),
        left: Math.min(position.x, window.innerWidth - 320)
      }}
    >
      <input
        type="text"
        placeholder="Search for a block type..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 border border-gray-200 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="space-y-1">
        {filteredTypes.length > 0 ? (
          filteredTypes.map(([key, config]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-3 transition-colors"
            >
              <span className="text-lg w-8 text-center flex-shrink-0">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-800">{config.label}</div>
                <div className="text-xs text-gray-500 truncate">{config.description}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No blocks found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ workspace, currentPageId, onPageSelect, onNewPage }) => {
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [irysStatus, setIrysStatus] = useState('ready');
  const [storageStats, setStorageStats] = useState(null);

  // Check Irys status
  useEffect(() => {
    const checkIrysStatus = async () => {
      const isReady = irysService.isReady();
      setIrysStatus(isReady ? 'ready' : 'connecting');
      
      if (isReady) {
        const stats = await irysService.getStorageStats();
        setStorageStats(stats);
      }
    };
    
    checkIrysStatus();
    const interval = setInterval(checkIrysStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  const handleSyncData = async () => {
    setIrysStatus('syncing');
    // Mock sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIrysStatus('ready');
  };

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

      {/* Irys Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              irysStatus === 'ready' ? 'bg-green-500' : 
              irysStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs font-medium text-gray-600">
              Irys Network
            </span>
          </div>
          <button
            onClick={handleSyncData}
            className="ml-auto p-1 hover:bg-gray-200 rounded"
            disabled={irysStatus === 'syncing'}
          >
            <Cloud className={`w-4 h-4 text-gray-400 ${irysStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {storageStats && (
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{storageStats.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{storageStats.totalSize}</span>
            </div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Decentralized Storage</span>
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
          <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-left text-sm">
            <Database className="w-4 h-4" />
            <span>Templates</span>
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
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save functionality
  useEffect(() => {
    const saveToIrys = async () => {
      if (saveStatus === 'saving') return;
      
      setSaveStatus('saving');
      try {
        const result = await irysService.savePage(page);
        console.log('Page saved to Irys:', result);
        setSaveStatus('saved');
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to save to Irys:', error);
        setSaveStatus('error');
      }
    };

    // Auto-save every 5 seconds when there are changes
    const saveTimeout = setTimeout(saveToIrys, 5000);
    return () => clearTimeout(saveTimeout);
  }, [page, saveStatus]);

  const updateBlock = (blockId, updates) => {
    const newBlocks = currentBlocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setCurrentBlocks(newBlocks);
    const updatedPage = { ...page, blocks: newBlocks };
    onPageUpdate(updatedPage);
    setSaveStatus('unsaved');
  };

  const deleteBlock = (blockId) => {
    const newBlocks = currentBlocks.filter(block => block.id !== blockId);
    setCurrentBlocks(newBlocks);
    const updatedPage = { ...page, blocks: newBlocks };
    onPageUpdate(updatedPage);
    setSaveStatus('unsaved');
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
    const updatedPage = { ...page, blocks: newBlocks };
    onPageUpdate(updatedPage);
    setEditingBlock(newBlock.id);
    setSaveStatus('unsaved');
  };

  const handlePageTitleChange = (e) => {
    const updatedPage = { ...page, title: e.target.value };
    onPageUpdate(updatedPage);
    setSaveStatus('unsaved');
  };

  const handleBlockTypeSelect = (blockType) => {
    if (editingBlock) {
      updateBlock(editingBlock, { type: blockType });
    }
    setShowBlockSelector(false);
  };

  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      const result = await irysService.savePage(page);
      console.log('Page manually saved to Irys:', result);
      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to save to Irys:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="flex-1 bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Save Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved' ? 'bg-green-500' : 
                saveStatus === 'saving' ? 'bg-yellow-500' : 
                saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span>
                {saveStatus === 'saved' && lastSaved ? `Saved at ${lastSaved}` :
                 saveStatus === 'saving' ? 'Saving to Irys...' :
                 saveStatus === 'error' ? 'Save failed' : 'Unsaved changes'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Cloud className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
                {saveStatus === 'saving' ? 'Saving...' : 'Save to Irys'}
              </button>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>Auto-save enabled</span>
              </div>
            </div>
          </div>

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
  const [loading, setLoading] = useState(true);

  // Initialize and load data from Irys
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // Try to load existing workspace data
        const savedWorkspace = await irysService.loadWorkspace('main-workspace');
        if (savedWorkspace) {
          setWorkspace(savedWorkspace);
        }

        // Load all pages
        const savedPages = {};
        for (const page of mockWorkspace.pages) {
          try {
            const savedPage = await irysService.loadPage(page.id);
            if (savedPage) {
              savedPages[page.id] = savedPage;
            } else {
              savedPages[page.id] = mockPages[page.id];
            }
          } catch (error) {
            console.error(`Failed to load page ${page.id}:`, error);
            savedPages[page.id] = mockPages[page.id];
          }
        }
        
        setPages(savedPages);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize workspace:', error);
        setLoading(false);
      }
    };

    initializeWorkspace();
  }, []);

  // Auto-save workspace changes
  useEffect(() => {
    const saveWorkspace = async () => {
      try {
        await irysService.saveWorkspace(workspace);
        console.log('Workspace saved to Irys');
      } catch (error) {
        console.error('Failed to save workspace:', error);
      }
    };

    const saveTimeout = setTimeout(saveWorkspace, 3000);
    return () => clearTimeout(saveTimeout);
  }, [workspace]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your workspace...</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Cloud className="w-4 h-4" />
            <span>Connecting to Irys Network</span>
          </div>
        </div>
      </div>
    );
  }

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
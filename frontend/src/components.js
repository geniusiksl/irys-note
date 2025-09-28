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
  Image as ImageIcon,
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
  Menu,
  Lock,
  Globe,
  Share2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { irysService } from './irysService';


// ImageBlock Component
const ImageBlock = ({ src, caption, onError, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = () => {
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
      // Retry loading the image
      const img = new Image();
      img.onload = () => setImageError(false);
      img.onerror = () => setImageError(true);
      img.src = src;
    } else {
      setImageError(true);
      if (onError) onError();
    }
  };

  if (imageError) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-red-300 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 text-red-500 flex items-center justify-center text-2xl">
            🖼️
          </div>
          <p className="text-red-600 mb-2">Failed to load image</p>
          <button
            onClick={() => {
              setRetryCount(0);
              setImageError(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Retry
          </button>
          <button
            onClick={onClick}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Edit URL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="space-y-2">
        <img 
          src={src} 
          alt={caption || 'Image'}
          className="max-w-full h-auto rounded-lg shadow-sm cursor-pointer"
          onError={handleImageError}
          onClick={onClick}
          draggable="false"
        />
        {caption && (
          <p className="text-sm text-gray-600 italic text-center">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};

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

// Функции для работы с localStorage
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
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
        content: 'Welcome to the IrysNote', // ИЗМЕНИТЬ ЗДЕСЬ
        properties: {}
      },
      {
        id: 'b2',
        type: 'paragraph',
        content: 'This is a Note built with React and IrysSDK for decentralized data storage.', // ИЗМЕНИТЬ ЗДЕСЬ
        properties: {}
      },
      {
        id: 'b3',
        type: 'heading2',
        content: 'Key Features', // ИЗМЕНИТЬ ЗДЕСЬ
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
        properties: { caption: 'Clean, organized workspace - just like your Note on Irys' }
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
  image: { icon: '🖼️', label: 'Image', description: 'Upload or embed an image.' },
  emoji: { icon: '😊', label: 'Emoji', description: 'Add an emoji to your content.' },
  database: { icon: '📊', label: 'Database', description: 'Add a table/database to your page.' },
};

// Emoji Picker Component
const EmojiPicker = ({ isOpen, onClose, onSelect, position }) => {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('people');
  const pickerRef = useRef(null);

  const emojiCategories = {
    people: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
    nature: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '☃️', '⛄', '❄️', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍷', '🥂', '🥃', '🍸', '🍹', '🧉', '🍾', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🎨', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🎮', '🎰', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻'],
    objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🎮', '🎰', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '📺', '📻', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🪃', '🏹', '🛡️', '🪄', '🔮', '🧿', '🪬', '📿', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🪃', '🏹', '🛡️', '🪄', '🔮', '🧿', '🪬', '📿'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '��️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
    flags: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼']
  };

  const getFilteredEmojis = () => {
    const emojis = emojiCategories[category] || [];
    if (!filter) return emojis;
    return emojis.filter(emoji => emoji.includes(filter));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
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

  if (!isOpen) return null;

  return (
    <div 
      ref={pickerRef}
      className="fixed z-[9998] bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-80 max-h-96 overflow-hidden"
      style={{ 
        top: Math.min(position.y, window.innerHeight - 400),
        left: Math.min(position.x, window.innerWidth - 320)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setCategory('people')}
            className={`p-2 rounded ${category === 'people' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            😊
          </button>
          <button
            onClick={() => setCategory('nature')}
            className={`p-2 rounded ${category === 'nature' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            🌱
          </button>
          <button
            onClick={() => setCategory('food')}
            className={`p-2 rounded ${category === 'food' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            🍎
          </button>
          <button
            onClick={() => setCategory('activities')}
            className={`p-2 rounded ${category === 'activities' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            ⚽
          </button>
          <button
            onClick={() => setCategory('objects')}
            className={`p-2 rounded ${category === 'objects' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            📱
          </button>
          <button
            onClick={() => setCategory('symbols')}
            className={`p-2 rounded ${category === 'symbols' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            ❤️
          </button>
          <button
            onClick={() => setCategory('flags')}
            className={`p-2 rounded ${category === 'flags' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            🏁
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
        {getFilteredEmojis().map((emoji, index) => (
          <button
            key={index}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Wallet Connection Modal Component
const WalletConnectModal = ({ isOpen, onClose, onConnect, isDarkMode = false }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className={`rounded-lg p-6 w-full max-w-md mx-4 relative transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Connect Wallet</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
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
              <h3 className={`font-medium transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Irys Decentralized Storage</h3>
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Connect your wallet to store data permanently</p>
            </div>
          </div>
          
          <div className={`border rounded-lg p-4 mb-4 transition-colors ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className={`font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>Why connect your wallet?</h4>
                <ul className={`text-sm space-y-1 transition-colors ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  <li>• Permanent, immutable storage on Irys network</li>
                  <li>• Your data is accessible from anywhere</li>
                  <li>• No central authority can delete your content</li>
                  <li>• Cryptographically secured with your wallet</li>
                </ul>
              </div>
            </div>
          </div>
          
          {error && (
            <div className={`border rounded-lg p-3 mb-4 transition-colors ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-700' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-red-300' : 'text-red-700'
              }`}>{error}</p>
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
                <span>Connect Wallet</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
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
const Block = ({ block, updateBlock, deleteBlock, insertBlock, isEditing, setEditingBlock, isDarkMode, onDragStart, onDragOver, onDrop, index }) => {
  const [content, setContent] = useState(block.content);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typeSelectorPosition, setTypeSelectorPosition] = useState({ x: 0, y: 0 });
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
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
    } else if (newContent.startsWith('/emoji')) {
      const rect = e.target.getBoundingClientRect();
      setEmojiPickerPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
      setShowEmojiPicker(true);
    } else if (newContent.startsWith('/image')) {
      // Handle image command
      const imageUrl = prompt('Enter image URL:');
      if (imageUrl) {
        updateBlock(block.id, { type: 'image', content: imageUrl });
        setContent(''); // Clear the /image command
      } else {
        // If user cancels, keep the /image text for editing
        setContent('/image');
      }
      setShowTypeSelector(false);
    } else if (newContent.startsWith('http') && (newContent.includes('.jpg') || newContent.includes('.jpeg') || newContent.includes('.png') || newContent.includes('.gif') || newContent.includes('.webp'))) {
      // Auto-detect image URLs
      updateBlock(block.id, { type: 'image', content: newContent });
      setShowTypeSelector(false);
    } else if (showTypeSelector && !newContent.startsWith('/')) {
      setShowTypeSelector(false);
    } else if (showEmojiPicker && !newContent.startsWith('/')) {
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showTypeSelector) {
        setShowTypeSelector(false);
        return;
      }
      // Don't create new block for image type
      if (block.type === 'image') {
        setEditingBlock(null);
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

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.startsWith('http') && (pastedText.includes('.jpg') || pastedText.includes('.jpeg') || pastedText.includes('.png') || pastedText.includes('.gif') || pastedText.includes('.webp'))) {
      e.preventDefault();
      updateBlock(block.id, { type: 'image', content: pastedText });
    }
  };

  const handleBlur = () => {
    if (!showTypeSelector) {
      updateBlock(block.id, { content });
      setEditingBlock(null);
    }
  };

  const handleBlockTypeChange = (newType) => {
    setShowTypeSelector(false);

    if (newType === 'emoji') {
      const rect = textareaRef.current?.getBoundingClientRect();
      if (rect) {
        setEmojiPickerPosition({
          x: rect.left,
          y: rect.bottom + 2
        });
        setShowEmojiPicker(true);
      }
    } else if (newType === 'database') {
      // Если текущий блок пустой, удаляем его перед вставкой таблицы
      if (!content.trim()) {
        deleteBlock(block.id);
      }
      // Создаем новый блок database с уникальным tableId
      const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      insertBlock(block.id, 'database', { tableId });
      setContent(''); // Очищаем содержимое блока, чтобы / исчезал
      setEditingBlock(null); // Завершаем редактирование сразу
      return;
    } else {
      updateBlock(block.id, { type: newType, content: content.replace('/', '') });
      setContent('');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }, 10);
    }
  };

  const handleEmojiSelect = (emoji) => {
    updateBlock(block.id, { content: emoji });
    setShowEmojiPicker(false);
    setContent(''); // Clear the /emoji command
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

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(block.id, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (onDragOver) onDragOver(e, index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedBlockId = e.dataTransfer.getData('text/plain');
    if (onDrop && draggedBlockId !== block.id) {
      onDrop(e, draggedBlockId, index);
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.borderTop = '';
  };

  const renderBlockContent = () => {
    if (isEditing) {
      return (
        <div className="relative">
          <textarea
            ref={textareaRef}
            data-block-id={block.id}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
            className="w-full bg-transparent border-none outline-none overflow-hidden min-h-[1.5rem] cursor-text"
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
          {showEmojiPicker && (
            <EmojiPicker
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onSelect={handleEmojiSelect}
              position={emojiPickerPosition}
            />
          )}
        </div>
      );
    }

    const baseClasses = isEditing 
    ? `min-h-[1.5rem] p-2 border rounded focus:outline-none focus:ring-2 resize-none transition-colors ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-800 text-white focus:ring-blue-400 focus:border-blue-400' 
          : 'border-blue-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500'
      }`
    : `min-h-[1.5rem] cursor-text transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`;
    
    switch (block.type) {
      case 'heading1':
        return (
          <h1 className={`text-3xl font-bold ${baseClasses} break-words`} onClick={handleClick} title="Click to edit block" style={{ wordBreak: 'break-word', overflow: 'visible' }}>
            {content || <span className="text-gray-400">Click to edit heading</span>}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className={`text-2xl font-bold ${baseClasses} break-words`} onClick={handleClick} style={{ wordBreak: 'break-word', overflow: 'visible' }}>
            {content || 'Heading 2'}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className={`text-xl font-bold ${baseClasses} break-words`} onClick={handleClick} style={{ wordBreak: 'break-word', overflow: 'visible' }}>
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
          <blockquote className={`border-l-4 pl-4 italic transition-colors ${
            isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
          } ${baseClasses}`} onClick={handleClick}>
            {content || 'Quote'}
          </blockquote>
        );
      case 'divider':
        return <hr className={`my-4 transition-colors ${
          isDarkMode ? 'border-gray-600' : 'border-gray-300'
        }`} />;
      case 'callout':
        return (
          <div className={`border rounded-lg p-4 flex items-start gap-3 my-2 transition-colors ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <span className="text-xl select-none">{block.properties.emoji || '💡'}</span>
            <div className={`flex-1 ${baseClasses}`} onClick={handleClick}>
              {content || 'Callout text'}
            </div>
          </div>
        );
      case 'code':
        return (
          <pre className={`border rounded-lg p-4 font-mono text-sm overflow-x-auto transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 text-gray-200' 
              : 'bg-gray-100 border-gray-200 text-gray-800'
          } ${baseClasses}`} onClick={handleClick}>
            {content || 'Code block'}
          </pre>
        );
      case 'image':
        return content ? (
          <ImageBlock
            src={content}
            caption={block.properties.caption}
            onError={() => {
              const newUrl = prompt('Image failed to load. Enter new URL:');
              if (newUrl) {
                updateBlock(block.id, { content: newUrl });
              }
            }}
            onClick={handleClick}
          />
        ) : (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-800/50' 
                : 'border-gray-300 bg-gray-50'
            } ${baseClasses}`}
            onClick={handleClick}
          >
            <div className={`transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="w-12 h-12 mx-auto mb-2 text-4xl flex items-center justify-center">
                🖼️
              </div>
              <p>Click to add an image</p>
              <p className="text-sm">Type /image or paste a URL</p>
            </div>
          </div>
        );
      case 'emoji':
        return (
          <div className={`text-4xl ${baseClasses}`} onClick={handleClick}>
            {content || '😊'}
          </div>
        );
      case 'database':
        return <EditableTable tableId={block.properties?.tableId || block.id} isDarkMode={isDarkMode} blockId={block.id} />;
      case 'paragraph':
        return (
          <div className={`${baseClasses}`} onClick={handleClick} title="Click to edit block">
            {content || <span className={`transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>Type '/' for commands or click to edit</span>}
          </div>
        );
      default:
        return (
          <div className={`${baseClasses}`} onClick={handleClick} title="Click to edit block">
            {content || <span className={`transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>Type '/' for commands or click to edit</span>}
          </div>
        );
    }
  };

  return (
    <div 
      ref={blockRef}
      className={`group relative flex items-start gap-2 py-1 rounded transition-colors ${
        isDarkMode 
          ? 'hover:bg-gray-800' 
          : 'hover:bg-gray-50'
      }`}
      onMouseEnter={() => setShowBlockMenu(true)}
      onMouseLeave={() => setShowBlockMenu(false)}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className={`p-1 rounded cursor-grab active:cursor-grabbing transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
          title="Drag to reorder"
          // drag handled by parent div
        >
          <GripVertical className={`w-4 h-4 transition-colors ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </button>
        <button 
          className={`p-1 rounded transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
          onClick={() => insertBlock(block.id, 'paragraph')}
          title="Add block below"
        >
          <Plus className={`w-4 h-4 transition-colors ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        {renderBlockContent()}
      </div>
      
      {showBlockMenu && (
        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            onClick={() => deleteBlock(block.id)}
            title="Delete block"
          >
            <Trash2 className={`w-4 h-4 transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </button>
        </div>
      )}
    </div>
  );
};

// Block Type Selector Component
const BlockTypeSelector = ({ onSelect, onClose, position, isDarkMode = false }) => {
  const [filter, setFilter] = useState('');
  const selectorRef = useRef(null);
  
  const filteredTypes = Object.entries(blockTypes).filter(([key, config]) =>
    config.label.toLowerCase().includes(filter.toLowerCase()) ||
    config.description.toLowerCase().includes(filter.toLowerCase()) ||
    key === 'image' // Always show image option
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
      className={`fixed z-[9998] border rounded-lg shadow-lg p-2 w-80 max-h-96 overflow-y-auto transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}
      style={{ 
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        top: Math.min(position.y, window.innerHeight - 400),
        left: Math.min(position.x, window.innerWidth - 320)
      }}
    >
      <input
        type="text"
        placeholder="Search for a block type..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={`w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
        }`}
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          color: isDarkMode ? '#ffffff' : '#111827'
        }}
        autoFocus
      />
      <div className="space-y-1">
        {filteredTypes.length > 0 ? (
          filteredTypes.map(([key, config]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
              style={{
                color: isDarkMode ? '#ffffff' : '#111827'
              }}
            >
              <span className="text-lg w-8 text-center flex-shrink-0">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div 
                  className={`font-medium text-sm transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}
                >{config.label}</div>
                <div 
                  className={`text-xs truncate transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >{config.description}</div>
              </div>
            </button>
          ))
        ) : (
          <div 
            className={`text-center py-4 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
          >
            <p className="text-sm">No blocks found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ workspace, currentPageId, onPageSelect, onNewPage, onNewProject, currentView, onViewChange, onProjectUpdate, onProjectDelete, onPageDelete, pages, onWalletDisconnect, walletStatus, onProjectSelect, onResetData, onWalletConnect, setShowWalletModal, toggleTheme, isDarkMode }) => {
  const [expandedProjects, setExpandedProjects] = useState(new Set(['personal', 'work']));
  const [searchTerm, setSearchTerm] = useState('');
  const [irysStatus, setIrysStatus] = useState('ready');
  const [storageStats, setStorageStats] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectIcon, setEditingProjectIcon] = useState('');

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

  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleProjectEdit = (project) => {
    setEditingProject(project.id);
    setEditingProjectName(project.name);
    // Убираем редактирование иконки
    setEditingProjectIcon(project.icon);
  };

  const handleProjectSave = () => {
    if (editingProject && onProjectUpdate) {
      const updatedProject = {
        ...workspace.projects[editingProject],
        name: editingProjectName,
        // Оставляем оригинальную иконку
        icon: workspace.projects[editingProject].icon
      };
      onProjectUpdate(editingProject, updatedProject);
    }
    setEditingProject(null);
    setEditingProjectName('');
    setEditingProjectIcon('');
  };

  const handleProjectCancel = () => {
    setEditingProject(null);
    setEditingProjectName('');
    setEditingProjectIcon('');
  };

  const handleProjectDelete = (projectId) => {
    if (onProjectDelete && confirm('Are you sure you want to delete this project?')) {
      onProjectDelete(projectId);
    }
  };

  const handleWalletDisconnect = async () => {
    if (onWalletDisconnect) {
      await onWalletDisconnect();
    }
  };

  const handleSyncData = async () => {
    setIrysStatus('syncing');
    // Mock sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIrysStatus('ready');
  };

  const handleWalletConnect = (address) => {
    onWalletConnect(address);
  };

  const getFilteredPages = () => {
    const allPages = Object.values(pages || []);
    
    if (currentView === 'favorites') {
      return allPages.filter(page => page.isFavorite);
    }
    
    if (currentView === 'recent') {
      return allPages
        .sort((a, b) => b.lastModified - a.lastModified)
        .slice(0, 10);
    }
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return allPages.filter(page => {
        const titleLower = page.title.toLowerCase();
        // Strict search: letters must be in order as typed by user
        return titleLower.includes(searchLower);
      });
    }
    
    return allPages;
  };

  // Исправлено: показываем все страницы с projectId = projectId
  const getProjectPages = (projectId) => {
    let filtered = Object.values(pages || {}).filter(page => page.projectId === projectId);
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(page => {
        const titleLower = page.title.toLowerCase();
        // Strict search: letters must be in order as typed by user
        return titleLower.includes(searchLower);
      });
    }
    
    return filtered;
  };

  return (
    <div className={`w-80 h-screen flex flex-col overflow-hidden sticky top-0 border-r transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Workspace Header */}
      <div className={`p-4 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            {typeof workspace.name === 'string' ? workspace.name.charAt(0) : ''}
          </div>
          <span className={`font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>{workspace.name}</span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Wallet Status */}
      <div className={`p-4 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              irysStatus === 'ready' ? 'bg-green-500' : 
              irysStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-xs font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Irys Network
            </span>
          </div>
          <button
            onClick={handleSyncData}
            className={`ml-auto p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            disabled={irysStatus === 'syncing'}
          >
            <Cloud className={`w-4 h-4 transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            } ${irysStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {walletStatus?.connected ? (
          <div className={`text-xs space-y-1 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="flex items-center gap-2">
              <Wallet className="w-3 h-3" />
              <span className="truncate">
  {typeof walletStatus.address === 'string'
    ? `${walletStatus.address.slice(0, 8)}...${walletStatus.address.slice(-4)}`
    : ''}
</span>
            </div>
            <div className="flex justify-between">
              <span>Decentralized:</span>
              <span className="text-green-600">✓</span>
            </div>
            <button
              onClick={handleWalletDisconnect}
              className={`w-full text-xs flex items-center gap-1 mt-2 transition-colors ${
                isDarkMode 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-red-600 hover:text-red-800'
              }`}
            >
              <X className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowWalletModal(true)}
            className={`w-full text-xs flex items-center gap-1 transition-colors ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <Wallet className="w-3 h-3" />
            <span>Connect Wallet</span>
          </button>
        )}
        
        {storageStats && (
          <div className={`text-xs space-y-1 mt-2 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
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
      </div>

      {/* Quick Actions */}
      <div className={`p-4 border-b transition-colors ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="space-y-1">
          <button 
            onClick={() => onViewChange('home')}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
              currentView === 'home' 
                ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => onViewChange('favorites')}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
              currentView === 'favorites' 
                ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>
          <button 
            onClick={() => onViewChange('recent')}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
              currentView === 'recent' 
                ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Recent</span>
          </button>
          <button 
            onClick={() => onViewChange('templates')}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
              currentView === 'templates' 
                ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Projects</span>
            <button
              onClick={onNewProject}
              className={`p-1 rounded transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
              title="New project"
            >
              <FolderPlus className={`w-4 h-4 transition-colors ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </button>
          </div>
          
          <div className="space-y-1 pb-2">
            {Object.values(workspace.projects || {}).map((project) => (
              <div key={project.id} className="group">
                <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  <button
                    onClick={() => toggleProject(project.id)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    {expandedProjects.has(project.id) ? 
                      <ChevronDown className="w-3 h-3" /> : 
                      <ChevronRight className="w-3 h-3" />
                    }
                  </button>
                  
                  {editingProject === project.id ? (
                    <>
                      <span className="text-sm">{project.icon}</span>
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        className={`flex-1 sm:w-48 sm:min-w-0 sm:max-w-sm border rounded-md text-sm transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="Project name"
                      />
                      <button
                        onClick={handleProjectSave}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-green-900/30 text-green-400' 
                            : 'hover:bg-green-200 text-green-600'
                        }`}
                        title="Save"
                      >
                        <CheckSquare className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleProjectCancel}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode 
                            ? 'bg-red-900/30 text-red-400' 
                            : 'bg-red-200 text-red-600'
                        }`}
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm" onClick={() => onProjectSelect(project.id)}>{project.icon}</span>
                      <span className={`text-sm flex-1 truncate transition-colors ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`} onClick={() => onProjectSelect(project.id)}>{project.name}</span>
                      <button
                        onClick={() => handleProjectEdit(project)}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-colors ${
                          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                        title="Edit project"
                      >
                        <Edit3 className={`w-3 h-3 transition-colors ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </button>
                      <button
                        onClick={() => onNewPage(project.id)}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-colors ${
                          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                        title="New page"
                      >
                        <Plus className={`w-3 h-3 transition-colors ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </button>
                      {project.id !== 'personal' && project.id !== 'work' && (
                        <button
                          onClick={() => handleProjectDelete(project.id)}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-colors ${
                            isDarkMode 
                              ? 'bg-red-900/30 text-red-400' 
                              : 'bg-red-200 text-red-600'
                          }`}
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                {expandedProjects.has(project.id) && (
                  <div className="ml-6 space-y-1">
                    {getProjectPages(project.id).map((page) => (
                      <div 
                        key={page.id}
                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          currentPageId === page.id 
                            ? (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100')
                            : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                        }`}
                        onClick={() => onPageSelect(page.id)}
                      >
                        <span className="text-sm">{page.icon}</span>
                        <span className={`text-sm flex-1 break-words transition-colors ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`} style={{ wordBreak: 'break-word', overflow: 'visible' }}>{page.title}</span>
                        {page.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPageDelete(page.id);
                          }}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${
                            isDarkMode 
                              ? 'hover:bg-red-900/30 text-red-400' 
                              : 'hover:bg-red-200 text-red-500'
                          }`}
                          title="Delete page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="space-y-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="w-4 h-4 text-lg flex items-center justify-center">
              {isDarkMode ? '☀️' : '🌙'}
            </span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={onResetData}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm text-red-600 transition-colors ${
              isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
            }`}
            title="Reset all data"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

    </div>
  );
};

// Page Editor Component
const PageEditor = ({ page, onPageUpdate, isDarkMode, pagePrivacy, setPagePrivacy }) => {
  const [editingBlock, setEditingBlock] = useState(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
  const [currentBlocks, setCurrentBlocks] = useState(page.blocks || []);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [walletStatus, setWalletStatus] = useState(irysService.getWalletStatus());

  // Check wallet status
  useEffect(() => {
    const checkWalletStatus = () => {
      const status = irysService.getWalletStatus();
      setWalletStatus(status);
    };
    
    checkWalletStatus();
    const interval = setInterval(checkWalletStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);




   

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

  const insertBlock = (afterBlockId, type = 'paragraph', additionalProperties = {}) => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: '',
      properties: additionalProperties
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

  const handleBlockReorder = (draggedBlockId, targetIndex) => {
    const draggedIndex = currentBlocks.findIndex(block => block.id === draggedBlockId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newBlocks = [...currentBlocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex,1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    setCurrentBlocks(newBlocks);
    const updatedPage = { ...page, blocks: newBlocks };
    onPageUpdate(updatedPage);
    setSaveStatus('unsaved');
  };

  const handlePageTitleChange = (e) => {
    const updatedPage = { ...page, title: e.target.value };
    onPageUpdate(updatedPage);
    setSaveStatus('unsaved');
  };

  const handleBlockTypeSelect = (blockType) => {
    setShowBlockSelector(false);
    
    if (blockType === 'emoji') {
      // Show emoji picker for emoji block type
      const rect = editingBlock?.getBoundingClientRect();
      if (rect) {
        setEmojiPickerPosition({
          x: rect.left,
          y: rect.bottom + 2
        });
        setShowEmojiPicker(true);
      }
    } else {
      // Update block type for other types
    if (editingBlock) {
      updateBlock(editingBlock, { type: blockType });
        // Focus the textarea after a short delay to ensure cursor appears
        setTimeout(() => {
          const textarea = document.querySelector(`[data-block-id="${editingBlock}"] textarea`);
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
          }
        }, 10);
      }
    }
  };



  // Функция для обогащения страницы данными таблиц из localStorage
  const enrichPageWithTableData = async (page) => {
    const enrichedBlocks = await Promise.all(
      (page.blocks || []).map(async (block) => {
        if (block.type === 'database') {
          // Ищем данные таблицы в localStorage
          const tableId = block.properties?.tableId || block.id;
          const tableDataKey = `irysNote_database_${tableId}`;
          const tableData = localStorage.getItem(tableDataKey);
          
          if (tableData) {
            try {
              const parsedTableData = JSON.parse(tableData);
              
              return {
                ...block,
                tableData: {
                  id: parsedTableData.id,
                  title: parsedTableData.title,
                  columns: parsedTableData.columns || [],
                  rows: parsedTableData.rows || []
                }
              };
            } catch (e) {
              console.warn(`Failed to parse table data for ${tableId}:`, e);
            }
          }
        }
        return block;
      })
    );
    
    return {
      ...page,
      blocks: enrichedBlocks
    };
  };

  const handleManualSave = async (privacy = 'private') => {
    if (!walletStatus?.connected) {
      alert('Please connect your wallet first to save to Irys');
      return;
    }
    
    setSaveStatus('saving');
    try {
      // Обогащаем блоки database данными из localStorage
      const enrichedPage = await enrichPageWithTableData(page);
      
      const result = await irysService.savePage(enrichedPage, privacy);
      console.log('Page manually saved to Irys:', result);
      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString());
      
      // Сохраняем маппинг между локальным ID и транзакционным ID
      if (result.success && result.id) {
        const pageMapping = JSON.parse(localStorage.getItem('irysNote_pageMapping') || '{}');
        pageMapping[page.id] = result.id;
        localStorage.setItem('irysNote_pageMapping', JSON.stringify(pageMapping));
        console.log(`📝 Saved mapping: ${page.id} -> ${result.id}`);
      }
      
      // Если заметка сохранена, показываем ссылку для копирования
      if (result.success && result.id) {
        if (privacy === 'public') {
          const copyResult = await irysService.copyPublicLink(result.id);
          if (copyResult.success) {
            alert(`Public note saved! Link copied to clipboard: ${copyResult.link}`);
          }
        } else if (privacy === 'private') {
          const copyResult = await irysService.copyPrivateLink(result.id);
          if (copyResult.success) {
            alert(`Private note saved! Link copied to clipboard: ${copyResult.link}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save to Irys:', error);
      setSaveStatus('error');
    }
  };

  const toggleFavorite = () => {
    const updatedPage = { ...page, isFavorite: !page.isFavorite };
    onPageUpdate(updatedPage);
  };

  const handlePageIconClick = (e) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setEmojiPickerPosition({
      x: rect.left,
      y: rect.bottom + 5
    });
    setShowEmojiPicker(true);
  };

  const handlePageEmojiSelect = (emoji) => {
    const updatedPage = { ...page, icon: emoji };
    onPageUpdate(updatedPage);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex-1 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Page Header */}
      <div className={`border-b p-1 transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Save Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved' ? 'bg-green-500' : 
                saveStatus === 'saving' ? 'bg-yellow-500' : 
                saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span>
                {saveStatus === 'saved' && lastSaved ? `Saved to Irys at ${lastSaved}` :
                 saveStatus === 'saving' ? 'Saving to Irys...' :
                 saveStatus === 'error' ? 'Irys save failed' : 'Local changes saved'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  page.isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-5 h-5 ${page.isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              {/* Privacy Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                  onClick={() => setPagePrivacy('private')}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    pagePrivacy === 'private' 
                      ? 'bg-white text-gray-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Private note - only visible to you"
                >
                  <Lock className="w-3 h-3" />
                  Private
                </button>
                <button
                  onClick={() => setPagePrivacy('public')}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    pagePrivacy === 'public' 
                      ? 'bg-white text-gray-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Public note - shareable with others"
                >
                  <Globe className="w-3 h-3" />
                  Public
                </button>
              </div>
              
              <button
                onClick={() => handleManualSave(pagePrivacy)}
                disabled={saveStatus === 'saving' || !walletStatus?.connected}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  walletStatus?.connected 
                    ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={walletStatus?.connected ? `Save as ${pagePrivacy} note to Irys` : 'Connect wallet to save'}
              >
                <Cloud className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
                {saveStatus === 'saving' ? 'Saving...' : `Save as ${pagePrivacy === 'public' ? 'Public' : 'Private'}`}
              </button>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>Local auto-save</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 w-full min-w-0">
            <button
              onClick={handlePageIconClick}
              className="text-4xl flex-shrink-0 hover:bg-gray-100 rounded-lg p-3 transition-colors cursor-pointer"
              title="Click to change emoji"
            >
              {page.icon}
            </button>
            <div className="flex-1 min-w-0 pr-8">
              <input
                type="text"
                value={page.title}
                onChange={handlePageTitleChange}
                className={`text-4xl font-bold bg-transparent border-none outline-none w-full min-w-0 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-100 placeholder-gray-500 focus:bg-gray-800' 
                    : 'text-gray-900 placeholder-gray-400 focus:bg-blue-50'
                }`}
                placeholder="Click to edit title"
                style={{ 
                  wordBreak: 'break-word', 
                  overflow: 'visible', 
                  maxWidth: 'none',
                  lineHeight: '1.28',
                  padding: '7px 0',
                  margin: '0',
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'block',
                  minHeight: '95px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-1">
            {currentBlocks.map((block, index) => (
              <Block
                key={block.id}
                block={block}
                updateBlock={updateBlock}
                deleteBlock={deleteBlock}
                insertBlock={insertBlock}
                isEditing={editingBlock === block.id}
                setEditingBlock={setEditingBlock}
                isDarkMode={isDarkMode}
                onDragStart={(blockId, blockIndex) => {
                  // Handle drag start if needed
                }}
                onDragOver={(e, targetIndex) => {
                  e.preventDefault();
                  e.currentTarget.style.borderTop = '2px solid #3B82F6';
                }}
                onDrop={(e, draggedBlockId, targetIndex) => {
                  e.currentTarget.style.borderTop = '';
                  handleBlockReorder(draggedBlockId, targetIndex);
                }}
                index={index}
              />
            ))}
            
            {/* Add new block button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => insertBlock(currentBlocks[currentBlocks.length - 1]?.id || 'new', 'paragraph')}
                className={`inline-flex items-center gap-2 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
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
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelect={handlePageEmojiSelect}
          position={emojiPickerPosition}
        />
      )}
    </div>
  );
};

// Main View Component for different sections
const MainView = ({ view, pages, onPageSelect, onNewPage, onPageDelete, workspace, selectedProjectId, onProjectSelect, isDarkMode }) => {
  const getViewTitle = () => {
    switch (view) {
      case 'home': return 'Home';
      case 'favorites': return 'Favorites';
      case 'recent': return 'Recent';
      case 'templates': return 'Templates';
      default: return 'Home';
    }
  };

  const getViewIcon = () => {
    switch (view) {
      case 'home': return <Home className="w-6 h-6" />;
      case 'favorites': return <Star className="w-6 h-6" />;
      case 'recent': return <Clock className="w-6 h-6" />;
      case 'templates': return <Layout className="w-6 h-6" />;
      default: return <Home className="w-6 h-6" />;
    }
  };

  const getViewPages = () => {
    if (selectedProjectId) {
      return pages.filter(page => page.projectId === selectedProjectId);
    }

    switch (view) {
      case 'favorites':
        return pages.filter(page => page.isFavorite);
      case 'recent':
        return pages.sort((a, b) => b.lastModified - a.lastModified).slice(0, 10);
      case 'templates':
        return []; // No templates for now
      default:
        return pages;
    }
  };

  const viewPages = getViewPages();

  return (
    <div className={`flex-1 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            {getViewIcon()}
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{getViewTitle()}</h1>
          </div>

          {view === 'templates' ? (
            <div className="text-center py-12">
              <Layout className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Templates coming soon</h2>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>We're working on bringing you awesome templates to get started quickly.</p>
            </div>
          ) : viewPages.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {view === 'favorites' ? <Star className="w-16 h-16" /> : <FileText className="w-16 h-16" />}
              </div>
              <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {view === 'favorites' ? 'No favorites yet' : 'No pages yet'}
              </h2>
              <p className={`mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {view === 'favorites' 
                  ? 'Star pages to add them to your favorites' 
                  : 'Create your first page to get started'}
              </p>
              {view !== 'favorites' && (
                <button
                  onClick={() => onNewPage()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create New Page
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {viewPages.map((page) => (
                <div
                  key={page.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer group relative ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div
                  onClick={() => onPageSelect(page.id)}
                    className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{page.icon}</span>
                      <h3 className={`font-medium flex-1 break-words transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`} style={{ wordBreak: 'break-word', overflow: 'visible' }}>{page.title}</h3>
                    {page.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                  <p className={`text-sm mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {workspace.projects?.[page.projectId]?.name || 'No project'}
                  </p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {view === 'recent' && page.lastModified 
                      ? `Modified ${new Date(page.lastModified).toLocaleDateString()}`
                      : `${page.blocks?.length || 0} blocks`}
                  </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDelete(page.id);
                    }}
                    className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      isDarkMode ? 'hover:bg-red-900' : 'hover:bg-red-200'
                    }`}
                    title="Delete page"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Public Note Viewer Component
const PublicNoteViewer = ({ publicNote, isDarkMode }) => {
  if (!publicNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading public note...</div>
        </div>
      </div>
    );
  }

  const { data, address, timestamp, publicId } = publicNote;
  const page = data;

  return (
    <div className={`page-editor ${isDarkMode ? 'dark' : ''}`}>
      <div className="page-header">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{page.icon || '📄'}</div>
            <div>
              <h1 className={`page-title ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '40px', fontWeight: '700' }}>
                {page.title || 'Untitled'}
              </h1>
            </div>
          </div>
          
          {/* Метаданные в правом верхнем углу */}
          <div className={`flex flex-col items-end gap-1 text-sm mr-4 mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>Public Note</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timestamp ? new Date(timestamp).toLocaleDateString() : 'Unknown date'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="page-content">
        <div className="space-y-2 px-4 py-2">
          {/* Отладочная информация */}
          {console.log('🔍 Debug - page.blocks:', page.blocks)}
          {console.log('🔍 Debug - page.blocks length:', page.blocks?.length)}
          {page.blocks && page.blocks.length > 0 ? (
            page.blocks.map((block, index) => {
              console.log(`🔍 Debug - block ${index}:`, block);
              return (
              <div key={block.id || index} className="block-container">
                {block.type === 'text' && (
                  <p className={`text-base leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{block.content}</p>
                )}
                {block.type === 'paragraph' && (
                  <p className={`text-base leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{block.content}</p>
                )}
                {block.type === 'heading1' && (
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{block.content}</h1>
                )}
                {block.type === 'heading2' && (
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{block.content}</h2>
                )}
                {block.type === 'heading3' && (
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{block.content}</h3>
                )}
                {block.type === 'quote' && (
                  <blockquote className={`border-l-4 pl-4 italic text-base ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-gray-800'}`}>
                    {block.content}
                  </blockquote>
                )}
                {block.type === 'code' && (
                  <pre className={`p-4 rounded text-sm font-mono overflow-x-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {block.content}
                  </pre>
                )}
                {block.type === 'todo' && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={block.checked} readOnly className="w-4 h-4" />
                    <span className={block.checked ? 'line-through text-gray-500' : `${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {block.content}
                    </span>
                  </div>
                )}
                {block.type === 'list' && (
                  <ul className={`list-disc list-inside space-y-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {block.items && block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}
                {block.type === 'numbered-list' && (
                  <ol className={`list-decimal list-inside space-y-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {block.items && block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ol>
                )}
                {block.type === 'divider' && (
                  <hr className={`my-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
                )}
                {block.type === 'image' && (
                  <div className="my-4">
                    <img 
                      src={block.src || block.url} 
                      alt={block.alt || 'Image'} 
                      className="max-w-full h-auto rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{display: 'none'}}>
                      Failed to load image
                    </div>
                  </div>
                )}
                {block.type === 'callout' && (
                  <div className={`p-4 rounded-lg border-l-4 ${isDarkMode ? 'bg-gray-800 border-blue-500' : 'bg-blue-50 border-blue-500'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{block.emoji || '💡'}</span>
                      <div className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {block.content}
                      </div>
                    </div>
                  </div>
                )}
                {block.type === 'emoji' && (
                  <div className="text-center my-4">
                    <span className="text-4xl">{block.content || block.emoji}</span>
                  </div>
                )}
                {block.type === 'database' && (
                  <div className="my-4">
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {block.tableData?.title || block.title || 'Table'}
                    </h3>
                    
                    {/* Проверяем все возможные структуры данных таблицы */}
                    {(() => {
                      // Пытаемся найти данные таблицы в разных местах
                      const tableData = block.tableData || block.data || block;
                      const columns = tableData?.columns || block.columns || [];
                      const rows = tableData?.rows || block.rows || [];
                      
                      
                      if (columns.length > 0 && rows.length > 0) {
                        return (
                          <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
                            <table className={`min-w-full border-collapse ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <thead>
                                <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                  {columns.map((column, colIndex) => (
                                    <th key={colIndex} className={`px-4 py-3 text-left font-semibold border-b border-r border-gray-300 first:rounded-tl-lg last:rounded-tr-lg last:border-r-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                      {column.name || column.title || `Column ${colIndex + 1}`}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, rowIndex) => (
                                  <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')} hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                    {columns.map((column, colIndex) => (
                                      <td key={colIndex} className={`px-4 py-3 border-b border-r border-gray-300 last:border-r-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${rowIndex === rows.length - 1 ? 'last:rounded-bl-lg last:rounded-br-lg' : ''}`}>
                                        <div className="flex items-center gap-2">
                                          {/* Показываем эмодзи если есть */}
                                          {row.emoji && (
                                            <span className="text-lg flex-shrink-0">{row.emoji}</span>
                                          )}
                                          <span className="flex-1">
                                            {(() => {
                                              // Пытаемся найти значение ячейки в разных форматах
                                              if (row.values) {
                                                return row.values[column.id] || row.values[column.name] || '';
                                              } else if (row[column.id]) {
                                                return row[column.id];
                                              } else if (row[column.name]) {
                                                return row[column.name];
                                              } else if (row[colIndex] !== undefined) {
                                                return row[colIndex];
                                              }
                                              return '';
                                            })()}
                                          </span>
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      } else {
                        return (
                          <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>No table data found</p>
                            <p className="text-sm mt-2">This table block exists but contains no data</p>
                            <p className="text-xs mt-1">Columns: {columns.length}, Rows: {rows.length}</p>
                          </div>
                        );
                      }
                    })()}
                    
                  </div>
                )}
                {/* Fallback для неизвестных типов блоков */}
                {!['text', 'paragraph', 'heading1', 'heading2', 'heading3', 'quote', 'code', 'todo', 'list', 'numbered-list', 'divider', 'image', 'callout', 'emoji', 'database'].includes(block.type) && (
                  <div className={`p-2 border rounded ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-100 text-gray-900'}`}>
                    <p className="text-sm text-gray-500">Unknown block type: {block.type}</p>
                    <p className="text-base">{block.content}</p>
                  </div>
                )}
              </div>
              );
            })
          ) : (
            <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>No content blocks found</p>
              <p className="text-sm mt-2">Debug info: page.blocks = {JSON.stringify(page.blocks)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Notion Clone Component
export const NotionClone = () => {
  const { pageId, publicId, transactionId } = useParams();
  const navigate = useNavigate();

  // Состояния
  const [workspace, setWorkspace] = useState(mockWorkspace);
  const [pages, setPages] = useState(mockPages);
  const [currentPageId, setCurrentPageId] = useState(pageId || null);
  const [currentPage, setCurrentPage] = useState(null);
  const [currentView, setCurrentView] = useState(pageId ? 'page' : 'home');
  const [loading, setLoading] = useState(true);
  const [walletStatus, setWalletStatus] = useState(irysService.getWalletStatus());
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('irysNote_darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [pagePrivacy, setPagePrivacy] = useState('private');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [publicNotes, setPublicNotes] = useState([]);
  const [currentPublicNote, setCurrentPublicNote] = useState(null);
  const [isViewingPublic, setIsViewingPublic] = useState(false);

  // Обработка темы
  useEffect(() => {
    localStorage.setItem('irysNote_darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Инициализация и загрузка данных
  useEffect(() => {
    const initializeWorkspace = async () => {
      // Сначала загружаем из localStorage
      const localWorkspace = loadFromLocalStorage('irysNote_workspace', null);
      const localPages = loadFromLocalStorage('irysNote_pages', null);
      
      let loadedWorkspace = null;
      let loadedPages = null;
      
      // Пытаемся загрузить с сервера/Irys
      try {
        loadedWorkspace = await irysService.loadWorkspace();
      } catch (e) {
        loadedWorkspace = null;
      }
      try {
        loadedPages = await irysService.loadPages();
      } catch (e) {
        loadedPages = null;
      }
      
      // Инициализируем маппинг страниц из Irys
      try {
        await initializePageMapping();
      } catch (e) {
        console.warn('Failed to initialize page mapping:', e);
      }
      
      // Объединяем данные: mock данные + localStorage + сервер
      let finalWorkspace = mockWorkspace;
      if (localWorkspace) {
        finalWorkspace = {
          ...mockWorkspace,
          ...localWorkspace,
          projects: { ...mockWorkspace.projects, ...localWorkspace.projects }
        };
      } else if (loadedWorkspace && loadedWorkspace.projects && Object.keys(loadedWorkspace.projects).length) {
        finalWorkspace = {
          ...mockWorkspace,
          ...loadedWorkspace,
          projects: { ...mockWorkspace.projects, ...loadedWorkspace.projects }
        };
      }
      
      let finalPages = mockPages;
      if (localPages) {
        finalPages = { ...mockPages, ...localPages };
      } else if (loadedPages && Object.keys(loadedPages).length && !loadedPages.error) {
        finalPages = { ...mockPages, ...loadedPages };
      }
      
      setWorkspace(finalWorkspace);
      setPages(finalPages);
      setLoading(false);
      
      // Логируем состояние pages после инициализации
      setTimeout(() => {
        console.log('DEBUG: pages after init:', finalPages);
      }, 100);
    };
    initializeWorkspace();
  }, []);



  // Слежение за pageId, publicId и transactionId
  useEffect(() => {
    if (publicId) {
      // Загружаем публичную заметку по transaction ID
      setIsViewingPublic(true);
      loadPublicNote(publicId); // publicId теперь это transaction ID
    } else if (transactionId) {
      // Загружаем приватную заметку по transaction ID
      setIsViewingPublic(false);
      loadPrivateNote(transactionId);
    } else if (pageId && pages[pageId]) {
      setIsViewingPublic(false);
      setCurrentPageId(pageId);
      setCurrentPage(pages[pageId]);
      setCurrentView('page');
    } else if (pageId) {
      // Если страницы нет в локальном состоянии, пытаемся загрузить из Irys
      setIsViewingPublic(false);
      loadPageFromIrys(pageId);
    }
  }, [pageId, publicId, transactionId, pages, navigate]);

  // Функция инициализации маппинга страниц
  const initializePageMapping = async () => {
    try {
      console.log('🔄 Initializing page mapping from Irys...');
      
      // Загружаем все страницы пользователя из Irys
      const allPages = await irysService.loadDataByWallet('page', true, true);
      
      if (allPages && allPages.length > 0) {
        const pageMapping = JSON.parse(localStorage.getItem('irysNote_pageMapping') || '{}');
        let mappingUpdated = false;
        
        for (const pageItem of allPages) {
          // Ищем страницы с публичными ID
          if (pageItem.data && pageItem.data.publicId) {
            const publicId = pageItem.data.publicId;
            const transactionId = pageItem.id;
            
            // Создаем маппинг для публичных страниц
            if (!pageMapping[publicId]) {
              pageMapping[publicId] = transactionId;
              mappingUpdated = true;
              console.log(`📝 Mapped public page: ${publicId} -> ${transactionId}`);
            }
          }
        }
        
        if (mappingUpdated) {
          localStorage.setItem('irysNote_pageMapping', JSON.stringify(pageMapping));
          console.log('✅ Page mapping initialized');
        }
      }
    } catch (e) {
      console.warn('Failed to initialize page mapping:', e);
    }
  };

  // Функция загрузки публичной заметки
  const loadPublicNote = async (transactionId) => {
    try {
      setLoading(true);
      console.log(`🔍 Loading public note with transaction ID: ${transactionId}`);
      const publicNote = await irysService.getPublicNoteByTransactionId(transactionId);
      if (publicNote) {
        setCurrentPublicNote(publicNote);
        setCurrentView('public');
      } else {
      setCurrentView('home');
      navigate('/');
        alert('Public note not found');
      }
    } catch (error) {
      console.error('Failed to load public note:', error);
      setCurrentView('home');
      navigate('/');
      alert('Failed to load public note');
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки приватной заметки
  const loadPrivateNote = async (transactionId) => {
    try {
      setLoading(true);
      console.log(`🔍 Loading private note with transaction ID: ${transactionId}`);
      const privateNote = await irysService.getPrivateNoteByTransactionId(transactionId);
      
      if (privateNote && privateNote.error) {
        // Обработка ошибок проверки кошелька
        if (privateNote.requiresWallet) {
          setCurrentView('home');
          navigate('/');
          alert(privateNote.error + '\n\nPlease connect your wallet to access private notes.');
          return;
        }
      }
      
      if (privateNote && privateNote.data) {
        setCurrentPage(privateNote.data);
        setCurrentView('page');
      } else {
        setCurrentView('home');
        navigate('/');
        alert('Private note not found');
      }
    } catch (error) {
      console.error('Failed to load private note:', error);
      setCurrentView('home');
      navigate('/');
      alert('Failed to load private note');
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки страницы из Irys по ID
  const loadPageFromIrys = async (pageId) => {
    try {
      setLoading(true);
      console.log(`🔍 Loading page from Irys: ${pageId}`);
      
      // Проверяем маппинг между локальным ID и транзакционным ID
      const pageMapping = JSON.parse(localStorage.getItem('irysNote_pageMapping') || '{}');
      const transactionId = pageMapping[pageId];
      
      if (!transactionId) {
        console.log(`❌ No transaction ID found for page: ${pageId}`);
        setCurrentView('home');
        navigate('/');
        alert('Page not found in Irys');
        return;
      }
      
      console.log(`🔍 Using transaction ID: ${transactionId}`);
      
      // Пытаемся загрузить страницу из Irys по транзакционному ID
      const pageData = await irysService.loadDataFromIrys(transactionId);
      
      if (pageData && pageData.blocks) {
        // Создаем объект страницы в нужном формате
        const loadedPage = {
          id: pageId, // Используем локальный ID
          title: pageData.title || 'Untitled',
          blocks: pageData.blocks || [],
          isFavorite: pageData.isFavorite || false,
          icon: pageData.icon || '📄',
          createdAt: pageData.createdAt || new Date().toISOString(),
          updatedAt: pageData.updatedAt || new Date().toISOString(),
          isPublic: pageData.isPublic || false,
          publicId: pageData.publicId || null,
          transactionId: transactionId // Сохраняем транзакционный ID
        };
        
        // Добавляем страницу в локальное состояние
        setPages(prevPages => ({
          ...prevPages,
          [pageId]: loadedPage
        }));
        
        // Устанавливаем как текущую страницу
        setCurrentPageId(pageId);
        setCurrentPage(loadedPage);
        setCurrentView('page');
        
        console.log(`✅ Page loaded from Irys: ${pageId} (tx: ${transactionId})`);
      } else {
        console.log(`❌ Page data not found in Irys: ${transactionId}`);
        setCurrentView('home');
        navigate('/');
        alert('Page data not found');
      }
    } catch (error) {
      console.error('Failed to load page from Irys:', error);
      setCurrentView('home');
      navigate('/');
      alert('Failed to load page from Irys');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handlePageSelect = (selectedPageId) => {
    navigate(`/page/${selectedPageId}`);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('project');
    setCurrentPageId(null);
    setCurrentPage(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedProjectId(null);
    setCurrentPageId(null);
    setCurrentPage(null);
    navigate('/');
  };

  const handleNewPage = (projectId = 'personal') => {
    const newPageId = uuidv4();
    const newPage = {
      id: newPageId,
      title: 'Untitled',
      icon: '📄',
      cover: null,
      projectId: projectId,
      isFavorite: false,
      lastModified: Date.now(),
      blocks: [
        {
          id: uuidv4(),
          type: 'paragraph',
          content: '',
          properties: {}
        }
      ]
    };
    setPages(prev => {
      const newPages = { ...prev, [newPageId]: newPage };
      saveToLocalStorage('irysNote_pages', newPages);
      return newPages;
    });
    navigate(`/page/${newPageId}`);
  };

  const handleNewProject = () => {
    const newProjectId = uuidv4();
    const newProject = {
      id: newProjectId,
      name: 'New Project',
      icon: '📁',
      color: '#6B7280',
      pages: []
    };
    setWorkspace(prev => {
      const newWorkspace = {
      ...prev,
      projects: { ...prev.projects, [newProjectId]: newProject }
      };
      saveToLocalStorage('irysNote_workspace', newWorkspace);
      return newWorkspace;
    });
  };

  const handleProjectUpdate = (projectId, updatedProject) => {
    setWorkspace(prev => {
      const newWorkspace = {
      ...prev,
      projects: {
        ...prev.projects,
        [projectId]: updatedProject
      }
      };
      saveToLocalStorage('irysNote_workspace', newWorkspace);
      return newWorkspace;
    });
  };

  const handleProjectDelete = (projectId) => {
    setWorkspace(prev => {
      const newWorkspace = {
      ...prev,
      projects: Object.fromEntries(
        Object.entries(prev.projects).filter(([id]) => id !== projectId)
      )
      };
      saveToLocalStorage('irysNote_workspace', newWorkspace);
      return newWorkspace;
    });
  };

  const handlePageUpdate = (updatedPage) => {
    setPages(prev => {
      const newPages = {
      ...prev,
      [updatedPage.id]: { ...updatedPage, lastModified: Date.now() }
      };
      saveToLocalStorage('irysNote_pages', newPages);
      return newPages;
    });
    setCurrentPage(updatedPage);
  };

  const handlePageDelete = (pageId) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      setPages(prev => {
        const newPages = { ...prev };
        delete newPages[pageId];
        saveToLocalStorage('irysNote_pages', newPages);
        return newPages;
      });
      
      // If we're currently on the deleted page, navigate to home
      if (currentPageId === pageId) {
        setCurrentPageId(null);
        setCurrentPage(null);
        setCurrentView('home');
        navigate('/');
      }
    }
  };

  const handleWalletDisconnect = async () => {
    await irysService.disconnectWallet();
    setWalletStatus({ connected: false, address: null });
    setShowWalletModal(true);
    setCurrentPageId(null);
    setCurrentPage(null);
    setSelectedProjectId(null);
    setCurrentView('home');
    navigate('/');
  };

  const handleWalletConnect = (address) => {
    setWalletStatus({ connected: true, address });
    setShowWalletModal(false);
  };

  // Функция для сброса данных (очистка localStorage)
  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear all pages and projects.')) {
      localStorage.removeItem('irysNote_workspace');
      localStorage.removeItem('irysNote_pages');
      window.location.reload();
    }
  };

  // НЕ показываем модалку автоматически - пользователь может подключить кошелек вручную
  // useEffect(() => {
  //   if (!walletStatus.connected) {
  //     setShowWalletModal(true);
  //   }
  // }, [walletStatus.connected]);

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
    <div className={`flex h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex-shrink-0">
            <Sidebar
        workspace={workspace}
        currentPageId={currentPageId}
        onPageSelect={handlePageSelect}
        onNewPage={handleNewPage}
        onNewProject={handleNewProject}
        onProjectUpdate={handleProjectUpdate}
        onProjectDelete={handleProjectDelete}
        onPageDelete={handlePageDelete}
        currentView={currentView}
        onViewChange={handleViewChange}
        pages={pages}
        onWalletDisconnect={handleWalletDisconnect}
        walletStatus={walletStatus}
        onProjectSelect={handleProjectSelect}
        onResetData={resetData}
        onWalletConnect={handleWalletConnect}
        setShowWalletModal={setShowWalletModal}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      </div>
      <div className="flex-1 overflow-y-auto">
      {currentView === 'page' && currentPage ? (
        <PageEditor
          key={currentPage.id}
          page={currentPage}
          onPageUpdate={handlePageUpdate}
          isDarkMode={isDarkMode}
          pagePrivacy={pagePrivacy}
          setPagePrivacy={setPagePrivacy}
        />
      ) : currentView === 'public' && currentPublicNote ? (
        <PublicNoteViewer
          publicNote={currentPublicNote}
          isDarkMode={isDarkMode}
        />
      ) : (
        <MainView
          view={currentView}
          pages={Object.values(pages)}
          onPageSelect={handlePageSelect}
          onNewPage={handleNewPage}
            onPageDelete={handlePageDelete}
          workspace={workspace}
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
          isDarkMode={isDarkMode}
        />
      )}
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  );
};

const COLUMN_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'number', label: 'Number' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'date', label: 'Date' },
  { type: 'select', label: 'Select' },
  { type: 'multi-select', label: 'Multi-select' },
  { type: 'url', label: 'URL' },
  { type: 'email', label: 'Email' },
];

function EditableTable({ tableId = null, isDarkMode = false, blockId = null }) {
  // Используем tableId из свойств блока или генерируем новый
  const [currentTableId] = useState(tableId || `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [title, setTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [columns, setColumns] = useState([
    { id: 'name', name: '', editing: false },
    { id: 'text', name: '', editing: false }
  ]);
  const [rows, setRows] = useState([
    { id: Date.now().toString(), values: Object.fromEntries([['name', ''], ['text', '']]), emoji: '' }
  ]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredHeader, setHoveredHeader] = useState(false);
  const [hoveredColHeader, setHoveredColHeader] = useState(null);
  const [emojiPickerRow, setEmojiPickerRow] = useState(null);
  const emojiIconRefs = useRef({});
  const [allRowsManuallySelected, setAllRowsManuallySelected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [lastSavedToIrys, setLastSavedToIrys] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Загрузка данных таблицы при инициализации
  useEffect(() => {
    const loadTableData = async () => {
      try {
        // Если передан tableId, пытаемся загрузить существующую таблицу
        if (tableId) {
          // Сначала пробуем загрузить из localStorage (быстро)
          const localData = localStorage.getItem(`irysNote_database_${tableId}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            setTitle(parsed.title || '');
            setColumns(parsed.columns || [{ id: 'name', name: '', editing: false }, { id: 'text', name: '', editing: false }]);
            setRows(parsed.rows || [{ id: Date.now().toString(), values: Object.fromEntries([['name', ''], ['text', '']]), emoji: '' }]);
            setLastSaved(parsed.timestamp);
            console.log('Loaded database table from localStorage');
          }
          
          // Затем пробуем загрузить из Irys (медленно, в фоне)
          const savedData = await irysService.loadDatabase();
          if (savedData && savedData.timestamp > (JSON.parse(localData || '{}').timestamp || 0)) {
            setTitle(savedData.title || '');
            setColumns(savedData.columns || [{ id: 'name', name: '', editing: false }, { id: 'text', name: '', editing: false }]);
            setRows(savedData.rows || [{ id: Date.now().toString(), values: Object.fromEntries([['name', ''], ['text', '']]), emoji: '' }]);
            setLastSavedToIrys(savedData.timestamp);
            console.log('Updated database table from Irys');
          }
        } else {
          // Для новой таблицы оставляем пустые значения по умолчанию
          console.log('Created new empty database table with ID:', currentTableId);
        }
      } catch (e) {
        console.warn('Failed to load database table:', e);
      }
    };
    loadTableData();
  }, [tableId, currentTableId]);

  // Локальное сохранение (без подписи)
  const saveToLocalStorage = useCallback(() => {
    try {
      const tableData = {
        id: currentTableId,
        title,
        columns: columns.map(col => ({ ...col, editing: false })),
        rows,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`irysNote_database_${currentTableId}`, JSON.stringify(tableData));
      setLastSaved(Date.now());
      setHasUnsavedChanges(false);
      console.log('Database table saved to localStorage with ID:', currentTableId);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [currentTableId, title, columns, rows]);

  // Сохранение в Irys (с подписью, только по кнопке)
  const saveToIrys = useCallback(async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      const tableData = {
        id: currentTableId,
        title,
        columns: columns.map(col => ({ ...col, editing: false })),
        rows,
        timestamp: Date.now()
      };
      
      const result = await irysService.saveDatabase(tableData);
      if (result.success) {
        setLastSavedToIrys(Date.now());
        setHasUnsavedChanges(false);
        // Также сохраняем локально с уникальным ID
        localStorage.setItem(`irysNote_database_${currentTableId}`, JSON.stringify(tableData));
        setLastSaved(Date.now());
        console.log('Database table saved to Irys with ID:', currentTableId, 'Transaction:', result.id);
      } else {
        console.error('Failed to save database table:', result.error);
      }
    } catch (e) {
      console.error('Error saving database table:', e);
    } finally {
      setSaving(false);
    }
  }, [saving, currentTableId, title, columns, rows]);

  // Дебаунсированное локальное автосохранение (БЕЗ подписи)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title || columns.some(col => col.name) || rows.some(row => Object.values(row.values).some(val => val))) {
        saveToLocalStorage();
        setHasUnsavedChanges(true); // Отмечаем, что есть несохраненные изменения в Irys
      }
    }, 1000); // Сохраняем локально через 1 секунду

    return () => clearTimeout(timeoutId);
  }, [saveToLocalStorage]);

  // Редактирование заголовка
  function startEditTitle() { setEditingTitle(true); }
  function finishEditTitle(value) {
    setTitle(value);
    setEditingTitle(false);
    // Локальное сохранение без подписи
    setTimeout(saveToLocalStorage, 100);
  }

  // Редактирование названия столбца
  function startEditCol(colId) {
    setColumns(cols => cols.map(c => c.id === colId ? { ...c, editing: true } : c));
  }
  function finishEditCol(colId, value) {
    setColumns(cols => cols.map(c => c.id === colId ? { ...c, name: value || c.name, editing: false } : c));
    // Локальное сохранение без подписи
    setTimeout(saveToLocalStorage, 100);
  }
  function handleColNameChange(colId, value) {
    setColumns(cols => cols.map(c => c.id === colId ? { ...c, name: value } : c));
  }

  // Добавить строку
  function addRow() {
    setRows(rows => [
      ...rows,
      { id: Date.now().toString(), values: Object.fromEntries(columns.map(c => [c.id, ''])), emoji: '' }
    ]);
    // Локальное сохранение без подписи
    setTimeout(saveToLocalStorage, 100);
  }

  // Добавить столбец (всегда справа)
  function addColumn() {
    const newId = Date.now().toString();
    setColumns(cols => [...cols, { id: newId, name: 'Column', editing: true }]);
    setRows(rows => rows.map(r => ({ ...r, values: { ...r.values, [newId]: '' } })));
  }

  // Редактировать ячейку
  function editCell(rowId, colId, value) {
    setRows(rows => rows.map(r =>
      r.id === rowId ? { ...r, values: { ...r.values, [colId]: value } } : r
    ));
  }

  // Выделение строк
  function toggleRowSelect(rowId) {
    setSelectedRows(sel => sel.includes(rowId) ? sel.filter(id => id !== rowId) : [...sel, rowId]);
  }
  function toggleAllRows() {
    if (selectedRows.length === rows.length) {
      setSelectedRows([]);
      setAllRowsManuallySelected(false);
    } else {
      setSelectedRows(rows.map(r => r.id));
      setAllRowsManuallySelected(true);
    }
  }
  function clearSelection() {
    setSelectedRows([]);
  }
  function deleteSelectedRows() {
    setRows(rows => rows.filter(r => !selectedRows.includes(r.id)));
    setSelectedRows([]);
  }

  // Выбор эмодзи для строки
  function handleEmojiSelect(rowId, emoji) {
    setRows(rows => rows.map(r => r.id === rowId ? { ...r, emoji } : r));
    setEmojiPickerRow(null);
  }

  // Получить позицию для EmojiPicker
  function getEmojiPickerPosition(rowId) {
    const ref = emojiIconRefs.current[rowId];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      return { x: rect.left, y: rect.bottom };
    }
    return { x: 0, y: 0 };
  }

  function deleteColumn(colId) {
    setColumns(cols => cols.filter(c => c.id !== colId));
    setRows(rows => rows.map(r => {
      const newVals = { ...r.values };
      delete newVals[colId];
      return { ...r, values: newVals };
    }));
  }

  // В useEffect сбрасываем allRowsManuallySelected если выделение снято
  useEffect(() => {
    if (selectedRows.length !== rows.length) {
      setAllRowsManuallySelected(false);
    }
  }, [selectedRows, rows.length]);

  return (
    <div className={`border rounded-xl shadow-sm w-full max-w-4xl mx-auto my-4 transition-colors ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Toolbar для удаления выбранных */}
      {selectedRows.length > 0 && (
        <div className={`flex items-center gap-2 p-2 border-b rounded-t-xl transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <span className="text-blue-600 font-medium">{selectedRows.length} selected</span>
          <button className={`p-1 transition-colors ${
            isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
          }`} onClick={deleteSelectedRows} title="Delete selected">
            <Trash2 className="w-5 h-5" />
          </button>
          <button className={`p-1 transition-colors ${
            isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
          }`} onClick={clearSelection} title="Clear selection">✕</button>
        </div>
      )}
      <div className="flex items-center gap-3 mb-2 mt-4 ml-4">
        <input
          className={`text-2xl font-bold bg-transparent outline-none px-1 py-0.5 w-64 transition-colors ${
            isDarkMode 
              ? 'text-gray-200 focus:bg-gray-700' 
              : 'text-gray-700 focus:bg-gray-100'
          }`}
          value={title}
          readOnly={!editingTitle}
          autoFocus={editingTitle}
          onClick={() => { if (!editingTitle) setEditingTitle(true); }}
          onChange={e => setTitle(e.target.value)}
          onBlur={e => { if (editingTitle) finishEditTitle(e.target.value); }}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === 'Escape') && editingTitle) finishEditTitle(e.target.value);
          }}
          placeholder="New database"
        />

      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr
              onMouseEnter={() => setHoveredHeader(true)}
              onMouseLeave={() => setHoveredHeader(false)}
            >
              {/* Квадратик для выбора всех строк — только слева от первого столбца (Name) */}
              <th className={`border-b px-2 py-2 text-center align-middle w-8 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                {(hoveredHeader || selectedRows.length > 0 || allRowsManuallySelected) && (
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'border-gray-500 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-100'
                    } ${((selectedRows.length === rows.length && rows.length > 0) || allRowsManuallySelected) ? 'bg-blue-100 border-blue-400' : ''}`}
                    onClick={toggleAllRows}
                    title="Select all rows"
                  >
                    {((selectedRows.length === rows.length && rows.length > 0) || allRowsManuallySelected) && <span className="w-3 h-3 bg-blue-500 rounded"></span>}
                  </div>
                )}
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.id}
                  className={`border-b px-4 py-2 text-left font-semibold relative transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-200 text-gray-700'
                  } ${idx < columns.length - 1 ? (isDarkMode ? 'border-r border-gray-600' : 'border-r border-gray-200') : ''}`}
                  onMouseEnter={() => setHoveredColHeader(col.id)}
                  onMouseLeave={() => setHoveredColHeader(null)}
                >
                  {/* Квадратик справа только у остальных столбцов (кроме первого) */}
                  {idx !== 0 && hoveredColHeader === col.id && (
                    <div
                      className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'border-gray-500 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                      title="Delete column"
                      onClick={() => deleteColumn(col.id)}
                    >
                      <Trash2 className={`w-4 h-4 transition-colors ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                  {col.editing ? (
                    <input
                      className={`border-none outline-none bg-transparent font-semibold px-1 py-0.5 w-32 min-w-[180px] transition-colors ${
                        isDarkMode 
                          ? 'text-gray-200 focus:bg-gray-700' 
                          : 'text-gray-700 focus:bg-gray-100'
                      }`}
                      value={col.name}
                      readOnly={!col.editing}
                      autoFocus={col.editing}
                      onClick={() => { if (!col.editing) startEditCol(col.id); }}
                      onChange={e => handleColNameChange(col.id, e.target.value)}
                      onBlur={e => { if (col.editing) finishEditCol(col.id, e.target.value); }}
                      onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === 'Escape') && col.editing) finishEditCol(col.id, e.target.value);
                      }}
                      placeholder="Column"
                    />
                  ) : (
                    <span
                      onClick={() => startEditCol(col.id)}
                      className={`cursor-pointer rounded px-1 py-0.5 transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                      } ${col.name ? (isDarkMode ? 'text-gray-200' : 'text-gray-700') : (isDarkMode ? 'text-gray-500' : 'text-gray-300')}`}
                    >
                      {col.name || <span className="text-gray-300">Column</span>}
                    </span>
                  )}
                </th>
              ))}
              {/* Плюсик справа от последнего столбца */}
              <th className={`border-b px-2 py-2 text-center align-middle transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <button
                  className={`w-6 h-6 flex items-center justify-center bg-transparent border-none shadow-none transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-blue-400' 
                      : 'text-gray-400 hover:text-blue-500'
                  }`}
                  style={{ zIndex: 2 }}
                  onClick={addColumn}
                  title="Add column"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.id}
                className={`transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                } ${selectedRows.includes(row.id) ? (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50') : ''}`}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Квадратик вне таблицы слева */}
                <td className={`border-b px-2 py-2 text-center align-middle w-8 transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  {(hoveredRow === row.id || selectedRows.includes(row.id)) && (
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'border-gray-500 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-100'
                      } ${selectedRows.includes(row.id) ? 'bg-blue-100 border-blue-400' : ''}`}
                      onClick={() => toggleRowSelect(row.id)}
                      title="Select row"
                    >
                      {selectedRows.includes(row.id) && <span className="w-3 h-3 bg-blue-500 rounded"></span>}
                    </div>
                  )}
                </td>
                {columns.map((col, idx) => (
                  <td key={col.id} className={`border-b px-4 py-2 transition-colors ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  } ${idx < columns.length - 1 ? (isDarkMode ? 'border-r border-gray-600' : 'border-r border-gray-200') : ''}`}>
                    {/* Для Name: иконка документа слева от текста, очень близко */}
                    {col.id === 'name' && (
                      <span className="inline-flex items-center gap-1">
                        <button
                          ref={el => emojiIconRefs.current[row.id] = el}
                          className={`w-6 h-6 flex items-center justify-center bg-transparent border-none shadow-none mr-1 transition-colors ${
                            isDarkMode 
                              ? 'text-gray-500 hover:text-blue-400' 
                              : 'text-gray-400 hover:text-blue-500'
                          }`}
                          onClick={() => setEmojiPickerRow(row.id)}
                          title="Set emoji"
                          type="button"
                        >
                          {row.emoji ? <span className="text-xl">{row.emoji}</span> : <FileText className="w-5 h-5" />}
                        </button>
                        <input
                          style={{ width: `${Math.round(260 * 2 / columns.length)}px` }}
                          className={`bg-transparent outline-none px-2 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-gray-200 focus:bg-gray-700' 
                              : 'text-gray-900 focus:bg-gray-100'
                          }`}
                          value={row.values[col.id] || ''}
                          onChange={e => editCell(row.id, col.id, e.target.value)}
                        />
                        {emojiPickerRow === row.id && (
                          <div style={{ position: 'absolute', zIndex: 50, left: 0 }}>
                            <EmojiPicker
                              isOpen={true}
                              onClose={() => setEmojiPickerRow(null)}
                              onSelect={emoji => handleEmojiSelect(row.id, emoji)}
                              position={getEmojiPickerPosition(row.id)}
                            />
                          </div>
                        )}
                      </span>
                    )}
                    {col.id !== 'name' && (
                      <input
                        className={`w-full bg-transparent outline-none min-w-[180px] px-2 rounded transition-colors ${
                          isDarkMode 
                            ? 'text-gray-200 focus:bg-gray-700' 
                            : 'text-gray-900 focus:bg-gray-100'
                        }`}
                        value={row.values[col.id] || ''}
                        onChange={e => editCell(row.id, col.id, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                {/* Добавить пустой td с border-r для визуального завершения линии справа */}
                <td className={`border-b border-r transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}></td>
              </tr>
            ))}
            {/* Строка + New page */}
            <tr>
              <td colSpan={columns.length + 2} className={`text-left px-4 py-3 cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'text-gray-500 hover:bg-gray-700' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`} onClick={addRow}>
                + New page
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
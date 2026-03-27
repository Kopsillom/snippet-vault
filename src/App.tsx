/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Code, 
  Type, 
  Link as LinkIcon, 
  User, 
  X,
  ExternalLink,
  Hash,
  Pencil,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { Category, Snippet, SnippetType } from './types';

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#71717a', // zinc
];

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSnippet, setIsAddingSnippet] = useState(false);
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Category deletion state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);
  
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetContent, setNewSnippetContent] = useState('');
  const [newSnippetType, setNewSnippetType] = useState<SnippetType>('text');
  const [newSnippetCategoryId, setNewSnippetCategoryId] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    const savedCategories = localStorage.getItem('sv_categories');
    const savedSnippets = localStorage.getItem('sv_snippets');
    
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else {
      const defaultCat: Category = {
        id: 'default',
        name: 'General',
        color: COLORS[0],
        createdAt: Date.now()
      };
      setCategories([defaultCat]);
      localStorage.setItem('sv_categories', JSON.stringify([defaultCat]));
    }
    
    if (savedSnippets) setSnippets(JSON.parse(savedSnippets));

    const savedDarkMode = localStorage.getItem('sv_darkMode');
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('sv_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sv_snippets', JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
    localStorage.setItem('sv_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const filteredSnippets = useMemo(() => {
    let result = snippets;
    if (selectedCategoryId !== 'all') {
      result = result.filter(s => s.categoryId === selectedCategoryId);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(query) || 
        s.content.toLowerCase().includes(query)
      );
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [snippets, selectedCategoryId, searchQuery]);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName,
      color: newCategoryColor,
      createdAt: Date.now()
    };
    setCategories([...categories, newCat]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete || deleteConfirmName !== categoryToDelete.name) return;
    
    const id = categoryToDelete.id;
    setCategories(categories.filter(c => c.id !== id));
    setSnippets(snippets.filter(s => s.categoryId !== id));
    if (selectedCategoryId === id) setSelectedCategoryId('all');
    
    setCategoryToDelete(null);
    setDeleteConfirmName('');
  };

  const openAddSnippetModal = () => {
    setEditingSnippetId(null);
    setNewSnippetTitle('');
    setNewSnippetContent('');
    setNewSnippetType('text');
    setNewSnippetCategoryId(selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || 'default');
    setIsAddingSnippet(true);
  };

  const openEditSnippetModal = (snippet: Snippet) => {
    setEditingSnippetId(snippet.id);
    setNewSnippetTitle(snippet.title);
    setNewSnippetContent(snippet.content);
    setNewSnippetType(snippet.type);
    setNewSnippetCategoryId(snippet.categoryId);
    setIsAddingSnippet(true);
  };

  const saveSnippet = () => {
    // Title is no longer required, only content is
    if (!newSnippetContent.trim()) return;
    const catId = newSnippetCategoryId || (selectedCategoryId !== 'all' ? selectedCategoryId : categories[0].id);
    
    if (editingSnippetId) {
      setSnippets(snippets.map(s => s.id === editingSnippetId ? {
        ...s,
        title: newSnippetTitle,
        content: newSnippetContent,
        type: newSnippetType,
        categoryId: catId
      } : s));
    } else {
      const newSnip: Snippet = {
        id: crypto.randomUUID(),
        categoryId: catId,
        title: newSnippetTitle,
        content: newSnippetContent,
        type: newSnippetType,
        createdAt: Date.now()
      };
      setSnippets([...snippets, newSnip]);
    }
    
    setNewSnippetTitle('');
    setNewSnippetContent('');
    setEditingSnippetId(null);
    setIsAddingSnippet(false);
  };

  const deleteSnippet = (id: string) => {
    setSnippets(snippets.filter(s => s.id !== id));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryColor = (id: string) => {
    return categories.find(c => c.id === id)?.color || '#71717a';
  };

  const getTypeIcon = (type: SnippetType) => {
    switch (type) {
      case 'code': return <Code className="w-3.5 h-3.5" />;
      case 'link': return <LinkIcon className="w-3.5 h-3.5" />;
      case 'contact': return <User className="w-3.5 h-3.5" />;
      default: return <Type className="w-3.5 h-3.5" />;
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn(
      "w-[400px] h-[600px] font-sans flex flex-col overflow-hidden shadow-2xl border transition-colors duration-300",
      darkMode 
        ? "bg-zinc-900 text-zinc-100 border-zinc-800 dark" 
        : "bg-white text-zinc-900 border-zinc-200"
    )}>
      {/* Compact Header */}
      <header className={cn(
        "px-4 py-3 border-b flex items-center justify-between shrink-0 z-10 transition-colors duration-300",
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
            darkMode ? "bg-zinc-100" : "bg-zinc-900"
          )}>
            <Hash className={cn("w-4 h-4", darkMode ? "text-zinc-900" : "text-white")} />
          </div>
          <h1 className="font-bold text-base tracking-tight">SnippetVault</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={cn(
              "p-2 rounded-full transition-colors mr-1",
              darkMode ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isSearchVisible 
                ? (darkMode ? "bg-zinc-800 text-zinc-100" : "bg-zinc-100 text-zinc-900") 
                : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            )}
          >
            <Search className="w-4 h-4" />
          </button>
          <button 
            onClick={openAddSnippetModal}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95 shadow-sm",
              darkMode ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search Bar (Expandable) - Animation removed */}
      {isSearchVisible && (
        <div className={cn(
          "px-4 py-2 border-b overflow-hidden transition-colors duration-300",
          darkMode ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50 border-zinc-100"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search snippets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-8 py-1.5 border rounded-lg text-xs outline-none transition-all",
                darkMode 
                  ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-2 focus:ring-zinc-100/10" 
                  : "bg-white border-zinc-200 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              )}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Category Selector with Arrows */}
      <div className={cn(
        "px-1 py-3 border-b flex items-center shrink-0 relative group/nav transition-colors duration-300",
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <button 
          onClick={() => scrollCategories('left')}
          className={cn(
            "p-1 transition-colors z-10",
            darkMode ? "bg-zinc-900 text-zinc-500 hover:text-zinc-100" : "bg-white text-zinc-400 hover:text-zinc-900"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar px-1"
        >
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
              selectedCategoryId === 'all' 
                ? (darkMode ? "bg-zinc-100 text-zinc-900 shadow-sm" : "bg-zinc-900 text-white shadow-sm") 
                : (darkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100")
            )}
          >
            All
          </button>
          
          {categories.map(cat => (
            <div key={cat.id} className="relative group/cat shrink-0">
              <button
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                  selectedCategoryId === cat.id 
                    ? (darkMode ? "bg-zinc-100 text-zinc-900 shadow-sm pr-7" : "bg-zinc-900 text-white shadow-sm pr-7") 
                    : (darkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100")
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </button>
              
              {selectedCategoryId === cat.id && cat.id !== 'default' && (
                <button 
                  onClick={() => setCategoryToDelete(cat)}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 transition-colors",
                    darkMode ? "text-zinc-900/60 hover:text-zinc-900" : "text-white/60 hover:text-white"
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          
          <button 
            onClick={() => setIsAddingCategory(true)}
            className={cn(
              "p-1.5 rounded-full transition-colors shrink-0",
              darkMode ? "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-100" : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button 
          onClick={() => scrollCategories('right')}
          className={cn(
            "p-1 transition-colors z-10",
            darkMode ? "bg-zinc-900 text-zinc-500 hover:text-zinc-100" : "bg-white text-zinc-400 hover:text-zinc-900"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Snippet List - Animation removed */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-300",
        darkMode ? "bg-zinc-950" : "bg-[#F9FAFB]"
      )}>
        {filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
              darkMode ? "bg-zinc-900" : "bg-zinc-100"
            )}>
              <Search className={cn("w-6 h-6", darkMode ? "text-zinc-700" : "text-zinc-300")} />
            </div>
            <h3 className={cn("text-sm font-bold", darkMode ? "text-zinc-100" : "text-zinc-900")}>No snippets</h3>
            <p className="text-[11px] text-zinc-400 mt-1 px-10">
              {searchQuery ? "Try a different search" : "Click the + button to add your first snippet"}
            </p>
          </div>
        ) : (
          filteredSnippets.map(snippet => (
            <div
              key={snippet.id}
              className={cn(
                "group border-2 rounded-xl p-3 hover:shadow-md transition-all flex flex-col relative overflow-hidden",
                darkMode ? "bg-zinc-900 border-opacity-50" : "bg-white"
              )}
              style={{ borderColor: getCategoryColor(snippet.categoryId) }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getCategoryColor(snippet.categoryId)}15`, color: getCategoryColor(snippet.categoryId) }}
                  >
                    {getTypeIcon(snippet.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className={cn("font-bold text-xs truncate", darkMode ? "text-zinc-100" : "text-zinc-900")}>
                      {snippet.title || <span className="text-zinc-500 italic font-normal">Untitled</span>}
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">
                      {format(snippet.createdAt, 'MMM d')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => copyToClipboard(snippet.content, snippet.id)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      darkMode ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100" : "hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900"
                    )}
                  >
                    {copiedId === snippet.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => openEditSnippetModal(snippet)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      darkMode ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100" : "hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900"
                    )}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => deleteSnippet(snippet.id)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      darkMode ? "hover:bg-zinc-800 text-zinc-500 hover:text-red-400" : "hover:bg-zinc-50 text-zinc-400 hover:text-red-500"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className={cn(
                "rounded-lg p-2.5 mb-2 max-h-24 overflow-hidden relative",
                darkMode ? "bg-zinc-950" : "bg-zinc-50"
              )}>
                <p className={cn(
                  "text-[11px] whitespace-pre-wrap",
                  darkMode ? "text-zinc-400" : "text-zinc-600",
                  snippet.type === 'code' && "font-mono text-[10px]"
                )}>
                  {snippet.content}
                </p>
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t to-transparent",
                  darkMode ? "from-zinc-950" : "from-zinc-50"
                )} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  {categories.find(c => c.id === snippet.categoryId)?.name}
                </span>
                {snippet.type === 'link' && (
                  <a 
                    href={snippet.content.startsWith('http') ? snippet.content : `https://${snippet.content}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline",
                      darkMode ? "text-zinc-300" : "text-zinc-900"
                    )}
                  >
                    Open <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <footer className={cn(
        "px-4 py-2 border-t flex items-center justify-between shrink-0 transition-colors duration-300",
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-1 w-16 rounded-full overflow-hidden",
            darkMode ? "bg-zinc-800" : "bg-zinc-100"
          )}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                darkMode ? "bg-zinc-100" : "bg-zinc-900"
              )} 
              style={{ width: `${Math.min(100, (snippets.length / 100) * 100)}%` }} 
            />
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{snippets.length}/100</span>
        </div>
        <span className="text-[9px] text-zinc-400 font-medium italic">SnippetVault v1.0</span>
      </footer>

      {/* Modals - Animations removed */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsAddingCategory(false)}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px]"
          />
          <div className={cn(
            "relative w-full rounded-2xl shadow-2xl overflow-hidden border",
            darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
          )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-base font-bold", darkMode ? "text-zinc-100" : "text-zinc-900")}>New Category</h3>
                <button onClick={() => setIsAddingCategory(false)} className={cn("p-1.5 rounded-full transition-colors", darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100")}>
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name..."
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all",
                      darkMode 
                        ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-zinc-100/10" 
                        : "bg-zinc-50 border-zinc-100 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCategoryColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full transition-all ring-offset-1",
                          newCategoryColor === color 
                            ? (darkMode ? "ring-2 ring-zinc-100 scale-110" : "ring-2 ring-zinc-900 scale-110") 
                            : "hover:scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setIsAddingCategory(false)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    darkMode ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  Cancel
                </button>
                <button 
                  onClick={addCategory}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md",
                    darkMode ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddingSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px]"
          />
          <div className={cn(
            "relative w-full rounded-2xl shadow-2xl overflow-hidden border",
            darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
          )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-base font-bold", darkMode ? "text-zinc-100" : "text-zinc-900")}>
                  {editingSnippetId ? 'Edit Snippet' : 'New Snippet'}
                </h3>
                <button onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }} className={cn("p-1.5 rounded-full transition-colors", darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100")}>
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Title (Optional)</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newSnippetTitle}
                      onChange={(e) => setNewSnippetTitle(e.target.value)}
                      placeholder="Title..."
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all",
                        darkMode 
                          ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-zinc-100/10" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Category</label>
                    <select 
                      value={newSnippetCategoryId}
                      onChange={(e) => setNewSnippetCategoryId(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all appearance-none cursor-pointer",
                        darkMode 
                          ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-zinc-100/10" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                      )}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['text', 'code', 'link', 'contact'] as SnippetType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewSnippetType(type)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                          newSnippetType === type 
                            ? (darkMode ? "bg-zinc-100 border-zinc-100 text-zinc-900 shadow-sm" : "bg-zinc-900 border-zinc-900 text-white shadow-sm") 
                            : (darkMode ? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700" : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300")
                        )}
                      >
                        {getTypeIcon(type)}
                        <span className="text-[8px] font-bold uppercase tracking-widest">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Content</label>
                  <textarea 
                    value={newSnippetContent}
                    onChange={(e) => setNewSnippetContent(e.target.value)}
                    placeholder={newSnippetType === 'code' ? 'Paste code...' : 'Enter content...'}
                    rows={4}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all resize-none",
                      darkMode 
                        ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-zinc-100/10" 
                        : "bg-zinc-50 border-zinc-100 text-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
                      newSnippetType === 'code' && "font-mono text-[10px]"
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    darkMode ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveSnippet}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md",
                    darkMode ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}
                >
                  {editingSnippetId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Deletion Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            onClick={() => { setCategoryToDelete(null); setDeleteConfirmName(''); }}
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
          />
          <div className={cn(
            "relative w-full rounded-2xl shadow-2xl overflow-hidden border",
            darkMode ? "bg-zinc-900 border-red-900/30" : "bg-white border-red-100"
          )}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", darkMode ? "bg-red-950/30" : "bg-red-50")}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold">Delete Category?</h3>
              </div>
              
              <p className={cn("text-xs mb-4 leading-relaxed", darkMode ? "text-zinc-400" : "text-zinc-500")}>
                This will permanently delete the category <span className={cn("font-bold", darkMode ? "text-zinc-100" : "text-zinc-900")}>"{categoryToDelete.name}"</span> and <span className="font-bold text-red-500">all snippets</span> inside it. This action cannot be undone.
              </p>

              <div className="space-y-3">
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  Type <span className={darkMode ? "text-zinc-100" : "text-zinc-900"}>"{categoryToDelete.name}"</span> to confirm
                </label>
                <input 
                  autoFocus
                  type="text" 
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Type category name..."
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all",
                    darkMode 
                      ? "bg-red-950/20 border-red-900/30 text-zinc-100 focus:ring-2 focus:ring-red-500/10" 
                      : "bg-red-50/50 border-red-100 text-zinc-900 focus:ring-2 focus:ring-red-500/10"
                  )}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => { setCategoryToDelete(null); setDeleteConfirmName(''); }}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    darkMode ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  Cancel
                </button>
                <button 
                  disabled={deleteConfirmName !== categoryToDelete.name}
                  onClick={confirmDeleteCategory}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md",
                    deleteConfirmName === categoryToDelete.name 
                      ? "bg-red-600 text-white hover:bg-red-700" 
                      : (darkMode ? "bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none" : "bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none")
                  )}
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

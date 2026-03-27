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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('sv_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sv_snippets', JSON.stringify(snippets));
  }, [snippets]);

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

  const deleteCategory = (id: string) => {
    if (id === 'default') return;
    setCategories(categories.filter(c => c.id !== id));
    setSnippets(snippets.filter(s => s.categoryId !== id));
    if (selectedCategoryId === id) setSelectedCategoryId('all');
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
    if (!newSnippetTitle.trim() || !newSnippetContent.trim()) return;
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

  return (
    <div className="w-[400px] h-[600px] bg-white text-zinc-900 font-sans flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
      {/* Compact Header */}
      <header className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Hash className="text-white w-4 h-4" />
          </div>
          <h1 className="font-bold text-base tracking-tight">SnippetVault</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isSearchVisible ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Search className="w-4 h-4" />
          </button>
          <button 
            onClick={openAddSnippetModal}
            className="p-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search Bar (Expandable) */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-b border-zinc-100 bg-zinc-50 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search snippets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontal Category Selector */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={cn(
            "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
            selectedCategoryId === 'all' 
              ? "bg-zinc-900 text-white shadow-sm" 
              : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
          )}
        >
          All
        </button>
        
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
              selectedCategoryId === cat.id 
                ? "bg-zinc-900 text-white shadow-sm" 
                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
          </button>
        ))}
        
        <button 
          onClick={() => setIsAddingCategory(true)}
          className="p-1.5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 hover:text-zinc-900 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAFB]">
        {filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-zinc-300" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">No snippets</h3>
            <p className="text-[11px] text-zinc-400 mt-1 px-10">
              {searchQuery ? "Try a different search" : "Click the + button to add your first snippet"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSnippets.map(snippet => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={snippet.id}
                className="group bg-white border-2 rounded-xl p-3 hover:shadow-md transition-all flex flex-col relative overflow-hidden"
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
                      <h4 className="font-bold text-xs text-zinc-900 truncate">{snippet.title}</h4>
                      <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">
                        {format(snippet.createdAt, 'MMM d')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => copyToClipboard(snippet.content, snippet.id)}
                      className="p-1.5 hover:bg-zinc-50 rounded-md text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      {copiedId === snippet.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => openEditSnippetModal(snippet)}
                      className="p-1.5 hover:bg-zinc-50 rounded-md text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteSnippet(snippet.id)}
                      className="p-1.5 hover:bg-zinc-50 rounded-md text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-zinc-50 rounded-lg p-2.5 mb-2 max-h-24 overflow-hidden relative">
                  <p className={cn(
                    "text-[11px] text-zinc-600 line-clamp-3 whitespace-pre-wrap",
                    snippet.type === 'code' && "font-mono text-[10px]"
                  )}>
                    {snippet.content}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-zinc-50 to-transparent" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    {categories.find(c => c.id === snippet.categoryId)?.name}
                  </span>
                  {snippet.type === 'link' && (
                    <a 
                      href={snippet.content.startsWith('http') ? snippet.content : `https://${snippet.content}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <footer className="px-4 py-2 border-t border-zinc-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (snippets.length / 100) * 100)}%` }} 
            />
          </div>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{snippets.length}/100</span>
        </div>
        <span className="text-[9px] text-zinc-300 font-medium italic">SnippetVault v1.0</span>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCategory(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-zinc-900">New Category</h3>
                  <button onClick={() => setIsAddingCategory(false)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name..."
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-all ring-offset-1",
                            newCategoryColor === color ? "ring-2 ring-zinc-900 scale-110" : "hover:scale-110"
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
                    className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addCategory}
                    className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-all shadow-md"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingSnippet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingSnippetId ? 'Edit Snippet' : 'New Snippet'}
                  </h3>
                  <button onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Title</label>
                      <input 
                        autoFocus
                        type="text" 
                        value={newSnippetTitle}
                        onChange={(e) => setNewSnippetTitle(e.target.value)}
                        placeholder="Title..."
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Category</label>
                      <select 
                        value={newSnippetCategoryId}
                        onChange={(e) => setNewSnippetCategoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['text', 'code', 'link', 'contact'] as SnippetType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => setNewSnippetType(type)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                            newSnippetType === type 
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm" 
                              : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300"
                          )}
                        >
                          {getTypeIcon(type)}
                          <span className="text-[8px] font-bold uppercase tracking-widest">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Content</label>
                    <textarea 
                      value={newSnippetContent}
                      onChange={(e) => setNewSnippetContent(e.target.value)}
                      placeholder={newSnippetType === 'code' ? 'Paste code...' : 'Enter content...'}
                      rows={4}
                      className={cn(
                        "w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all resize-none",
                        newSnippetType === 'code' && "font-mono text-[10px]"
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }}
                    className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveSnippet}
                    className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-all shadow-md"
                  >
                    {editingSnippetId ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

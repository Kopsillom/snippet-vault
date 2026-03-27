/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  MoreVertical,
  ChevronRight,
  FolderPlus,
  X,
  ExternalLink,
  Hash,
  Pencil
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

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);
  
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetContent, setNewSnippetContent] = useState('');
  const [newSnippetType, setNewSnippetType] = useState<SnippetType>('text');
  const [newSnippetCategoryId, setNewSnippetCategoryId] = useState('');

  // Load data
  useEffect(() => {
    const savedCategories = localStorage.getItem('sv_categories');
    const savedSnippets = localStorage.getItem('sv_snippets');
    
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else {
      // Default category
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
      case 'code': return <Code className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'contact': return <User className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 border-b border-zinc-100">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Hash className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">SnippetVault</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Categories</span>
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="p-1 hover:bg-zinc-100 rounded-md transition-colors text-zinc-500"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedCategoryId === 'all' ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", selectedCategoryId === 'all' ? "bg-white" : "bg-zinc-300")} />
                All Snippets
              </button>
              
              {categories.map(cat => (
                <div key={cat.id} className="group relative">
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all pr-8",
                      selectedCategoryId === cat.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                  {cat.id !== 'default' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-zinc-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100">
          <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
            <p className="text-[10px] text-zinc-400 font-medium mb-1">STORAGE USED</p>
            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 rounded-full" 
                style={{ width: `${Math.min(100, (snippets.length / 100) * 100)}%` }} 
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium">{snippets.length} / 100 snippets</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="h-16 border-b border-zinc-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search snippets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-full text-sm focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddSnippetModal}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Snippet
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                  {selectedCategoryId === 'all' ? 'All Snippets' : categories.find(c => c.id === selectedCategoryId)?.name}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {filteredSnippets.length} {filteredSnippets.length === 1 ? 'snippet' : 'snippets'} found
                </p>
              </div>
            </div>

            {filteredSnippets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">No snippets found</h3>
                <p className="text-zinc-500 max-w-xs mt-2">
                  {searchQuery ? "Try adjusting your search query or category filter." : "Start by creating your first snippet to organize your thoughts."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredSnippets.map(snippet => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={snippet.id}
                      className="group bg-white border-2 rounded-2xl p-5 hover:shadow-xl hover:shadow-zinc-900/5 transition-all flex flex-col"
                      style={{ borderColor: getCategoryColor(snippet.categoryId) }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${getCategoryColor(snippet.categoryId)}15`, color: getCategoryColor(snippet.categoryId) }}
                          >
                            {getTypeIcon(snippet.type)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{snippet.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                              {format(snippet.createdAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => copyToClipboard(snippet.content, snippet.id)}
                            className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedId === snippet.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => openEditSnippetModal(snippet)}
                            className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                            title="Edit snippet"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteSnippet(snippet.id)}
                            className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                            title="Delete snippet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-zinc-50 rounded-xl p-4 mb-4 overflow-hidden">
                        <p className={cn(
                          "text-sm text-zinc-600 line-clamp-4 whitespace-pre-wrap",
                          snippet.type === 'code' && "font-mono text-xs"
                        )}>
                          {snippet.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(snippet.categoryId) }} />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            {categories.find(c => c.id === snippet.categoryId)?.name}
                          </span>
                        </div>
                        {snippet.type === 'link' && (
                          <a 
                            href={snippet.content.startsWith('http') ? snippet.content : `https://${snippet.content}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1 hover:underline"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCategory(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">New Category</h3>
                  <button onClick={() => setIsAddingCategory(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Category Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Work, Personal, Code"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Color Theme</label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all ring-offset-2",
                            newCategoryColor === color ? "ring-2 ring-zinc-900 scale-110" : "hover:scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addCategory}
                    className="flex-1 px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                  >
                    Create Category
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
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">
                    {editingSnippetId ? 'Edit Snippet' : 'New Snippet'}
                  </h3>
                  <button onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                      <input 
                        autoFocus
                        type="text" 
                        value={newSnippetTitle}
                        onChange={(e) => setNewSnippetTitle(e.target.value)}
                        placeholder="Snippet title..."
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                      />
                    </div>
                    <div className="w-40">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                      <select 
                        value={newSnippetCategoryId}
                        onChange={(e) => setNewSnippetCategoryId(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Snippet Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['text', 'code', 'link', 'contact'] as SnippetType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => setNewSnippetType(type)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                            newSnippetType === type 
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-md" 
                              : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300"
                          )}
                        >
                          {getTypeIcon(type)}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Content</label>
                    <textarea 
                      value={newSnippetContent}
                      onChange={(e) => setNewSnippetContent(e.target.value)}
                      placeholder={newSnippetType === 'code' ? 'Paste your code here...' : 'Enter snippet content...'}
                      rows={6}
                      className={cn(
                        "w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all resize-none",
                        newSnippetType === 'code' && "font-mono text-xs"
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => { setIsAddingSnippet(false); setEditingSnippetId(null); }}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveSnippet}
                    className="flex-1 px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                  >
                    {editingSnippetId ? 'Update Snippet' : 'Save Snippet'}
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

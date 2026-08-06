import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Image as ImageIcon, Video as VideoIcon, Upload, Sparkles, Film, Trash2, Plus, CheckCircle2, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type GalleryCategory = 'Elderly Care Activities' | "Children's Activities" | 'Training Sessions' | 'Events' | 'Facility Photos' | 'Family Visitations';

interface StagedMediaItem {
  id: string;
  title: string;
  category: GalleryCategory;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  description: string;
  date: string;
  fileName?: string;
}

export const AddGalleryMediaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addGalleryItem, addMultipleGalleryItems, showToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global settings for batch upload
  const [globalCategory, setGlobalCategory] = useState<GalleryCategory>('Elderly Care Activities');
  const [globalDate, setGlobalDate] = useState('August 2026');
  const [globalDescription, setGlobalDescription] = useState('High-resolution media highlight from daily activities and institutional care.');

  // Staged files list
  const [stagedItems, setStagedItems] = useState<StagedMediaItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Single URL input state
  const [singleUrl, setSingleUrl] = useState('');
  const [singleUrlType, setSingleUrlType] = useState<'image' | 'video'>('image');
  const [singleTitle, setSingleTitle] = useState('');

  if (!isOpen) return null;

  const cleanFileNameToTitle = (fileName: string): string => {
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const cleanName = nameWithoutExt.replace(/[-_]/g, ' ').trim();
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  const processFiles = (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    let loadedCount = 0;

    const newStaged: StagedMediaItem[] = [];

    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';
      const cleanTitle = cleanFileNameToTitle(file.name);

      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        newStaged.push({
          id: `staged-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          title: cleanTitle || `Gallery Media ${stagedItems.length + index + 1}`,
          category: globalCategory,
          mediaType,
          imageUrl: isVideo ? 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80' : resultUrl,
          videoUrl: isVideo ? resultUrl : undefined,
          description: globalDescription,
          date: globalDate,
          fileName: file.name
        });

        loadedCount++;
        if (loadedCount === fileArray.length) {
          setStagedItems(prev => [...prev, ...newStaged]);
          setIsProcessing(false);
          showToast(`Added ${fileArray.length} file(s) to upload queue`);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input value so same files can be chosen again if needed
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddSingleUrl = () => {
    if (!singleUrl.trim()) return;
    const newItem: StagedMediaItem = {
      id: `staged-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: singleTitle.trim() || `Gallery ${singleUrlType === 'video' ? 'Video' : 'Photo'}`,
      category: globalCategory,
      mediaType: singleUrlType,
      imageUrl: singleUrlType === 'image' ? singleUrl.trim() : 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
      videoUrl: singleUrlType === 'video' ? singleUrl.trim() : undefined,
      description: globalDescription,
      date: globalDate,
    };
    setStagedItems(prev => [...prev, newItem]);
    setSingleUrl('');
    setSingleTitle('');
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<StagedMediaItem>) => {
    setStagedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleApplyGlobalCategory = (cat: GalleryCategory) => {
    setGlobalCategory(cat);
    setStagedItems(prev => prev.map(item => ({ ...item, category: cat })));
  };

  const handleApplyGlobalDate = (dt: string) => {
    setGlobalDate(dt);
    setStagedItems(prev => prev.map(item => ({ ...item, date: dt })));
  };

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedItems.length === 0) {
      showToast('Please select or upload at least one photo or video first.');
      return;
    }

    const itemsToSubmit = stagedItems.map(({ title, category, mediaType, imageUrl, videoUrl, description, date }) => ({
      title: title.trim() || 'Gallery Media',
      category,
      mediaType,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      videoUrl,
      description: description.trim() || 'Gallery upload',
      date: date || 'August 2026',
    }));

    if (itemsToSubmit.length === 1) {
      addGalleryItem(itemsToSubmit[0]);
    } else {
      addMultipleGalleryItems(itemsToSubmit);
    }

    setStagedItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Batch Upload Photos & Videos</h2>
                <span className="text-[10px] bg-teal-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Multiple Files Supported
                </span>
              </div>
              <p className="text-xs text-slate-400">Select or drag & drop multiple images and videos to add to the gallery at once</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* Drag & Drop Multi-file Selection Box */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-teal-400/60 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/70 transition-all rounded-3xl p-6 text-center space-y-3 relative group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="multi-file-upload-input"
            />

            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Choose or Drag & Drop Multiple Photos / Videos
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hold <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl</kbd> or <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono">Cmd</kbd> to select multiple files at once (JPG, PNG, WebP, MP4, MOV)
              </p>
            </div>

            <div className="pt-1">
              <label
                htmlFor="multi-file-upload-input"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Browse & Add Multiple Files</span>
              </label>
            </div>

            {isProcessing && (
              <div className="text-xs font-bold text-teal-700 animate-pulse pt-2">
                Processing uploaded media files...
              </div>
            )}
          </div>

          {/* Quick URL Adder (Optional) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Or Add Media via Web Link / URL</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex bg-white rounded-xl border border-slate-200 p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSingleUrlType('image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    singleUrlType === 'image' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Photo
                </button>
                <button
                  type="button"
                  onClick={() => setSingleUrlType('video')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    singleUrlType === 'video' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <VideoIcon className="w-3.5 h-3.5" /> Video
                </button>
              </div>

              <input
                type="text"
                placeholder="Paste Image or Video URL link..."
                value={singleUrl}
                onChange={e => setSingleUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium"
              />

              <button
                type="button"
                onClick={handleAddSingleUrl}
                disabled={!singleUrl.trim()}
                className="bg-teal-700 disabled:opacity-50 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add URL
              </button>
            </div>
          </div>

          {/* Global Defaults for Batch */}
          {stagedItems.length > 0 && (
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Apply Batch Settings to All Items
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                  {stagedItems.length} {stagedItems.length === 1 ? 'item' : 'items'} queued
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Category</label>
                  <select
                    value={globalCategory}
                    onChange={e => handleApplyGlobalCategory(e.target.value as GalleryCategory)}
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white font-medium focus:outline-none"
                  >
                    <option value="Elderly Care Activities">Elderly Care Activities</option>
                    <option value="Children's Activities">Children's Activities</option>
                    <option value="Training Sessions">Training Sessions</option>
                    <option value="Events">Events</option>
                    <option value="Facility Photos">Facility Photos</option>
                    <option value="Family Visitations">Family Visitations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Date / Period</label>
                  <input
                    type="text"
                    value={globalDate}
                    onChange={e => handleApplyGlobalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Staged Items Preview List */}
          {stagedItems.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Staged Gallery Media ({stagedItems.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setStagedItems([])}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-1">
                {stagedItems.map((item, index) => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex gap-3 relative group hover:border-teal-400 transition-all">
                    
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      {item.mediaType === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-rose-400">
                          <VideoIcon className="w-8 h-8" />
                          <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-rose-600 text-white px-1 rounded">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Meta Fields */}
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                          #{index + 1} &bull; {item.mediaType.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStagedItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.title}
                        placeholder="Title..."
                        onChange={e => handleUpdateItem(item.id, { title: e.target.value })}
                        className="w-full text-xs font-bold text-slate-900 border-b border-transparent focus:border-teal-500 outline-none bg-transparent"
                      />

                      <select
                        value={item.category}
                        onChange={e => handleUpdateItem(item.id, { category: e.target.value as GalleryCategory })}
                        className="w-full text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="Elderly Care Activities">Elderly Care Activities</option>
                        <option value="Children's Activities">Children's Activities</option>
                        <option value="Training Sessions">Training Sessions</option>
                        <option value="Events">Events</option>
                        <option value="Facility Photos">Facility Photos</option>
                        <option value="Family Visitations">Family Visitations</option>
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-1">
              <Film className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No media queued yet</p>
              <p className="text-[11px]">Select files above to queue multiple images or videos for upload</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {stagedItems.length > 0 ? (
              <span className="text-slate-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready to publish {stagedItems.length} media item(s)
              </span>
            ) : (
              <span>Select files to begin upload</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={stagedItems.length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload {stagedItems.length > 0 ? `All (${stagedItems.length})` : ''} to Gallery</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

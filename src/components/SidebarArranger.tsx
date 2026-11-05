import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GripVertical,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';
import { ParsedSection } from '../utils/documentParser';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../sampleDocuments';

interface SidebarArrangerProps {
  sections: ParsedSection[];
  onMoveSectionUp: (index: number) => void;
  onMoveSectionDown: (index: number) => void;
  onDeleteSection: (index: number) => void;
  onAddSection: (title: string, level: number) => void;
  onSelectSectionToView?: (sectionId: string) => void;
  onLoadSample: (sample: SampleDoc) => void;
  onFileUpload: (filename: string, content: string) => void;
  activeSectionId?: string;
  isArranging: boolean;
}

export const SidebarArranger: React.FC<SidebarArrangerProps> = ({
  sections,
  onMoveSectionUp,
  onMoveSectionDown,
  onDeleteSection,
  onAddSection,
  onSelectSectionToView,
  onLoadSample,
  onFileUpload,
  activeSectionId,
  isArranging,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionLevel, setNewSectionLevel] = useState(2);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // File reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onFileUpload(file.name, content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    onAddSection(newSectionTitle.trim(), newSectionLevel);
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Header & File Upload */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
            File Sections & Order
          </span>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            {sections.length} {sections.length === 1 ? 'part' : 'sections'}
          </span>
        </div>

        {/* Upload drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/60'
              : 'border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-gray-100/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,.json,.csv,.rtf,.markdown,.log"
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">
              <strong>Upload file</strong> or drop .md, .txt, .csv
            </span>
          </div>
        </div>

        {/* Load Sample Docs Button */}
        <button
          onClick={() => setShowSamplesModal(true)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-gray-200 hover:bg-indigo-50/50 hover:border-indigo-300 rounded-lg text-xs font-medium text-gray-700 hover:text-indigo-700 transition-colors shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span>Load Sample Messy Files</span>
        </button>
      </div>

      {/* Sections Drag/Reorder List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sections.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No structured headings detected yet. Paste text or click Auto-Arrange to organize into clear sections.
          </div>
        ) : (
          sections.map((sec, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === sections.length - 1;
            const isActive = activeSectionId === sec.id;

            return (
              <div
                key={sec.id}
                onClick={() => onSelectSectionToView?.(sec.id)}
                className={`group relative flex items-center justify-between p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-300 shadow-2xs text-indigo-950 font-medium'
                    : 'bg-white hover:bg-gray-100/80 border-gray-200 text-gray-800'
                }`}
                style={{
                  paddingLeft: sec.level > 1 ? `${Math.min(sec.level * 8 + 8, 32)}px` : '8px',
                }}
              >
                {/* Drag handle & title */}
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-[10px] text-gray-400 font-mono w-4 shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">
                      {sec.title || 'Untitled Section'}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      H{sec.level} • {sec.content.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>

                {/* Move Up / Move Down buttons */}
                <div className="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSectionUp(idx);
                    }}
                    disabled={isFirst || isArranging}
                    title="Move section up"
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-indigo-600 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSectionDown(idx);
                    }}
                    disabled={isLast || isArranging}
                    title="Move section down"
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-indigo-600 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(idx);
                    }}
                    disabled={isArranging}
                    title="Delete section"
                    className="p-1 hover:bg-rose-100 rounded text-gray-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Section */}
      <div className="p-2 border-t border-gray-200 bg-white">
        {isAddingSection ? (
          <form onSubmit={handleAddSubmit} className="space-y-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="text"
              placeholder="Section Heading title..."
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              autoFocus
              className="w-full text-xs px-2 py-1.5 bg-white border border-gray-300 rounded focus:border-indigo-500 focus:outline-hidden"
            />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-gray-500">Level:</span>
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewSectionLevel(lvl)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      newSectionLevel === lvl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    H{lvl}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-2 py-1 text-gray-500 hover:text-gray-700 text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 text-[11px]"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingSection(true)}
            className="w-full py-1.5 px-3 border border-dashed border-gray-300 hover:border-indigo-400 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Section</span>
          </button>
        )}
      </div>

      {/* Samples Modal */}
      {showSamplesModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Select a Sample File to Arrange & Fix
                </h3>
                <p className="text-xs text-gray-500">
                  These real drafts contain grammar errors, out-of-order sections, and structural issues.
                </p>
              </div>
              <button
                onClick={() => setShowSamplesModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {SAMPLE_DOCUMENTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    onLoadSample(sample);
                    setShowSamplesModal(false);
                  }}
                  className="p-3 border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/40 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                      {sample.title}
                    </span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {sample.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {sample.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowSamplesModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

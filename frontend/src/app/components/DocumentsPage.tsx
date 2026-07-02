import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, FileText, Trash2, Download, Sparkles, RefreshCw,
  CheckCircle2, AlertCircle, Clock, File, FileType, X, ChevronRight
} from "lucide-react";

interface FileItem {
  fileName: string;
  originalName?: string;
  size: number;
  lastModified?: string;
  contentType?: string;
}

interface AnalysisResult {
  fileName: string;
  analysis: string;
  extractedTextLength: number;
  model: string;
}

interface DocumentsPageProps {
  user: { name: string; email: string; company: string };
}

function renderAnalysis(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={j} style={{ color: '#86BC25' }}>{part.slice(2, -2)}</strong>;
    if (/^\*\s+/.test(part))
        return <span key={j}>• {part.replace(/^\*\s+/, '')}</span>;
      return part;
    });
    if (line === '') return <div key={i} className="h-2" />;
    return <p key={i} className="leading-relaxed text-sm">{rendered}</p>;
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  const color = ext === 'pdf' ? '#EF4444' : ext === 'txt' ? '#86BC25' :
    ['doc','docx'].includes(ext||'') ? '#3B82F6' : '#E8A44A';
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
    style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
    {(ext||'?').toUpperCase().slice(0,3)}
  </div>;
}

export function DocumentsPage({ user }: DocumentsPageProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/files/list");
      if (r.ok) setFiles(await r.json());
      else throw new Error("Failed to load files");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useState(() => { fetchFiles(); });

  const uploadFile = async (file: File) => {
    const allowed = ['.pdf','.doc','.docx','.txt','.png','.jpg','.jpeg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`File type not allowed. Allowed: ${allowed.join(', ')}`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB');
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await fetch('/files/upload', { method: 'POST', body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Upload failed');
      setSuccess(`✅ "${file.name}" uploaded successfully to MinIO`);
      setTimeout(() => setSuccess(""), 4000);
      fetchFiles();
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(false);
  };

  const deleteFile = async (fileName: string) => {
    try {
      const r = await fetch(`/files/delete/${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      setFiles(prev => prev.filter(f => f.fileName !== fileName));
      if (selectedFile?.fileName === fileName) setSelectedFile(null);
      if (analysis?.fileName === fileName) setAnalysis(null);
      setSuccess("File deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const analyzeFile = async (fileName: string) => {
    setAnalyzing(fileName);
    setAnalysis(null);
    setError("");
    try {
      const r = await fetch(`/files/analyze/${encodeURIComponent(fileName)}`, { method: 'POST' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data);
    } catch (e: any) {
      setError(e.message);
    }
    setAnalyzing(null);
  };

  const downloadFile = (fileName: string) => {
    window.open(`/files/download/${encodeURIComponent(fileName)}`, '_blank');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: '#0A0B0D' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 700, color: '#F0F2F0' }}>
          Document Intelligence
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6B7A5E' }}>
          Upload meeting notes, reports, and documents — AI extracts action items and priorities automatically
        </p>
      </div>

      {/* Status messages */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 mb-4 p-3 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={14} style={{ color: '#EF4444' }} />
            <span className="text-xs" style={{ color: '#EF4444' }}>{error}</span>
            <button onClick={() => setError("")} className="ml-auto"><X size={12} style={{ color: '#EF4444' }} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 mb-4 p-3 rounded-lg"
            style={{ background: 'rgba(134,188,37,0.08)', border: '1px solid rgba(134,188,37,0.2)' }}>
            <CheckCircle2 size={14} style={{ color: '#86BC25' }} />
            <span className="text-xs" style={{ color: '#86BC25' }}>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Upload + File List */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{
              background: dragOver ? 'rgba(134,188,37,0.08)' : '#111318',
              border: dragOver ? '2px dashed #86BC25' : '2px dashed rgba(134,188,37,0.2)',
              transform: dragOver ? 'scale(1.01)' : 'scale(1)'
            }}>
            <input ref={fileInputRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); }} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#86BC25] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm" style={{ color: '#86BC25' }}>Uploading to MinIO...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(134,188,37,0.1)', border: '1px solid rgba(134,188,37,0.2)' }}>
                  <Upload size={22} style={{ color: '#86BC25' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F0F2F0' }}>
                    {dragOver ? 'Drop file here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#4A5568' }}>
                    PDF, DOC, DOCX, TXT, PNG, JPG · Max 10MB
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(134,188,37,0.06)', border: '1px solid rgba(134,188,37,0.1)', color: '#6B7A5E' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Stored in MinIO · AI-ready
                </div>
              </div>
            )}
          </div>

          {/* File list */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
              <span className="text-xs font-semibold" style={{ color: '#86BC25' }}>
                Files in MinIO ({files.length})
              </span>
              <button onClick={fetchFiles} disabled={loading}
                className="p-1 rounded hover:bg-[#1A1E24] disabled:opacity-40">
                <RefreshCw size={13} style={{ color: '#6B7A5E' }} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#86BC25] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="py-8 text-center">
                <FileText size={24} className="mx-auto mb-2" style={{ color: '#2D3440' }} />
                <p className="text-xs" style={{ color: '#4A5568' }}>No files uploaded yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(134,188,37,0.05)' }}>
                {files.map(file => (
                  <motion.div key={file.fileName} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#0D1117] cursor-pointer transition-colors"
                    style={selectedFile?.fileName === file.fileName ? { background: 'rgba(134,188,37,0.04)' } : {}}
                    onClick={() => setSelectedFile(file)}>
                    {fileIcon(file.fileName)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#F0F2F0' }}>
                        {file.fileName.replace(/^\d+_/, '')}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#4A5568' }}>
                        {formatBytes(file.size)} · {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); downloadFile(file.fileName); }}
                        className="p-1.5 rounded hover:bg-[#1A1E24]" title="Download">
                        <Download size={13} style={{ color: '#6B7A5E' }} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); analyzeFile(file.fileName); }}
                        disabled={analyzing === file.fileName}
                        className="p-1.5 rounded hover:bg-[#1A1E24] disabled:opacity-40" title="Analyze with AI">
                        {analyzing === file.fileName
                          ? <div className="w-3 h-3 border border-[#86BC25] border-t-transparent rounded-full animate-spin" />
                          : <Sparkles size={13} style={{ color: '#86BC25' }} />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteFile(file.fileName); }}
                        className="p-1.5 rounded hover:bg-[#1A1E24]" title="Delete">
                        <Trash2 size={13} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                    {selectedFile?.fileName === file.fileName && <ChevronRight size={12} style={{ color: '#86BC25' }} />}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Files", value: files.length, icon: FileText },
              { label: "Total Size", value: formatBytes(files.reduce((s, f) => s + f.size, 0)), icon: File },
              { label: "Storage", value: "MinIO", icon: FileType },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-3" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                <stat.icon size={14} style={{ color: '#86BC25' }} className="mb-2" />
                <div className="text-sm font-bold" style={{ color: '#F0F2F0' }}>{stat.value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#4A5568' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — AI Analysis */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)', minHeight: '400px' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #86BC25, #4A9B6F)' }}>
                <Sparkles size={12} style={{ color: '#0A0B0D' }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#F0F2F0' }}>AI Document Analysis</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(134,188,37,0.1)', color: '#86BC25', border: '1px solid rgba(134,188,37,0.2)' }}>
                Groq/Llama-3.1
              </span>
            </div>

            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-2 border-[#86BC25] border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: '#F0F2F0' }}>Analyzing document...</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7A5E' }}>Extracting text · Running AI analysis</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg"
                  style={{ background: 'rgba(134,188,37,0.05)', border: '1px solid rgba(134,188,37,0.1)' }}>
                  <CheckCircle2 size={14} style={{ color: '#86BC25' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#86BC25' }}>
                      {analysis.fileName.replace(/^\d+_/, '')}
                    </p>
                    <p className="text-[10px]" style={{ color: '#4A5568' }}>
                      {analysis.extractedTextLength} characters extracted · {analysis.model}
                    </p>
                  </div>
                  <button onClick={() => setAnalysis(null)} className="ml-auto">
                    <X size={13} style={{ color: '#4A5568' }} />
                  </button>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-1"
                  style={{ color: '#C8D4B8' }}>
                  {renderAnalysis(analysis.analysis)}
                </div>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
                {fileIcon(selectedFile.fileName)}
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F0F2F0' }}>
                    {selectedFile.fileName.replace(/^\d+_/, '')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B7A5E' }}>{formatBytes(selectedFile.size)}</p>
                </div>
                <button onClick={() => analyzeFile(selectedFile.fileName)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                  style={{ background: '#86BC25', color: '#0A0B0D' }}>
                  <Sparkles size={14} />
                  Analyze with AI
                </button>
                <p className="text-xs" style={{ color: '#4A5568' }}>
                  AI will extract summary, action items, and priorities
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(134,188,37,0.06)', border: '1px solid rgba(134,188,37,0.1)' }}>
                  <Sparkles size={22} style={{ color: '#86BC25' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F0F2F0' }}>AI Document Intelligence</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6B7A5E' }}>
                    Upload a meeting note or report, then click{' '}
                    <span style={{ color: '#86BC25' }}>✦ Analyze</span> to extract
                    action items and priorities automatically
                  </p>
                </div>
                <div className="w-full mt-2 space-y-2">
                  {[
                    { icon: FileText, text: "Upload MOM / retrospective notes" },
                    { icon: Sparkles, text: "AI extracts action items & priorities" },
                    { icon: CheckCircle2, text: "Tasks created automatically in DB" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg text-left"
                      style={{ background: '#0D1117', border: '1px solid rgba(134,188,37,0.06)' }}>
                      <step.icon size={13} style={{ color: '#86BC25' }} />
                      <span className="text-xs" style={{ color: '#6B7A5E' }}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  applicationId: string;
  fileType: 'abstract' | 'full_paper' | 'supplementary';
  label: string;
  description?: string;
  required?: boolean;
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  existingFile?: UploadedFile;
}

export interface UploadedFile {
  id: string;
  name: string;
  uniqueName: string;
  size: number;
  type: string;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export default function FileUpload({
  applicationId,
  fileType,
  label,
  description,
  required = false,
  onUploadSuccess,
  onUploadError,
  existingFile,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(existingFile || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('fileType', fileType);

      // Simulate progress (since we can't track actual progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const response = await fetch('/api/applications/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedFile(result.file);
      onUploadSuccess?.(result.file);
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setUploadedFile(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {description && <p className="text-xs text-gray-500">{description}</p>}

      {/* Upload Area */}
      {!uploadedFile && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            className="hidden"
            id={`file-${fileType}-${applicationId}`}
          />
          <label
            htmlFor={`file-${fileType}-${applicationId}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              uploading
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-sm text-blue-600 font-medium">
                    Yükleniyor... {uploadProgress}%
                  </p>
                  {/* Progress Bar */}
                  <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Dosya seçmek için tıklayın</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (Max 10MB)
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* File Info */}
      <div className="text-xs text-gray-500">
        <p>• Maksimum dosya boyutu: 10MB</p>
        <p>• Kabul edilen formatlar: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG</p>
      </div>
    </div>
  );
}

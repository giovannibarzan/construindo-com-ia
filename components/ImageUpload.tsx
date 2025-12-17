
import React, { useState, useRef } from 'react';
import { backend } from '../services/backend';

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  folder?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentImageUrl, onImageUploaded, folder = 'general', className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setUploading(true);
    setError(null);

    try {
      const publicUrl = await backend.uploadImage(file, folder);
      onImageUploaded(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      // Reset input para permitir selecionar o mesmo arquivo novamente se falhar
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onImageUploaded('');
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden group
          ${currentImageUrl ? 'border-transparent h-48 bg-gray-100 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 h-32 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
          disabled={uploading}
        />

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
             <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
             <p className="text-xs font-bold text-gray-500">Enviando...</p>
          </div>
        ) : currentImageUrl ? (
          <>
            <img 
              src={currentImageUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
               <span className="text-white text-sm font-bold flex items-center gap-1">
                   <span className="material-symbols-outlined">edit</span> Trocar
               </span>
               <button 
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                title="Remover imagem"
               >
                   <span className="material-symbols-outlined !text-lg block">delete</span>
               </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-3xl mb-1">cloud_upload</span>
            <p className="text-xs font-medium">Clique para fazer upload</p>
            <p className="text-[10px] mt-1 opacity-70">PNG, JPG até 5MB</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined !text-sm">error</span> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;

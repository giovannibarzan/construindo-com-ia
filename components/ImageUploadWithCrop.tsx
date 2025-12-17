import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { backend } from '../services/backend';

interface ImageUploadWithCropProps {
  label: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: number; // 1 para quadrado, 16/9 para landscape, etc
}

const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  label,
  currentImageUrl,
  onImageUploaded,
  folder = 'general',
  className = '',
  aspectRatio = 1
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Por favor, selecione uma imagem válida (JPG, PNG, GIF ou WebP)");
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 10MB");
      return;
    }

    // Criar preview para crop
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const createCroppedImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = selectedImage!;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx || !croppedAreaPixels) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/webp', 0.9);
      };
    });
  };

  const handleSaveCrop = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    setUploading(true);
    setError(null);

    try {
      // Deletar imagem antiga se existir
      if (currentImageUrl) {
        console.log('Deletando imagem antiga:', currentImageUrl);
        await backend.deleteImage(currentImageUrl);
      }

      // Criar imagem cortada
      const croppedBlob = await createCroppedImage();
      const croppedFile = new File([croppedBlob], 'cropped-image.webp', { type: 'image/webp' });

      // Upload
      const publicUrl = await backend.uploadImage(croppedFile, folder);
      console.log('Nova imagem enviada:', publicUrl);
      onImageUploaded(publicUrl);

      // Limpar
      setSelectedImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err: any) {
      console.error('Erro ao processar imagem:', err);
      setError(err.message || 'Erro ao processar imagem');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Deletar do bucket
    if (currentImageUrl) {
      console.log('Removendo imagem:', currentImageUrl);
      await backend.deleteImage(currentImageUrl);
    }

    onImageUploaded('');
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Preview / Upload Area */}
      <div
        onClick={() => !selectedImage && fileInputRef.current?.click()}
        className={`relative w-full rounded-lg border-2 border-dashed transition-all overflow-hidden group
          ${selectedImage ? 'border-transparent' : currentImageUrl ? 'border-transparent h-48 bg-gray-100 dark:bg-gray-800 cursor-pointer' : 'border-gray-300 dark:border-gray-700 h-32 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs font-bold text-gray-500">Processando...</p>
          </div>
        ) : currentImageUrl && !selectedImage ? (
          <>
            <img
              src={`${currentImageUrl}?t=${Date.now()}`}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Erro ao carregar imagem:', currentImageUrl);
                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Erro+ao+carregar';
              }}
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
        ) : !selectedImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-3xl mb-1">cloud_upload</span>
            <p className="text-xs font-medium">Clique para fazer upload</p>
            <p className="text-[10px] mt-1 opacity-70">PNG, JPG até 10MB</p>
          </div>
        ) : null}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span className="material-symbols-outlined !text-sm">error</span> {error}
        </p>
      )}

      {/* Crop Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ajustar Imagem</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Posicione e ajuste o zoom da sua imagem</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Cropper Area */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
              <div className="relative w-full mx-auto" style={{ aspectRatio: aspectRatio, maxHeight: '60vh' }}>
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-4">
                {/* Zoom Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-base">zoom_in</span>
                      Zoom
                    </label>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCrop}
                    disabled={uploading}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined !text-lg">check</span>
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ImageUploadWithCrop;

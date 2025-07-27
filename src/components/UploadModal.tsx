import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Check, AlertCircle, Loader2, Info, Brain, Shield } from 'lucide-react';
import { useMemes } from '../hooks/useMemes';
import { useAuth } from '../hooks/useAuth';
import { useOCR } from '../hooks/useOCR';
import { useStats } from '../hooks/useStats';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  ocrText: string;
  suggestedCategory: string;
  selectedTag: string;
  status: 'processing' | 'completed' | 'error' | 'duplicate';
}

const commonTags = [
  'engraçado', 'hilário', 'comédia', 'piada', 'riso',
  'trabalho', 'segunda-feira', 'sexta-feira', 'chefe', 'escritório',
  'amor', 'relacionamento', 'namorada', 'namorado', 'casal',
  'futebol', 'petro', 'primeiro', 'golo', 'jogo',
  'política', 'governo', 'angola', 'presidente',
  'luanda', 'chuva', 'trânsito', 'kwanza', 'dinheiro',
  'quando', 'cara', 'reação', 'expressão', 'sentimento',
  'gaming', 'playstation', 'fifa', 'pes',
  'música', 'artista', 'cantor', 'banda',
  'filme', 'série', 'cinema', 'tv',
  'comida', 'casa', 'família', 'amigos'
];

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { uploadMeme, isBackendConfigured, checkForDuplicates, uploading } = useMemes();
  const { user, isConfigured } = useAuth();
  const { extractText, suggestCategory, isProcessing } = useOCR();
  const { categories } = useStats();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      const uploadedFile: UploadedFile = {
        id,
        file,
        preview,
        ocrText: '',
        suggestedCategory: '',
        selectedTag: '',
        status: 'processing'
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // ✅ MELHORADO: Verificar duplicatas primeiro com feedback visual
        const isDuplicate = await checkForDuplicates(file);
        if (isDuplicate) {
          setUploadedFiles(prev => prev.map(f => 
            f.id === id 
              ? { 
                  ...f, 
                  ocrText: 'Arquivo duplicado detectado - este meme já existe na plataforma',
                  suggestedCategory: 'Outros',
                  status: 'duplicate' 
                }
              : f
          ));
          continue;
        }

        // Processar OCR real
        const ocrText = await extractText(file);
        const suggestedCat = suggestCategory(ocrText);

        setUploadedFiles(prev => prev.map(f => 
          f.id === id 
            ? { 
                ...f, 
                ocrText: ocrText || 'Nenhum texto detectado',
                suggestedCategory: suggestedCat,
                status: 'completed' 
              }
            : f
        ));
      } catch (error) {
        console.error('Erro no processamento OCR:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === id 
            ? { 
                ...f, 
                ocrText: 'Erro no processamento',
                suggestedCategory: 'Outros',
                status: 'error' 
              }
            : f
        ));
      }
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const updateFileTag = (id: string, tag: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, selectedTag: tag } : f
    ));
  };

  const handleSubmit = async () => {
    if (!isBackendConfigured) {
      toast.error('Configure o Supabase para fazer uploads permanentes');
      return;
    }

    if (!user) {
      toast.error('Faça login para enviar memes');
      return;
    }

    if (uploading) {
      toast.error('Upload já em andamento. Aguarde...');
      return;
    }

    const validFiles = uploadedFiles.filter(f => f.status === 'completed');
    if (validFiles.length === 0) {
      toast.error('Nenhum arquivo válido para enviar');
      return;
    }

    // Verificar se categoria foi selecionada
    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return;
    }

    // Verificar se todos os arquivos têm tags selecionadas
    const filesWithoutTags = validFiles.filter(f => !f.selectedTag);
    if (filesWithoutTags.length > 0) {
      toast.error('Selecione uma tag para todos os arquivos');
      return;
    }

    try {
      for (const file of validFiles) {
        await uploadMeme(file.file, {
          title: title || file.file.name,
          description,
          tags: [file.selectedTag],
          category: selectedCategory,
          ocrText: file.ocrText
        });
      }

      // Reset form
      setUploadedFiles([]);
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      onClose();
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleLocalSubmit = () => {
    // Para uso sem backend - apenas simular o processo
    toast.success('Memes processados localmente! (Configure o Supabase para uploads permanentes)');
    setUploadedFiles([]);
    setTitle('');
    setDescription('');
    setSelectedCategory('');
    onClose();
  };

  // Condições para habilitar o botão de enviar
  const validFiles = uploadedFiles.filter(f => f.status === 'completed');
  const hasValidFiles = validFiles.length > 0;
  const hasCategory = selectedCategory !== '';
  const allFilesHaveTags = validFiles.every(f => f.selectedTag !== '');
  const notProcessing = !uploading && !isProcessing && !uploadedFiles.some(f => f.status === 'processing');

  const canSubmit = hasValidFiles && hasCategory && allFilesHaveTags && notProcessing;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Contribuir com Memes
                  </h2>
                  {(isProcessing || uploading) && (
                    <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                      <Brain className="h-5 w-5 animate-pulse" />
                      <span className="text-sm">
                        {uploading ? 'Enviando...' : 'Processando OCR...'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={uploading}
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Faça upload de imagens e nossa IA irá categorizar automaticamente usando OCR
              </p>

              {/* Anti-duplicate notice */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Sistema Anti-Duplicação Ativo
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Verificamos automaticamente se o meme já existe na plataforma para manter a qualidade do acervo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status do Backend */}
              {!isBackendConfigured && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Modo Local Ativo
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Configure o Supabase para uploads permanentes. No modo local, os memes são apenas processados temporariamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isBackendConfigured && !user && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Login Necessário
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Faça login para enviar memes permanentemente para a plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Arraste e solte imagens aqui
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ou clique para selecionar arquivos
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 cursor-pointer transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Image className="mr-2 h-5 w-5" />
                  Selecionar Imagens
                </label>
              </div>

              {/* Global Category Selection */}
              {uploadedFiles.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configurações Globais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoria (obrigatório) *
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={uploading}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Imagens Carregadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedFiles.map(file => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg overflow-hidden border-2 ${
                          file.status === 'duplicate' 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                          <button
                            onClick={() => removeFile(file.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            disabled={uploading}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.file.name}
                            </span>
                            {file.status === 'processing' && (
                              <div className="flex items-center space-x-1">
                                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                                <Brain className="h-4 w-4 text-primary-500 animate-pulse" />
                              </div>
                            )}
                            {file.status === 'completed' && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            {file.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            {file.status === 'duplicate' && (
                              <div className="flex items-center space-x-1">
                                <Shield className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Duplicado</span>
                              </div>
                            )}
                          </div>
                          {file.status === 'processing' && (
                            <p className="text-xs text-gray-500">Processando OCR e verificando duplicados...</p>
                          )}
                          {file.status === 'completed' && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                              <p><strong>Texto detectado:</strong> "{file.ocrText}"</p>
                              <div>
                                <label className="block text-xs font-medium mb-1">Tag (obrigatório) *:</label>
                                <select
                                  value={file.selectedTag}
                                  onChange={(e) => updateFileTag(file.id, e.target.value)}
                                  className="w-full text-xs p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                                  disabled={uploading}
                                  required
                                >
                                  <option value="">Selecione uma tag</option>
                                  {commonTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                          {file.status === 'error' && (
                            <p className="text-xs text-red-500">Erro no processamento OCR</p>
                          )}
                          {file.status === 'duplicate' && (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              <p className="font-medium">⚠️ Meme Duplicado Detectado</p>
                              <p className="mt-1">Este arquivo é muito similar a um meme já existente na plataforma. Por favor, escolha outro arquivo.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dê um título aos seus memes"
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o contexto ou adicione informações extras"
                    rows={3}
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  
                  <motion.button
                    whileHover={canSubmit ? { scale: 1.05 } : {}}
                    whileTap={canSubmit ? { scale: 0.95 } : {}}
                    onClick={isBackendConfigured && user ? handleSubmit : handleLocalSubmit}
                    disabled={!canSubmit}
                    className={`px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                      canSubmit 
                        ? 'hover:shadow-lg cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {uploading 
                        ? 'Enviando...' 
                        : isBackendConfigured && user 
                          ? 'Enviar Memes' 
                          : 'Processar Localmente'
                      }
                    </span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
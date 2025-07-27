import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import toast from 'react-hot-toast';

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);

  const extractText = async (imageFile: File): Promise<string> => {
    setIsProcessing(true);
    
    try {
      const worker = await createWorker('por', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            // Opcional: mostrar progresso
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();

      // Limpar e processar o texto extraído
      const cleanText = text
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      return cleanText;
    } catch (error) {
      console.error('Erro no OCR:', error);
      toast.error('Erro ao processar texto da imagem');
      return '';
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestCategory = (ocrText: string): string => {
    const text = ocrText.toLowerCase();
    
    // Palavras-chave para categorização automática
    const categoryKeywords = {
      'Reação': ['quando', 'cara', 'expressão', 'reação', 'sentimento', 'emoção'],
      'Trabalho': ['trabalho', 'chefe', 'escritório', 'reunião', 'segunda', 'sexta', 'salário', 'férias'],
      'Esportes': ['futebol', 'golo', 'petro', 'primeiro', 'benfica', 'interclube', 'bola', 'jogo'],
      'Política': ['governo', 'presidente', 'ministro', 'política', 'eleições', 'angola'],
      'Amor': ['amor', 'namorada', 'namorado', 'coração', 'relacionamento', 'casal'],
      'Cotidiano': ['luanda', 'chuva', 'trânsito', 'kwanza', 'dinheiro', 'comida', 'casa'],
      'Humor': ['engraçado', 'piada', 'riso', 'comédia', 'hilário'],
      'Games': ['jogo', 'gaming', 'playstation', 'xbox', 'fifa', 'pes']
    };

    // Encontrar categoria com mais matches
    let bestCategory = 'Cotidiano'; // categoria padrão
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  };

  return {
    extractText,
    suggestCategory,
    isProcessing
  };
}
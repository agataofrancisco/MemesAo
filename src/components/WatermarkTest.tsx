import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye } from 'lucide-react'
import Watermark from './Watermark'

export default function WatermarkTest() {
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const testImageUrl =
    'https://via.placeholder.com/800x600/8B5CF6/FFFFFF?text=Teste+Watermark'

  const handleWatermarkedImage = (url: string) => {
    setWatermarkedImage(url)
    setIsProcessing(false)
  }

  const testWatermark = () => {
    setIsProcessing(true)
    setWatermarkedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Teste do Watermark
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Testa a funcionalidade de adicionar "Baixado em memes.ao" nas
            imagens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagem Original */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Imagem Original
            </h3>
            <img
              src={testImageUrl}
              alt="Imagem de teste"
              className="w-full h-auto rounded-lg mb-4"
            />
            <button
              onClick={testWatermark}
              disabled={isProcessing}
              className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Processando...' : 'Testar Watermark'}
            </button>
          </div>

          {/* Imagem com Watermark */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Imagem com Watermark
            </h3>
            {watermarkedImage ? (
              <div>
                <img
                  src={watermarkedImage}
                  alt="Imagem com watermark"
                  className="w-full h-auto rounded-lg mb-4"
                />
                <a
                  href={watermarkedImage}
                  download="meme-com-watermark.jpg"
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar com Watermark
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {isProcessing ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Processando...
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Clique em "Testar Watermark" para ver o resultado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Componente Watermark (invisível) */}
        <Watermark
          imageUrl={testImageUrl}
          onWatermarkedImage={handleWatermarkedImage}
        />
      </div>
    </div>
  )
}

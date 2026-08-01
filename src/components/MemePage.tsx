import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Download, Share2, Eye, Trophy } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useMetaTags } from '../hooks/useMetaTags'
import { apiGet } from '../lib/api'
import type { Meme } from '../lib/types'

export default function MemePage() {
  const { memeId } = useParams<{ memeId: string }>()
  const navigate = useNavigate()

  console.log('MemePage renderizado com memeId:', memeId)

  const { toggleFavorite, favorites, downloadMeme, shareMemeWithUrl } = useMemes()

  const [meme, setMeme] = useState<Meme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usar o hook useMetaTags para atualizar as meta tags
  useMetaTags({
    title: meme ? `${meme.title || 'Meme'} - MemesAo` : 'Meme - MemesAo',
    description:
      meme?.description || 'Descubra este meme engraçado no MemesAo!',
    image: meme?.image_url,
    url: meme ? `${window.location.origin}/meme/${meme.id}` : undefined,
    type: 'article',
  })

  useEffect(() => {
    console.log('MemePage useEffect triggered, memeId:', memeId)

    const loadMeme = async () => {
      if (!memeId) return

      try {
        setLoading(true)
        console.log('Loading meme with ID:', memeId)

        const data = await apiGet<{ meme: Meme }>(
          `/api/memes/${encodeURIComponent(memeId)}`,
        )

        if (data.meme) {
          setMeme(data.meme)
        }
      } catch (err) {
        console.error('Erro ao carregar meme:', err)
        setError('Meme não encontrado')
      } finally {
        setLoading(false)
      }
    }

    loadMeme()
  }, [memeId])

  // Verificar se memeId existe
  if (!memeId) {
    console.log('memeId não fornecido')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-300">
              ID do meme não fornecido
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleFavorite = async () => {
    if (!meme) return
    await toggleFavorite(meme.id)
  }

  const handleDownload = async () => {
    if (!meme) return
    await downloadMeme(meme)
  }

  const handleShare = async () => {
    if (!meme) return
    await shareMemeWithUrl(meme)
  }

  if (loading) {
    console.log('Renderizando loading...')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando meme...
          </p>
        </div>
      </div>
    )
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-300">
              {error || 'Meme não encontrado'}
            </p>
            <button
              onClick={handleBack}
              className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isFavorite = favorites.includes(meme.id)
  const score =
    (meme.like_count || 0) +
    (meme.download_count || 0) * 2 +
    (meme.share_count || 0) * 3

  // Meta tags para SEO e partilhas (comentado temporariamente para debug)
  // useMetaTags({
  //   title: meme.title || 'Meme Engraçado - MemesAo',
  //   description: meme.description || 'Confira este meme engraçado no MemesAo!',
  //   image: meme.image_url,
  //   url: window.location.href,
  //   type: 'article'
  // })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Imagem do meme */}
          <div className="relative">
            <img
              src={meme.image_url}
              alt={meme.title || 'Meme'}
              className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
              loading="lazy"
            />

            {/* Overlay com estatísticas */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{(meme.view_count || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>{score.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do meme */}
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {meme.title || 'Meme sem título'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {meme.description || 'Sem descrição'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Categoria: {meme.category}</span>
                <span>⬢</span>
                <span>Por: {meme.uploaded_by_name}</span>
                <span>⬢</span>
                <span>
                  {new Date(meme.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Estatísticas detalhadas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(meme.like_count || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Likes
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Download className="h-5 w-5 text-primary-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(meme.download_count || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Downloads
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Share2 className="h-5 w-5 text-success-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(meme.share_count || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Partilhas
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-5 w-5 text-accent-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Score
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleFavorite}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isFavorite
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`}
                />
                {isFavorite ? 'Desfavoritar' : 'Favoritar'}
              </button>

              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-2" />
                Download
              </button>

              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-success-600 text-white rounded-xl font-medium hover:bg-success-700 transition-all duration-200"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Partilhar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

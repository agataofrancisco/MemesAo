import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Share2, Eye } from 'lucide-react';
import { useMemes } from '../hooks/useMemes';
import toast from 'react-hot-toast';

export default function FeaturedMemes() {
  const { featuredMemes, favorites, toggleFavorite, downloadMeme, loading } = useMemes();

  const handleShare = async (meme: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: `Confira este meme: ${meme.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback para clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <section id="memes" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Memes em Destaque
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Os memes mais curtidos da semana, escolhidos pela comunidade
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="aspect-square bg-gray-300 dark:bg-gray-700" />
                <div className="p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="memes" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Memes em Destaque
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Os memes mais curtidos da semana, baseados nos favoritos da comunidade
          </p>
        </motion.div>

        {featuredMemes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum meme em destaque no momento.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Configure o Supabase para ver os memes mais populares da comunidade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredMemes.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={meme.image_url}
                    alt={meme.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {meme.category}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Heart size={12} className="mr-1 fill-current" />
                      {meme.favorite_count}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {meme.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye size={16} className="mr-1" />
                        {meme.view_count?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center">
                        <Download size={16} className="mr-1" />
                        {meme.download_count || 0}
                      </span>
                    </div>
                  </div>

                  {meme.ocr_text && (
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                      "{meme.ocr_text}"
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFavorite(meme.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        favorites.includes(meme.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <Heart size={16} className={favorites.includes(meme.id) ? 'fill-current' : ''} />
                      <span>{meme.favorite_count}</span>
                    </motion.button>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShare(meme)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <Share2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadMeme(meme)}
                        className="p-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        <Download size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
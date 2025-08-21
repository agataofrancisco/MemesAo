import React from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Zap,
  Search,
  Upload,
  Shield,
  Users,
  BarChart3,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    id: 1,
    icon: Brain,
    title: 'OCR Inteligente',
    description:
      'Tecnologia avançada que lê texto em imagens para categorização automática e busca precisa.',
    color: 'from-primary-500 to-blue-500',
  },
  {
    id: 2,
    icon: Zap,
    title: 'Categorização Automática',
    description:
      'IA analisa conteúdo visual e textual para organizar memes automaticamente.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    icon: Search,
    title: 'Busca Avançada',
    description:
      'Pesquise por texto, categoria, tags ou até mesmo pelo conteúdo das imagens.',
    color: 'from-teal-500 to-green-500',
  },
  {
    id: 4,
    icon: Upload,
    title: 'Upload Fácil',
    description:
      'Interface intuitiva com drag & drop para Publicar com a comunidade.',
    color: 'from-accent-500 to-red-500',
  },
  {
    id: 5,
    icon: Shield,
    title: 'Moderação Inteligente',
    description:
      'Sistema de moderação que garante qualidade e adequação do conteúdo.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 6,
    icon: Users,
    title: 'Comunidade Ativa',
    description:
      'Milhares de usuários contribuindo e compartilhando os melhores memes.',
    color: 'from-pink-500 to-red-500',
  },
  {
    id: 7,
    icon: BarChart3,
    title: 'Analytics Detalhado',
    description:
      'Acompanhe tendências, popularidade e estatísticas em tempo real.',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 8,
    icon: Smartphone,
    title: 'Totalmente Responsivo',
    description:
      'Experiência perfeita em todos os dispositivos, do mobile ao desktop.',
    color: 'from-yellow-500 to-orange-500',
  },
]

export default function Features() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Funcionalidades Avançadas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tecnologia de ponta para a melhor experiência de descoberta e
            compartilhamento de memes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-4`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

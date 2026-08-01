import { motion } from 'framer-motion'
import { Smile, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Smile className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-primary-300">
                MemesAo
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              O maior acervo digital de memes angolanos. Descubra, compartilhe e
              contribua para a comunidade de humor mais divertida de Angola.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6">Contacto</h3>
            <div className="flex items-center text-gray-400">
              <Mail size={16} className="mr-2" />
              <a
                href="mailto:agataodoriafrancisco91@gmail.com"
                className="hover:text-white transition-colors"
              >
                agataodoriafrancisco91@gmail.com
              </a>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; 2025 MemesAo. Todos os direitos reservados. Desenvolvido por{' '}
            <a
              href="https://agataofrancisco.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 transition-colors font-medium"
            >
              Agatão Francisco
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

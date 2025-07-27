import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  BarChart3, 
  Users, 
  Image, 
  Settings, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Heart,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: 'Total de Memes', value: '2,846', change: '+12%', icon: Image, color: 'text-blue-500' },
    { label: 'Usuários Ativos', value: '8,423', change: '+8%', icon: Users, color: 'text-green-500' },
    { label: 'Downloads Hoje', value: '341', change: '+15%', icon: Download, color: 'text-purple-500' },
    { label: 'Uploads Pendentes', value: '23', change: '+5%', icon: AlertTriangle, color: 'text-orange-500' },
  ];

  const pendingMemes = [
    {
      id: 1,
      title: 'Meme sobre política',
      image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200',
      ocrText: 'texto político detectado',
      category: 'Política',
      uploadedBy: 'user123',
      date: '2025-01-20'
    },
    {
      id: 2,
      title: 'Meme de futebol',
      image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=200',
      ocrText: 'golo do petro',
      category: 'Esportes',
      uploadedBy: 'user456',
      date: '2025-01-20'
    },
  ];

  const topMemes = [
    {
      id: 1,
      title: 'Quando é sexta-feira',
      views: 1254,
      likes: 342,
      downloads: 187,
      category: 'Reação'
    },
    {
      id: 2,
      title: 'Segunda-feira chegando',
      views: 987,
      likes: 213,
      downloads: 123,
      category: 'Humor'
    },
    {
      id: 3,
      title: 'Fim do mês',
      views: 876,
      likes: 198,
      downloads: 98,
      category: 'Situação'
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stat.change} vs último mês
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Uploads por Dia
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <BarChart3 size={48} />
            <span className="ml-2">Gráfico de uploads</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Memes da Semana
          </h3>
          <div className="space-y-3">
            {topMemes.map((meme, index) => (
              <div key={meme.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {meme.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {meme.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {meme.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Heart size={14} className="mr-1" />
                      {meme.likes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Memes Pendentes de Moderação
        </h3>
        <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm">
          {pendingMemes.length} pendentes
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingMemes.map((meme) => (
          <div key={meme.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <img
              src={meme.image}
              alt={meme.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {meme.title}
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p><strong>OCR:</strong> "{meme.ocrText}"</p>
                <p><strong>Categoria:</strong> {meme.category}</p>
                <p><strong>Enviado por:</strong> {meme.uploadedBy}</p>
                <p><strong>Data:</strong> {meme.date}</p>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Aprovar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <XCircle size={16} className="mr-2" />
                  Rejeitar
                </motion.button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configurações do Sistema
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Configurações de OCR
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sensibilidade do OCR
              </label>
              <select className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idiomas Suportados
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  Português
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  Inglês
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Francês
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Configurações de Upload
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamanho máximo por arquivo
              </label>
              <select className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <option>5MB</option>
                <option>10MB</option>
                <option>15MB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formatos aceitos
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  JPG/JPEG
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  PNG
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  WebP
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'moderation', name: 'Moderação', icon: CheckCircle },
    { id: 'settings', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'moderation' && renderModeration()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
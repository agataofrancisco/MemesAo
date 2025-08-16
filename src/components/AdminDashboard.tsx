import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { supabase, isSupabaseConfigured, type Meme } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  onClose: () => void;
}

interface PendingMeme extends Meme {
  profile?: {
    username?: string;
    email?: string;
  };
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMemes: 0,
    totalUsers: 0,
    totalDownloads: 0,
    pendingMemes: 0
  });
  const [pendingMemes, setPendingMemes] = useState<PendingMeme[]>([]);
  const [allMemes, setAllMemes] = useState<PendingMeme[]>([]);
  const [filteredMemes, setFilteredMemes] = useState<PendingMeme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, profile, loading: authLoading } = useAuth();

  // Verificar se o usuário é admin/moderador
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  useEffect(() => {
    // Só verificar acesso após o profile ser carregado
    if (!authLoading) {
      if (isAdmin) {
        loadDashboardData();
      } else if (profile) {
        // Profile carregado mas não é admin
        toast.error('Acesso negado. Apenas administradores podem acessar este painel.');
        onClose();
      }
      // Se profile for null, ainda está carregando, não fazer nada
    }
  }, [isAdmin, authLoading, profile]);

  useEffect(() => {
    filterMemes();
  }, [allMemes, searchTerm, statusFilter]);

  const loadDashboardData = async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      setLoading(true);

      // Carregar estatísticas
      const [memesResult, usersResult, downloadsResult, pendingResult] = await Promise.all([
        supabase.from('memes').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('meme_downloads').select('id', { count: 'exact', head: true }),
        supabase.from('memes').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        totalMemes: memesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalDownloads: downloadsResult.count || 0,
        pendingMemes: pendingResult.count || 0
      });

      // Carregar memes pendentes
      const { data: pendingData } = await supabase
        .from('memes')
        .select(`
          *,
          categories (name),
          profiles (username, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingMemes(pendingData || []);

      // Carregar todos os memes para a aba de gerenciamento
      const { data: allMemesData } = await supabase
        .from('memes')
        .select(`
          *,
          categories (name),
          profiles (username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      setAllMemes(allMemesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados do painel:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const filterMemes = () => {
    let filtered = allMemes;

    if (searchTerm) {
      filtered = filtered.filter(meme =>
        meme.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meme.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meme.ocr_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(meme => meme.status === statusFilter);
    }

    setFilteredMemes(filtered);
  };

  const updateMemeStatus = async (memeId: string, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('memes')
        .update({ status: newStatus })
        .eq('id', memeId);

      if (error) throw error;

      // Atualizar estados locais
      setPendingMemes(prev => prev.filter(meme => meme.id !== memeId));
      setAllMemes(prev => prev.map(meme => 
        meme.id === memeId ? { ...meme, status: newStatus } : meme
      ));

      setStats(prev => ({
        ...prev,
        pendingMemes: prev.pendingMemes - 1,
        totalMemes: newStatus === 'approved' ? prev.totalMemes + 1 : prev.totalMemes
      }));

      toast.success(`Meme ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status do meme:', error);
      toast.error('Erro ao atualizar status do meme');
    }
  };

  const deleteMeme = async (memeId: string) => {
    if (!supabase) return;

    if (!confirm('Tem certeza que deseja excluir este meme permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', memeId);

      if (error) throw error;

      setAllMemes(prev => prev.filter(meme => meme.id !== memeId));
      setPendingMemes(prev => prev.filter(meme => meme.id !== memeId));

      toast.success('Meme excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir meme:', error);
      toast.error('Erro ao excluir meme');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Memes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalMemes}</p>
            </div>
            <Image className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalDownloads}</p>
            </div>
            <Download className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploads Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingMemes}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
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

      {pendingMemes.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Não há memes pendentes de moderação!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingMemes.map((meme) => (
            <div key={meme.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img
                src={meme.image_url}
                alt={meme.title || 'Meme sem título'}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagem+não+encontrada';
                }}
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {meme.title || 'Sem título'}
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {meme.description && <p><strong>Descrição:</strong> {meme.description}</p>}
                  {meme.ocr_text && <p><strong>OCR:</strong> "{meme.ocr_text}"</p>}
                  <p><strong>Categoria:</strong> {meme.categories?.name || 'Sem categoria'}</p>
                  <p><strong>Enviado por:</strong> {meme.profile?.username || meme.profile?.email || 'Usuário desconhecido'}</p>
                  <p><strong>Data:</strong> {new Date(meme.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateMemeStatus(meme.id, 'approved')}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Aprovar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateMemeStatus(meme.id, 'rejected')}
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
      )}
    </div>
  );

  const renderMemes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gerenciar Memes
        </h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar memes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Imagem</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Título</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Categoria</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Estatísticas</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Data</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredMemes.map((meme) => (
                <tr key={meme.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <img
                      src={meme.image_url}
                      alt={meme.title || 'Meme'}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=?';
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{meme.title || 'Sem título'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {meme.description || 'Sem descrição'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {meme.categories?.name || 'Sem categoria'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meme.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      meme.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {meme.status === 'approved' ? 'Aprovado' :
                       meme.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {meme.view_count || 0}
                      </span>
                      <span className="flex items-center">
                        <Download size={12} className="mr-1" />
                        {meme.download_count || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(meme.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {meme.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateMemeStatus(meme.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                            title="Aprovar"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateMemeStatus(meme.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Rejeitar"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteMeme(meme.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (!isAdmin && !authLoading && profile) {
    return null;
  }

  // Mostrar loading enquanto verifica permissões
  if (authLoading || (!profile && user)) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'moderation', name: 'Moderação', icon: CheckCircle },
    { id: 'memes', name: 'Gerenciar Memes', icon: Image },
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
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
          <div className="hidden sm:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
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

          {/* Mobile tabs */}
          <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.name}</option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Carregando dados...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'moderation' && renderModeration()}
                {activeTab === 'memes' && renderMemes()}
                {activeTab === 'settings' && (
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Configurações em desenvolvimento...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
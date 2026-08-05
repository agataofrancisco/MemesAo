import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Image,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Megaphone,
  Tag,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAllCategories } from '../hooks/useAllCategories'
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api'
import type { Meme } from '../lib/types'
import AdAdminPanel from './AdAdminPanel'
import toast from 'react-hot-toast'

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminDashboard({
  isOpen,
  onClose,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMemes: 0,
    totalUsers: 0,
    totalDownloads: 0,
    pendingMemes: 0,
  })
  const [pendingMemes, setPendingMemes] = useState<Meme[]>([])
  const [allMemes, setAllMemes] = useState<Meme[]>([])
  const [searchTerm] = useState('')
  const [statusFilter] = useState('all')
  const [deletingMemeId, setDeletingMemeId] = useState<string | null>(null)

  // Estados para CRUD de memes
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMeme, setEditingMeme] = useState<Meme | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category_id: '',
    status: 'pending',
  })

  // Estado para painel de anúncios
  const [isAdPanelOpen, setIsAdPanelOpen] = useState(false)

  // Estados para CRUD de categorias
  const [adminCategories, setAdminCategories] = useState<
    { id: string; name: string; count: number; icon: string; color: string; description: string }[]
  >([])
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Tag',
    color: 'from-gray-500 to-gray-600',
  })
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [savingCategory, setSavingCategory] = useState(false)

  const { user, profile, loading: authLoading } = useAuth()
  const { categories: allCategories } = useAllCategories()

  // Função para verificar se o usuário é admin/moderador
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  useEffect(() => {
    if (isOpen && !authLoading) {
      if (!isAdmin) {
        setLoading(false)
        return
      }
      loadDashboardData()
    }
  }, [isOpen, isAdmin, authLoading])

  useEffect(() => {
    if (isOpen && activeTab === 'categories' && isAdmin) {
      loadAdminCategories()
    }
  }, [isOpen, activeTab, isAdmin])

  const loadAdminCategories = async () => {
    try {
      const data = await apiGet<
        { id: string; name: string; count: number; icon: string; color: string; description: string }[]
      >('/api/categories')
      setAdminCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    }
  }

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('O nome da categoria é obrigatório')
      return
    }
    setSavingCategory(true)
    try {
      if (editingCategoryId) {
        await apiPatch(`/api/admin/categories/${editingCategoryId}`, categoryForm)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        await apiPost('/api/admin/categories', categoryForm)
        toast.success('Categoria criada com sucesso!')
      }
      setCategoryForm({ name: '', description: '', icon: 'Tag', color: 'from-gray-500 to-gray-600' })
      setEditingCategoryId(null)
      await loadAdminCategories()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      toast.error(
        `Erro ao salvar categoria: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      )
    } finally {
      setSavingCategory(false)
    }
  }

  const editCategory = (cat: {
    id: string
    name: string
    icon: string
    color: string
    description: string
  }) => {
    setEditingCategoryId(cat.id)
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Tag',
      color: cat.color || 'from-gray-500 to-gray-600',
    })
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    try {
      await apiDelete(`/api/admin/categories/${categoryId}`)
      toast.success('Categoria excluída com sucesso!')
      await loadAdminCategories()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast.error('Erro ao excluir categoria')
    }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    console.log('🔄 Iniciando carregamento do dashboard admin...')
    try {
      const data = await apiGet<{
        stats: {
          totalMemes: number
          totalUsers: number
          totalDownloads: number
          pendingMemes: number
        }
        pending: Meme[]
        memes: Meme[]
      }>('/api/admin/dashboard')

      setStats(data.stats)
      setPendingMemes(data.pending)
      setAllMemes(data.memes)
      console.log('✅ Dashboard carregado com sucesso!')
    } catch (error) {
      console.error('âŒ Erro ao carregar dados do dashboard:', error)
      toast.error(
        `Erro ao carregar dados: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      )
    } finally {
      setLoading(false)
    }
  }

  const approvePendingMeme = async (memeId: string) => {
    try {
      await apiPatch(`/api/memes/${memeId}`, { status: 'approved' })
      toast.success('Meme aprovado com sucesso!')
      loadDashboardData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao aprovar meme:', error)
      toast.error(
        `Erro ao aprovar meme: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      )
    }
  }

  const rejectPendingMeme = async (memeId: string) => {
    try {
      await apiPatch(`/api/memes/${memeId}`, { status: 'rejected' })
      toast.success('Meme rejeitado')
      loadDashboardData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao rejeitar meme:', error)
      toast.error(
        `Erro ao rejeitar meme: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      )
    }
  }

  const deleteMeme = async (memeId: string) => {
    if (!confirm('Tem certeza que deseja deletar este meme?')) return

    setDeletingMemeId(memeId)
    try {
      await apiDelete(`/api/memes/${memeId}`)
      toast.success('Meme deletado com sucesso!')
      await loadDashboardData()
    } catch (error) {
      console.error('Erro ao deletar meme:', error)
      toast.error(
        `Erro ao deletar meme: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      )
    } finally {
      setDeletingMemeId(null)
    }
  }

  const filterMemes = (memes: Meme[]) => {
    let filtered = memes

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (meme) =>
          meme.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meme.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meme.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((meme) => meme.status === statusFilter)
    }

    return filtered
  }

  if (!isOpen) return null

  // Mostrar loading enquanto verifica permissões
  if (authLoading || (!profile && user)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verificando permissões...
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4"
        >
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    )
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Memes
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalMemes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Usuários Ativos
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Downloads
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalDownloads}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pendentes
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.pendingMemes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveTab('memes')}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left group"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
              <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              Gerenciar Memes
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Aprovar, rejeitar ou editar memes pendentes
          </p>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors text-left group"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
              <Megaphone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              Gerenciar Anúncios
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Criar, editar e monitorar campanhas publicitárias
          </p>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors text-left group"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              Gerenciar Usuários
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Visualizar e gerenciar contas de usuários
          </p>
        </button>
      </div>
    </div>
  )

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
          <p className="text-gray-500 dark:text-gray-400">
            Não há memes pendentes de moderação!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingMemes.map((meme) => (
            <div
              key={meme.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <img
                src={meme.thumbnail_url || meme.image_url}
                alt={meme.title || 'Meme sem título'}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/400x300?text=Imagem+não+encontrada'
                }}
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {meme.title || 'Sem título'}
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {meme.description && (
                    <p>
                      <strong>Descrição:</strong> {meme.description}
                    </p>
                  )}
                  {meme.ocr_text && (
                    <p>
                      <strong>OCR:</strong> "{meme.ocr_text}"
                    </p>
                  )}
                  <p>
                    <strong>Categoria:</strong>{' '}
                    {meme.category || 'Sem categoria'}
                  </p>
                  <p>
                    <strong>Enviado por:</strong>{' '}
                    {meme.uploaded_by_name || 'Anónimo'}
                  </p>
                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(meme.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => approvePendingMeme(meme.id)}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Aprovar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => rejectPendingMeme(meme.id)}
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
  )

  const renderMemes = () => {
    const filteredMemes = filterMemes(allMemes)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciar Memes
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {filteredMemes.length} de {allMemes.length} memes
            (limitado a 100 mais recentes)
          </span>
        </div>

        {/* Botão para configurar políticas de DELETE */}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Imagem
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Estatísticas
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredMemes.map((meme) => (
                  <tr
                    key={meme.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={meme.thumbnail_url || meme.image_url}
                        alt={meme.title || 'Meme'}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/48x48?text=?'
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {meme.title || 'Sem título'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {meme.description || 'Sem descrição'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {meme.category || 'Sem categoria'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          meme.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : meme.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {meme.status === 'approved'
                          ? 'Aprovado'
                          : meme.status === 'rejected'
                          ? 'Rejeitado'
                          : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-3 text-xs">
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
                              onClick={() => approvePendingMeme(meme.id)}
                              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                              title="Aprovar"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => rejectPendingMeme(meme.id)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                              title="Rejeitar"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(meme)}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteMeme(meme.id)}
                          disabled={deletingMemeId === meme.id}
                          className={`p-1 rounded ${
                            deletingMemeId === meme.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                          }`}
                          title={
                            deletingMemeId === meme.id
                              ? 'Deletando...'
                              : 'Excluir'
                          }
                        >
                          {deletingMemeId === meme.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full" />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
    )
  }

  // Funções CRUD para memes
  const openEditModal = (meme: Meme) => {
    setEditingMeme(meme)
    setEditForm({
      title: meme.title || '',
      description: meme.description || '',
      category_id: meme.category_id || '',
      status: meme.status || 'pending',
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingMeme(null)
    setEditForm({
      title: '',
      description: '',
      category_id: '',
      status: 'pending',
    })
  }

  const updateMeme = async () => {
    if (!editingMeme) return

    try {
      await apiPatch(`/api/memes/${editingMeme.id}`, {
        title: editForm.title,
        description: editForm.description,
        category_id: editForm.category_id,
        status: editForm.status,
      })

      toast.success('Meme atualizado com sucesso!')
      closeEditModal()
      await loadDashboardData()
    } catch (error) {
      console.error('Erro ao atualizar meme:', error)
      toast.error('Erro ao atualizar meme')
    }
  }

  // Modal de edição
  const renderEditModal = () => (
    <AnimatePresence>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Meme
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {editingMeme && (
                <div className="mb-4">
                  <img
                    src={editingMeme.image_url}
                    alt={editingMeme.title || 'Meme'}
                    className="w-full max-h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-700"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Título do meme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Descrição do meme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={editForm.category_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {allCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={updateMeme}
                className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciamento de Usuários
        </h2>
        <button
          onClick={() => setIsAdPanelOpen(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Gerenciar Usuários</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Clique em "Gerenciar Usuários" para abrir o painel completo de
          administração de usuários.
        </p>
      </div>
    </div>
  )

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciamento de Categorias
        </h2>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
          {adminCategories.length} categorias
        </span>
      </div>

      {/* Formulário Criar/Editar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              placeholder="Ex: Animais"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, description: e.target.value })
              }
              placeholder="Ex: Memes com animais"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ícone (lucide)
            </label>
            <select
              value={categoryForm.icon}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, icon: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {['Tag', 'Smile', 'Gamepad', 'Film', 'Trophy', 'Briefcase', 'Heart', 'Music', 'Coffee', 'Users', 'Star', 'Zap', 'TrendingUp', 'Sparkles'].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cor (gradiente)
            </label>
            <select
              value={categoryForm.color}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, color: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {[
                'from-primary-500 to-blue-500',
                'from-purple-500 to-pink-500',
                'from-teal-500 to-green-500',
                'from-accent-500 to-red-500',
                'from-indigo-500 to-purple-500',
                'from-pink-500 to-red-500',
                'from-green-500 to-teal-500',
                'from-yellow-500 to-orange-500',
                'from-red-500 to-orange-500',
                'from-blue-500 to-purple-500',
                'from-gray-500 to-gray-600',
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={saveCategory}
            disabled={savingCategory}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {savingCategory ? 'Salvando...' : editingCategoryId ? 'Atualizar' : 'Criar Categoria'}
          </button>
          {editingCategoryId && (
            <button
              type="button"
              onClick={() => {
                setEditingCategoryId(null)
                setCategoryForm({
                  name: '',
                  description: '',
                  icon: 'Tag',
                  color: 'from-gray-500 to-gray-600',
                })
              }}
              className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {adminCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            adminCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shrink-0`}>
                    <Tag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {cat.name}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({cat.count} memes)
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => editCategory(cat)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar categoria"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Image },
    { id: 'moderation', name: 'Moderação', icon: Clock },
    { id: 'memes', name: 'Gerenciar Memes', icon: Image },
    { id: 'categories', name: 'Categorias', icon: Tag },
    { id: 'ads', name: 'Gerenciar Anúncios', icon: Megaphone },
    { id: 'users', name: 'Gerenciar Usuários', icon: Users },
  ]

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
              <XCircle size={24} />
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
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">
                  Carregando dados...
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'moderation' && renderModeration()}
                {activeTab === 'memes' && renderMemes()}
                {activeTab === 'ads' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gerenciamento de Anúncios
                      </h2>
                      <button
                        onClick={() => setIsAdPanelOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Gerenciar Anúncios</span>
                      </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                        Clique em "Gerenciar Anúncios" para abrir o painel
                        completo de administração de anúncios.
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'categories' && renderCategories()}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal de edição */}
      {renderEditModal()}

      {/* Painel de Anúncios */}
      <AdAdminPanel
        isOpen={isAdPanelOpen}
        onClose={() => setIsAdPanelOpen(false)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Stats {
  totalMemes: number;
  totalDownloads: number;
  totalUsers: number;
  totalFavorites: number;
}

interface CategoryStats {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  description: string;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalMemes: 6,
    totalDownloads: 23,
    totalUsers: 4,
    totalFavorites: 12
  });
  
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadCategories();
  }, []);

  const loadStats = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      // Buscar estatísticas reais do banco
      const [memesResult, usersResult, downloadsResult, favoritesResult] = await Promise.all([
        supabase.from('memes').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('meme_downloads').select('id', { count: 'exact', head: true }),
        supabase.from('user_favorites').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalMemes: memesResult.count || 6,
        totalUsers: usersResult.count || 1,
        totalDownloads: downloadsResult.count || 0,
        totalFavorites: favoritesResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // ✅ CORRIGIDO: Categorias mock que coincidem com o banco
      setCategories([
        {
          id: '1',
          name: 'Reação',
          count: 2,
          icon: 'Smile',
          color: 'from-primary-500 to-blue-500',
          description: 'Expressões e reações'
        },
        {
          id: '2',
          name: 'Games',
          count: 1,
          icon: 'Gamepad',
          color: 'from-purple-500 to-pink-500',
          description: 'Mundo dos jogos'
        },
        {
          id: '3',
          name: 'Filmes/TV',
          count: 0,
          icon: 'Film',
          color: 'from-teal-500 to-green-500',
          description: 'Cinema e televisão'
        },
        {
          id: '4',
          name: 'Esportes',
          count: 1,
          icon: 'Trophy',
          color: 'from-accent-500 to-red-500',
          description: 'Futebol e outros esportes'
        },
        {
          id: '5',
          name: 'Trabalho',
          count: 0,
          icon: 'Briefcase',
          color: 'from-indigo-500 to-purple-500',
          description: 'Vida profissional'
        },
        {
          id: '6',
          name: 'Amor',
          count: 0,
          icon: 'Heart',
          color: 'from-pink-500 to-red-500',
          description: 'Relacionamentos'
        },
        {
          id: '7',
          name: 'Música',
          count: 0,
          icon: 'Music',
          color: 'from-green-500 to-teal-500',
          description: 'Artistas e música'
        },
        {
          id: '8',
          name: 'Cotidiano',
          count: 2,
          icon: 'Coffee',
          color: 'from-yellow-500 to-orange-500',
          description: 'Dia a dia angolano'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      // ✅ CORRIGIDO: Buscar diretamente da tabela categories com contagem real
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Para cada categoria, contar memes aprovados
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('memes')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'approved');

          return {
            id: category.id,
            name: category.name,
            count: count || 0,
            icon: category.icon || 'Tag',
            color: category.color || 'from-gray-500 to-gray-600',
            description: category.description || `Categoria ${category.name}`
          };
        })
      );

      // Ordenar: categorias com memes primeiro, depois "Outros" no final
      categoriesWithCount.sort((a, b) => {
        if (a.name === 'Outros') return 1;
        if (b.name === 'Outros') return -1;
        return b.count - a.count;
      });

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    categories,
    loading,
    refreshStats: loadStats,
    refreshCategories: loadCategories
  };
}
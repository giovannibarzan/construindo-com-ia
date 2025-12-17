
import React, { useState } from 'react';
import CreatePost from '../CreatePost';
import PostCard from '../PostCard';
import FeedFilters from '../FeedFilters';
import TrendingTags from '../TrendingTags';
import { Post, PostType, User } from '../../types';
import { backend } from '../../services/backend';
import EmptyState from '../EmptyState';

interface FeedViewProps {
  currentUser: User;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  onPostClick?: (postId: string) => void;
}

const FeedView: React.FC<FeedViewProps> = ({ currentUser, onShowToast, onPostClick }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState<Array<{ value: string; type: string; count: number }>>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedType, setSelectedType] = useState<'all' | PostType | 'questions'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await backend.getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const tags = await backend.getPopularTags();
      setPopularTags(tags);
    } catch (error) {
      console.error("Failed to fetch popular tags", error);
    }
  };

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchPosts(), fetchPopularTags()]).finally(() => setLoading(false));
  }, []);

  // Apply filters
  React.useEffect(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some(tag => tag.value.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Type filter
    if (selectedType === 'questions') {
      filtered = filtered.filter(p => p.type === PostType.QUESTION);
    } else if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags && p.tags.some(tag => tag.value === selectedTag));
    }

    setFilteredPosts(filtered);
  }, [posts, selectedType, selectedTag, searchQuery]);

  const handleCreatePost = async (text: string, type: PostType, imageUrl?: string, tags?: any[]) => {
    try {
      const newPost = await backend.createPost({ content: text, type, imageUrl, tags });
      setPosts(prev => [newPost, ...prev]);
      if (onShowToast) onShowToast("Post publicado!", "success");
      fetchPopularTags();
    } catch (error) {
      console.error("Failed to create post", error);
      if (onShowToast) onShowToast("Erro ao criar post.", "error");
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setTimeout(() => { fetchPosts(); fetchPopularTags(); }, 500);
  };

  const handleTagClick = (tag: string | null) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4">
      <div className="flex gap-6 animate-in fade-in duration-300">
        {/* Main Feed - max 680px centered */}
        <div className="flex-1 max-w-[680px] mx-auto flex flex-col gap-4">
          <CreatePost currentUser={currentUser} onPost={handleCreatePost} />

          {/* Filters (Navigation + Type combined) */}
          <FeedFilters
            selectedType={selectedType}
            selectedTag={selectedTag}
            selectedStatus={'all'}
            onTypeChange={setSelectedType}
            onTagChange={handleTagClick}
            onStatusChange={() => { }}
            popularTags={[]}
          />

          <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>

          {/* Posts */}
          <div className="flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full rounded-xl border border-gray-200 bg-white p-4 h-48 animate-pulse dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredPosts.length === 0 && posts.length === 0 ? (
              <EmptyState
                icon="forum"
                title="Seja o Primeiro a Postar!"
                description="A comunidade está esperando por você! Compartilhe suas ideias, projetos, dúvidas ou conquistas. Vamos construir juntos uma comunidade incrível."
                gradient="from-blue-500 to-purple-600"
              />
            ) : filteredPosts.length === 0 ? (
              <div className="w-full rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50 p-8 text-center">
                <span className="text-4xl mb-2 block">🔍</span>
                <p className="text-gray-500 dark:text-gray-400">Nenhum post encontrado.</p>
                <button onClick={() => { setSelectedType('all'); setSelectedTag(null); setSearchQuery(''); }} className="mt-4 text-primary hover:underline text-sm">
                  Limpar filtros
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDeletePost} onShowToast={onShowToast} variant="feed" onClick={() => onPostClick && onPostClick(post.id)} />
              ))
            )}
          </div>
        </div>

        {/* Widgets - 280px - Desktop XL only */}
        <div className="hidden xl:block w-[280px] shrink-0 space-y-3 sticky top-4 self-start">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 !text-base">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar posts..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Trending Tags */}
          <TrendingTags
            tags={popularTags.slice(0, 3)}
            onTagClick={handleTagClick}
          />

          {/* Popular Tags */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">🏷️ Tags Populares</h3>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.slice(0, 8).map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => handleTagClick(tag.value)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${selectedTag === tag.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  #{tag.value}
                </button>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">📊 Comunidade</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Posts</span>
                <span className="font-bold text-gray-900 dark:text-white">{filteredPosts.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Tags</span>
                <span className="font-bold text-gray-900 dark:text-white">{popularTags.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedView;

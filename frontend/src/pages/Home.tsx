import { useState } from 'react';
import { usePublishedPosts } from '../hooks/usePosts';
import { useDebounce } from '../hooks/useDebounce';
import PostCard from '../components/posts/PostCard';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import usePageTitle from '../hooks/usePageTitle';

const CATEGORIES = ['All', 'Technology', 'Design', 'Business', 'Lifestyle', 'Science', 'General', 'Other'];

const Home = () => {
  usePageTitle(); // → "WorldInsights — Ideas Worth Reading"
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { posts, pages, isLoading, error } = usePublishedPosts({
    page,
    limit: 12,
    search: debouncedSearch,
    category: category === 'All' ? '' : category,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat === 'All' ? '' : cat);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Ideas worth reading
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Explore articles on technology, design, and more — written by people who care about their craft.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search articles…"
            className="input pl-10"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => {
          const active = (cat === 'All' && !category) || cat === category;
          return (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base">No posts found{search ? ` for "${search}"` : ''}.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Home;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyPosts } from '../hooks/usePosts';
import { useDebounce } from '../hooks/useDebounce';
import usePageTitle from '../hooks/usePageTitle';
import { postApi, userApi } from '../api/client';
import { Post, User } from '../types';
import PostsTable from '../components/dashboard/PostsTable';
import StatsCard from '../components/dashboard/StatsCard';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';

// ─── SVG icons (inline, no dependency) ───────────────────────────────────────
const IconDocs = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
  </svg>
);
const IconCheck = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
  </svg>
);
const IconClock = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUsers = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Author Dashboard ──────────────────────────────────────────────────────────
const AuthorDashboard = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { posts, total, pages, isLoading, refetch } = useMyPosts({
    page,
    search: debouncedSearch,
    status: statusFilter,
  });

  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total Posts" value={total} icon={<IconDocs />} color="blue" />
        <StatsCard label="Published" value={published} icon={<IconCheck />} color="green" />
        <StatsCard label="Drafts" value={drafts} icon={<IconClock />} color="yellow" />
      </div>

      {/* Posts */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">My Posts</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…"
              className="input w-44 text-sm py-2"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input w-36 text-sm py-2"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {isLoading ? <Loader /> : <PostsTable posts={posts} onRefetch={refetch} />}
        <div className="px-5 pb-4">
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [tab, setTab] = useState<'posts' | 'users'>('posts');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setIsLoading(true);
    if (tab === 'posts') {
      postApi
        .getAllAdmin({ page, status: statusFilter, search: debouncedSearch })
        .then((res) => {
          setAllPosts(res.data.posts);
          setPages(res.data.pages);
          setTotal(res.data.total);
        })
        .finally(() => setIsLoading(false));
    } else {
      userApi
        .getAll()
        .then((res) => setUsers(res.data.users))
        .finally(() => setIsLoading(false));
    }
  }, [tab, page, statusFilter, debouncedSearch, tick]);

  const handleToggleUser = async (userId: string) => {
    await userApi.toggleStatus(userId);
    setTick((t) => t + 1);
  };

  const published = allPosts.filter((p) => p.status === 'published').length;
  const drafts = allPosts.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard label="Total Posts" value={total} icon={<IconDocs />} color="blue" />
        <StatsCard label="Published" value={published} icon={<IconCheck />} color="green" />
        <StatsCard label="Drafts" value={drafts} icon={<IconClock />} color="yellow" />
        <StatsCard label="Users" value={users.length} icon={<IconUsers />} color="gray" />
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        {(['posts', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">All Posts</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search…"
                className="input w-44 text-sm py-2"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="input w-36 text-sm py-2"
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            <PostsTable posts={allPosts} onRefetch={() => setTick((t) => t + 1)} showAuthor />
          )}
          <div className="px-5 pb-4">
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">All Users</h2>
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={u.role === 'admin' ? 'badge-blue' : 'badge-gray capitalize'}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={u.isActive ? 'badge-green' : 'badge-gray'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className={`text-xs font-medium ${
                          u.isActive
                            ? 'text-red-500 hover:text-red-700'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Dashboard Page (wrapper) ─────────────────────────────────────────────────
const Dashboard = () => {
  usePageTitle('Dashboard');
  const { user, isAdmin } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="font-medium text-gray-700">{user?.name}</span>
            <span className="ml-2 badge-gray capitalize">{user?.role}</span>
          </p>
        </div>
        <Link to="/posts/new" className="btn-primary">
          + New Post
        </Link>
      </div>

      {isAdmin ? <AdminDashboard /> : <AuthorDashboard />}
    </div>
  );
};

export default Dashboard;

import { useState, useRef, FormEvent } from 'react';
import { userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import usePageTitle from '../hooks/usePageTitle';

const Profile = () => {
  usePageTitle('Profile Settings');
  const { user, updateUser } = useAuth();

  // ─── Profile form ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await userApi.updateProfile(profileForm);
      updateUser(res.data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setProfileMsg({ type: 'error', text: msg || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Avatar upload ─────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (file: File | null) => {
    setAvatarFile(file);
    setAvatarMsg(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setAvatarMsg(null);
    try {
      const res = await userApi.uploadAvatar(avatarFile);
      updateUser(res.data.user);
      setAvatarPreview(null);
      setAvatarFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setAvatarMsg({ type: 'success', text: 'Avatar updated successfully.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setAvatarMsg({ type: 'error', text: msg || 'Failed to upload avatar.' });
    } finally {
      setAvatarLoading(false);
    }
  };

  // ─── Password form ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await userApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPwMsg({ type: 'error', text: msg || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const currentAvatar = avatarPreview || user?.avatar || getAvatarUrl(user?.name || '');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details and avatar.</p>
      </div>

      {/* ── Avatar section ────────────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Profile Picture</h2>

        <div className="flex items-start gap-6">
          {/* Avatar preview */}
          <div className="relative flex-shrink-0">
            <img
              src={currentAvatar}
              alt={user?.name}
              className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
            {avatarPreview && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-600 border-2 border-white" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm text-gray-500 leading-relaxed">
              Upload a photo (JPG, PNG or WebP, max 3 MB). Your avatar is auto-generated from your
              initials if no image is uploaded.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-secondary text-sm"
              >
                Choose image
              </button>
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={avatarLoading}
                  className="btn-primary text-sm"
                >
                  {avatarLoading ? 'Uploading…' : 'Save avatar'}
                </button>
              )}
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => { handleFileChange(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />

            {avatarMsg && (
              <p className={`text-sm ${avatarMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {avatarMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile details ───────────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Account Details</h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              maxLength={250}
              placeholder="Tell readers a bit about yourself…"
              className="input resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">{profileForm.bio.length}/250</p>
          </div>

          {profileMsg && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                profileMsg.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change password ───────────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              className="input"
              required
              minLength={6}
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className="input"
              required
            />
          </div>

          {pwMsg && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                pwMsg.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {pwMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

/**
 * Returns a DiceBear "initials" avatar URL for the given name.
 * If the user has uploaded a custom avatar, pass that instead — this is
 * used only as the fallback.
 *
 * Docs: https://www.dicebear.com/styles/initials/
 */
export const getAvatarUrl = (name: string): string => {
  const seed = encodeURIComponent(name.trim() || 'User');
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}&backgroundColor=2563eb&textColor=ffffff&fontSize=38&fontWeight=600&size=80`;
};

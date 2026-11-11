export const isAdmin = (userId: string | undefined): boolean => {
  return !!userId && userId === import.meta.env.VITE_ADMIN_UID;
};

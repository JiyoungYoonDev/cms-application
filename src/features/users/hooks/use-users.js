import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, updateUserStatus } from '../services/user-service';

export function useUsers({ search, role, status, page = 0, size = 20 } = {}) {
  return useQuery({
    queryKey: ['cms-users', search, role, status, page, size],
    queryFn: () => getUsers({ search, role, status, page, size }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cms-users'] }),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cms-users'] }),
  });
}

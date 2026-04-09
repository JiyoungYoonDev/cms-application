import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTemplates,
  getTemplateVersions,
  getVersionDetail,
  getVersionMetrics,
  compareVersions,
  activateVersion,
  createVersion,
} from '../services/generation-admin-service';

export function useTemplates() {
  return useQuery({
    queryKey: ['generation', 'templates'],
    queryFn: getTemplates,
  });
}

export function useTemplateVersions(templateId) {
  return useQuery({
    queryKey: ['generation', 'templates', templateId, 'versions'],
    queryFn: () => getTemplateVersions(templateId),
    enabled: !!templateId,
  });
}

export function useVersionDetail(versionId) {
  return useQuery({
    queryKey: ['generation', 'templates', 'version', versionId, 'detail'],
    queryFn: () => getVersionDetail(versionId),
    enabled: !!versionId,
  });
}

export function useVersionMetrics(versionId) {
  return useQuery({
    queryKey: ['generation', 'templates', 'version', versionId, 'metrics'],
    queryFn: () => getVersionMetrics(versionId),
    enabled: !!versionId,
  });
}

export function useCompareVersions(versionA, versionB) {
  return useQuery({
    queryKey: ['generation', 'templates', 'compare', versionA, versionB],
    queryFn: () => compareVersions(versionA, versionB),
    enabled: !!versionA && !!versionB,
  });
}

export function useActivateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId) => activateVersion(versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['generation', 'templates'] });
    },
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, payload }) => createVersion(templateId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['generation', 'templates'] });
    },
  });
}

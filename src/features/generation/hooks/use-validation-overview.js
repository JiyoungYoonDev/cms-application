import { useQuery } from '@tanstack/react-query';
import { getValidationOverview, getOutputValidations } from '../services/generation-admin-service';

export function useValidationOverview() {
  return useQuery({
    queryKey: ['generation', 'validation', 'overview'],
    queryFn: getValidationOverview,
  });
}

export function useOutputValidations(outputId) {
  return useQuery({
    queryKey: ['generation', 'validation', 'output', outputId],
    queryFn: () => getOutputValidations(outputId),
    enabled: !!outputId,
  });
}

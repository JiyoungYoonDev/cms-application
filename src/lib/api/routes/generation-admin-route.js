const BASE = '/api/generation/admin';

export const generationAdminRoutes = {
  // Dashboard
  overview: () => `${BASE}/dashboard/overview`,
  jobs: () => `${BASE}/dashboard/jobs`,
  jobDetail: (jobId) => `${BASE}/dashboard/jobs/${jobId}`,

  // Validation
  validationOverview: () => `${BASE}/validations/overview`,
  outputValidations: (outputId) => `${BASE}/validations/output/${outputId}`,

  // Prompt Templates
  templates: () => `${BASE}/templates`,
  templateVersions: (templateId) => `${BASE}/templates/${templateId}/versions`,
  templateActiveVersion: (templateId) => `${BASE}/templates/${templateId}/versions/active`,
  createVersion: (templateId) => `${BASE}/templates/${templateId}/versions`,
  versionDetail: (versionId) => `${BASE}/templates/versions/${versionId}`,
  activateVersion: (versionId) => `${BASE}/templates/versions/${versionId}/activate`,
  versionMetrics: (versionId) => `${BASE}/templates/versions/${versionId}/metrics`,
  compareVersions: (versionA, versionB) =>
    `${BASE}/templates/versions/compare?versionA=${versionA}&versionB=${versionB}`,

  // Status overrides
  updateBatchStatus: (batchId) => `${BASE}/batches/${batchId}/status`,
  updateTaskStatus: (taskId) => `${BASE}/tasks/${taskId}/status`,

  // Reviews
  createReview: () => `${BASE}/reviews`,
  jobReviews: (jobId) => `${BASE}/reviews/job/${jobId}`,

  // Diffs
  jobDiffs: (jobId) => `${BASE}/diffs/job/${jobId}`,
};

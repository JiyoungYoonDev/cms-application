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

  // Job control
  stopJob: (jobId) => `${BASE}/dashboard/jobs/${jobId}/stop`,
  resumeJob: (jobId) => `${BASE}/dashboard/jobs/${jobId}/resume`,

  // Math validation
  mathCheck: () => `${BASE}/validations/math-check`,

  // Status overrides
  updateBatchStatus: (batchId) => `${BASE}/batches/${batchId}/status`,
  updateTaskStatus: (taskId) => `${BASE}/tasks/${taskId}/status`,

  // Reviews
  createReview: () => `${BASE}/reviews`,
  jobReviews: (jobId) => `${BASE}/reviews/job/${jobId}`,

  // Validation Rounds
  jobValidations: (jobId) => `${BASE}/dashboard/jobs/${jobId}/validations`,
  revalidateJob: (jobId) => `${BASE}/dashboard/jobs/${jobId}/revalidate`,
  overrideValidation: (resultId) => `${BASE}/validations/${resultId}/override`,
  compareRounds: (roundA, roundB) => `${BASE}/validations/rounds/compare?roundA=${roundA}&roundB=${roundB}`,

  // Scope-based Validation
  validateCourse: (courseId) => `${BASE}/validations/courses/${courseId}`,
  validateSection: (sectionId) => `${BASE}/validations/sections/${sectionId}`,
  validateLecture: (lectureId) => `${BASE}/validations/lectures/${lectureId}`,
  validateItem: (itemId) => `${BASE}/validations/items/${itemId}`,
  scopedRounds: (scopeType, targetId) => `${BASE}/validations/${scopeType}/${targetId}/rounds`,

  // Diffs
  jobDiffs: (jobId) => `${BASE}/diffs/job/${jobId}`,
};

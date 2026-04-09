const COURSES_BASE = process.env.NEXT_PUBLIC_API_COURSES;

export const generationRoutes = {
  generate: () => `${COURSES_BASE}/generate`,
  regenerateLecture: (lectureId) => `${COURSES_BASE}/generate/lecture/${lectureId}`,
  retryJob: (jobId) => `${COURSES_BASE}/generate/retry/job/${jobId}`,
  retryTask: (taskId) => `${COURSES_BASE}/generate/retry/task/${taskId}`,
  jobTasks: (jobId) => `${COURSES_BASE}/generate/job/${jobId}/tasks`,
  retryBatch: (batchId) => `${COURSES_BASE}/generate/retry/batch/${batchId}`,
  taskBatches: (taskId) => `${COURSES_BASE}/generate/task/${taskId}/batches`,
  reconvertLecture: (lectureId) => `${COURSES_BASE}/generate/reconvert/lecture/${lectureId}`,
  regenerateItem: (itemId) => `${COURSES_BASE}/generate/item/${itemId}`,
  generationOutput: (outputId) => `${COURSES_BASE}/generate/output/${outputId}`,
  addSection: () => `${COURSES_BASE}/generate/section`,
  addLecture: () => `${COURSES_BASE}/generate/lecture`,
  addItem: () => `${COURSES_BASE}/generate/item`,
};

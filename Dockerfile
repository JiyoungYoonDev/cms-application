FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BACKEND_INTERNAL_URL=http://localhost:8081
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_COURSE_CATEGORIES=/api/course-categories
ARG NEXT_PUBLIC_API_COURSES=/api/courses
ARG NEXT_PUBLIC_API_SECTIONS=/api/course-sections
ARG NEXT_PUBLIC_API_LECTURES=/lectures
ARG NEXT_PUBLIC_API_LECTURES_BASE=/api/lectures
ARG NEXT_PUBLIC_API_LECTURE_ITEMS_BASE=/api/lecture-items

ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_COURSE_CATEGORIES=$NEXT_PUBLIC_API_COURSE_CATEGORIES
ENV NEXT_PUBLIC_API_COURSES=$NEXT_PUBLIC_API_COURSES
ENV NEXT_PUBLIC_API_SECTIONS=$NEXT_PUBLIC_API_SECTIONS
ENV NEXT_PUBLIC_API_LECTURES=$NEXT_PUBLIC_API_LECTURES
ENV NEXT_PUBLIC_API_LECTURES_BASE=$NEXT_PUBLIC_API_LECTURES_BASE
ENV NEXT_PUBLIC_API_LECTURE_ITEMS_BASE=$NEXT_PUBLIC_API_LECTURE_ITEMS_BASE

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

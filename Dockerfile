# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Express backend and serve the frontend
FROM node:18-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy built frontend files to the backend's public directory
COPY --from=frontend-builder /app/frontend/dist ./public

# Cloud Run sets the PORT environment variable
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]

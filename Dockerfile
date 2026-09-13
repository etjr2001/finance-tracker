# ---- Stage 1: build the frontend ----
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---- Stage 2: build the backend, embedding the frontend's static output ----
FROM maven:3.9-eclipse-temurin-25-alpine AS backend-build
WORKDIR /app
COPY pom.xml ./
COPY src/ src/
COPY --from=frontend-build /app/frontend/dist/ src/main/resources/static/
RUN mvn -B package -DskipTests

# ---- Stage 3: slim runtime ----
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar"]
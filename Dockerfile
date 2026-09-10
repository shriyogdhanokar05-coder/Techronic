# =================================================================
# Stage 1: Build the Application JAR from repository root
# =================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache Maven dependencies layer
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production jar
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# =================================================================
# Stage 2: Minimal, Secure Non-Root Runtime Container
# =================================================================
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Create a dedicated non-root system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Enforce secure non-root permissions
RUN chown -R appuser:appgroup /app
USER appuser

# Expose default HTTP port
EXPOSE 8080

# Environment variables
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=postgres \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck definition
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/quests/public || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]

# Use official OpenJDK image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven build files
COPY backend/pom.xml .
COPY backend/src ./src

# Package the Spring Boot app
RUN apk add --no-cache maven && mvn -f pom.xml clean package -DskipTests

# Expose Spring Boot default port
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "target/donation-backend-0.0.1-SNAPSHOT.jar"]

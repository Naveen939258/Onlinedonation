# Use OpenJDK 17 base image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory inside container
WORKDIR /app

# Copy all backend files
COPY . .

# Install Maven & build the Spring Boot app
RUN apk add --no-cache maven && mvn clean package -DskipTests

# Expose Spring Boot default port
EXPOSE 8080

# Run the built JAR
CMD ["java", "-jar", "target/donation-backend-1.0.0.jar"]

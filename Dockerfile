FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy only pom.xml first to fetch dependencies and leverage Docker layer cache
COPY pom.xml .

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the package using cache mount to speed up incremental builds
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

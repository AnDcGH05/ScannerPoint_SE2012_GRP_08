# Builds the Spring Boot backend into a small Java 21 image (used by Railway).
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
# Tests need a local MySQL, so they are skipped in the cloud build
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
# Railway gives the port in $PORT; locally it falls back to 8081
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]

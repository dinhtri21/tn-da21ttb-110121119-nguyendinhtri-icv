FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and all project files
COPY ["server.sln", "./"]
COPY ["iCV.API/iCV.API.csproj", "iCV.API/"]
COPY ["iCV.Application/iCV.Application.csproj", "iCV.Application/"]
COPY ["iCV.Domain/iCV.Domain.csproj", "iCV.Domain/"]
COPY ["iCV.Infrastructure/iCV.Infrastructure.csproj", "iCV.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "iCV.API/iCV.API.csproj"

# Copy the rest of the application
COPY . .
WORKDIR "/src/iCV.API"

# Build the application
RUN dotnet build "iCV.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "iCV.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "iCV.API.dll"]
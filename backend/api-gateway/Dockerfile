# Build stage (using .NET 9.0)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY api-gateway.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "api-gateway.dll"]

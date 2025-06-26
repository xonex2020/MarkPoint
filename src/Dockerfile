FROM node:18-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package*.json ./
RUN npm install

# Rest des Codes kopieren
COPY . .

# Port freigeben
EXPOSE 8080

# Startbefehl
CMD ["npm", "start"]
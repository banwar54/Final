FROM node:22.14.0-alpine

# Create Backend dir inside container
WORKDIR /Backend

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy rest code
COPY . .

# Expose the port
EXPOSE 5000

# Run the development server
CMD ["npm", "run", "dev"]

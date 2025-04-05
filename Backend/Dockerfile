# Use Node.js 22.14.0 as the base image
FROM node:22.14.0-alpine

# Set environment variable to avoid interactive prompts during builds
ENV NODE_ENV=development

# Create app directory inside the container
WORKDIR /Backend

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the port your backend uses (adjust if necessary)
EXPOSE 5000

# Ensure `node_modules/.bin` is available in PATH for scripts
ENV PATH /Backend/node_modules/.bin:$PATH

# Run the development server
CMD ["npm", "run", "dev"]

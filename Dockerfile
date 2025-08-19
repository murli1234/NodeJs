# --- Base Image ---
# Use an official Node.js runtime as a parent image.
# Using alpine version for a smaller image size.
FROM node:18-lts

# --- Working Directory ---
# Create and set the working directory in the container.
WORKDIR /usr/src/app

# --- Copy package files ---
# Copy package.json and package-lock.json to the working directory.
# This leverages Docker's layer caching.
COPY package*.json ./

# --- Install Dependencies ---
# Install the application's dependencies.
RUN npm install

# --- Copy Application Code ---
# Copy the rest of the application's source code to the working directory.
COPY . .

# --- Expose Port ---
# Make port 3000 available to the world outside this container.
EXPOSE 3000

# --- Run Command ---
# Define the command to run the application.
CMD [ "node", "server.js" ]

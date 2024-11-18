# Use a PHP image with CLI for Yii2 development server
FROM php:8.1-apache

# Install PDO and MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# Set the working directory
WORKDIR /app

# Copy the Yii2 application files
COPY . /app

# Command to run Yii2's PHP built-in server on port 8080
CMD ["php", "yii", "serve", "--port=8888", "--docroot=web"]

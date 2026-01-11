# Troubleshooting Guide

This guide helps you to troubleshoot common issues with the application.

## 500 Internal Server Error on Authentication

If you are seeing a `500 Internal Server Error` when trying to log in or access authenticated routes, it is likely that the application is unable to connect to the database.

### 1. Check your Environment Variables

The application uses a `.env.local` file to store environment variables for local development. Make sure you have created this file in the root of the project.

Your `.env.local` file should look like this:

```
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
JWT_SECRET="your-super-secret-jwt-key"
```

Replace the values in the `DATABASE_URL` with the correct credentials for your local PostgreSQL database.

### 2. Check your Database Connection

You can test the database connection by running the following command:

```bash
npx prisma db pull
```

If the connection is successful, Prisma will introspect your database and update your `prisma/schema.prisma` file.

If you get an error, it means that the `DATABASE_URL` in your `.env.local` file is incorrect.

### 3. Run Migrations

Once you have a valid database connection, you need to run the database migrations to create the necessary tables:

```bash
npx prisma migrate dev
```

This command will apply all the migrations in the `prisma/migrations` directory to your database.

### 4. Restart the Application

After completing these steps, restart the development server:

```bash
npm run dev
```

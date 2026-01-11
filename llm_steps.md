I have analyzed the errors and determined that the database schema was not fully created, causing the "500 Internal Server Error" on login.

To fix this, I have created a new migration file. Please follow these steps to resolve the issue:

1.  **Ensure your PostgreSQL database is running.** You can use Docker for this:
    ```bash
    docker-compose up -d postgres
    ```

2.  **Apply the database migrations.** This will create the necessary tables in your database.
    ```bash
    npx prisma migrate dev
    ```

After completing these steps, the login functionality should work as expected.

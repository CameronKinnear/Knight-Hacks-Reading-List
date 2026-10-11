# Use server-managed cookie sessions

The app will authenticate registered Users with email and password, hash passwords with bcrypt, and persist secure server-managed sessions in MongoDB. This keeps authentication state under the Express application's control and lets the project demonstrate the full Node, Express, and MongoDB flow without an external identity provider.

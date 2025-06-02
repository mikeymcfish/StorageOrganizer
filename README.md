# Storage Container Tracking Application

A comprehensive storage container tracking application that enables efficient and intuitive item management through a visual grid interface with robust data import/export capabilities.

## Features

- **Visual Grid Interface**: Organize items in customizable container grids with drag-and-drop functionality
- **Component Management**: Track electronic components with categories, sizes, quantities, and detailed information
- **Search & Filter**: Advanced search across all items with multiple field support
- **Import/Export**: JSON-based data backup and restore functionality
- **Low Quantity Alerts**: Visual indicators for items running low on stock
- **Checkout System**: Track borrowed items with user names and return status
- **Special Characters**: Quick insertion of electronic symbols (Ω, μ) for component names

## Windows Installation Guide

### Prerequisites

1. **Node.js 20 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS version for Windows
   - Run the installer and follow the setup wizard
   - Verify installation: Open Command Prompt and run `node --version`

2. **PostgreSQL Database**
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Run the installer and remember your postgres user password
   - Default port is 5432 (keep this unless you have conflicts)
   - Create a new database for the application

### Installation Steps

1. **Download and Extract**
   ```cmd
   # Download the application files to your desired directory
   # Extract to: C:\storage-tracker (or your preferred location)
   cd C:\storage-tracker
   ```

2. **Install Dependencies**
   ```cmd
   npm install
   ```

3. **Database Setup**
   - Open pgAdmin or connect via command line
   - Create a new database named `storage_tracker`
   - Note your connection details:
     - Host: localhost
     - Port: 5432 (default)
     - Database: storage_tracker
     - Username: postgres (or your username)
     - Password: (your postgres password)

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/storage_tracker
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=storage_tracker
   PGUSER=your_username
   PGPASSWORD=your_password
   NODE_ENV=production
   ```

5. **Database Migration**
   ```cmd
   npm run db:push
   ```

6. **Start the Application**
   ```cmd
   npm run dev
   ```

7. **Access the Application**
   - Open your web browser
   - Navigate to: `http://localhost:5000`
   - The application will be ready to use

### Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL service is running in Windows Services
- Check firewall settings allow connections on port 5432
- Ensure database credentials are correct in .env file

**Port Conflicts:**
- If port 5000 is in use, modify the port in `server/index.ts`
- Update your browser URL accordingly

**Permission Errors:**
- Run Command Prompt as Administrator if you encounter permission issues
- Ensure your user has read/write access to the application directory

### Production Deployment (Optional)

For production use on a local network:

1. **Build the Application**
   ```cmd
   npm run build
   ```

2. **Configure Network Access**
   - Update server configuration to bind to `0.0.0.0` instead of `localhost`
   - Configure Windows Firewall to allow the application port
   - Access via `http://your-computer-ip:5000` from other devices

### Backup and Restore

**Backup:**
- Use the Export feature in the application to save your data as JSON
- Additionally, backup your PostgreSQL database using pgAdmin

**Restore:**
- Use the Import feature to restore from JSON backup
- For complete restoration, restore the PostgreSQL database and import JSON data

### Support

For technical issues:
1. Check the console output for error messages
2. Verify database connectivity
3. Ensure all dependencies are properly installed
4. Check that ports are not blocked by firewall

## Development

For developers wanting to modify the application:

**Technology Stack:**
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Express.js + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Build Tool: Vite

**Development Commands:**
```cmd
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push database schema changes
npm run type-check   # TypeScript type checking
```

## License

This application is provided as-is for personal and commercial use.
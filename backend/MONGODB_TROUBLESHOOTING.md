# MongoDB Connection Troubleshooting Guide

## Error: `querySrv ECONNREFUSED`

This error typically occurs when connecting to MongoDB Atlas. Here are solutions:

### Solution 1: Check MongoDB Atlas Network Access

1. **Go to MongoDB Atlas Dashboard**
   - Navigate to: https://cloud.mongodb.com/
   - Select your cluster
   - Click on **"Network Access"** (or **"IP Access List"**)

2. **Add IP Address**
   - Click **"Add IP Address"**
   - For development, you can temporarily add: `0.0.0.0/0` (allows all IPs)
   - **⚠️ Warning:** This is insecure for production - use specific IPs in production
   - Click **"Confirm"**

3. **Wait 2-3 minutes** for changes to propagate

### Solution 2: Verify Connection String Format

Your `.env` file should have:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.68z5a0h.mongodb.net/database-name?retryWrites=true&w=majority
```

**Important:**
- Replace `username` with your MongoDB Atlas username
- Replace `password` with your MongoDB Atlas password (URL-encoded if it contains special characters)
- Replace `database-name` with your database name
- The connection string should be on a **single line**

### Solution 3: Check DNS/Network Issues

If you're behind a corporate firewall or VPN:

1. **Try a different DNS server:**
   - Use Google DNS: `8.8.8.8` and `8.8.4.4`
   - Or Cloudflare DNS: `1.1.1.1` and `1.0.0.1`

2. **Disable VPN temporarily** to test connection

3. **Check firewall settings:**
   - Ensure port 27017 is not blocked (though Atlas uses SRV, not this port)

### Solution 4: Use Local MongoDB (Alternative)

If MongoDB Atlas continues to fail, use local MongoDB:

1. **Install MongoDB locally:**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb
   
   # Or download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB:**
   ```bash
   # Windows
   mongod
   
   # Or start as a service
   net start MongoDB
   ```

3. **Update `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/agriculture-chat
   ```

### Solution 5: Verify MongoDB Atlas Cluster Status

1. Check if your cluster is running (not paused)
2. Ensure you have enough credits/quota
3. Verify the cluster is in the correct region

### Solution 6: Test Connection String

Test your connection string using MongoDB Compass or `mongosh`:

```bash
# Using mongosh (MongoDB Shell)
mongosh "mongodb+srv://username:password@cluster0.68z5a0h.mongodb.net/database-name"
```

### Quick Fix for Development

For immediate testing, you can use local MongoDB:

1. Install MongoDB locally (see Solution 4)
2. Update your `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/agriculture-chat
   ```
3. Restart your server

### Environment Variable Example

Create or update `backend/.env`:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/agriculture-chat

# OR MongoDB Atlas (with proper credentials)
# MONGODB_URI=mongodb+srv://username:password@cluster0.68z5a0h.mongodb.net/agriculture-chat?retryWrites=true&w=majority

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### Still Having Issues?

1. Check MongoDB Atlas logs in the dashboard
2. Verify your MongoDB Atlas account status
3. Try creating a new cluster
4. Contact MongoDB Atlas support

## Common Mistakes

1. ❌ **Password with special characters not URL-encoded**
   - Special characters like `@`, `#`, `%` must be URL-encoded
   - `@` becomes `%40`, `#` becomes `%23`, etc.

2. ❌ **Using wrong database name**
   - Database name in connection string must match what you created

3. ❌ **Cluster paused**
   - Free tier clusters auto-pause after inactivity

4. ❌ **IP not whitelisted**
   - Most common issue - check Network Access settings


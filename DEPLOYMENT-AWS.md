# AWS Ubuntu Deployment Guide

Complete guide for deploying the Weather Information Platform to AWS EC2 Ubuntu server.

## Prerequisites

- AWS EC2 instance running Ubuntu 20.04 or later
- SSH access to the server
- Domain name (optional, but recommended)

## 1. Server Setup

### 1.1 Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.2 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Node.js 20+ (Required for Next.js 15)

```bash
# Install Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x or higher
npm --version
```

### 1.4 Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

### 1.5 Install Git

```bash
sudo apt install -y git
```

### 1.6 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## 2. Database Setup

### 2.1 Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE weather_platform_prod;
CREATE USER weather_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE weather_platform_prod TO weather_user;

# Grant schema permissions
\c weather_platform_prod
GRANT ALL ON SCHEMA public TO weather_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO weather_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO weather_user;

# Exit PostgreSQL
\q
```

### 2.2 Configure PostgreSQL for Local Connections

```bash
# Edit pg_hba.conf to allow password authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change this line:
# local   all             all                                     peer
# To:
# local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 3. Application Deployment

### 3.1 Clone Repository

```bash
# Navigate to deployment directory
cd /home/ubuntu

# Clone your repository
git clone https://github.com/yourusername/weather-platform.git
cd weather-platform
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment Variables

```bash
# Create production .env file
nano .env

# Add the following:
DATABASE_URL="postgresql://weather_user:your_secure_password@localhost:5432/weather_platform_prod?schema=public"

# API Keys
GEOAPIFY_API_KEY="a31dce689f9247898e125fd91f33000c"
YOUTUBE_API_KEY="AIzaSyAHgYLkpGbCXmOtI3mTCgEHflaRxUdpibM"

# App Config
NEXT_PUBLIC_APP_URL="http://your-ec2-ip:3000"
NODE_ENV="production"

# Save and exit (Ctrl+X, Y, Enter)
```

### 3.4 Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migration to create tables
npx prisma migrate deploy
```

### 3.5 Build the Application

```bash
npm run build
```

## 4. Start Application with PM2

### 4.1 Create PM2 Ecosystem File

```bash
nano ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [{
    name: 'weather-platform',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/weather-platform',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 4.2 Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs weather-platform

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs (will look like: sudo env PATH=... pm2 startup ...)
```

## 5. Configure Nginx (Recommended for Production)

### 5.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 5.2 Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/weather-platform
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 Enable Site and Restart Nginx

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/weather-platform /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5.4 Update Environment Variable

```bash
nano .env

# Update NEXT_PUBLIC_APP_URL to use domain or IP without port
NEXT_PUBLIC_APP_URL="http://your-domain.com"
# or
NEXT_PUBLIC_APP_URL="http://your-ec2-ip"
```

Restart the application:

```bash
pm2 restart weather-platform
```

## 6. Configure AWS Security Group

### 6.1 Open Required Ports

In AWS Console, configure your EC2 Security Group:

**With Nginx (Recommended):**
- Port 80 (HTTP) - 0.0.0.0/0
- Port 443 (HTTPS) - 0.0.0.0/0 (if using SSL)
- Port 22 (SSH) - Your IP only

**Without Nginx:**
- Port 3000 (Next.js) - 0.0.0.0/0
- Port 22 (SSH) - Your IP only

## 7. Optional: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

Update `.env`:

```bash
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

Restart:

```bash
pm2 restart weather-platform
```

## 8. Monitoring and Maintenance

### 8.1 PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs weather-platform

# Restart app
pm2 restart weather-platform

# Stop app
pm2 stop weather-platform

# Monitor resources
pm2 monit
```

### 8.2 Database Backup

```bash
# Create backup script
nano /home/ubuntu/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U weather_user -h localhost weather_platform_prod > $BACKUP_DIR/backup_$TIMESTAMP.sql
```

Make executable and add to crontab:

```bash
chmod +x /home/ubuntu/backup-db.sh

# Run daily at 2 AM
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

### 8.3 Application Updates

```bash
cd /home/ubuntu/weather-platform

# Pull latest changes
git pull origin master

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart weather-platform
```

## 9. Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs weather-platform --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Check Node.js version
node --version  # Must be 20+
```

### Database connection fails

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U weather_user -h localhost -d weather_platform_prod

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Nginx errors

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

### Port access issues

```bash
# Check if application is listening
sudo netstat -tlnp | grep :3000

# Check firewall (if enabled)
sudo ufw status

# Check AWS Security Group in AWS Console
```

## 10. Performance Optimization

### 10.1 Enable PM2 Cluster Mode (Multi-Core)

Edit `ecosystem.config.js`:

```javascript
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

Restart:

```bash
pm2 reload ecosystem.config.js
```

### 10.2 Configure Nginx Caching

Add to Nginx configuration:

```nginx
# Cache static assets
location /_next/static {
    alias /home/ubuntu/weather-platform/.next/static;
    expires 1y;
    access_log off;
}

# Cache images
location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
    expires 30d;
    access_log off;
}
```

### 10.3 Setup Swap (for small instances)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 11. Cost Optimization

### Recommended EC2 Instance

- **t3.small** or **t3.micro** (1-2 GB RAM)
- 10-20 GB storage
- Monthly cost: ~$10-20 USD

### Database Optimization

- Regular VACUUM and ANALYZE
- Index unused queries
- Archive old data

## 12. Security Checklist

- [ ] Change default database password
- [ ] Restrict SSH to your IP only
- [ ] Enable AWS CloudWatch monitoring
- [ ] Setup automatic security updates
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS with SSL certificate
- [ ] Regular database backups
- [ ] Keep Node.js and dependencies updated

## Support

For issues or questions:
- Check logs: `pm2 logs weather-platform`
- Review database: `psql -U weather_user -d weather_platform_prod`
- Test API endpoints: `curl http://localhost:3000/api/geocode`

# Skill: Linux Hardening (The "Bunker" Skill)

Harden the Hostinger KVM 1 instance against unauthorized network access and brute-force attacks.

## Usage Procedure

### 1. Identify "Open" Ports
- **Risk**: MongoDB (27017) and Redis (6379) exposed to the public internet are high-value targets.
- **Goal**: Lock down the Hostinger VPS IP so only essential web and SSH traffic passes through.

### 2. Provide the Hardening Configuration
**UFW (Uncomplicated Firewall) Setup:**
Configure the firewall first, then enable it.

```bash
# 1. Reset all to defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow SSH (Port 22) - Ensure your IP is allowed if possible
sudo ufw allow 22/tcp

# 3. Allow HTTP (80) and HTTPS (443) for Nginx/Caddy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Explicitly block DB/Redis from public (Optional as default is DENY)
# Any attempt to connect to these from outside will be Dropped/Rejected
sudo ufw deny 27017
sudo ufw deny 6379

# 5. Enable the firewall
echo "y" | sudo ufw enable
```

**Fail2Ban SSH Protection:**
Install and configure Fail2Ban to ban IPs that exhibit brute-force patterns on SSH.

```bash
# 1. Install
sudo apt update && sudo apt install fail2ban -y

# 2. Create a local jail configuration
sudo bash -c 'cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 1h
findtime = 15m
EOF'

# 3. Restart Fail2Ban
sudo systemctl restart fail2ban
```

### 3. Verification Commands
Use these to confirm the "Bunker" status:

```bash
# Check UFW Status
sudo ufw status verbose

# Check Fail2Ban Banned IPs
sudo fail2ban-client status sshd
```

## Hardening Checklist:
- [ ] **Firewall**: UFW is enabled and rules for 27017/6379 are not present (or DENY).
- [ ] **Fail2Ban**: Service is running and SSH jail is active.
- [ ] **SSH**: Consider disabling password login and using SSH Keys ONLY for maximum safety.
- [ ] **Updates**: Set up `unattended-upgrades` to keep the Hostinger kernel and services patched.

# 🐬 MySQL Master-Slave Replication with Docker

## 🧱 Architecture

```text
+-------------+ Replication +-------------+
|  MySQL 1    | ------------> |  MySQL 2   |
|  (Master)   |               |  (Slave)   |
+-------------+               +-------------+
```

---


## 📦 Docker Setup

### 1. Create Docker Network 

  ```bash
# Create network
docker network create my_master_slave

# Start MySQL Master
docker run -d --name mysql-master 
  --network my_master_slave 
  -p 8811:3306 
  -e MYSQL_ROOT_PASSWORD=root 
  mysql:8.0

# Start MySQL Slave
docker run -d --name mysql-slave 
  --network my_master_slave 
  -p 8822:3306 
  -e MYSQL_ROOT_PASSWORD=root 
  mysql:8.0
```

---

### 🔹 2. Configure `my.cnf`

#### 🖊️ Master Configuration (`master.cnf`)

```bash
# Copy config file from container to host
docker cp mysql-master:/etc/my.cnf ./mysql/master/my.cnf

# Edit (add the following lines)
log_bin=mysql-bin
server-id=1

# Copy back into container
docker cp ./mysql/master/my.cnf mysql-master:/etc/my.cnf
```

#### 🖊️ Slave Configuration (`slave.cnf`)

```bash
# Copy config file from container to host
docker cp mysql-slave:/etc/my.cnf ./mysql/slave/my.cnf

# Edit (add the following lines)
log_bin=mysql-bin
server-id=2

# Copy back into container
docker cp ./mysql/slave/my.cnf mysql-slave:/etc/my.cnf
```

> ✅ **Restart both containers after updating configs**

---

## ⚙️ Configure Replication

### 🔹 On Master (`mysql-master`)

```sql
-- Log into MySQL
mysql -uroot -p

-- Check binary log info
SHOW MASTER STATUS;
```

📌 Note down:
- `File` (e.g., `binlog.000002`)
- `Position` (e.g., `157`)

---

### 🔹 On Slave (`mysql-slave`)

```sql
-- Log into MySQL
mysql -uroot -p

-- Replace IP with master container IP (docker inspect)
CHANGE MASTER TO
  MASTER_HOST='172.21.0.2',
  MASTER_PORT=3306,
  MASTER_USER='root',
  MASTER_PASSWORD='root',
  MASTER_LOG_FILE='binlog.000002',
  MASTER_LOG_POS=157,
  MASTER_CONNECT_RETRY=60,
  GET_MASTER_PUBLIC_KEY=1;

-- Start replication
START SLAVE;
-- (or START REPLICA; for MySQL 8+)

-- Check status
SHOW SLAVE STATUS\G;
-- (or SHOW REPLICA STATUS\G;)
```

✅ Ensure the following:
```
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

---

## 🧪 Test Replication

### 🔹 On Master

```sql
CREATE DATABASE test DEFAULT CHARSET utf8mb4;

-- Check
SHOW DATABASES;
```

### 🔹 On Slave

```sql
-- Check replicated database
SHOW DATABASES;
```

---

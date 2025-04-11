# MYSQL-Master-Slave Replication with Docker
## 🧱 Architecture
+-------------+ Replication +-------------+ | MySQL 1 | --------------------> | MySQL 2 | | (Master) | | (Slave) | +-------------+ +-------------+


## 📦 Docker Setup

### 1. Create Docker Network 
```bash
docker network create my_master_slave

docker run -d --name mysql-master   
  --network my_master_slave
  -p 8811:3306
  -e MYSQL_ROOT_PASSWORD=root 
  mysql:8.0

docker run -d --name mysql-slave
  --network my_master_slave
  -p 8822:3306
  -e MYSQL_ROOT_PASSWORD=root 
  mysql:8.0
  ```

master.cnf
```bash
docker cp [id-container-master]:/etc/my.cnf ./mysql/master (path chua file copy)

log_bin=mysql-bin
server-id=1

docker cp ./mysql/master/my.cnf [id-container-master]:/etc/my.cnf
```

slave.cnf
```bash
docker cp [id-container-slave]:/etc/my.cnf ./mysql/slave 

log_bin=mysql-bin
server-id=2

docker cp ./mysql/slave/my.cnf [id-container-slave]:/etc/my.cnf
```

## ⚙️ Configure 
### On Master (mysql-master)
```sql
-- Check log position
mysql> SHOW MASTER STATUS;
```

### On Slave (mysql-slave)
```sql
mysql> CHANGE MASTER TO
  MASTER_HOST='172.21.0.2' --docker inspect [id-container-master] -> IPAdress,
  MASTER_PORT=3306,
  MASTER_USER='root',
  MASTER_PASSWORD='root',
  MASTER_LOG_FILE='binlog.000002', -- master SHOW MASTER STATUS
  MASTER_LOG_POS=157, -- master SHOW MASTER STATUS
  MASTER_CONNECT_RETRY=60,
  GET_MASTER_PUBLIC_KEY=1;

START SLAVE;
START REPLICA;
SHOW SLAVE STATUS\G;
SHOW REPLICA STATUS\G;
```

```sql
SHOW SLAVE STATUS\G;

check 
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

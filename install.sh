set -euxo pipefail

#manual - copy ~/.json configs and data
#scp 184.72.54.8:~/.stebeneva.ru.json ~/
#manual - copy *.gz backups
#scp -r 184.72.54.8:~/stebeneva.ru.sql.gz ~/
#scp -r 184.72.54.8:~/stebeneva.ru.tar.gz ~/

sudo certbot certonly --webroot -w ~/stebeneva.ru/public -d stebeneva.ru -n
sudo certbot certonly --webroot -w ~/stebeneva.ru/public -d stebeneva.pro -n

sudo mkdir /var/lib/mysql-files/stebeneva.ru

echo "create user 'stebeneva.ru'@'localhost' identified with mysql_native_password by ''" | sudo mysql -uroot
echo "grant all on `stebeneva.ru`.* to 'stebeneva.ru'@'localhost'" | sudo mysql -uroot
echo "grant file on `stebeneva.ru`.* to 'stebeneva.ru'@'localhost'" | sudo mysql -uroot

zcat stebeneva.ru.sql.gz | sudo mysql -ustebeneva.ru stebeneva.ru

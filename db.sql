create database `stebeneva.ru`;

use `stebeneva.ru`;

create user 'stebeneva.ru'@'localhost' identified with mysql_native_password by '';
grant all on `stebeneva.ru`.* to 'stebeneva.ru'@'localhost';
grant file on `stebeneva.ru`.* to 'stebeneva.ru'@'localhost';

create table section (
  id bigint primary key auto_increment,
  created datetime,
  name text
);

create table photo (
  id bigint primary key auto_increment,
  created datetime,
  sectionId bigint,
  filename text,
  content longblob,
  frontpage tinyint default 0,
  position bigint,
  key sectionId(sectiondId)
);

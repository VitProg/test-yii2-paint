test yii2 paint
============================

Простенькая рисовалка с возможностью сохранения и редактирования (по паролю) рисунков и просмотра списка всех рисонков.



REQUIREMENTS
------------

минимум PHP 5.4
  
любая база данных (например MySQL)


INSTALLATION
------------

### установка Composer
~~~
cd ~
curl -sS https://getcomposer.org/installer -o composer-setup.php
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
composer global require "fxp/composer-asset-plugin:^1.2.0"
~~~

Перейти в папку где должен лежать проект и выполнить:

~~~
git clone https://github.com/VitProg/test-yii2-paint
cd test-yii2-paint
composer install
~~~

Настраиваем подключение к БД:

~~~
cp ./config/_db.local.php ./config/db.local.php
nano ./config/db.local.php
~~~

И прописываем сво данные для доступа к БД


Запускаем миграции:

~~~
yii migrate/up
~~~

Все готово!




*Автор - [vitprog@gmail.com](mailto:vitprog@gmail.com)*


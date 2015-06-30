# stebeneva.ru

Admin page http://stebeneva.ru/admin
Username: test
Password: test
Change in project home directory `config.json`.

## Photos Configuration

Here is a sample of photos configuration `${PROJECT_HOME_DIR}/photos/conf.json`:

```json
{
  "studio": {
    "autoibf4sa19.jpg": false,
  },
  "portrait": {
    "autoibf4sxp1.jpg": false,
  },
  "reportage": {
    "autoibf5t5ic.jpg": true
  },
  "models": {},
  "travel": {}
}
```

From root object, each property is photo category, as you can see there is five (5) photo categories, studio, portrait, reportage, models, travel. And each category properties is photos filename as key with `display on front-page` flag as value. When the flag is true, that photos will be displayed at the front-page.


## Setting up

Requirement C++ library for Graphic Editing, libgd2.
Different way for each machine's architecture.
Refer to: https://github.com/y-a-v-a/node-gd#installation-on-debianubuntu

```
git clone https://github.com/akura-co/stebeneva.ru.git &&
cd stebeneva.ru &&
git checkout nodejs &&
npm i &&
node app
```

## contact

raabbajam@gmail.com

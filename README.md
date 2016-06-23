# SDHacks 2016

### Available Gulp Tasks:

*Automatic Tasks:*

- **sass:** Live compiling of **scss** files to **minified css**
- **jscoffee:** Live compiling of **coffee** files to **minified js**
- **jshint:** Javascript **linter** for your project
- **build-js:** Compiles files on **static/assets/js** to **minified js** (with sourcemaps) separately
- **build-ng:** Compiles and concatenates all your angular app code into one single minified file (with sourcemaps)

*Manual Tasks:*

- **img-optimizer:** Lossless compression for all the images used in your project

### Available NPM Tasks:

- **start:** Starts the project via **nodemon**
- **createadmin:** Task for creating a project-wide **superuser**
- **scaffold:** Magical scaffold generator

### Usage

Assuming you already have the needed **MEAN Stack** pieces installed on your computer/server (**MongoDB**, **NodeJS** & **ExpressJS**) plus **Git** & **Bower** Just run:

    1. git clone
    2. cd SDHacks2016
    3. git init
    4. npm install -g gulp gulp-cli
    5. npm install
    6. bower install

    gulp

From inside your app's folder and then open **http://localhost:3000** in your browser.
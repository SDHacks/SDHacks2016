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

### Usage

Assuming you already have the needed **MEAN Stack** pieces installed on your computer/server (**MongoDB**, **NodeJS** & **ExpressJS**) plus **Git** & **Bower** Just run:

    1. git clone
    2. cd SDHacks2016
    3. cp .env.example .env
    4. npm install
    5. bower install
    6. gulp
    
Edit any options in the new .env file to match your needs

From inside your app's folder and then open **http://localhost:3000** in your browser.

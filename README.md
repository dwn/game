# Malkachi Games

## To build and run

### Production: `./run`

### Debug: `./run debug`

### To rebuild all C/C++ object files (not typically needed): `make clean; ./run`

## api/
Library written for graphics, audio, input, and special operations using Emscripten C/C++

## app/
Code for games and other classes written in C/C++ using the library

## [app-name]/
Particular assets and config for an app

## bin/
No manual edits - generated executables

## mob/
Flutter code for framing a web app as an installable mobile-device app

## msc/
Not typically useful - just functions used to generate tables and other preprocessed data

## web/
Javascript/Node/Express/Socket server for framing an app on the web
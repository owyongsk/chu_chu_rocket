#!/usr/bin/env bash

BOWER=./private/bower_components
DST=./client/lib

# BOOTSTRAP
BOOTSTRAP=${BOWER}/bootstrap/dist
cp ${BOOTSTRAP}/css/* ${DST}/css/
cp ${BOOTSTRAP}/js/* ${DST}/js/
cp ${BOOTSTRAP}/fonts/* ${DST}/fonts/

# jQuery
JQUERY=${BOWER}/jquery/dist
cp ${JQUERY}/* ${DST}/js/

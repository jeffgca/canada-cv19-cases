#!/usr/bin/env bash

# ensure we're in the right directory
pushd . > /dev/null
SCRIPT_PATH="${BASH_SOURCE[0]}"
if ([ -h "${SCRIPT_PATH}" ]); then
  while([ -h "${SCRIPT_PATH}" ]); do cd `dirname "$SCRIPT_PATH"`;
  SCRIPT_PATH=`readlink "${SCRIPT_PATH}"`; done
fi
cd `dirname ${SCRIPT_PATH}` > /dev/null
SCRIPT_PATH=`pwd`;
popd  > /dev/null
echo "run scrape from `pwd`"

NODE = `/usr/bin/env node`

$NODE $SCRIPT_PATH/index.js
# $SCRIPT_PATH/output/canada.csv
# echo "commit changes"
# cd $SCRIPT_PATH && git add ./output/canada/csv && git commit -m "Update `date`" && git push origin master
# echo "done"

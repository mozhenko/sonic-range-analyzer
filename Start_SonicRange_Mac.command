#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TARGET="file://$DIR/SonicRange_Studio_Portable.html"

if [ -d "/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="$TARGET" --window-size=1460,920
elif [ -d "/Applications/Brave Browser.app" ]; then
  open -na "Brave Browser" --args --app="$TARGET" --window-size=1460,920
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  open -na "Microsoft Edge" --args --app="$TARGET" --window-size=1460,920
else
  open "$DIR/SonicRange_Studio_Portable.html"
fi

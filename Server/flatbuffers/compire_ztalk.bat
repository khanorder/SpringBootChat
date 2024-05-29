@echo off

set DART_PATH="D:/work\00-private\Dart\ZTalk\lib"
set JAVA_PATH="../src"

rmdir /s /q %DART_PATH%/flatbuffers
rmdir /s /q %JAVA_PATH%/src/main/java/com/zangho/game/flatbuffers

::flatc --ts -o ts --no-warnings --gen-name-strings --gen-object-api --force-empty --force-empty-vectors --ts-no-import-ext --ts-flat-files --no-prefix --keep-prefix ztalk.fbs
flatc --java -o %DART_PATH% --no-warnings --gen-name-strings --gen-object-api ztalk.fbs
flatc --dart -o %DART_PATH% --no-warnings --gen-name-strings --gen-object-api --filename-suffix _domains ztalk.fbs
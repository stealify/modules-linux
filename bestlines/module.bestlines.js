const CC = "G++";
const LIBS = "/usr/local/lib/just"; // should be JUST_HOME "/usr/local/lib/just";
const MODULE_NAME = "bestlines";
const DEPS = `mkdir -p deps
curl -L -o deps/bestline.tar.gz https://codeload.github.com/jart/bestline/tar.gz/master
tar -zxvf deps/bestline.tar.gz -C deps/
cd deps/bestline-master && $(C) -fPIC -c -O3 -o bestline.o bestline.c`;
const MODULE = `$(CC) -c -fPIC -std=c++17 -DV8_COMPRESS_POINTERS -Ideps/bestline-master -I$(JUST_HOME) -I$(JUST_HOME)/deps/v8/include -g -O3 -march=native -mtune=native -Wall -Wextra -flto -Wno-unused-parameter ${MODULE_NAME}.cc
$(CC) -g -s -shared -flto -pthread -m64 -Wl,--start-group deps/bestline-master/bestline.o ${MODULE_NAME}.o -Wl,--end-group -Wl,-soname=${MODULE_NAME}.so -o ${MODULE_NAME}.so -ldl -lrt
objcopy --only-keep-debug ${MODULE_NAME}.so ${MODULE_NAME}.so.debug
strip --strip-debug --strip-unneeded ${MODULE_NAME}.so`;

const all = [clean(),DEPS,MODULE]
const clean = (all) => `rm -f *.o
rm -f *.so
rm -f *.so.debug${all ? '\n' + `rm -fr deps`: ``}`;

const install = (debug) => `${debug ? '\n' + `mkdir -p ${LIBS}/.debug
cp -f ${MODULE_NAME}.so.debug ${LIBS}/.debug/${MODULE}.so.debug
objcopy --add-gnu-debuglink=${LIBS}/${MODULE_NAME}.so ${LIBS}/.debug/${MODULE_NAME}.so.debug`: `mkdir -p ${LIBS}
cp -f ${MODULE_NAME}.so ${LIBS}/${MODULE_NAME}.so`}
`;

  
export const bestlines = {
  assets: [
    { fileName: "bestlines.cc", source: `#include "bestlines.h"

void just::bestlines::BestlineHistoryLoad(const FunctionCallbackInfo<Value> &args) {
  String::Utf8Value filename(args.GetIsolate(), args[0]);
  bestlineHistoryLoad(*filename);
}

void just::bestlines::BestlineHistorySave(const FunctionCallbackInfo<Value> &args) {
  String::Utf8Value filename(args.GetIsolate(), args[0]);
  bestlineHistorySave(*filename);
}

void just::bestlines::BestlineHistoryAdd(const FunctionCallbackInfo<Value> &args) {
  String::Utf8Value line(args.GetIsolate(), args[0]);
  bestlineHistoryAdd(*line);
}

void just::bestlines::BestlineHistoryFree(const FunctionCallbackInfo<Value> &args) {
  bestlineHistoryFree();
}

void just::bestlines::BestlineClearScreen(const FunctionCallbackInfo<Value> &args) {
  bestlineClearScreen(1);
}

void just::bestlines::BestlineDisableRawMode(const FunctionCallbackInfo<Value> &args) {
  bestlineDisableRawMode();
}

void just::bestlines::Bestline(const FunctionCallbackInfo<Value> &args) {
  Isolate* isolate = args.GetIsolate();
  String::Utf8Value prompt(isolate, args[0]);
  char* line = bestline(*prompt);
  if (line == NULL) return;
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, line, 
    NewStringType::kNormal, strlen(line)).ToLocalChecked());
}

void just::bestlines::Init(Isolate* isolate, Local<ObjectTemplate> target) {
  Local<ObjectTemplate> module = ObjectTemplate::New(isolate);
  SET_METHOD(isolate, module, "bestline", Bestline);
  SET_METHOD(isolate, module, "loadHistory", BestlineHistoryLoad);
  SET_METHOD(isolate, module, "saveHistory", BestlineHistorySave);
  SET_METHOD(isolate, module, "addHistory", BestlineHistoryAdd);
  SET_METHOD(isolate, module, "clearHistory", BestlineHistoryFree);
  SET_METHOD(isolate, module, "cls", BestlineClearScreen);
  SET_METHOD(isolate, module, "disableRawMode", BestlineDisableRawMode);
  SET_MODULE(isolate, target, "bestlines", module);
}`,
    },
    { fileName: "bestlines.h", source: `#ifndef JUST_BESTLINE_H
#define JUST_BESTLINE_H

#include <just.h>

extern "C" {
#include "deps/bestline-master/bestline.h"
}

namespace just {

namespace bestlines {
void Bestline(const FunctionCallbackInfo<Value> &args);

void BestlineHistoryLoad(const FunctionCallbackInfo<Value> &args);
void BestlineHistorySave(const FunctionCallbackInfo<Value> &args);
void BestlineHistoryAdd(const FunctionCallbackInfo<Value> &args);
void BestlineHistoryFree(const FunctionCallbackInfo<Value> &args);
void BestlineClearScreen(const FunctionCallbackInfo<Value> &args);

void BestlineDisableRawMode(const FunctionCallbackInfo<Value> &args);

void Init(Isolate* isolate, Local<ObjectTemplate> target);
}

}

extern "C" {
	void* _register_bestlines() {
		return (void*)just::bestlines::Init;
	}
}

#endif`,},
    { fileName: "baselines.d.ts", source: ``, },
  ],
  chunks: [{}]
  
}

const Runtime = {
  "builtins.S": `.global _binary_main_js_start
_binary_main_js_start:
        .incbin "main.js"
        .global _binary_main_js_end
_binary_main_js_end`,
  "main.cc": `#include "stealify.h"
#include "main.h"

int main(int argc, char** argv) {
  setvbuf(stdout, nullptr, _IONBF, 0);
  setvbuf(stderr, nullptr, _IONBF, 0);
  std::unique_ptr<Platform> platform = v8::platform::NewDefaultPlatform();
  V8::InitializePlatform(platform.get());
  V8::Initialize();
  V8::SetFlagsFromString(v8flags);
  if (_v8flags_from_commandline == 1) {
    V8::SetFlagsFromCommandLine(&argc, argv, true);
  }
  register_builtins();
  stealify::CreateIsolate(argc, argv, stealify_js, stealify_js_len, stealify::hrtime());
  V8::Dispose();
  V8::ShutdownPlatform();
  platform.reset();
  return 0;
}`,
  "main.h": `using v8::V8;
using v8::Platform;
extern char _binary_main_js_start[];
extern char _binary_main_js_end[];
void register_builtins() {
  stealify::builtins_add("main.js", _binary_main_js_start, _binary_main_js_end - _binary_main_js_start);
}
static unsigned int stealify_js_len = _binary_main_js_end - _binary_main_js_start;
static const char* stealify_js = _binary_main_js_start;
static const char* v8flags = "--stack-trace-limit=10 --use-strict --disallow-code-generation-from-strings";
static unsigned int _v8flags_from_commandline = 1;`,
  "main.js": `if (global.stealify) {
  const { error, print } = stealify

  global.onUnhandledRejection = err => {
    error(err.stack)
  }

  function wrapHRTime (runtime) {
    const { hrtime, allochrtime } = runtime
    const buf = new ArrayBuffer(8)
    const u32 = new Uint32Array(buf)
    const u64 = new BigUint64Array(buf)
    delete runtime.allochrtime
    const start = Number(runtime.start)
    allochrtime(buf)
    const fun = () => {
      hrtime()
      return Number((u32[1] * 0x100000000) + u32[0]) - start
    }
    fun.bigint = () => {
      hrtime()
      return u64[0]
    }
    return fun
  }

  const hrtime = wrapHRTime(smol)

  const console = {
    log: (...args) => print(...args)
  }

  const process = {
    hrtime
  }

  global.console = console
  global.process = process
}

console.log(process.hrtime())`
  
}`,
  "stealify.cc": ``,
  "stealify.h": ``,
  // Optional
  "stats.js": `var arr = {
  max: function (array) {
    return Math.max.apply(null, array)
  },

  min: function (array) {
    return Math.min.apply(null, array)
  },

  range: function (array) {
    return arr.max(array) - arr.min(array)
  },

  midrange: function (array) {
    return arr.range(array) / 2
  },

  sum: function (array) {
    var num = 0
    for (var i = 0, l = array.length; i < l; i++) num += array[i]
    return num
  },

  mean: function (array) {
    return arr.sum(array) / array.length
  },

  median: function (array) {
    array.sort(function (a, b) {
      return a - b
    })
    var mid = array.length / 2
    return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2
  },

  modes: function (array) {
    if (!array.length) return []
    var modeMap = {},
      maxCount = 0,
      modes = []

    array.forEach(function (val) {
      if (!modeMap[val]) modeMap[val] = 1
      else modeMap[val]++

      if (modeMap[val] > maxCount) {
        modes = [val]
        maxCount = modeMap[val]
      }
      else if (modeMap[val] === maxCount) {
        modes.push(val)
        maxCount = modeMap[val]
      }
    })
    return modes
  },

  variance: function (array) {
    var mean = arr.mean(array)
    return arr.mean(array.map(function (num) {
      return Math.pow(num - mean, 2)
    }))
  },

  standardDeviation: function (array) {
    return Math.sqrt(arr.variance(array))
  },

  meanAbsoluteDeviation: function (array) {
    var mean = arr.mean(array)
    return arr.mean(array.map(function (num) {
      return Math.abs(num - mean)
    }))
  },

  zScores: function (array) {
    var mean = arr.mean(array)
    var standardDeviation = arr.standardDeviation(array)
    return array.map(function (num) {
      return (num - mean) / standardDeviation
    })
  }
}

arr.average = arr.mean

module.exports = arr`,
  "bench.js": `const { run } = require('@run')
const { ANSI } = require('@binary')
const stats = require('stats.js')
const fs = require('fs')

const { writeFile } = fs

async function launch () {
  if (just.opts.flush) {
    writeFile('/proc/sys/vm/drop_caches', ArrayBuffer.fromString('3'))
    await run('sync').waitfor()
  }
  const program = await run('./smol').waitfor()
  if (program.status !== 0) throw new just.SystemError(`exec status ${status}`)
  return Number(program.out)
}

const times = []
const { eraseLine, column } = ANSI.control
const runs = parseInt(just.args[2] || '100', 10)

for (let i = 0; i < runs; i++) {
  const t = await launch()
  just.print(`${column(0)}${eraseLine()}${(i + 1).toString().padEnd(10, ' ')} : ${t}`, false)
  times.push(t)
}

just.print('')
just.print(`mean      ${parseInt(stats.mean(times), 10)} nsec`)
just.print(`median    ${parseInt(stats.median(times), 10)} nsec`)
just.print(`stdDev    ${parseInt(stats.standardDeviation(times), 10)} nsec`)
just.print(`max       ${stats.max(times)} nsec`)
just.print(`min       ${stats.min(times)} nsec`)
just.print(`range     ${stats.range(times)} nsec`)
just.print(`midrange  ${stats.midrange(times)} nsec`)
just.print(`absDev    ${parseInt(stats.meanAbsoluteDeviation(times), 10)} nsec`)`,
  ".gitignore": `*.o
*.gz
stealify
sstealify.debug
deps
node_modules
scratch`,
  "Makefile": `CC=g++
RELEASE=0.1.12
INSTALL=/usr/local/bin
TARGET=smol
LIB=-ldl
FLAGS=${CFLAGS}
LFLAG=${LFLAGS}

.PHONY: help clean

help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_\.-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deps/v8/libv8_monolith.a: ## download v8 monolithic library for linking
	curl -L -o v8lib-$(RELEASE).tar.gz https://raw.githubusercontent.com/just-js/libv8/$(RELEASE)/v8.tar.gz
	tar -zxvf v8lib-$(RELEASE).tar.gz
	rm -f v8lib-$(RELEASE).tar.gz

builtins.o: ## compile builtins with build dependencies
	gcc builtins.S -c -o builtins.o

compile:
	$(CC) -c ${FLAGS} -std=c++17 -DV8_COMPRESS_POINTERS -I. -I./deps/v8/include -g -O3 -march=native -mtune=native -Wpedantic -Wall -Wextra -flto -Wno-unused-parameter main.cc
	$(CC) -c ${FLAGS} -DNAMESPACE='${TARGET}' -DVERSION='"${RELEASE}"' -std=c++17 -DV8_COMPRESS_POINTERS -I. -I./deps/v8/include -g -O3 -march=native -mtune=native -Wpedantic -Wall -Wextra -flto -Wno-unused-parameter ${TARGET}.cc

main: deps/v8/libv8_monolith.a ## link the main application dynamically
	$(CC) -g -rdynamic -flto -pthread -m64 -Wl,--start-group deps/v8/libv8_monolith.a main.o ${TARGET}.o builtins.o -Wl,--end-group ${LFLAG} ${LIB} -o ${TARGET} -Wl,-rpath=/usr/local/lib/${TARGET}

main-static: deps/v8/libv8_monolith.a ## link the main application statically
	$(CC) -g -static -flto -pthread -m64 -Wl,--start-group deps/v8/libv8_monolith.a main.o ${TARGET}.o builtins.o -Wl,--end-group ${LFLAG} ${LIB} -o ${TARGET} -Wl,-rpath=/usr/local/lib/${TARGET}

debug: ## strip debug symbols into a separate file
	objcopy --only-keep-debug ${TARGET} ${TARGET}.debug
	strip --strip-debug --strip-unneeded ${TARGET}
	objcopy --add-gnu-debuglink=${TARGET}.debug ${TARGET}

all:
	$(MAKE) clean builtins.o compile main debug

clean: ## tidy up
	rm -f *.o
	rm -f *.gz
	rm -f ${TARGET}
	rm -f ${TARGET}.debug

cleanall: ## remove target and build deps
	rm -fr deps
	$(MAKE) clean

install: ## install
	mkdir -p ${INSTALL}
	cp -f ${TARGET} ${INSTALL}/${TARGET}

install-debug: ## install debug symbols
	mkdir -p ${INSTALL}/.debug
	cp -f ${TARGET}.debug ${INSTALL}/.debug/${TARGET}.debug

uninstall: ## uninstall
	rm -f ${INSTALL}/${TARGET}
	rm -f ${INSTALL}/${TARGET}/.debug

.DEFAULT_GOAL := help`


}

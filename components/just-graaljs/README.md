# just-graaljs
Is a JustJS just-v8 inspired Component and Component build system that also invokes es4x from the eclipse vertx team mainly paolo lopez the lead maintainer. 

It Implements a just-v8 like self build pattern even with the same command line switches using:
- es4x as event loop supplyer
- graaljs as code composition runtime
- implements a just:: api in Kotlin / Java / ECMAScript
- is compatible to just-v8 into both directions as embedder as also getting embedded via SubstrateVM(GraalVM NativeImage)
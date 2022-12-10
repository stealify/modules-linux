# node-graal for just-v8
using libnode.so can also use libnode.so from the graaljs project for interop 
this depends on the graaljs module which integrates v8 and supplys libnode.so
simply use the graal-node module if you need that for integration this builds
the c++ nodejs version by default. 

Alllows bidrectional embedding node-graal into just-v8 and vice versa 
To not get confused for performance and none experimental use you mostly want
to embedded node-graal into just-v8 to interop with JAVA based code running 
inside the JVM or SubstrateVM builds. 

The JVM and or SubstrateVM builds are not knowen to be faster or add 
any other value then interop as of time of writing. So the only speed advantage
maybe at development time when you work with existing JVM based code bases at scale.

Or if you want to embedded just-v8 into your existing nativ builds to incremental adopt 
it and switch your codebase over.
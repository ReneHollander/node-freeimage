node-freeimage
==============

Node.js wrapper around [FreeImage](http://freeimage.sourceforge.net/).
Since this package uses [FFI](https://www.npmjs.com/package/node-ffi), the FreeImage dynamic library must be installed. 
On 64-bit systems, only the 64-bit version of FreeImage can be used by FFI.

## Installation

From npmjs.org:

    npm install node-freeimage
  
From bitbucket.org:

    npm install git+https://bitbucket.org/koldev/node-freeimage.git

## Usage

    var fi = require("node-freeimage");

    console.log("FreeImage version:", fi.getVersion());

## Tests

    npm test
    
## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release


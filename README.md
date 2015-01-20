node-freeimage
==============

Node.js wrapper around [FreeImage](http://freeimage.sourceforge.net/). This package uses [FFI](https://www.npmjs.com/package/node-ffi), so the FreeImage dynamic library must be installed, see below. If you have any problems, questions or suggestions, please feel free to [contact me](http://stackoverflow.com/users/600135/kol).

## Installation

### 1) Install FreeImage

#### 1/a) Windows

The FreeImage binary distribution won't work. All exported functions were compiled using the `__stdcall` calling convention and have names in the DLL like `_FreeImage_GetVersion@0`. The `node-freeimage` package assumes that function names are not mangled.   

You need to download the [source distribution](http://freeimage.sourceforge.net/download.html), and compile it using Visual Studio. There are solution files for VS2003, VS2005 and VS2008, but more modern VS versions also work, just open VS2008.sln and let VS upgrade every project. The following settings are needed:
 
-  Select Release Mode. 
-  On 32-bit Windows, compile for 32-bit (it's the default), but on 64-bit Windows, compile for 64-bit ([MSDN](http://msdn.microsoft.com/en-us/library/9yb4317s.aspx)).
-  In `FreeImage.h`, find this: `#define DLL_CALLCONV __stdcall` and replace `__stdcall` with `__cdecl`.    
-  If you get errors referring to `std::max` and `std::min`, add `#include <algorithm>` to the `#include` list of the affected files.

After compilation succeeds, copy `FreeImage.dll` from the `Release` directory into the `node-freeimage` directory.

#### 1/b) Linux

Install the FreeImage development package. For example, on Ubuntu:

    sudo apt-get install libfreeimage-dev
    
### 2) Install `node-freeimage`     



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


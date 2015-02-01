node-freeimage
==============

Node.js wrapper around [FreeImage](http://freeimage.sourceforge.net/). This package uses [FFI](https://www.npmjs.com/package/node-ffi), so the FreeImage dynamic library must be installed, see below. If you have any problems, questions or suggestions, please feel free to [contact me](<mailto:kocsis1977@gmail.com>).


## Usage

    var fi = require("node-freeimage");

    console.log("FreeImage version:", fi.getVersion());


## Requirements

- Windows or Linux
- Installed FreeImage dynamic library, version 3.16.0 or above


## Installation

### 1. Install FreeImage

#### a) Windows

The FreeImage binary distribution won't work. All exported functions were compiled using the `__stdcall` calling convention and have names in the DLL like `_FreeImage_GetVersion@0`. The `node-freeimage` package assumes that function names are not mangled.   

You need to download the [source distribution](http://freeimage.sourceforge.net/download.html), and compile it using Visual Studio. There are solution files for VS2003, VS2005 and VS2008, but more modern VS versions also work, just open VS2008.sln and let VS upgrade every project. The following settings are needed:
 
-  Select Release Mode. 
-  On 32-bit Windows, compile for 32-bit (it's the default), but on 64-bit Windows, compile for 64-bit ([MSDN](http://msdn.microsoft.com/en-us/library/9yb4317s.aspx)).
-  In `FreeImage.h`, find this: `#define DLL_CALLCONV __stdcall` and replace `__stdcall` with `__cdecl`.    
-  If you get errors referring to `std::max` and `std::min`, add `#include <algorithm>` to the `#include` list of the affected files.

After compilation succeeds, copy `FreeImage.dll` from the `Release` directory into the `node-freeimage` directory.

#### b) Linux

Download the [source distribution](http://freeimage.sourceforge.net/download.html), and compile it using GCC:

    make

After successful compilation, install it:

    sudo make install
 
    
### 2. Install `node-freeimage`     

From npmjs.org:

    npm install node-freeimage
  
From bitbucket.org:

    npm install git+https://bitbucket.org/koldev/node-freeimage.git


## Tests

    npm test
 
   
## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.


## Release History

* 0.1.0 Initial release.
* 0.2.0 Added the desciption of installation steps.
* 0.3.0 Added assertions and unit tests for bitmap information functions.
* 0.4.0 Added assertions and unit tests for file type functions.
* 0.5.0 Added assertions and unit tests for pixel access functions.
* 0.6.0 Added assertions and unit tests for conversion functions.
* 0.7.0 Added assertions and unit tests for tone mapping operators.
* 0.8.0 Added assertions and unit tests for ICC profile functions.
* 0.9.0 Added assertions and unit tests for multipage functions.
* 0.10.0 Added assertions and unit tests for compression functions.
* 0.11.0 Added assertions and unit tests for helper functions.
* 0.12.0 Added assertions and unit tests for tag creation and destruction functions.
* 0.13.0 Added assertions and unit tests for tag accessor functions.
* 0.14.0 Added assertions and unit tests for metadata iterator functions.
* 0.15.0 Added assertions and unit tests for metadata accessor functions.
* 0.16.0 Added assertions and unit tests for metadata helper functions.
* 0.17.0 Added assertions and unit tests for rotation and flipping functions.
* 0.18.0 Added assertions and unit tests for up- and downsampling functions.
* 0.19.0 Added assertions and unit tests for color manipulation functions.
* 0.20.0 Added assertions and unit tests for channel processing functions.
* 0.21.0 Added assertions and unit tests for copy, paste, and composite routines.
* 0.22.0 Added assertions and unit tests for JPEG transformation functions.


## JavaScript version of supported FreeImage functions

It is assumed that `node-freeimage` has been loaded as follows:

    var fi = require("node-freeimage");

### Bitmap function reference

#### General functions

- `FreeImage_Initialise`: --- (not needed)
- `FreeImage_DeInitialise`: --- (not needed)
- `FreeImage_GetVersion`: `fi.getVersion`
- `FreeImage_GetCopyrightMessage`: `fi.getCopyrightMessage`
- `FreeImage_SetOutputMessage`: ---

#### Bitmap management functions

- `FreeImage_Allocate`: `fi.allocate`
- `FreeImage_AllocateT`: `fi.allocateT`
- `FreeImage_Load`: `fi.load`
- `FreeImage_LoadU`: ---
- `FreeImage_LoadFromHandle`: ---
- `FreeImage_Save`: `fi.save`
- `FreeImage_SaveU`: ---
- `FreeImage_SaveToHandle`: ---
- `FreeImage_Clone`: `fi.clone`
- `FreeImage_Unload`: `fi.unload`

#### Bitmap information functions

- `FreeImage_GetImageType`: `fi.getImageType`
- `FreeImage_GetColorsUsed`: `fi.getColorsUsed`
- `FreeImage_GetBPP`: `fi.getBPP`
- `FreeImage_GetWidth`: `fi.getWidth`
- `FreeImage_GetHeight`: `fi.getHeight`
- `FreeImage_GetLine`: `fi.getLine`
- `FreeImage_GetPitch`: `fi.getPitch`
- `FreeImage_GetDIBSize`: `fi.getDIBSize`
- `FreeImage_GetPalette`: `fi.getPalette`
- `FreeImage_GetDotsPerMeterX`: `fi.getDotsPerMeterX`
- `FreeImage_GetDotsPerMeterY`: `fi.getDotsPerMeterY`
- `FreeImage_SetDotsPerMeterX`: `fi.setDotsPerMeterX`
- `FreeImage_SetDotsPerMeterY`: `fi.setDotsPerMeterY`
- `FreeImage_GetInfoHeader`: `fi.getInfoHeader`
- `FreeImage_GetInfo`: `fi.getInfo`
- `FreeImage_GetColorType`: `fi.getColorType`
- `FreeImage_GetRedMask`: `fi.getRedMask`
- `FreeImage_GetGreenMask`: `fi.getGreenMask`
- `FreeImage_GetBlueMask`: `fi.getBlueMask`
- `FreeImage_GetTransparencyCount`: `fi.getTransparencyCount`
- `FreeImage_GetTransparencyTable`: `fi.getTransparencyTable`
- `FreeImage_SetTransparencyTable`: `fi.setTransparencyTable`
- `FreeImage_SetTransparent`: `fi.setTransparent`
- `FreeImage_IsTransparent`: `fi.isTransparent`
- `FreeImage_SetTransparentIndex`: `fi.setTransparentIndex`
- `FreeImage_GetTransparentIndex`: `fi.getTransparentIndex`
- `FreeImage_HasBackgroundColor`: `fi.hasBackgroundColor`
- `FreeImage_GetBackgroundColor`: `fi.getBackgroundColor`
- `FreeImage_SetBackgroundColor`: `fi.setBackgroundColor`
- `FreeImage_HasPixels`: `fi.hasPixels`
- `FreeImage_GetThumbnail`: `fi.getThumbnail`
- `FreeImage_SetThumbnail`: `fi.setThumbnail`

#### Filetype functions

- `FreeImage_GetFileType`: `fi.getFileType`
- `FreeImage_GetFileTypeU`: ---
- `FreeImage_GetFileTypeFromHandle`: ---
- `FreeImage_GetFileTypeFromMemory`: ---

#### Pixel access functions

- `FreeImage_GetBits`: `fi.getBits`
- `FreeImage_GetScanLine`: `fi.getScanLine`
- `FreeImage_GetPixelIndex`: `fi.getPixelIndex`
- `FreeImage_GetPixelColor`: `fi.getPixelColor`
- `FreeImage_SetPixelIndex`: `fi.setPixelIndex`
- `FreeImage_SetPixelColor`: `fi.setPixelColor`

#### Conversion functions

- `FreeImage_ConvertTo4Bits`: `fi.convertTo4Bits`
- `FreeImage_ConvertTo8Bits`: `fi.convertTo8Bits`
- `FreeImage_ConvertToGreyscale`: `fi.convertToGreyscale`
- `FreeImage_ConvertTo16Bits555`: `fi.convertTo16Bits555`
- `FreeImage_ConvertTo16Bits565`: `fi.convertTo16Bits565`
- `FreeImage_ConvertTo24Bits`: `fi.convertTo24Bits`
- `FreeImage_ConvertTo32Bits`: `fi.convertTo32Bits`
- `FreeImage_ColorQuantize`: `fi.colorQuantize`
- `FreeImage_ColorQuantizeEx`: `fi.colorQuantizeEx`
- `FreeImage_Threshold`: `fi.threshold`
- `FreeImage_Dither`: `fi.dither`
- `FreeImage_ConvertFromRawBits`: `fi.convertFromRawBits`
- `FreeImage_ConvertToRawBits`: `fi.convertToRawBits`
- `FreeImage_ConvertToStandardType`: `fi.convertToStandardType`
- `FreeImage_ConvertToType`: `fi.convertToType`
- `FreeImage_ConvertToFloat`: `fi.convertToFloat`
- `FreeImage_ConvertToRGBF`: `fi.convertToRGBF`
- `FreeImage_ConvertToUINT16`: `fi.convertToUINT16`
- `FreeImage_ConvertToRGB16`: `fi.convertToRGB16`

####  Tone mapping operators

- `FreeImage_ToneMapping`: `fi.toneMapping`
- `FreeImage_TmoDrago03`: `fi.tmoDrago03`
- `FreeImage_TmoReinhard05`: `fi.tmoReinhard05`
- `FreeImage_TmoReinhard05Ex`: `fi.tmoReinhard05Ex`
- `FreeImage_TmoFattal02`: `fi.tmoFattal02`

#### ICC profile functions

- `FreeImage_GetICCProfile`: `fi.getICCProfile`
- `FreeImage_CreateICCProfile`: `fi.createICCProfile`
- `FreeImage_DestroyICCProfile`: `fi.destroyICCProfile`

#### Plugin functions

- `FreeImage_GetFIFCount`: ---
- `FreeImage_SetPluginEnabled`: ---
- `FreeImage_IsPluginEnabled`: ---
- `FreeImage_GetFIFFromFormat`: ---
- `FreeImage_GetFIFFromMime`: ---
- `FreeImage_GetFIFMimeType`: ---
- `FreeImage_GetFormatFromFIF`: ---
- `FreeImage_GetFIFExtensionList`: ---
- `FreeImage_GetFIFDescription`: ---
- `FreeImage_GetFIFRegExpr`: ---
- `FreeImage_GetFIFFromFilename`: ---
- `FreeImage_GetFIFFromFilenameU`: ---
- `FreeImage_FIFSupportsReading`: ---
- `FreeImage_FIFSupportsWriting`: ---
- `FreeImage_FIFSupportsExportType`: ---
- `FreeImage_FIFSupportsExportBPP`: ---
- `FreeImage_FIFSupportsICCProfiles`: ---
- `FreeImage_FIFSupportsNoPixels`: ---
- `FreeImage_RegisterLocalPlugin`: ---
- `FreeImage_RegisterExternalPlugin`: ---


#### Multipage functions

- `FreeImage_OpenMultiBitmap`: `fi.openMultiBitmap`
- `FreeImage_OpenMultiBitmapFromHandle`: ---
- `FreeImage_SaveMultiBitmapToHandle`: ---
- `FreeImage_CloseMultiBitmap`: `fi.closeMultiBitmap`
- `FreeImage_GetPageCount`: `fi.getPageCount`
- `FreeImage_AppendPage`: `fi.appendPage`
- `FreeImage_InsertPage`: `fi.insertPage`
- `FreeImage_DeletePage`: `fi.deletePage`
- `FreeImage_LockPage`: `fi.lockPage`
- `FreeImage_UnlockPage`: `fi.unlockPage`
- `FreeImage_MovePage`: `fi.movePage`
- `FreeImage_GetLockedPageNumbers`: `fi.getLockedPageNumbers`

#### Memory I/O streams

- `FreeImage_OpenMemory`: --- 
- `FreeImage_CloseMemory`: --- 
- `FreeImage_LoadFromMemory`: --- 
- `FreeImage_SaveToMemory`: --- 
- `FreeImage_AcquireMemory`: --- 
- `FreeImage_TellMemory`: --- 
- `FreeImage_SeekMemory`: --- 
- `FreeImage_ReadMemory`: --- 
- `FreeImage_WriteMemory`: --- 
- `FreeImage_LoadMultiBitmapFromMemory`: --- 
- `FreeImage_SaveMultiBitmapToMemory`: --- 

#### Compression functions

- `FreeImage_ZLibCompress`: `fi.zLibCompress`
- `FreeImage_ZLibUncompress`: `fi.zLibUncompress`
- `FreeImage_ZLibGZip`: `fi.zLibGZip`
- `FreeImage_ZLibGUnzip`: `fi.zLibGUnzip`
- `FreeImage_ZLibCRC32`: `fi.zLibCRC32`

#### Helper functions

- `FreeImage_IsLittleEndian`: `fi.isLittleEndian`
- `FreeImage_LookupX11Color`: `fi.lookupX11Color`
- `FreeImage_LookupSVGColor`: `fi.lookupSVGColor`

### Metadata function reference

#### Tag creation and destruction

- `FreeImage_CreateTag`: `fi.createTag`
- `FreeImage_DeleteTag`: `fi.deleteTag`
- `FreeImage_CloneTag`: `fi.cloneTag`

#### Tag accessors

- `FreeImage_GetTagKey`: `fi.getTagKey`
- `FreeImage_GetTagDescription`: `fi.getTagDescription`
- `FreeImage_GetTagID`: `fi.getTagID`
- `FreeImage_GetTagType`: `fi.getTagType`
- `FreeImage_GetTagCount`: `fi.getTagCount`
- `FreeImage_GetTagLength`: `fi.getTagLength`
- `FreeImage_GetTagValue`: `fi.getTagValue`
- `FreeImage_SetTagKey`: `fi.setTagKey`
- `FreeImage_SetTagDescription`: `fi.setTagDescription`
- `FreeImage_SetTagID`: `fi.setTagID`
- `FreeImage_SetTagType`: `fi.setTagType`
- `FreeImage_SetTagCount`: `fi.setTagCount`
- `FreeImage_SetTagLength`: `fi.setTagLength`
- `FreeImage_SetTagValue`: `fi.setTagValue`

#### Metadata iterator

- `FreeImage_FindFirstMetadata`: `fi.findFirstMetadata`
- `FreeImage_FindNextMetadata`: `fi.findNextMetadata`
- `FreeImage_FindCloseMetadata`: `fi.findCloseMetadata`

#### Metadata accessors

- `FreeImage_GetMetadata`: `fi.getMetadata`
- `FreeImage_SetMetadata`: `fi.setMetadata`

#### Metadata helper functions

- `FreeImage_GetMetadataCount`: `fi.getMetadataCount`
- `FreeImage_CloneMetadata`: `fi.cloneMetadata`
- `FreeImage_TagToString`: `fi.tagToString`

### Toolkit function reference

#### Rotation and flipping

- `FreeImage_Rotate`: `fi.rotate`
- `FreeImage_RotateEx`: `fi.rotate`
- `FreeImage_FlipHorizontal`: `fi.flipHorizontal`
- `FreeImage_FlipVertical`: `fi.flipVertical`

#### Upsampling / downsampling

- `FreeImage_Rescale`: `fi.rescale`
- `FreeImage_MakeThumbnail`: `fi.makeThumbnail`

#### Color manipulation
- `FreeImage_AdjustCurve`: `fi.adjustCurve`
- `FreeImage_AdjustGamma`: `fi.adjustGamma`
- `FreeImage_AdjustBrightness`: `fi.adjustBrightness`
- `FreeImage_AdjustContrast`: `fi.adjustContrast`
- `FreeImage_Invert`: `fi.invert`
- `FreeImage_GetHistogram`: `fi.getHistogram`
- `FreeImage_GetAdjustColorsLookupTable`: `fi.getAdjustColorsLookupTable`
- `FreeImage_AdjustColors`: `fi.adjustColors`
- `FreeImage_ApplyColorMapping`: `fi.applyColorMapping`
- `FreeImage_SwapColors`: `fi.swapColors`
- `FreeImage_ApplyPaletteIndexMapping`: `fi.applyPaletteIndexMapping`
- `FreeImage_SwapPaletteIndices`: `fi.swapPaletteIndices`

#### Channel processing

- `FreeImage_GetChannel`: `fi.getChannel`
- `FreeImage_SetChannel`: `fi.setChannel`
- `FreeImage_GetComplexChannel`: `fi.getComplexChannel`
- `FreeImage_SetComplexChannel`: `fi.setComplexChannel`

#### Copy / Paste / Composite routines

- `FreeImage_Copy`: `fi.copy`
- `FreeImage_Paste`: `fi.paste`
- `FreeImage_Composite`: `fi.composite`
- `FreeImage_PreMultiplyWithAlpha`: `fi.preMultiplyWithAlpha`

#### JPEG lossless transformations

- `FreeImage_JPEGTransform`: `fi.jpegTransform`
- `FreeImage_JPEGTransformU`: ---
- `FreeImage_JPEGCrop`: `fi.jpegCrop`
- `FreeImage_JPEGCrop`: ---
- `FreeImage_JPEGTransformCombined`: `fi.jpegTransformCombined`
- `FreeImage_JPEGTransformCombinedU`: ---
- `FreeImage_JPEGTransformCombinedFromMemory`: ---
- `FreeImage_JPEGTransformFromHandle`: ---

#### Background filling

- `FreeImage_FillBackground`: `fi.fillBackground`
- `FreeImage_EnlargeCanvas`: `fi.enlargeCanvas`
- `FreeImage_AllocateEx`: `fi.allocateEx`
- `FreeImage_AllocateExT`: `fi.allocateExT`

#### Miscellaneous algorithms

- `FreeImage_MultigridPoissonSolver`: `fi.multigridPoissonSolver`

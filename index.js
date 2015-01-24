var ref = require("ref"),
    RefArray = require("ref-array"),
    RefStruct = require("ref-struct"),
    ffi = require("ffi"),
    os = require("os"),
    // Constants
    FALSE = 0,
    TRUE = 1,
    NULL = ref.NULL,
    // Simple types
    VOID = ref.types.void,
    PVOID = ref.refType(VOID),
    BOOL = ref.types.int32,
    PBOOL = ref.refType(BOOL),
    BYTE = ref.types.uint8,
    PBYTE = ref.refType(BYTE),
    PPBYTE = ref.refType(PBYTE),
    WORD = ref.types.uint16,
    PWORD = ref.refType(WORD),
    DWORD = ref.types.uint32,
    PDWORD = ref.refType(DWORD),
    LONG = ref.types.int32,
    PLONG = ref.refType(LONG),
    INT64 = ref.types.int64,
    PINT64 = ref.refType(INT64),
    UINT64 = ref.types.uint64,
    PUINT64 = ref.refType(UINT64),
    FLOAT = ref.types.float,
    PFLOAT = ref.refType(FLOAT),
    DOUBLE = ref.types.double,
    PDOUBLE = ref.refType(DOUBLE),
    STRING = ref.types.CString,
    BITMAP = VOID,
    PBITMAP = PVOID,
    MULTIBITMAP = VOID,
    PMULTIBITMAP = PVOID,
    METADATA = VOID,
    PMETADATA = PVOID,
    TAG = VOID,
    PTAG = PVOID,
    PPTAG = ref.refType(PTAG),
    MEMORY = VOID,
    PMEMORY = PVOID,
    // Structs
    RGBQUAD = RefStruct({
      rgbBlue: BYTE,
      rgbGreen: BYTE,
      rgbRed: BYTE,
      rgbReserved: BYTE
    }),
    PRGBQUAD = ref.refType(RGBQUAD),
    RGBTRIPLE = RefStruct({
      rgbtBlue: BYTE,
      rgbtGreen: BYTE,
      rgbtRed: BYTE
    }),
    PRGBTRIPLE = ref.refType(RGBTRIPLE),
    BITMAPINFOHEADER = RefStruct({
      biSize: DWORD,
      biWidth: LONG, 
      biHeight: LONG,
      biPlanes: WORD,
      biBitCount: WORD,
      biCompression: DWORD,
      biSizeImage: DWORD, 
      biXPelsPerMeter: LONG,
      biYPelsPerMeter: LONG,
      biClrUsed: DWORD,
      biClrImportant: DWORD
    }),
    PBITMAPINFOHEADER = ref.refType(BITMAPINFOHEADER),
    BITMAPINFO = RefStruct({
      bmiHeader: BITMAPINFOHEADER, 
      bmiColors: RefArray(RGBQUAD)
    }),
    PBITMAPINFO = ref.refType(BITMAPINFO),
    RGB16 = RefStruct({
      red: WORD,
      green: WORD,
      blue: WORD
    }),
    PRGB16 = ref.refType(RGB16),
    RGBA16 = RefStruct({
      red: WORD,
      green: WORD,
      blue: WORD,
      alpha: WORD
    }),
    PRGBA16 = ref.refType(RGBA16),
    RGBF = RefStruct({
      red: FLOAT,
      green: FLOAT,
      blue: FLOAT
    }),
    PRGBF = ref.refType(RGBF),
    RGBAF = RefStruct({
      red: FLOAT,
      green: FLOAT,
      blue: FLOAT,
      alpha: FLOAT
    }),
    PRGBAF = ref.refType(RGBAF),
    COMPLEX = RefStruct({
      r: DOUBLE,
      i: DOUBLE
    }),
    PCOMPLEX = ref.refType(COMPLEX),
    ICCPROFILE = RefStruct({
      flags: WORD,
      size: DWORD,
      data: PVOID
    }),
    PICCPROFILE = ref.refType(ICCPROFILE),
    // Library
    libraryName = "",
    library = null;
    
function setToDefaultIfUndefined(arg, argDefault) {
  return typeof arg === "undefined" ? argDefault : arg;
}

function assertBoolean(arg, argName) {
  if (typeof arg !== "boolean") {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be a boolean (" + arg + ")."
    );
  }
}    

function assertByte(arg, argName) {
  if (typeof arg !== "number" || arg % 1 !== 0 || arg < 0 || 255 < arg) {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be a byte (" + arg + ")."
    );
  }
}    

function assertInteger(arg, argName) {
  if (typeof arg !== "number" || arg % 1 !== 0) {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be an integer (" + arg + ")."
    );
  }
}    

function assertUnsignedInteger(arg, argName) {
  if (typeof arg !== "number" || arg % 1 !== 0 || arg < 0) {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be an unsigned integer (" + arg + ")."
    );
  }
}    

function assertDouble(arg, argName) {
  if (typeof arg !== "number") {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be a double-precision floating-point number (" + arg + ")."
    );
  }
}    

function assertNonEmptyString(arg, argName) {
  if (typeof arg !== "string" || arg.length === 0) {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be a non-empty string (" + arg + ")."
    );
  }
}

function assertObject(arg, argName) {
  if (typeof arg !== "object") {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be an object (" + arg + ")."
    );
  }
}

function assertNonNullObject(arg, argName) {
  if (
    typeof arg !== "object" || 
    arg === null ||
    typeof arg.isNull !== "function" || 
    arg.isNull()
  ) {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be a non-null object (" + arg + ")."
    );
  }
}

function assertImageType(arg, argName) {
  var p;
  for (p in module.exports.IMAGE_TYPE) {
    if (arg === module.exports.IMAGE_TYPE[p]) {
      return;
    }
  }
  throw new Error(
    "Argument \"" + argName + "\" " + 
    "must be an image type (" + arg + ")."
  );
}

function assertImageFormat(arg, argName) {
  var p;
  for (p in module.exports.IMAGE_FORMAT) {
    if (arg === module.exports.IMAGE_FORMAT[p]) {
      return;
    }
  }
  throw new Error(
    "Argument \"" + argName + "\" " + 
    "must be an image format (" + arg + ")."
  );
}

function assertQuantization(arg, argName) {
  var p;
  for (p in module.exports.QUANTIZATION) {
    if (arg === module.exports.QUANTIZATION[p]) {
      return;
    }
  }
  throw new Error(
    "Argument \"" + argName + "\" " + 
    "must be a quantization algorithm (" + arg + ")."
  );
}

function assertDithering(arg, argName) {
  var p;
  for (p in module.exports.DITHERING) {
    if (arg === module.exports.DITHERING[p]) {
      return;
    }
  }
  throw new Error(
    "Argument \"" + argName + "\" " + 
    "must be a dithering algorithm (" + arg + ")."
  );
}

function assertToneMappingOperation(arg, argName) {
  var p;
  for (p in module.exports.TONE_MAPPING_OPERATION) {
    if (arg === module.exports.TONE_MAPPING_OPERATION[p]) {
      return;
    }
  }
  throw new Error(
    "Argument \"" + argName + "\" " + 
    "must be a tone mapping operation (" + arg + ")."
  );
}

libraryName = os.platform().indexOf("win") >= 0 ? "FreeImage" : "libfreeimage";
library = new ffi.Library(libraryName, {
  // BITMAP FUNCTION REFERENCE
  // General functions
  "FreeImage_GetVersion": [STRING, []],
  "FreeImage_GetCopyrightMessage": [STRING, []],
  // Bitmap management functions
  "FreeImage_Allocate": [PBITMAP, [LONG, LONG, LONG, DWORD, DWORD, DWORD]],
  "FreeImage_AllocateT": [PBITMAP, [LONG, LONG, LONG, LONG, DWORD, DWORD, DWORD]],
  "FreeImage_Save": [BOOL, [LONG, PBITMAP, STRING, LONG]],
  "FreeImage_Load": [PBITMAP, [LONG, STRING, LONG]],
  "FreeImage_Clone": [PBITMAP, [PBITMAP]],
  "FreeImage_Unload": [VOID, [PBITMAP]],
  // Bitmap information functions
  "FreeImage_GetImageType": [LONG, [PBITMAP]],
  "FreeImage_GetColorsUsed": [DWORD, [PBITMAP]],
  "FreeImage_GetBPP": [DWORD, [PBITMAP]],
  "FreeImage_GetWidth": [DWORD, [PBITMAP]],
  "FreeImage_GetHeight": [DWORD, [PBITMAP]],
  "FreeImage_GetLine": [DWORD, [PBITMAP]],
  "FreeImage_GetPitch": [DWORD, [PBITMAP]],
  "FreeImage_GetDIBSize": [DWORD, [PBITMAP]],
  "FreeImage_GetPalette": [PRGBQUAD, [PBITMAP]],
  "FreeImage_GetDotsPerMeterX": [DWORD, [PBITMAP]],
  "FreeImage_GetDotsPerMeterY": [DWORD, [PBITMAP]],
  "FreeImage_SetDotsPerMeterX": [VOID, [PBITMAP, DWORD]],
  "FreeImage_SetDotsPerMeterY": [VOID, [PBITMAP, DWORD]],
  "FreeImage_GetInfoHeader": [PBITMAPINFOHEADER, [PBITMAP]],
  "FreeImage_GetInfo": [PBITMAPINFO, [PBITMAP]],
  "FreeImage_GetColorType": [LONG, [PBITMAP]],
  "FreeImage_GetRedMask": [DWORD, [PBITMAP]],
  "FreeImage_GetGreenMask": [DWORD, [PBITMAP]],
  "FreeImage_GetBlueMask": [DWORD, [PBITMAP]],
  "FreeImage_GetTransparencyCount": [DWORD, [PBITMAP]],
  "FreeImage_GetTransparencyTable": [PBYTE, [PBITMAP]],
  "FreeImage_SetTransparencyTable": [VOID, [PBITMAP, PBYTE, LONG]],
  "FreeImage_SetTransparent": [VOID, [PBITMAP, BOOL]],
  "FreeImage_IsTransparent": [BOOL, [PBITMAP]],
  "FreeImage_SetTransparentIndex": [VOID, [PBITMAP, LONG]],
  "FreeImage_GetTransparentIndex": [LONG, [PBITMAP]],
  "FreeImage_HasBackgroundColor": [BOOL, [PBITMAP]],
  "FreeImage_GetBackgroundColor": [BOOL, [PBITMAP, PRGBQUAD]],
  "FreeImage_SetBackgroundColor": [BOOL, [PBITMAP, PRGBQUAD]],
  "FreeImage_HasPixels": [BOOL, [PBITMAP]],
  "FreeImage_GetThumbnail": [PBITMAP, [PBITMAP]],
  "FreeImage_SetThumbnail": [BOOL, [PBITMAP, PBITMAP]],
  // Filetype functions
  "FreeImage_GetFileType": [LONG, [STRING, LONG]],
  // Pixel access functions
  "FreeImage_GetBits": [PBYTE, [PBITMAP]],
  "FreeImage_GetScanLine": [PBYTE, [PBITMAP, LONG]],
  "FreeImage_GetPixelIndex": [BOOL, [PBITMAP, DWORD, DWORD, PBYTE]],
  "FreeImage_GetPixelColor": [BOOL, [PBITMAP, DWORD, DWORD, PRGBQUAD]],
  "FreeImage_SetPixelIndex": [BOOL, [PBITMAP, DWORD, DWORD, PBYTE]],
  "FreeImage_SetPixelColor": [BOOL, [PBITMAP, DWORD, DWORD, PRGBQUAD]],
  // Conversion functions
  "FreeImage_ConvertTo4Bits": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertTo8Bits": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToGreyscale": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertTo16Bits555": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertTo16Bits565": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertTo24Bits": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertTo32Bits": [PBITMAP, [PBITMAP]],
  "FreeImage_ColorQuantize": [PBITMAP, [PBITMAP, LONG]],
  "FreeImage_ColorQuantizeEx": [PBITMAP, [PBITMAP, LONG, LONG, LONG, PRGBQUAD]],
  "FreeImage_Threshold": [PBITMAP, [PBITMAP, BYTE]],
  "FreeImage_Dither": [PBITMAP, [PBITMAP, LONG]],
  "FreeImage_ConvertFromRawBits": [PBITMAP, [PBYTE, LONG, LONG, LONG, DWORD, DWORD, DWORD, DWORD, BOOL]],
  "FreeImage_ConvertToRawBits": [VOID, [PBYTE, PBITMAP, LONG, DWORD, DWORD, DWORD, DWORD, BOOL]],
  "FreeImage_ConvertToStandardType": [PBITMAP, [PBITMAP, BOOL]],
  "FreeImage_ConvertToType": [PBITMAP, [PBITMAP, LONG, BOOL]],
  "FreeImage_ConvertToFloat": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToRGBF": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToUINT16": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToRGB16": [PBITMAP, [PBITMAP]],
  // Tone mapping operators
  "FreeImage_ToneMapping": [PBITMAP, [PBITMAP, LONG, DOUBLE, DOUBLE]],
  "FreeImage_TmoDrago03": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE]],
  "FreeImage_TmoReinhard05": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE]],
  "FreeImage_TmoReinhard05Ex": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE, DOUBLE, DOUBLE]],
  "FreeImage_TmoFattal02": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE]],
  // ICC profile functions
  "FreeImage_GetICCProfile": [PICCPROFILE, [PBITMAP]],
  "FreeImage_CreateICCProfile": [PICCPROFILE, [PBITMAP, PVOID, LONG]],
  "FreeImage_DestroyICCProfile": [VOID, [PBITMAP]],
  // Multipage functions
  "FreeImage_OpenMultiBitmap": [PMULTIBITMAP, [LONG, STRING, BOOL, BOOL, BOOL, LONG]],
  "FreeImage_CloseMultiBitmap": [BOOL, [PMULTIBITMAP, LONG]],
  "FreeImage_GetPageCount": [LONG, [PMULTIBITMAP]],
  "FreeImage_AppendPage": [VOID, [PMULTIBITMAP, PBITMAP]],
  "FreeImage_InsertPage": [VOID, [PMULTIBITMAP, LONG, PBITMAP]],
  "FreeImage_DeletePage": [VOID, [PMULTIBITMAP, LONG]],
  "FreeImage_LockPage": [PBITMAP, [PMULTIBITMAP, LONG]],
  "FreeImage_UnlockPage": [VOID, [PMULTIBITMAP, PBITMAP, BOOL]],
  "FreeImage_MovePage": [BOOL, [PMULTIBITMAP, LONG, LONG]],
  "FreeImage_GetLockedPageNumbers": [BOOL, [PMULTIBITMAP, PLONG, PLONG]],
  // Compression functions
  "FreeImage_ZLibCompress": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibUncompress": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibGZip": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibGUnzip": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibCRC32": [DWORD, [DWORD, PBYTE, DWORD]],
  // Helper functions
  "FreeImage_IsLittleEndian": [BOOL, []],
  "FreeImage_LookupX11Color": [BOOL, [STRING, PBYTE, PBYTE, PBYTE]],
  "FreeImage_LookupSVGColor": [BOOL, [STRING, PBYTE, PBYTE, PBYTE]],
  // METADATA FUNCTION REFERENCE
  // Tag creation and destruction
  "FreeImage_CreateTag": [PTAG, []],
  "FreeImage_DeleteTag": [VOID, [PTAG]],
  "FreeImage_CloneTag": [PTAG, [PTAG]],
  // Tag accessors
  "FreeImage_GetTagKey": [STRING, [PTAG]],
  "FreeImage_GetTagDescription": [STRING, [PTAG]],
  "FreeImage_GetTagID": [WORD, [PTAG]],
  "FreeImage_GetTagType": [LONG, [PTAG]],
  "FreeImage_GetTagCount": [DWORD, [PTAG]],
  "FreeImage_GetTagLength": [DWORD, [PTAG]],
  "FreeImage_GetTagValue": [PVOID, [PTAG]],
  "FreeImage_SetTagKey": [BOOL, [PTAG, STRING]],
  "FreeImage_SetTagDescription": [BOOL, [PTAG, STRING]],
  "FreeImage_SetTagID": [BOOL, [PTAG, WORD]],
  "FreeImage_SetTagType": [BOOL, [PTAG, LONG]],
  "FreeImage_SetTagCount": [BOOL, [PTAG, DWORD]],
  "FreeImage_SetTagLength": [BOOL, [PTAG, DWORD]],
  "FreeImage_SetTagValue": [BOOL, [PTAG, PVOID]],
  // Metadata iterator
  "FreeImage_FindFirstMetadata": [PMETADATA, [LONG, PBITMAP, PPTAG]],
  "FreeImage_FindNextMetadata": [BOOL, [PMETADATA, PPTAG]],
  "FreeImage_FindCloseMetadata": [VOID, [PMETADATA]],
  // Metadata accessors
  "FreeImage_GetMetadata": [BOOL, [LONG, PBITMAP, STRING, PPTAG]],
  "FreeImage_SetMetadata": [BOOL, [LONG, PBITMAP, STRING, PTAG]],
  // Metadata helper functions
  "FreeImage_GetMetadataCount": [DWORD, [LONG, PBITMAP]],
  "FreeImage_CloneMetadata": [BOOL, [PBITMAP, PBITMAP]],
  "FreeImage_TagToString": [STRING, [LONG, PTAG, STRING]],
  // TOOLKIT FUNCTION REFERENCE
  // Rotation and flipping
  "FreeImage_Rotate": [PBITMAP, [PBITMAP, DOUBLE, PVOID]],
  "FreeImage_RotateEx": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE, DOUBLE, DOUBLE, DOUBLE, BOOL]],
  "FreeImage_FlipHorizontal": [BOOL, [PBITMAP]],
  "FreeImage_FlipVertical": [BOOL, [PBITMAP]],
  // Upsampling / downsampling
  "FreeImage_Rescale": [PBITMAP, [PBITMAP, LONG, LONG, LONG]],
  "FreeImage_MakeThumbnail": [PBITMAP, [PBITMAP, LONG, BOOL]],
  // Color manipulation
  "FreeImage_AdjustCurve": [BOOL, [PBITMAP, PBYTE, LONG]],
  "FreeImage_AdjustGamma": [BOOL, [PBITMAP, DOUBLE]],
  "FreeImage_AdjustBrightness": [BOOL, [PBITMAP, DOUBLE]],
  "FreeImage_AdjustContrast": [BOOL, [PBITMAP, DOUBLE]],
  "FreeImage_Invert": [BOOL, [PBITMAP]],
  "FreeImage_GetHistogram": [BOOL, [PBITMAP, PDWORD, LONG]],
  "FreeImage_GetAdjustColorsLookupTable": [LONG, [PBYTE, DOUBLE, DOUBLE, DOUBLE, BOOL]],
  "FreeImage_AdjustColors": [BOOL, [PBITMAP, DOUBLE, DOUBLE, DOUBLE, BOOL]],
  "FreeImage_ApplyColorMapping": [DWORD, [PBITMAP, PRGBQUAD, PRGBQUAD, DWORD, BOOL, BOOL]],
  "FreeImage_SwapColors": [DWORD, [PBITMAP, PRGBQUAD, PRGBQUAD, BOOL]],
  "FreeImage_ApplyPaletteIndexMapping": [DWORD, [PBITMAP, PBYTE, PBYTE, DWORD, BOOL]],
  "FreeImage_SwapPaletteIndices": [DWORD, [PBITMAP, PBYTE, PBYTE]],
  // Channel processing
  "FreeImage_GetChannel": [PBITMAP, [PBITMAP, LONG]],
  "FreeImage_SetChannel": [BOOL, [PBITMAP, PBITMAP, LONG]],
  "FreeImage_GetComplexChannel": [PBITMAP, [PBITMAP, LONG]],
  "FreeImage_SetComplexChannel": [BOOL, [PBITMAP, PBITMAP, LONG]],
  // Copy / Paste / Composite routines
  "FreeImage_Copy": [PBITMAP, [PBITMAP, LONG, LONG, LONG, LONG]],
  "FreeImage_Paste": [BOOL, [PBITMAP, PBITMAP, LONG, LONG, LONG]],
  "FreeImage_Composite": [PBITMAP, [PBITMAP, BOOL, PRGBQUAD, PBITMAP]],
  "FreeImage_PreMultiplyWithAlpha": [BOOL, [PBITMAP]],
  // JPEG lossless transformations
  "FreeImage_JPEGTransform": [BOOL, [STRING, STRING, LONG, BOOL]],
  "FreeImage_JPEGCrop": [BOOL, [STRING, STRING, LONG, LONG, LONG, LONG]],
  // Background filling
  "FreeImage_FillBackground": [BOOL, [PBITMAP, PVOID, LONG]],
  "FreeImage_EnlargeCanvas": [PBITMAP, [PBITMAP, LONG, LONG, LONG, LONG, PVOID, LONG]],
  "FreeImage_AllocateEx": [PBITMAP, [LONG, LONG, LONG, PRGBQUAD, LONG, PRGBQUAD, DWORD, DWORD, DWORD]],
  "FreeImage_AllocateExT": [PBITMAP, [LONG, LONG, LONG, LONG, PVOID, LONG, PRGBQUAD, DWORD, DWORD, DWORD]],
  // Miscellaneous algorithms
  "FreeImage_MultigridPoissonSolver": [PBITMAP, [PBITMAP, LONG]]
});
  
module.exports = {
  RGBA: {
    RED: 2,
    GREEN: 1,
    BLUE: 0,
    ALPHA: 3
  },
  RGBA_MASK: {
    RED: 0x00FF0000,
    GREEN: 0x0000FF00,
    BLUE: 0x000000FF,
    ALPHA: 0xFF000000,
    RGB: 0x00FFFFFF
  },
  RGBA_SHIFT: {
    RED: 16,
    GREEN: 8,
    BLUE: 0,
    ALPHA: 24
  },
  RGB16_555_MASK: {
    RED: 0x7C00,
    GREEN: 0x03E0,
    BLUE: 0x001F
  },
  RGB16_555_SHIFT: {
    RED: 10,
    GREEN: 5,
    BLUE: 0
  },
  RGB16_565_MASK: {
    RED: 0xF800,
    GREEN: 0x07E0,
    BLUE: 0x001F
  },
  RGB16_565_SHIFT: {
    RED: 11,
    GREEN: 5,
    BLUE: 0
  },
  ICC_DEFAULT: 0x00,
  ICC_COLOR_IS_CMYK: 0x01,
  IMAGE_FORMAT: {
    UNKNOWN: -1,
    BMP: 0,
    ICO: 1,
    JPEG: 2,
    JNG: 3,
    KOALA: 4,
    LBM: 5,
    IFF: 5,
    MNG: 6,
    PBM: 7,
    PBMRAW: 8,
    PCD: 9,
    PCX: 10,
    PGM: 11,
    PGMRAW: 12,
    PNG: 13,
    PPM: 14,
    PPMRAW: 15,
    RAS: 16,
    TARGA: 17,
    TIFF: 18,
    WBMP: 19,
    PSD: 20,
    CUT: 21,
    XBM: 22,
    XPM: 23,
    DDS: 24,
    GIF: 25,
    HDR: 26,
    FAXG3: 27,
    SGI: 28,
    EXR: 29,
    J2K: 30,
    JP2: 31,
    PFM: 32,
    PICT: 33,
    RAW: 34,
    WEBP: 35,
    JXR: 36
  },
  IMAGE_TYPE: {
    UNKNOWN: 0,
    BITMAP: 1,
    UINT16: 2,
    INT16: 3,
    UINT32: 4,
    INT32: 5,
    FLOAT: 6,
    DOUBLE: 7,
    COMPLEX: 8,
    RGB16: 9,
    RGBA16: 10,
    RGBF: 11,
    RGBAF: 12
  },
  COLOR_TYPE: {
    MINISWHITE: 0,
    MINISBLACK: 1,
    RGB: 2,
    PALETTE: 3,
    RGBALPHA: 4,
    CMYK: 5
  },
  QUANTIZATION: {
    WUQUANT: 0,
    NNQUANT: 1
  },
  DITHERING: {
    FS: 0,
    BAYER4x4: 1,
    BAYER8x8: 2,
    CLUSTER6x6: 3,
    CLUSTER8x8: 4,
    CLUSTER16x16: 5,
    BAYER16x16: 6
  },
  JPEG_OPERATION: {
    NONE: 0,
    FLIP_H: 1,
    FLIP_V: 2,
    TRANSPOSE: 3,
    TRANSVERSE: 4,
    ROTATE_90: 5,
    ROTATE_180: 6,
    ROTATE_270: 7
  },
  TONE_MAPPING_OPERATION: {
    DRAGO03: 0,
    REINHARD05: 1,
    FATTAL02: 2
  },
  FILTER: {
    BOX: 0,
    BICUBIC: 1,
    BILINEAR: 2,
    BSPLINE: 3,
    CATMULLROM: 4,
    LANCZOS3: 5
  },
  COLOR_CHANNEL: {
    RGB: 0,
    RED: 1,
    GREEN: 2,
    BLUE: 3,
    ALPHA: 4,
    BLACK: 5,
    REAL: 6,
    IMAG: 7,
    MAG: 8,
    PHASE: 9
  },
  METADATA_TYPE: {
    NOTYPE: 0,
    BYTE: 1,
    ASCII: 2,
    SHORT: 3,
    LONG: 4,
    RATIONAL: 5,
    SBYTE: 6,
    UNDEFINED: 7,
    SSHORT: 8,
    SLONG: 9,
    SRATIONAL: 10,
    FLOAT: 11,
    DOUBLE: 12,
    IFD: 13,
    PALETTE: 14,
    LONG8: 16,
    SLONG8: 17,
    IFD8: 18
  },
  METADATA_MODEL: {
    NODATA: -1,
    COMMENTS: 0,
    EXIF_MAIN: 1,
    EXIF_EXIF: 2,
    EXIF_GPS: 3,
    EXIF_MAKERNOTE: 4,
    EXIF_INTEROP: 5,
    IPTC: 6,
    XMP: 7,
    GEOTIFF: 8,
    ANIMATION: 9,
    CUSTOM: 10,
    EXIF_RAW: 11
  },
  LOAD_SAVE_OPTION: {
    LOAD_NOPIXELS: 0x8000,
    BMP: {
      DEFAULT: 0,
      BMP_SAVE_RLE: 1
    },
    CUT: {
      DEFAULT: 0
    },
    DDS: {
      DEFAULT: 0
    },
    EXR: {
      DEFAULT: 0,
      FLOAT: 0x0001,
      NONE: 0x0002,
      ZIP: 0x0004,
      PIZ: 0x0008,
      PXR24: 0x0010,
      B44: 0x0020,
      LC: 0x0040
    },
    FAXG3: {
      DEFAULT: 0
    },
    GIF: {
      DEFAULT: 0,
      LOAD256: 1,
      PLAYBACK: 2
    },
    HDR: {
      DEFAULT: 0
    },
    ICO: {
      DEFAULT: 0,
      MAKEALPHA: 1
    },
    IFF: {
      DEFAULT: 0
    },
    J2K: {
      DEFAULT: 0
    },
    JP2: {
      DEFAULT: 0
    },
    JPEG: {
      DEFAULT: 0,
      FAST: 0x0001,
      ACCURATE: 0x0002,
      CMYK: 0x0004,
      EXIFROTATE: 0x0008,
      GREYSCALE: 0x0010,
      QUALITYSUPERB: 0x80,
      QUALITYGOOD: 0x0100,
      QUALITYNORMAL: 0x0200,
      QUALITYAVERAGE: 0x0400,
      QUALITYBAD: 0x0800,
      PROGRESSIVE: 0x2000,
      SUBSAMPLING_411: 0x1000,
      SUBSAMPLING_420: 0x4000,
      SUBSAMPLING_422: 0x8000,
      SUBSAMPLING_444: 0x10000,
      OPTIMIZE: 0x20000,
      BASELINE: 0x40000
    },
    KOALA: {
      DEFAULT: 0
    },
    LBM: {
      DEFAULT: 0
    },
    MNG: {
      DEFAULT: 0
    },
    PCD: {
      DEFAULT: 0,
      BASE: 1,
      BASEDIV4: 2,
      BASEDIV16: 3
    },
    PCX: {
      DEFAULT: 0
    },
    PFM: {
      DEFAULT: 0
    },
    PICT: {
      DEFAULT: 0
    },
    PNG: {
      DEFAULT: 0,
      IGNOREGAMMA: 1,
      Z_BEST_SPEED: 0x0001,
      Z_DEFAULT_COMPRESSION: 0x0006,
      Z_BEST_COMPRESSION: 0x0009,
      Z_NO_COMPRESSION: 0x0100,
      INTERLACED: 0x0200
    },
    PNM: {
      DEFAULT: 0,
      SAVE_RAW: 0,
      SAVE_ASCII: 1
    },
    PSD: {
      DEFAULT: 0,
      CMYK: 1,
      LAB: 2
    },
    RAS: {
      DEFAULT: 0
    },
    RAW: {
      DEFAULT: 0,
      PREVIEW: 1,
      DISPLAY: 2,
      HALFSIZE: 4
    },
    SGI: {
      DEFAULT: 0
    },
    TARGA: {
      DEFAULT: 0,
      LOAD_RGB888: 1,
      SAVE_RLE: 2
    },
    TIFF: {
      DEFAULT: 0,
      CMYK: 0x0001,
      PACKBITS: 0x0100,
      DEFLATE: 0x0200,
      ADOBE_DEFLATE: 0x0400,
      NONE: 0x0800,
      CCITTFAX3: 0x1000,
      CCITTFAX4: 0x2000,
      LZW: 0x4000,
      JPEG: 0x8000,
      LOGLUV: 0x10000
    },
    WBMP: {
      DEFAULT: 0
    },
    XBM: {
      DEFAULT: 0
    },
    XPM: {
      DEFAULT: 0
    },
    WEBP: {
      DEFAULT: 0,
      LOSSLESS: 0x100
    },
    JXR: {
      DEFAULT: 0,
      LOSSLESS: 0x0064,
      PROGRESSIVE: 0x2000
    }
  },
  BACKGROUND_COLOR: {
    IS_RGB_COLOR: 0x00,
    IS_RGBA_COLOR: 0x01,
    FIND_EQUAL_COLOR: 0x02,
    ALPHA_IS_INDEX: 0x04,
    PALETTE_SEARCH_MASK: 0x06
  },
  // BITMAP FUNCTION REFERENCE
  // General functions
  getVersion: function () {
    return library.FreeImage_GetVersion();
  },
  getCopyrightMessage: function () {
    return library.FreeImage_GetCopyrightMessage();
  },
  // Bitmap management functions
  allocate: function (width, height, bpp, redMask, greenMask, blueMask) {
    redMask = setToDefaultIfUndefined(redMask, 0);
    greenMask = setToDefaultIfUndefined(greenMask, 0);
    blueMask = setToDefaultIfUndefined(blueMask, 0);
    assertInteger(width, "width");
    assertInteger(height, "height");
    assertInteger(bpp, "bpp");
    assertUnsignedInteger(redMask, "redMask");
    assertUnsignedInteger(greenMask, "greenMask");
    assertUnsignedInteger(blueMask, "blueMask");
    return library.FreeImage_Allocate(
      width, height, bpp, 
      redMask, greenMask, blueMask
    );
  },
  allocateT: function (type, width, height, bpp, redMask, greenMask, blueMask) {
    bpp = setToDefaultIfUndefined(bpp, 8);
    redMask = setToDefaultIfUndefined(redMask, 0);
    greenMask = setToDefaultIfUndefined(greenMask, 0);
    blueMask = setToDefaultIfUndefined(blueMask, 0);
    assertImageType(type, "type");
    assertInteger(width, "width");
    assertInteger(height, "height");
    assertInteger(bpp, "bpp");
    assertUnsignedInteger(redMask, "redMask");
    assertUnsignedInteger(greenMask, "greenMask");
    assertUnsignedInteger(blueMask, "blueMask");
    return library.FreeImage_AllocateT(
      type,
      width, height, bpp, 
      redMask, greenMask, blueMask
    );
  },
  save: function (format, bitmap, fileName, flags) {
    flags = setToDefaultIfUndefined(flags, 0);
    assertImageFormat(format, "format");
    assertNonNullObject(bitmap, "bitmap");
    assertNonEmptyString(fileName, "fileName");
    assertInteger(flags, "flags");
    return library.FreeImage_Save(format, bitmap, fileName, flags) === TRUE;
  },
  load: function (format, fileName, flags) {
    flags = setToDefaultIfUndefined(flags, 0);
    assertImageFormat(format, "format");
    assertNonEmptyString(fileName, "fileName");
    assertInteger(flags, "flags");
    return library.FreeImage_Load(format, fileName, flags);
  },
  clone: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_Clone(bitmap);
  },
  unload: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_Unload(bitmap);
  },
  // Bitmap information functions
  getImageType: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetImageType(bitmap);
  },
  getColorsUsed: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetColorsUsed(bitmap);
  },
  getBPP: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetBPP(bitmap);
  },
  getWidth: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetWidth(bitmap);
  },
  getHeight: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetHeight(bitmap);
  },
  getLine: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetLine(bitmap);
  },
  getPitch: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetPitch(bitmap);
  },
  getDIBSize: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetDIBSize(bitmap);
  },
  getPalette: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetPalette(bitmap);
  },
  getDotsPerMeterX: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetDotsPerMeterX(bitmap);
  },
  getDotsPerMeterY: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetDotsPerMeterY(bitmap);
  },
  setDotsPerMeterX: function (bitmap, dpmX) {
    assertNonNullObject(bitmap, "bitmap");
    assertUnsignedInteger(dpmX, "dpmX");
    library.FreeImage_SetDotsPerMeterX(bitmap, dpmX);
  },
  setDotsPerMeterY: function (bitmap, dpmY) {
    assertNonNullObject(bitmap, "bitmap");
    assertUnsignedInteger(dpmY, "dpmY");
    library.FreeImage_SetDotsPerMeterY(bitmap, dpmY);
  },
  getInfoHeader: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetInfoHeader(bitmap);
  },
  getInfo: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetInfo(bitmap);
  },
  getColorType: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetColorType(bitmap);
  },
  getRedMask: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetRedMask(bitmap);
  },
  getGreenMask: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetGreenMask(bitmap);
  },
  getBlueMask: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetBlueMask(bitmap);
  },
  getTransparencyCount: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetTransparencyCount(bitmap);
  },
  getTransparencyTable: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetTransparencyTable(bitmap);
  },
  setTransparencyTable: function (bitmap, table, count) {
    assertNonNullObject(bitmap, "bitmap");
    assertNonNullObject(table, "table");
    assertInteger(count, "count");
    library.FreeImage_SetTransparencyTable(bitmap, table, count);
  },
  setTransparent: function (bitmap, enabled) {
    assertNonNullObject(bitmap, "bitmap");
    assertBoolean(enabled, "enabled");
    library.FreeImage_SetTransparent(bitmap, enabled ? TRUE : FALSE);
  },
  isTransparent: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_IsTransparent(bitmap) === TRUE;
  },
  setTransparentIndex: function (bitmap, index) {
    assertNonNullObject(bitmap, "bitmap");
    assertInteger(index, "index");
    library.FreeImage_SetTransparentIndex(bitmap, index);
  },
  getTransparentIndex: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetTransparentIndex(bitmap);
  },
  hasBackgroundColor: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_HasBackgroundColor(bitmap) === TRUE;
  },
  getBackgroundColor: function (bitmap, color) {
    assertNonNullObject(bitmap, "bitmap");
    assertNonNullObject(color, "color");
    return library.FreeImage_GetBackgroundColor(bitmap, color) === TRUE;
  },
  setBackgroundColor: function (bitmap, color) {
    assertNonNullObject(bitmap, "bitmap");
    assertObject(color, "color");
    return library.FreeImage_SetBackgroundColor(bitmap, color) === TRUE;
  },
  hasPixels: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_HasPixels(bitmap) === TRUE;
  },
  getThumbnail: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetThumbnail(bitmap);
  },
  setThumbnail: function (bitmap, thumbnail) {
    assertNonNullObject(bitmap, "bitmap");
    assertObject(thumbnail, "thumbnail");
    return library.FreeImage_SetThumbnail(bitmap, thumbnail) === TRUE;
  },
  // Filetype functions
  getFileType: function (fileName, size) {
    size = setToDefaultIfUndefined(size, 0);
    assertNonEmptyString(fileName, "fileName");
    assertInteger(size, "size");
    return library.FreeImage_GetFileType(fileName, size);
  },
  // Pixel access functions
  getBits: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_GetBits(bitmap);
  },
  getScanLine: function (bitmap, scanLine) {
    assertNonNullObject(bitmap, "bitmap");
    assertInteger(scanLine, "scanLine");
    return library.FreeImage_GetScanLine(bitmap, scanLine);
  },
  getPixelIndex: function (bitmap, x, y, value) {
    assertNonNullObject(bitmap, "bitmap");
    assertUnsignedInteger(x, "x");
    assertUnsignedInteger(y, "y");
    assertNonNullObject(value, "value");
    return library.FreeImage_GetPixelIndex(bitmap, x, y, value) === TRUE;
  },
  getPixelColor: function (bitmap, x, y, value) {
    assertNonNullObject(bitmap, "bitmap");
    assertUnsignedInteger(x, "x");
    assertUnsignedInteger(y, "y");
    assertNonNullObject(value, "value");
    return library.FreeImage_GetPixelColor(bitmap, x, y, value) === TRUE;
  },
  setPixelIndex: function (bitmap, x, y, value) {
    assertNonNullObject(bitmap, "bitmap");
    assertUnsignedInteger(x, "x");
    assertUnsignedInteger(y, "y");
    assertNonNullObject(value, "value");
    return library.FreeImage_SetPixelIndex(bitmap, x, y, value) === TRUE;
  },
  setPixelColor: function (bitmap, x, y, value) {
    assertNonNullObject(bitmap, "bitmap");
    assertUnsignedInteger(x, "x");
    assertUnsignedInteger(y, "y");
    assertNonNullObject(value, "value");
    return library.FreeImage_SetPixelColor(bitmap, x, y, value) === TRUE;
  },
  // Conversion functions
  convertTo4Bits: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertTo4Bits(bitmap);
  },
  convertTo8Bits: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertTo8Bits(bitmap);
  },
  convertToGreyscale: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertToGreyscale(bitmap);
  },
  convertTo16Bits555: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertTo16Bits555(bitmap);
  },
  convertTo16Bits565: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertTo16Bits565(bitmap);
  },
  convertTo24Bits: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertTo24Bits(bitmap);
  },
  convertTo32Bits: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertTo32Bits(bitmap);
  },
  colorQuantize: function (bitmap, quantize) {
    assertNonNullObject(bitmap, "bitmap");
    assertQuantization(quantize, "quantize");
    return library.FreeImage_ColorQuantize(bitmap, quantize);
  },
  colorQuantizeEx: function (bitmap, quantize, paletteSize, reserveSize, reservePalette) {
    quantize = setToDefaultIfUndefined(quantize, this.QUANTIZATION.WUQUANT);
    paletteSize = setToDefaultIfUndefined(paletteSize, 256);
    reserveSize = setToDefaultIfUndefined(reserveSize, 0);
    reservePalette = setToDefaultIfUndefined(reservePalette, ref.NULL);
    assertNonNullObject(bitmap, "bitmap");
    assertQuantization(quantize, "quantize");
    assertInteger(paletteSize, "paletteSize");
    assertInteger(reserveSize, "reserveSize");
    assertObject(reservePalette, "reservePalette");
    return library.FreeImage_ColorQuantizeEx(bitmap, quantize, paletteSize, reserveSize, reservePalette);
  },
  threshold: function (bitmap, t) {
    assertNonNullObject(bitmap, "bitmap");
    assertByte(t, "t");
    return library.FreeImage_Threshold(bitmap, t);
  },
  dither: function (bitmap, algorithm) {
    assertNonNullObject(bitmap, "bitmap");
    assertDithering(algorithm, "algorithm");
    return library.FreeImage_Dither(bitmap, algorithm);
  },
  convertFromRawBits: function (bits, width, height, pitch, bpp, redMask, greenMask, blueMask, topDown) {
    topDown = setToDefaultIfUndefined(topDown, false);
    assertNonNullObject(bits, "bits");
    assertInteger(width, "width");
    assertInteger(height, "height");
    assertInteger(pitch, "pitch");
    assertUnsignedInteger(bpp, "bpp");
    assertUnsignedInteger(redMask, "redMask");
    assertUnsignedInteger(greenMask, "greenMask");
    assertUnsignedInteger(blueMask, "blueMask");
    assertBoolean(topDown, "topDown");
    return library.FreeImage_ConvertFromRawBits(bits, width, height, pitch, bpp, redMask, greenMask, blueMask, topDown ? TRUE : FALSE);
  },
  convertToRawBits: function (bits, bitmap, pitch, bpp, redMask, greenMask, blueMask, topDown) {
    topDown = setToDefaultIfUndefined(topDown, false);
    assertNonNullObject(bits, "bits");
    assertNonNullObject(bitmap, "bitmap");
    assertInteger(pitch, "pitch");
    assertUnsignedInteger(bpp, "bpp");
    assertUnsignedInteger(redMask, "redMask");
    assertUnsignedInteger(greenMask, "greenMask");
    assertUnsignedInteger(blueMask, "blueMask");
    assertBoolean(topDown, "topDown");
    library.FreeImage_ConvertToRawBits(bits, bitmap, pitch, bpp, redMask, greenMask, blueMask, topDown);
  },
  convertToStandardType: function (bitmap, scaleLinear) {
    scaleLinear = setToDefaultIfUndefined(scaleLinear, true);
    assertNonNullObject(bitmap, "bitmap");
    assertBoolean(scaleLinear, "scaleLinear");
    return library.FreeImage_ConvertToStandardType(bitmap, scaleLinear);
  },
  convertToType: function (bitmap, type, scaleLinear) {
    scaleLinear = setToDefaultIfUndefined(scaleLinear, true);
    assertNonNullObject(bitmap, "bitmap");
    assertImageType(type, "type");
    assertBoolean(scaleLinear, "scaleLinear");
    return library.FreeImage_ConvertToType(bitmap, type, scaleLinear);
  },
  convertToFloat: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertToFloat(bitmap);
  },
  convertToRGBF: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertToRGBF(bitmap);
  },
  convertToUINT16: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertToUINT16(bitmap);
  },
  convertToRGB16: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_ConvertToRGB16(bitmap);
  },
  // Tone mapping operators
  toneMapping: function (bitmap, tmo, firstParam, secondParam) {
    firstParam = setToDefaultIfUndefined(firstParam, 0);
    secondParam = setToDefaultIfUndefined(secondParam, 0);
    assertNonNullObject(bitmap, "bitmap");
    assertToneMappingOperation(tmo, "tmo");
    assertDouble(firstParam, "firstParam");
    assertDouble(secondParam, "secondParam");
    return library.FreeImage_ToneMapping(bitmap, tmo, firstParam, secondParam);
  },
  tmoDrago03: function (bitmap, gamma, exposure) {
    gamma = setToDefaultIfUndefined(gamma, 2.2);
    exposure = setToDefaultIfUndefined(exposure, 0);
    assertNonNullObject(bitmap, "bitmap");
    assertDouble(gamma, "gamma");
    assertDouble(exposure, "exposure");
    return library.FreeImage_TmoDrago03(bitmap, gamma, exposure);
  },
  tmoReinhard05: function (bitmap, intensity, contrast) {
    intensity = setToDefaultIfUndefined(intensity, 0);
    contrast = setToDefaultIfUndefined(contrast, 0);
    assertNonNullObject(bitmap, "bitmap");
    assertDouble(intensity, "intensity");
    assertDouble(contrast, "contrast");
    return library.FreeImage_TmoReinhard05(bitmap, intensity, contrast);
  },
  tmoReinhard05Ex: function (bitmap, intensity, contrast, adaptation, colorCorrection) {
    intensity = setToDefaultIfUndefined(intensity, 0);
    contrast = setToDefaultIfUndefined(contrast, 0);
    adaptation = setToDefaultIfUndefined(adaptation, 1);
    colorCorrection = setToDefaultIfUndefined(colorCorrection, 0);
    assertNonNullObject(bitmap, "bitmap");
    assertDouble(intensity, "intensity");
    assertDouble(contrast, "contrast");
    assertDouble(adaptation, "adaptation");
    assertDouble(colorCorrection, "colorCorrection");
    return library.FreeImage_TmoReinhard05Ex(bitmap, intensity, contrast, adaptation, colorCorrection);
  },
  tmoFattal02: function (bitmap, colorSaturation, attenuation) {
    colorSaturation = setToDefaultIfUndefined(colorSaturation, 0.5);
    attenuation = setToDefaultIfUndefined(attenuation, 0.85);
    assertNonNullObject(bitmap, "bitmap");
    assertDouble(colorSaturation, "colorSaturation");
    assertDouble(attenuation, "attenuation");
    return library.FreeImage_TmoFattal02(bitmap, colorSaturation, attenuation);
  },
  // ICC profile functions
  // FIICCPROFILE *FreeImage_GetICCProfile(FIBITMAP *bitmap);
  getICCProfile: function (bitmap) {
    return library.FreeImage_GetICCProfile(bitmap);
  },
  // FIICCPROFILE *FreeImage_CreateICCProfile(FIBITMAP *bitmap, void *data, long size);
  createICCProfile: function (bitmap, data, size) {
    return library.FreeImage_CreateICCProfile(bitmap, data, size);
  },
  // void FreeImage_DestroyICCProfile(FIBITMAP *bitmap);
  destroyICCProfile: function (bitmap) {
    return library.FreeImage_DestroyICCProfile(bitmap);
  },
  // Multipage functions
  // FIMULTIBITMAP * FreeImage_OpenMultiBitmap(FREE_IMAGE_FORMAT fif, const char *filename, BOOL create_new, BOOL read_only, BOOL keep_cache_in_memory FI_DEFAULT(FALSE), int flags FI_DEFAULT(0));
  openMultiBitmap: function (fif, filename, create_new, read_only, keep_cache_in_memory, flags) {
    return library.FreeImage_OpenMultiBitmap(fif, filename, create_new, read_only, keep_cache_in_memory, flags);
  },
  // BOOL FreeImage_CloseMultiBitmap(FIMULTIBITMAP *bitmap, int flags FI_DEFAULT(0));
  closeMultiBitmap: function (bitmap, flags) {
    return library.FreeImage_CloseMultiBitmap(bitmap, flags);
  },
  // int FreeImage_GetPageCount(FIMULTIBITMAP *bitmap);
  getPageCount: function (bitmap) {
    return library.FreeImage_GetPageCount(bitmap);
  },
  // void FreeImage_AppendPage(FIMULTIBITMAP *bitmap, FIBITMAP *data);
  appendPage: function (bitmap, data) {
    return library.FreeImage_AppendPage(bitmap, data);
  },
  // void FreeImage_InsertPage(FIMULTIBITMAP *bitmap, int page, FIBITMAP *data);
  insertPage: function (bitmap, page, data) {
    return library.FreeImage_InsertPage(bitmap, page, data);
  },
  // void FreeImage_DeletePage(FIMULTIBITMAP *bitmap, int page);
  deletePage: function (bitmap, page) {
    return library.FreeImage_DeletePage(bitmap, page);
  },
  // FIBITMAP * FreeImage_LockPage(FIMULTIBITMAP *bitmap, int page);
  lockPage: function (bitmap, page) {
    return library.FreeImage_LockPage(bitmap, page);
  },
  // void FreeImage_UnlockPage(FIMULTIBITMAP *bitmap, FIBITMAP *data, BOOL changed);
  unlockPage: function (bitmap, data, changed) {
    return library.FreeImage_UnlockPage(bitmap, data, changed);
  },
  // BOOL FreeImage_MovePage(FIMULTIBITMAP *bitmap, int target, int source);
  movePage: function (bitmap, target, source) {
    return library.FreeImage_MovePage(bitmap, target, source);
  },
  // BOOL FreeImage_GetLockedPageNumbers(FIMULTIBITMAP *bitmap, int *pages, int *count);
  getLockedPageNumbers: function (bitmap, pages, count) {
    return library.FreeImage_GetLockedPageNumbers(bitmap, pages, count);
  },
  // Compression functions
  // DWORD FreeImage_ZLibCompress(BYTE *target, DWORD target_size, BYTE *source, DWORD source_size);
  zLibCompress: function (target, target_size, source, source_size) {
    return library.FreeImage_ZLibCompress(target, target_size, source, source_size);
  },
  // DWORD FreeImage_ZLibUncompress(BYTE *target, DWORD target_size, BYTE *source, DWORD source_size);
  zLibUncompress: function (target, target_size, source, source_size) {
    return library.FreeImage_ZLibUncompress(target, target_size, source, source_size);
  },
  // DWORD FreeImage_ZLibGZip(BYTE *target, DWORD target_size, BYTE *source, DWORD source_size);
  zLibGZip: function (target, target_size, source, source_size) {
    return library.FreeImage_ZLibGZip(target, target_size, source, source_size);
  },
  // DWORD FreeImage_ZLibGUnzip(BYTE *target, DWORD target_size, BYTE *source, DWORD source_size);
  zLibGUnzip: function (target, target_size, source, source_size) {
    return library.FreeImage_ZLibGUnzip(target, target_size, source, source_size);
  },
  // DWORD FreeImage_ZLibCRC32(DWORD crc, BYTE *source, DWORD source_size);
  zLibCRC32: function (crc, source, source_size) {
    return library.FreeImage_ZLibCRC32(crc, source, source_size);
  },
  // Helper functions  
  // BOOL FreeImage_IsLittleEndian(void);
  isLittleEndian: function () {
    return library.FreeImage_IsLittleEndian();
  },
  // BOOL FreeImage_LookupX11Color(const char *szColor, BYTE *nRed, BYTE *nGreen, BYTE *nBlue);
  lookupX11Color: function (szColor, nRed, nGreen, nBlue) {
    return library.FreeImage_LookupX11Color(szColor, nRed, nGreen, nBlue);
  },
  // BOOL FreeImage_LookupSVGColor(const char *szColor, BYTE *nRed, BYTE *nGreen, BYTE *nBlue);
  lookupSVGColor: function (szColor, nRed, nGreen, nBlue) {
    return library.FreeImage_LookupSVGColor(szColor, nRed, nGreen, nBlue);
  },
  // METADATA FUNCTION REFERENCE
  // Tag creation and destruction
  // FITAG *FreeImage_CreateTag(void);
  createTag: function () {
    return library.FreeImage_CreateTag();
  },
  // void FreeImage_DeleteTag(FITAG *tag);
  deleteTag: function (tag) {
    return library.FreeImage_DeleteTag(tag);
  },
  // FITAG *FreeImage_CloneTag(FITAG *tag);
  cloneTag: function (tag) {
    return library.FreeImage_CloneTag(tag);
  },
  // Tag accessors
  // const char *FreeImage_GetTagKey(FITAG *tag);
  getTagKey: function (tag) {
    return library.FreeImage_GetTagKey(tag);
  },
  // const char *FreeImage_GetTagDescription(FITAG *tag);
  getTagDescription: function (tag) {
    return library.FreeImage_GetTagDescription(tag);
  },
  // WORD FreeImage_GetTagID(FITAG *tag);
  getTagID: function (tag) {
    return library.FreeImage_GetTagID(tag);
  },
  // FREE_IMAGE_MDTYPE FreeImage_GetTagType(FITAG *tag);
  getTagType: function (tag) {
    return library.FreeImage_GetTagType(tag);
  },
  // DWORD FreeImage_GetTagCount(FITAG *tag);
  getTagCount: function (tag) {
    return library.FreeImage_GetTagCount(tag);
  },
  // DWORD FreeImage_GetTagLength(FITAG *tag);
  getTagLength: function (tag) {
    return library.FreeImage_GetTagLength(tag);
  },
  // const void *FreeImage_GetTagValue(FITAG *tag);
  getTagValue: function (tag) {
    return library.FreeImage_GetTagValue(tag);
  },
  // BOOL FreeImage_SetTagKey(FITAG *tag, const char *key);
  setTagKey: function (tag, key) {
    return library.FreeImage_SetTagKey(tag, key);
  },
  // BOOL FreeImage_SetTagDescription(FITAG *tag, const char *description);
  setTagDescription: function (tag, description) {
    return library.FreeImage_SetTagDescription(tag, description);
  },
  // BOOL FreeImage_SetTagID(FITAG *tag, WORD id);
  setTagID: function (tag, id) {
    return library.FreeImage_SetTagID(tag, id);
  },
  // BOOL FreeImage_SetTagType(FITAG *tag, FREE_IMAGE_MDTYPE type);
  setTagType: function (tag, type) {
    return library.FreeImage_SetTagType(tag, type);
  },
  // BOOL FreeImage_SetTagCount(FITAG *tag, DWORD count);
  setTagCount: function (tag, count) {
    return library.FreeImage_SetTagCount(tag, count);
  },
  // BOOL FreeImage_SetTagLength(FITAG *tag, DWORD length);
  setTagLength: function (tag, length) {
    return library.FreeImage_SetTagLength(tag, length);
  },
  // BOOL FreeImage_SetTagValue(FITAG *tag, const void *value);
  setTagValue: function (tag, value) {
    return library.FreeImage_SetTagValue(tag, value);
  },
  // Metadata iterator
  // FIMETADATA *FreeImage_FindFirstMetadata(FREE_IMAGE_MDMODEL model, FIBITMAP *bitmap, FITAG **tag);
  findFirstMetadata: function (model, bitmap, tag) {
    return library.FreeImage_FindFirstMetadata(model, bitmap, tag);
  },
  // BOOL FreeImage_FindNextMetadata(FIMETADATA *mdhandle, FITAG **tag);
  findNextMetadata: function (mdhandle, tag) {
    return library.FreeImage_FindNextMetadata(mdhandle, tag);
  },
  // void FreeImage_FindCloseMetadata(FIMETADATA *mdhandle);
  findCloseMetadata: function (mdhandle) {
    return library.FreeImage_FindCloseMetadata(mdhandle);
  },
  // Metadata accessors
  // BOOL FreeImage_GetMetadata(FREE_IMAGE_MDMODEL model, FIBITMAP *bitmap, const char *key, FITAG **tag);
  getMetadata: function (model, bitmap, key, tag) {
    return library.FreeImage_GetMetadata(model, bitmap, key, tag);
  },
  // BOOL FreeImage_SetMetadata(FREE_IMAGE_MDMODEL model, FIBITMAP *bitmap, const char *key, FITAG *tag);
  setMetadata: function (model, bitmap, key, tag) {
    return library.FreeImage_SetMetadata(model, bitmap, key, tag);
  },
  // Metadata helper functions
  // unsigned FreeImage_GetMetadataCount(FREE_IMAGE_MDMODEL model, FIBITMAP *bitmap);
  getMetadataCount: function (model, bitmap) {
    return library.FreeImage_GetMetadataCount(model, bitmap);
  },
  // BOOL FreeImage_CloneMetadata(FIBITMAP *dst, FIBITMAP *src);
  cloneMetadata: function (dst, src) {
    return library.FreeImage_CloneMetadata(dst, src);
  },
  // const char *FreeImage_TagToString(FREE_IMAGE_MDMODEL model, FITAG *tag, char *Make FI_DEFAULT(NULL));
  tagToString: function (model, tag, Make) {
    return library.FreeImage_TagToString(model, tag, Make);
  },
  // TOOLKIT FUNCTION REFERENCE
  // Rotation and flipping
  // FIBITMAP *FreeImage_Rotate(FIBITMAP *bitmap, double angle, const void *bkcolor FI_DEFAULT(NULL));
  rotate: function (bitmap, angle, bkcolor) {
    return library.FreeImage_Rotate(bitmap, angle, bkcolor);
  },
  // FIBITMAP *FreeImage_RotateEx(FIBITMAP *bitmap, double angle, double x_shift, double y_shift, double x_origin, double y_origin, BOOL use_mask);
  rotateEx: function (bitmap, angle, x_shift, y_shift, x_origin, y_origin, use_mask) {
    return library.FreeImage_RotateEx(bitmap, angle, x_shift, y_shift, x_origin, y_origin, use_mask);
  },
  // BOOL FreeImage_FlipHorizontal(FIBITMAP *bitmap);
  flipHorizontal: function (bitmap) {
    return library.FreeImage_FlipHorizontal(bitmap);
  },
  // BOOL FreeImage_FlipVertical(FIBITMAP *bitmap);
  flipVertical: function (bitmap) {
    return library.FreeImage_FlipVertical(bitmap);
  },
  // Upsampling / downsampling
  // FIBITMAP *FreeImage_Rescale(FIBITMAP *bitmap, int dst_width, int dst_height, FREE_IMAGE_FILTER filter FI_DEFAULT(FILTER_CATMULLROM));
  rescale: function (bitmap, dst_width, dst_height, filter) {
    return library.FreeImage_Rescale(bitmap, dst_width, dst_height, filter);
  },
  // FIBITMAP *FreeImage_MakeThumbnail(FIBITMAP *bitmap, int max_pixel_size, BOOL convert FI_DEFAULT(TRUE));
  makeThumbnail: function (bitmap, max_pixel_size, convert) {
    return library.FreeImage_MakeThumbnail(bitmap, max_pixel_size, convert);
  },
  // Color manipulation
  // BOOL FreeImage_AdjustCurve(FIBITMAP *bitmap, BYTE *LUT, FREE_IMAGE_COLOR_CHANNEL channel);
  adjustCurve: function (bitmap, LUT, channel) {
    return library.FreeImage_AdjustCurve(bitmap, LUT, channel);
  },
  // BOOL FreeImage_AdjustGamma(FIBITMAP *bitmap, double gamma);
  adjustGamma: function (bitmap, gamma) {
    return library.FreeImage_AdjustGamma(bitmap, gamma);
  },
  // BOOL FreeImage_AdjustBrightness(FIBITMAP *bitmap, double percentage);
  adjustBrightness: function (bitmap, percentage) {
    return library.FreeImage_AdjustBrightness(bitmap, percentage);
  },
  // BOOL FreeImage_AdjustContrast(FIBITMAP *bitmap, double percentage);
  adjustContrast: function (bitmap, percentage) {
    return library.FreeImage_AdjustContrast(bitmap, percentage);
  },
  // BOOL FreeImage_Invert(FIBITMAP *bitmap);
  invert: function (bitmap) {
    return library.FreeImage_Invert(bitmap);
  },
  // BOOL FreeImage_GetHistogram(FIBITMAP *bitmap, DWORD *histo, FREE_IMAGE_COLOR_CHANNEL channel FI_DEFAULT(FICC_BLACK));
  getHistogram: function (bitmap, histo, channel) {
    return library.FreeImage_GetHistogram(bitmap, histo, channel);
  },
  // int FreeImage_GetAdjustColorsLookupTable(BYTE *LUT, double brightness, double contrast, double gamma, BOOL invert);
  getAdjustColorsLookupTable: function (LUT, brightness, contrast, gamma, invert) {
    return library.FreeImage_GetAdjustColorsLookupTable(LUT, brightness, contrast, gamma, invert);
  },
  // BOOL FreeImage_AdjustColors(FIBITMAP *bitmap, double brightness, double contrast, double gamma, BOOL invert FI_DEFAULT(FALSE));
  adjustColors: function (bitmap, brightness, contrast, gamma, invert) {
    return library.FreeImage_AdjustColors(bitmap, brightness, contrast, gamma, invert);
  },
  // unsigned FreeImage_ApplyColorMapping(FIBITMAP *bitmap, RGBQUAD *srccolors, RGBQUAD *dstcolors, unsigned count, BOOL ignore_alpha, BOOL swap);
  applyColorMapping: function (bitmap, srccolors, dstcolors, count, ignore_alpha, swap) {
    return library.FreeImage_ApplyColorMapping(bitmap, srccolors, dstcolors, count, ignore_alpha, swap);
  },
  // unsigned FreeImage_SwapColors(FIBITMAP *bitmap, RGBQUAD *color_a, RGBQUAD *color_b, BOOL ignore_alpha);
  swapColors: function (bitmap, color_a, color_b, ignore_alpha) {
    return library.FreeImage_SwapColors(bitmap, color_a, color_b, ignore_alpha);
  },
  // unsigned FreeImage_ApplyPaletteIndexMapping(FIBITMAP *bitmap, BYTE *srcindices,  BYTE *dstindices, unsigned count, BOOL swap);
  applyPaletteIndexMapping: function (bitmap, srcindices, dstindices, count, swap) {
    return library.FreeImage_ApplyPaletteIndexMapping(bitmap, srcindices, dstindices, count, swap);
  },
  // unsigned FreeImage_SwapPaletteIndices(FIBITMAP *bitmap, BYTE *index_a, BYTE *index_b);
  swapPaletteIndices: function (bitmap, index_a, index_b) {
    return library.FreeImage_SwapPaletteIndices(bitmap, index_a, index_b);
  },
  // Channel processing
  // FIBITMAP *FreeImage_GetChannel(FIBITMAP *bitmap, FREE_IMAGE_COLOR_CHANNEL channel);
  getChannel: function (bitmap, channel) {
    return library.FreeImage_GetChannel(bitmap, channel);
  },
  // BOOL FreeImage_SetChannel(FIBITMAP *dst, FIBITMAP *src, FREE_IMAGE_COLOR_CHANNEL channel);
  setChannel: function (dst, src, channel) {
    return library.FreeImage_SetChannel(dst, src, channel);
  },
  // FIBITMAP *FreeImage_GetComplexChannel(FIBITMAP *src, FREE_IMAGE_COLOR_CHANNEL channel);
  getComplexChannel: function (src, channel) {
    return library.FreeImage_GetComplexChannel(src, channel);
  },
  // BOOL FreeImage_SetComplexChannel(FIBITMAP *dst, FIBITMAP *src, FREE_IMAGE_COLOR_CHANNEL channel);
  setComplexChannel: function (dst, src, channel) {
    return library.FreeImage_SetComplexChannel(dst, src, channel);
  },
  // Copy / Paste / Composite routines
  // FIBITMAP *FreeImage_Copy(FIBITMAP *bitmap, int left, int top, int right, int bottom);
  copy: function (bitmap, left, top, right, bottom) {
    return library.FreeImage_Copy(bitmap, left, top, right, bottom);
  },
  // BOOL FreeImage_Paste(FIBITMAP *dst, FIBITMAP *src, int left, int top, int alpha);
  paste: function (dst, src, left, top, alpha) {
    return library.FreeImage_Paste(dst, src, left, top, alpha);
  },
  // FIBITMAP *FreeImage_Composite(FIBITMAP *fg, BOOL useFileBkg FI_DEFAULT(FALSE), RGBQUAD *appBkColor FI_DEFAULT(NULL), FIBITMAP *bg FI_DEFAULT(NULL));
  composite: function (fg, useFileBkg, appBkColor, bg) {
    return library.FreeImage_Composite(fg, useFileBkg, appBkColor, bg);
  },
  // BOOL FreeImage_PreMultiplyWithAlpha(FIBITMAP *bitmap);
  preMultiplyWithAlpha: function (bitmap) {
    return library.FreeImage_PreMultiplyWithAlpha(bitmap);
  },
  // JPEG lossless transformations
  // BOOL FreeImage_JPEGTransform(const char *src_file, const char *dst_file, FREE_IMAGE_OPERATION operation, BOOL perfect FI_DEFAULT(TRUE));
  jpegTransform: function (src_file, dst_file, operation, perfect) {
    return library.FreeImage_JPEGTransform(src_file, dst_file, operation, perfect);
  },
  // BOOL FreeImage_JPEGCrop(const char *src_file, const char *dst_file, int left, int top, int right, int bottom);
  jpegCrop: function (src_file, dst_file, left, top, right, bottom) {
    return library.FreeImage_JPEGCrop(src_file, dst_file, left, top, right, bottom);
  },
  // BOOL FreeImage_JPEGTransformCombined(const char *src_file, const char *dst_file, FREE_IMAGE_OPERATION operation, int* left, int* top, int* right, int* bottom, BOOL perfect FI_DEFAULT(TRUE));
  jpegTransformCombined: function (src_file, dst_file, operation, left, top, right, bottom, perfect) {
    return library.FreeImage_JPEGTransformCombined(src_file, dst_file, operation, left, top, right, bottom, perfect);
  },
  // Background filling
  // BOOL FreeImage_FillBackground(FIBITMAP *bitmap, const void *color, int options FI_DEFAULT(0));
  fillBackground: function (bitmap, color, options) {
    return library.FreeImage_FillBackground(bitmap, color, options);
  },
  // FIBITMAP *FreeImage_EnlargeCanvas(FIBITMAP *src, int left, int top, int right, int bottom, const void *color, int options FI_DEFAULT(0));
  enlargeCanvas: function (src, left, top, right, bottom, color, options) {
    return library.FreeImage_EnlargeCanvas(src, left, top, right, bottom, color, options);
  },
  // FIBITMAP *FreeImage_AllocateEx(int width, int height, int bpp, const RGBQUAD *color, int options FI_DEFAULT(0), const RGBQUAD *palette FI_DEFAULT(NULL), unsigned red_mask FI_DEFAULT(0), unsigned green_mask FI_DEFAULT(0), unsigned blue_mask FI_DEFAULT(0));
  allocateEx: function (width, height, bpp, color, options, palette, red_mask, green_mask, blue_mask) {
    return library.FreeImage_AllocateEx(width, height, bpp, color, options, palette, red_mask, green_mask, blue_mask);
  },
  // FIBITMAP *FreeImage_AllocateExT(FREE_IMAGE_TYPE type, int width, int height, int bpp, const void *color, int options FI_DEFAULT(0), const RGBQUAD *palette FI_DEFAULT(NULL), unsigned red_mask FI_DEFAULT(0), unsigned green_mask FI_DEFAULT(0), unsigned blue_mask FI_DEFAULT(0));
  allocateExT: function (type, width, height, bpp, color, options, palette, red_mask, green_mask, blue_mask) {
    return library.FreeImage_AllocateExT(type, width, height, bpp, color, options, palette, red_mask, green_mask, blue_mask);
  },
  // Miscellaneous algorithms
  // FIBITMAP *FreeImage_MultigridPoissonSolver(FIBITMAP *Laplacian, int ncycle FI_DEFAULT(3));
  multigridPoissonSolver: function (Laplacian, ncycle) {
    return library.FreeImage_MultigridPoissonSolver(Laplacian, ncycle);
  }
}

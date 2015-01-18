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
    WSTRING = "string",
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
      bmiColors: RefArray(RGBQUAD, 1)
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

function assertNonEmptyString(arg, argName) {
  if (typeof arg !== "string" || arg.length === 0) {
    throw new Error(
      "Argument \"" + argName + "\" " + 
      "must be a non-empty string (" + arg + ")."
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

libraryName = os.platform().indexOf("win") >= 0 ? "FreeImage" : "libfreeimage";
library = new ffi.Library(libraryName, {
  // General functions
  "FreeImage_GetVersion": [STRING, []],
  "FreeImage_GetCopyrightMessage": [STRING, []],
  // Bitmap management functions
  "FreeImage_Allocate": [PBITMAP, [LONG, LONG, LONG, DWORD, DWORD, DWORD]],
  "FreeImage_AllocateT": [PBITMAP, [LONG, LONG, LONG, LONG, DWORD, DWORD, DWORD]],
  "FreeImage_Save": [BOOL, [LONG, PBITMAP, STRING, LONG]],
  "FreeImage_Load": [PBITMAP, [LONG, STRING, LONG]],
  "FreeImage_Unload": [VOID, [PBITMAP]],
  
  
  "FreeImage_Clone": [PBITMAP, [PBITMAP]],
  "FreeImage_HasPixels": [BOOL, [PBITMAP]],
  "FreeImage_LoadU": [PBITMAP, [LONG, WSTRING, LONG]],
  "FreeImage_SaveU": [BOOL, [LONG, PBITMAP, WSTRING, LONG]],
  "FreeImage_OpenMemory": [PMEMORY, [PBYTE, DWORD]],
  "FreeImage_CloseMemory": [VOID, [PMEMORY]],
  "FreeImage_LoadFromMemory": [PBITMAP, [LONG, PMEMORY, LONG]],
  "FreeImage_SaveToMemory": [BOOL, [LONG, PBITMAP, PMEMORY, LONG]],
  "FreeImage_TellMemory": [LONG, [PMEMORY]],
  "FreeImage_SeekMemory": [BOOL, [PMEMORY, LONG, LONG]],
  "FreeImage_AcquireMemory": [BOOL, [PMEMORY, PPBYTE, PDWORD]],
  "FreeImage_ReadMemory": [DWORD, [PVOID, DWORD, DWORD, PMEMORY]],
  "FreeImage_WriteMemory": [DWORD, [PVOID, DWORD, DWORD, PMEMORY]],
  "FreeImage_LoadMultiBitmapFromMemory": [PMULTIBITMAP, [LONG, PMEMORY, LONG]],
  "FreeImage_SaveMultiBitmapToMemory": [BOOL, [LONG, PMULTIBITMAP, PMEMORY, LONG]],
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
  "FreeImage_GetFileType": [LONG, [STRING, LONG]],
  "FreeImage_GetFileTypeU": [LONG, [WSTRING, LONG]],
  "FreeImage_GetFileTypeFromMemory": [LONG, [PMEMORY, LONG]],
  "FreeImage_GetImageType": [LONG, [PBITMAP]],
  "FreeImage_IsLittleEndian": [BOOL, []],
  "FreeImage_LookupX11Color": [BOOL, [STRING, PBYTE, PBYTE, PBYTE]],
  "FreeImage_LookupSVGColor": [BOOL, [STRING, PBYTE, PBYTE, PBYTE]],
  "FreeImage_GetBits": [PBYTE, [PBITMAP]],
  "FreeImage_GetScanLine": [PBYTE, [PBITMAP, LONG]],
  "FreeImage_GetPixelIndex": [BOOL, [PBITMAP, DWORD, DWORD, PBYTE]],
  "FreeImage_GetPixelColor": [BOOL, [PBITMAP, DWORD, DWORD, PRGBQUAD]],
  "FreeImage_SetPixelIndex": [BOOL, [PBITMAP, DWORD, DWORD, PBYTE]],
  "FreeImage_SetPixelColor": [BOOL, [PBITMAP, DWORD, DWORD, PRGBQUAD]],
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
  "FreeImage_SetTransparent": [VOID, [PBITMAP, BOOL]],
  "FreeImage_SetTransparencyTable": [VOID, [PBITMAP, PBYTE, LONG]],
  "FreeImage_IsTransparent": [BOOL, [PBITMAP]],
  "FreeImage_SetTransparentIndex": [VOID, [PBITMAP, LONG]],
  "FreeImage_GetTransparentIndex": [LONG, [PBITMAP]],
  "FreeImage_HasBackgroundColor": [BOOL, [PBITMAP]],
  "FreeImage_GetBackgroundColor": [BOOL, [PBITMAP, PRGBQUAD]],
  "FreeImage_SetBackgroundColor": [BOOL, [PBITMAP, PRGBQUAD]],
  "FreeImage_GetThumbnail": [PBITMAP, [PBITMAP]],
  "FreeImage_SetThumbnail": [BOOL, [PBITMAP, PBITMAP]],
  "FreeImage_GetICCProfile": [PICCPROFILE, [PBITMAP]],
  "FreeImage_CreateICCProfile": [PICCPROFILE, [PBITMAP, PVOID, LONG]],
  "FreeImage_DestroyICCProfile": [VOID, [PBITMAP]],
  "FreeImage_ConvertLine1To4": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine8To4": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine16To4_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine16To4_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine24To4": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine32To4": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine1To8": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine4To8": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine16To8_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine16To8_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine24To8": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine32To8": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine1To16_555": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine4To16_555": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine8To16_555": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine16_565_To16_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine24To16_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine32To16_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine1To16_565": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine4To16_565": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine8To16_565": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine16_555_To16_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine24To16_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine32To16_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine1To24": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine4To24": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine8To24": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine16To24_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine16To24_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine32To24": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine1To32": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine4To32": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine8To32": [VOID, [PBYTE, PBYTE, LONG, PRGBQUAD]],
  "FreeImage_ConvertLine16To32_555": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine16To32_565": [VOID, [PBYTE, PBYTE, LONG]],
  "FreeImage_ConvertLine24To32": [VOID, [PBYTE, PBYTE, LONG]],
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
  "FreeImage_ConvertToFloat": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToRGBF": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToUINT16": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToRGB16": [PBITMAP, [PBITMAP]],
  "FreeImage_ConvertToStandardType": [PBITMAP, [PBITMAP, BOOL]],
  "FreeImage_ConvertToType": [PBITMAP, [PBITMAP, LONG, BOOL]],
  "FreeImage_ToneMapping": [PBITMAP, [PBITMAP, LONG, DOUBLE, DOUBLE]],
  "FreeImage_TmoDrago03": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE]],
  "FreeImage_TmoReinhard05": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE]],
  "FreeImage_TmoReinhard05Ex": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE, DOUBLE, DOUBLE]],
  "FreeImage_TmoFattal02": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE]],
  "FreeImage_ZLibCompress": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibUncompress": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibGZip": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibGUnzip": [DWORD, [PBYTE, DWORD, PBYTE, DWORD]],
  "FreeImage_ZLibCRC32": [DWORD, [DWORD, PBYTE, DWORD]],
  "FreeImage_CreateTag": [PTAG, []],
  "FreeImage_DeleteTag": [VOID, [PTAG]],
  "FreeImage_CloneTag": [PTAG, [PTAG]],
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
  "FreeImage_FindFirstMetadata": [PMETADATA, [LONG, PBITMAP, PPTAG]],
  "FreeImage_FindNextMetadata": [BOOL, [PMETADATA, PPTAG]],
  "FreeImage_FindCloseMetadata": [VOID, [PMETADATA]],
  "FreeImage_SetMetadata": [BOOL, [LONG, PBITMAP, STRING, PTAG]],
  "FreeImage_GetMetadata": [BOOL, [LONG, PBITMAP, STRING, PPTAG]],
  "FreeImage_GetMetadataCount": [DWORD, [LONG, PBITMAP]],
  "FreeImage_CloneMetadata": [BOOL, [PBITMAP, PBITMAP]],
  "FreeImage_TagToString": [STRING, [LONG, PTAG, STRING]],
  "FreeImage_JPEGTransform": [BOOL, [STRING, STRING, LONG, BOOL]],
  "FreeImage_JPEGTransformU": [BOOL, [WSTRING, WSTRING, LONG, BOOL]],
  "FreeImage_JPEGCrop": [BOOL, [STRING, STRING, LONG, LONG, LONG, LONG]],
  "FreeImage_JPEGCropU": [BOOL, [WSTRING, WSTRING, LONG, LONG, LONG, LONG]],
  "FreeImage_RotateClassic": [PBITMAP, [PBITMAP, DOUBLE]],
  "FreeImage_Rotate": [PBITMAP, [PBITMAP, DOUBLE, PVOID]],
  "FreeImage_RotateEx": [PBITMAP, [PBITMAP, DOUBLE, DOUBLE, DOUBLE, DOUBLE, DOUBLE, BOOL]],
  "FreeImage_FlipHorizontal": [BOOL, [PBITMAP]],
  "FreeImage_FlipVertical": [BOOL, [PBITMAP]],
  "FreeImage_Rescale": [PBITMAP, [PBITMAP, LONG, LONG, LONG]],
  "FreeImage_MakeThumbnail": [PBITMAP, [PBITMAP, LONG, BOOL]],
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
  "FreeImage_GetChannel": [PBITMAP, [PBITMAP, LONG]],
  "FreeImage_SetChannel": [BOOL, [PBITMAP, PBITMAP, LONG]],
  "FreeImage_GetComplexChannel": [PBITMAP, [PBITMAP, LONG]],
  "FreeImage_SetComplexChannel": [BOOL, [PBITMAP, PBITMAP, LONG]],
  "FreeImage_Copy": [PBITMAP, [PBITMAP, LONG, LONG, LONG, LONG]],
  "FreeImage_Paste": [BOOL, [PBITMAP, PBITMAP, LONG, LONG, LONG]],
  "FreeImage_Composite": [PBITMAP, [PBITMAP, BOOL, PRGBQUAD, PBITMAP]],
  "FreeImage_PreMultiplyWithAlpha": [BOOL, [PBITMAP]],
  "FreeImage_FillBackground": [BOOL, [PBITMAP, PVOID, LONG]],
  "FreeImage_EnlargeCanvas": [PBITMAP, [PBITMAP, LONG, LONG, LONG, LONG, PVOID, LONG]],
  "FreeImage_AllocateEx": [PBITMAP, [LONG, LONG, LONG, PRGBQUAD, LONG, PRGBQUAD, DWORD, DWORD, DWORD]],
  "FreeImage_AllocateExT": [PBITMAP, [LONG, LONG, LONG, LONG, PVOID, LONG, PRGBQUAD, DWORD, DWORD, DWORD]],
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
  QUANTIZATION_ALGORITHM: {
    WUQUANT: 0,
    NNQUANT: 1
  },
  DITHERING_ALGORITHM: {
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
  unload: function (bitmap) {
    assertNonNullObject(bitmap, "bitmap");
    return library.FreeImage_Unload(bitmap);
  },



  // FIBITMAP * FreeImage_Clone(FIBITMAP *dib);
  clone: function (dib) {
    return library.FreeImage_Clone(dib);
  },
  // BOOL FreeImage_HasPixels(FIBITMAP *dib);
  hasPixels: function (dib) {
    return library.FreeImage_HasPixels(dib);
  },
  // FIBITMAP *FreeImage_LoadU(FREE_IMAGE_FORMAT fif, const wchar_t *filename, int flags FI_DEFAULT(0));
  loadU: function (fif, filename, flags) {
    return library.FreeImage_LoadU(fif, filename, flags);
  },
  // BOOL FreeImage_SaveU(FREE_IMAGE_FORMAT fif, FIBITMAP *dib, const wchar_t *filename, int flags FI_DEFAULT(0));
  saveU: function (fif, dib, filename, flags) {
    return library.FreeImage_SaveU(fif, dib, filename, flags);
  },
  // FIMEMORY *FreeImage_OpenMemory(BYTE *data FI_DEFAULT(0), DWORD size_in_bytes FI_DEFAULT(0));
  openMemory: function (data, size_in_bytes) {
    return library.FreeImage_OpenMemory(data, size_in_bytes);
  },
  // void FreeImage_CloseMemory(FIMEMORY *stream);
  closeMemory: function (stream) {
    return library.FreeImage_CloseMemory(stream);
  },
  // FIBITMAP *FreeImage_LoadFromMemory(FREE_IMAGE_FORMAT fif, FIMEMORY *stream, int flags FI_DEFAULT(0));
  loadFromMemory: function (fif, stream, flags) {
    return library.FreeImage_LoadFromMemory(fif, stream, flags);
  },
  // BOOL FreeImage_SaveToMemory(FREE_IMAGE_FORMAT fif, FIBITMAP *dib, FIMEMORY *stream, int flags FI_DEFAULT(0));
  saveToMemory: function (fif, dib, stream, flags) {
    return library.FreeImage_SaveToMemory(fif, dib, stream, flags);
  },
  // long FreeImage_TellMemory(FIMEMORY *stream);
  tellMemory: function (stream) {
    return library.FreeImage_TellMemory(stream);
  },
  // BOOL FreeImage_SeekMemory(FIMEMORY *stream, long offset, int origin);
  seekMemory: function (stream, offset, origin) {
    return library.FreeImage_SeekMemory(stream, offset, origin);
  },
  // BOOL FreeImage_AcquireMemory(FIMEMORY *stream, BYTE **data, DWORD *size_in_bytes);
  acquireMemory: function (stream, data, size_in_bytes) {
    return library.FreeImage_AcquireMemory(stream, data, size_in_bytes);
  },
  // unsigned FreeImage_ReadMemory(void *buffer, unsigned size, unsigned count, FIMEMORY *stream);
  readMemory: function (buffer, size, count, stream) {
    return library.FreeImage_ReadMemory(buffer, size, count, stream);
  },
  // unsigned FreeImage_WriteMemory(const void *buffer, unsigned size, unsigned count, FIMEMORY *stream);
  writeMemory: function (buffer, size, count, stream) {
    return library.FreeImage_WriteMemory(buffer, size, count, stream);
  },
  // FIMULTIBITMAP *FreeImage_LoadMultiBitmapFromMemory(FREE_IMAGE_FORMAT fif, FIMEMORY *stream, int flags FI_DEFAULT(0));
  loadMultiBitmapFromMemory: function (fif, stream, flags) {
    return library.FreeImage_LoadMultiBitmapFromMemory(fif, stream, flags);
  },
  // BOOL FreeImage_SaveMultiBitmapToMemory(FREE_IMAGE_FORMAT fif, FIMULTIBITMAP *bitmap, FIMEMORY *stream, int flags);
  saveMultiBitmapToMemory: function (fif, bitmap, stream, flags) {
    return library.FreeImage_SaveMultiBitmapToMemory(fif, bitmap, stream, flags);
  },
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
  // FREE_IMAGE_FORMAT FreeImage_GetFileType(const char *filename, int size FI_DEFAULT(0));
  getFileType: function (filename, size) {
    return library.FreeImage_GetFileType(filename, size);
  },
  // FREE_IMAGE_FORMAT FreeImage_GetFileTypeU(const wchar_t *filename, int size FI_DEFAULT(0));
  getFileTypeU: function (filename, size) {
    return library.FreeImage_GetFileTypeU(filename, size);
  },
  // FREE_IMAGE_FORMAT FreeImage_GetFileTypeFromMemory(FIMEMORY *stream, int size FI_DEFAULT(0));
  getFileTypeFromMemory: function (stream, size) {
    return library.FreeImage_GetFileTypeFromMemory(stream, size);
  },
  // FREE_IMAGE_TYPE FreeImage_GetImageType(FIBITMAP *dib);
  getImageType: function (dib) {
    return library.FreeImage_GetImageType(dib);
  },
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
  // BYTE *FreeImage_GetBits(FIBITMAP *dib);
  getBits: function (dib) {
    return library.FreeImage_GetBits(dib);
  },
  // BYTE *FreeImage_GetScanLine(FIBITMAP *dib, int scanline);
  getScanLine: function (dib, scanline) {
    return library.FreeImage_GetScanLine(dib, scanline);
  },
  // BOOL FreeImage_GetPixelIndex(FIBITMAP *dib, unsigned x, unsigned y, BYTE *value);
  getPixelIndex: function (dib, x, y, value) {
    return library.FreeImage_GetPixelIndex(dib, x, y, value);
  },
  // BOOL FreeImage_GetPixelColor(FIBITMAP *dib, unsigned x, unsigned y, RGBQUAD *value);
  getPixelColor: function (dib, x, y, value) {
    return library.FreeImage_GetPixelColor(dib, x, y, value);
  },
  // BOOL FreeImage_SetPixelIndex(FIBITMAP *dib, unsigned x, unsigned y, BYTE *value);
  setPixelIndex: function (dib, x, y, value) {
    return library.FreeImage_SetPixelIndex(dib, x, y, value);
  },
  // BOOL FreeImage_SetPixelColor(FIBITMAP *dib, unsigned x, unsigned y, RGBQUAD *value);
  setPixelColor: function (dib, x, y, value) {
    return library.FreeImage_SetPixelColor(dib, x, y, value);
  },
  // unsigned FreeImage_GetColorsUsed(FIBITMAP *dib);
  getColorsUsed: function (dib) {
    return library.FreeImage_GetColorsUsed(dib);
  },
  // unsigned FreeImage_GetBPP(FIBITMAP *dib);
  getBPP: function (dib) {
    return library.FreeImage_GetBPP(dib);
  },
  // unsigned FreeImage_GetWidth(FIBITMAP *dib);
  getWidth: function (dib) {
    return library.FreeImage_GetWidth(dib);
  },
  // unsigned FreeImage_GetHeight(FIBITMAP *dib);
  getHeight: function (dib) {
    return library.FreeImage_GetHeight(dib);
  },
  // unsigned FreeImage_GetLine(FIBITMAP *dib);
  getLine: function (dib) {
    return library.FreeImage_GetLine(dib);
  },
  // unsigned FreeImage_GetPitch(FIBITMAP *dib);
  getPitch: function (dib) {
    return library.FreeImage_GetPitch(dib);
  },
  // unsigned FreeImage_GetDIBSize(FIBITMAP *dib);
  getDIBSize: function (dib) {
    return library.FreeImage_GetDIBSize(dib);
  },
  // RGBQUAD *FreeImage_GetPalette(FIBITMAP *dib);
  getPalette: function (dib) {
    return library.FreeImage_GetPalette(dib);
  },
  // unsigned FreeImage_GetDotsPerMeterX(FIBITMAP *dib);
  getDotsPerMeterX: function (dib) {
    return library.FreeImage_GetDotsPerMeterX(dib);
  },
  // unsigned FreeImage_GetDotsPerMeterY(FIBITMAP *dib);
  getDotsPerMeterY: function (dib) {
    return library.FreeImage_GetDotsPerMeterY(dib);
  },
  // void FreeImage_SetDotsPerMeterX(FIBITMAP *dib, unsigned res);
  setDotsPerMeterX: function (dib, res) {
    return library.FreeImage_SetDotsPerMeterX(dib, res);
  },
  // void FreeImage_SetDotsPerMeterY(FIBITMAP *dib, unsigned res);
  setDotsPerMeterY: function (dib, res) {
    return library.FreeImage_SetDotsPerMeterY(dib, res);
  },
  // BITMAPINFOHEADER *FreeImage_GetInfoHeader(FIBITMAP *dib);
  getInfoHeader: function (dib) {
    return library.FreeImage_GetInfoHeader(dib);
  },
  // BITMAPINFO *FreeImage_GetInfo(FIBITMAP *dib);
  getInfo: function (dib) {
    return library.FreeImage_GetInfo(dib);
  },
  // FREE_IMAGE_COLOR_TYPE FreeImage_GetColorType(FIBITMAP *dib);
  getColorType: function (dib) {
    return library.FreeImage_GetColorType(dib);
  },
  // unsigned FreeImage_GetRedMask(FIBITMAP *dib);
  getRedMask: function (dib) {
    return library.FreeImage_GetRedMask(dib);
  },
  // unsigned FreeImage_GetGreenMask(FIBITMAP *dib);
  getGreenMask: function (dib) {
    return library.FreeImage_GetGreenMask(dib);
  },
  // unsigned FreeImage_GetBlueMask(FIBITMAP *dib);
  getBlueMask: function (dib) {
    return library.FreeImage_GetBlueMask(dib);
  },
  // unsigned FreeImage_GetTransparencyCount(FIBITMAP *dib);
  getTransparencyCount: function (dib) {
    return library.FreeImage_GetTransparencyCount(dib);
  },
  // BYTE * FreeImage_GetTransparencyTable(FIBITMAP *dib);
  getTransparencyTable: function (dib) {
    return library.FreeImage_GetTransparencyTable(dib);
  },
  // void FreeImage_SetTransparent(FIBITMAP *dib, BOOL enabled);
  setTransparent: function (dib, enabled) {
    return library.FreeImage_SetTransparent(dib, enabled);
  },
  // void FreeImage_SetTransparencyTable(FIBITMAP *dib, BYTE *table, int count);
  setTransparencyTable: function (dib, table, count) {
    return library.FreeImage_SetTransparencyTable(dib, table, count);
  },
  // BOOL FreeImage_IsTransparent(FIBITMAP *dib);
  isTransparent: function (dib) {
    return library.FreeImage_IsTransparent(dib);
  },
  // void FreeImage_SetTransparentIndex(FIBITMAP *dib, int index);
  setTransparentIndex: function (dib, index) {
    return library.FreeImage_SetTransparentIndex(dib, index);
  },
  // int FreeImage_GetTransparentIndex(FIBITMAP *dib);
  getTransparentIndex: function (dib) {
    return library.FreeImage_GetTransparentIndex(dib);
  },
  // BOOL FreeImage_HasBackgroundColor(FIBITMAP *dib);
  hasBackgroundColor: function (dib) {
    return library.FreeImage_HasBackgroundColor(dib);
  },
  // BOOL FreeImage_GetBackgroundColor(FIBITMAP *dib, RGBQUAD *bkcolor);
  getBackgroundColor: function (dib, bkcolor) {
    return library.FreeImage_GetBackgroundColor(dib, bkcolor);
  },
  // BOOL FreeImage_SetBackgroundColor(FIBITMAP *dib, RGBQUAD *bkcolor);
  setBackgroundColor: function (dib, bkcolor) {
    return library.FreeImage_SetBackgroundColor(dib, bkcolor);
  },
  // FIBITMAP *FreeImage_GetThumbnail(FIBITMAP *dib);
  getThumbnail: function (dib) {
    return library.FreeImage_GetThumbnail(dib);
  },
  // BOOL FreeImage_SetThumbnail(FIBITMAP *dib, FIBITMAP *thumbnail);
  setThumbnail: function (dib, thumbnail) {
    return library.FreeImage_SetThumbnail(dib, thumbnail);
  },
  // FIICCPROFILE *FreeImage_GetICCProfile(FIBITMAP *dib);
  getICCProfile: function (dib) {
    return library.FreeImage_GetICCProfile(dib);
  },
  // FIICCPROFILE *FreeImage_CreateICCProfile(FIBITMAP *dib, void *data, long size);
  createICCProfile: function (dib, data, size) {
    return library.FreeImage_CreateICCProfile(dib, data, size);
  },
  // void FreeImage_DestroyICCProfile(FIBITMAP *dib);
  destroyICCProfile: function (dib) {
    return library.FreeImage_DestroyICCProfile(dib);
  },
  // void FreeImage_ConvertLine1To4(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine1To4: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine1To4(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine8To4(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine8To4: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine8To4(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine16To4_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To4_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To4_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine16To4_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To4_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To4_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine24To4(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine24To4: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine24To4(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine32To4(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine32To4: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine32To4(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine1To8(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine1To8: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine1To8(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine4To8(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine4To8: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine4To8(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine16To8_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To8_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To8_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine16To8_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To8_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To8_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine24To8(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine24To8: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine24To8(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine32To8(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine32To8: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine32To8(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine1To16_555(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine1To16_555: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine1To16_555(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine4To16_555(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine4To16_555: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine4To16_555(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine8To16_555(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine8To16_555: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine8To16_555(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine16_565_To16_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16_565_To16_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16_565_To16_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine24To16_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine24To16_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine24To16_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine32To16_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine32To16_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine32To16_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine1To16_565(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine1To16_565: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine1To16_565(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine4To16_565(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine4To16_565: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine4To16_565(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine8To16_565(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine8To16_565: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine8To16_565(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine16_555_To16_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16_555_To16_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16_555_To16_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine24To16_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine24To16_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine24To16_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine32To16_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine32To16_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine32To16_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine1To24(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine1To24: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine1To24(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine4To24(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine4To24: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine4To24(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine8To24(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine8To24: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine8To24(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine16To24_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To24_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To24_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine16To24_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To24_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To24_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine32To24(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine32To24: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine32To24(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine1To32(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine1To32: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine1To32(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine4To32(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine4To32: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine4To32(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine8To32(BYTE *target, BYTE *source, int width_in_pixels, RGBQUAD *palette);
  convertLine8To32: function (target, source, width_in_pixels, palette) {
    return library.FreeImage_ConvertLine8To32(target, source, width_in_pixels, palette);
  },
  // void FreeImage_ConvertLine16To32_555(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To32_555: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To32_555(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine16To32_565(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine16To32_565: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine16To32_565(target, source, width_in_pixels);
  },
  // void FreeImage_ConvertLine24To32(BYTE *target, BYTE *source, int width_in_pixels);
  convertLine24To32: function (target, source, width_in_pixels) {
    return library.FreeImage_ConvertLine24To32(target, source, width_in_pixels);
  },
  // FIBITMAP *FreeImage_ConvertTo4Bits(FIBITMAP *dib);
  convertTo4Bits: function (dib) {
    return library.FreeImage_ConvertTo4Bits(dib);
  },
  // FIBITMAP *FreeImage_ConvertTo8Bits(FIBITMAP *dib);
  convertTo8Bits: function (dib) {
    return library.FreeImage_ConvertTo8Bits(dib);
  },
  // FIBITMAP *FreeImage_ConvertToGreyscale(FIBITMAP *dib);
  convertToGreyscale: function (dib) {
    return library.FreeImage_ConvertToGreyscale(dib);
  },
  // FIBITMAP *FreeImage_ConvertTo16Bits555(FIBITMAP *dib);
  convertTo16Bits555: function (dib) {
    return library.FreeImage_ConvertTo16Bits555(dib);
  },
  // FIBITMAP *FreeImage_ConvertTo16Bits565(FIBITMAP *dib);
  convertTo16Bits565: function (dib) {
    return library.FreeImage_ConvertTo16Bits565(dib);
  },
  // FIBITMAP *FreeImage_ConvertTo24Bits(FIBITMAP *dib);
  convertTo24Bits: function (dib) {
    return library.FreeImage_ConvertTo24Bits(dib);
  },
  // FIBITMAP *FreeImage_ConvertTo32Bits(FIBITMAP *dib);
  convertTo32Bits: function (dib) {
    return library.FreeImage_ConvertTo32Bits(dib);
  },
  // FIBITMAP *FreeImage_ColorQuantize(FIBITMAP *dib, FREE_IMAGE_QUANTIZE quantize);
  colorQuantize: function (dib, quantize) {
    return library.FreeImage_ColorQuantize(dib, quantize);
  },
  // FIBITMAP *FreeImage_ColorQuantizeEx(FIBITMAP *dib, FREE_IMAGE_QUANTIZE quantize FI_DEFAULT(FIQ_WUQUANT), int PaletteSize FI_DEFAULT(256), int ReserveSize FI_DEFAULT(0), RGBQUAD *ReservePalette FI_DEFAULT(NULL));
  colorQuantizeEx: function (dib, quantize, PaletteSize, ReserveSize, ReservePalette) {
    return library.FreeImage_ColorQuantizeEx(dib, quantize, PaletteSize, ReserveSize, ReservePalette);
  },
  // FIBITMAP *FreeImage_Threshold(FIBITMAP *dib, BYTE T);
  threshold: function (dib, T) {
    return library.FreeImage_Threshold(dib, T);
  },
  // FIBITMAP *FreeImage_Dither(FIBITMAP *dib, FREE_IMAGE_DITHER algorithm);
  dither: function (dib, algorithm) {
    return library.FreeImage_Dither(dib, algorithm);
  },
  // FIBITMAP *FreeImage_ConvertFromRawBits(BYTE *bits, int width, int height, int pitch, unsigned bpp, unsigned red_mask, unsigned green_mask, unsigned blue_mask, BOOL topdown FI_DEFAULT(FALSE));
  convertFromRawBits: function (bits, width, height, pitch, bpp, red_mask, green_mask, blue_mask, topdown) {
    return library.FreeImage_ConvertFromRawBits(bits, width, height, pitch, bpp, red_mask, green_mask, blue_mask, topdown);
  },
  // void FreeImage_ConvertToRawBits(BYTE *bits, FIBITMAP *dib, int pitch, unsigned bpp, unsigned red_mask, unsigned green_mask, unsigned blue_mask, BOOL topdown FI_DEFAULT(FALSE));
  convertToRawBits: function (bits, dib, pitch, bpp, red_mask, green_mask, blue_mask, topdown) {
    return library.FreeImage_ConvertToRawBits(bits, dib, pitch, bpp, red_mask, green_mask, blue_mask, topdown);
  },
  // FIBITMAP *FreeImage_ConvertToFloat(FIBITMAP *dib);
  convertToFloat: function (dib) {
    return library.FreeImage_ConvertToFloat(dib);
  },
  // FIBITMAP *FreeImage_ConvertToRGBF(FIBITMAP *dib);
  convertToRGBF: function (dib) {
    return library.FreeImage_ConvertToRGBF(dib);
  },
  // FIBITMAP *FreeImage_ConvertToUINT16(FIBITMAP *dib);
  convertToUINT16: function (dib) {
    return library.FreeImage_ConvertToUINT16(dib);
  },
  // FIBITMAP *FreeImage_ConvertToRGB16(FIBITMAP *dib);
  convertToRGB16: function (dib) {
    return library.FreeImage_ConvertToRGB16(dib);
  },
  // FIBITMAP *FreeImage_ConvertToStandardType(FIBITMAP *src, BOOL scale_linear FI_DEFAULT(TRUE));
  convertToStandardType: function (src, scale_linear) {
    return library.FreeImage_ConvertToStandardType(src, scale_linear);
  },
  // FIBITMAP *FreeImage_ConvertToType(FIBITMAP *src, FREE_IMAGE_TYPE dst_type, BOOL scale_linear FI_DEFAULT(TRUE));
  convertToType: function (src, dst_type, scale_linear) {
    return library.FreeImage_ConvertToType(src, dst_type, scale_linear);
  },
  // FIBITMAP *FreeImage_ToneMapping(FIBITMAP *dib, FREE_IMAGE_TMO tmo, double first_param FI_DEFAULT(0), double second_param FI_DEFAULT(0));
  toneMapping: function (dib, tmo, first_param, second_param) {
    return library.FreeImage_ToneMapping(dib, tmo, first_param, second_param);
  },
  // FIBITMAP *FreeImage_TmoDrago03(FIBITMAP *src, double gamma FI_DEFAULT(2.2), double exposure FI_DEFAULT(0));
  tmoDrago03: function (src, gamma, exposure) {
    return library.FreeImage_TmoDrago03(src, gamma, exposure);
  },
  // FIBITMAP *FreeImage_TmoReinhard05(FIBITMAP *src, double intensity FI_DEFAULT(0), double contrast FI_DEFAULT(0));
  tmoReinhard05: function (src, intensity, contrast) {
    return library.FreeImage_TmoReinhard05(src, intensity, contrast);
  },
  // FIBITMAP *FreeImage_TmoReinhard05Ex(FIBITMAP *src, double intensity FI_DEFAULT(0), double contrast FI_DEFAULT(0), double adaptation FI_DEFAULT(1), double color_correction FI_DEFAULT(0));
  tmoReinhard05Ex: function (src, intensity, contrast, adaptation, color_correction) {
    return library.FreeImage_TmoReinhard05Ex(src, intensity, contrast, adaptation, color_correction);
  },
  // FIBITMAP *FreeImage_TmoFattal02(FIBITMAP *src, double color_saturation FI_DEFAULT(0.5), double attenuation FI_DEFAULT(0.85));
  tmoFattal02: function (src, color_saturation, attenuation) {
    return library.FreeImage_TmoFattal02(src, color_saturation, attenuation);
  },
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
  // FIMETADATA *FreeImage_FindFirstMetadata(FREE_IMAGE_MDMODEL model, FIBITMAP *dib, FITAG **tag);
  findFirstMetadata: function (model, dib, tag) {
    return library.FreeImage_FindFirstMetadata(model, dib, tag);
  },
  // BOOL FreeImage_FindNextMetadata(FIMETADATA *mdhandle, FITAG **tag);
  findNextMetadata: function (mdhandle, tag) {
    return library.FreeImage_FindNextMetadata(mdhandle, tag);
  },
  // void FreeImage_FindCloseMetadata(FIMETADATA *mdhandle);
  findCloseMetadata: function (mdhandle) {
    return library.FreeImage_FindCloseMetadata(mdhandle);
  },
  // BOOL FreeImage_SetMetadata(FREE_IMAGE_MDMODEL model, FIBITMAP *dib, const char *key, FITAG *tag);
  setMetadata: function (model, dib, key, tag) {
    return library.FreeImage_SetMetadata(model, dib, key, tag);
  },
  // BOOL FreeImage_GetMetadata(FREE_IMAGE_MDMODEL model, FIBITMAP *dib, const char *key, FITAG **tag);
  getMetadata: function (model, dib, key, tag) {
    return library.FreeImage_GetMetadata(model, dib, key, tag);
  },
  // unsigned FreeImage_GetMetadataCount(FREE_IMAGE_MDMODEL model, FIBITMAP *dib);
  getMetadataCount: function (model, dib) {
    return library.FreeImage_GetMetadataCount(model, dib);
  },
  // BOOL FreeImage_CloneMetadata(FIBITMAP *dst, FIBITMAP *src);
  cloneMetadata: function (dst, src) {
    return library.FreeImage_CloneMetadata(dst, src);
  },
  // const char *FreeImage_TagToString(FREE_IMAGE_MDMODEL model, FITAG *tag, char *Make FI_DEFAULT(NULL));
  tagToString: function (model, tag, Make) {
    return library.FreeImage_TagToString(model, tag, Make);
  },
  // BOOL FreeImage_JPEGTransform(const char *src_file, const char *dst_file, FREE_IMAGE_OPERATION operation, BOOL perfect FI_DEFAULT(TRUE));
  jPEGTransform: function (src_file, dst_file, operation, perfect) {
    return library.FreeImage_JPEGTransform(src_file, dst_file, operation, perfect);
  },
  // BOOL FreeImage_JPEGTransformU(const wchar_t *src_file, const wchar_t *dst_file, FREE_IMAGE_OPERATION operation, BOOL perfect FI_DEFAULT(TRUE));
  jPEGTransformU: function (src_file, dst_file, operation, perfect) {
    return library.FreeImage_JPEGTransformU(src_file, dst_file, operation, perfect);
  },
  // BOOL FreeImage_JPEGCrop(const char *src_file, const char *dst_file, int left, int top, int right, int bottom);
  jPEGCrop: function (src_file, dst_file, left, top, right, bottom) {
    return library.FreeImage_JPEGCrop(src_file, dst_file, left, top, right, bottom);
  },
  // BOOL FreeImage_JPEGCropU(const wchar_t *src_file, const wchar_t *dst_file, int left, int top, int right, int bottom);
  jPEGCropU: function (src_file, dst_file, left, top, right, bottom) {
    return library.FreeImage_JPEGCropU(src_file, dst_file, left, top, right, bottom);
  },
  // BOOL FreeImage_JPEGTransformCombined(const char *src_file, const char *dst_file, FREE_IMAGE_OPERATION operation, int* left, int* top, int* right, int* bottom, BOOL perfect FI_DEFAULT(TRUE));
  jPEGTransformCombined: function (src_file, dst_file, operation, left, top, right, bottom, perfect) {
    return library.FreeImage_JPEGTransformCombined(src_file, dst_file, operation, left, top, right, bottom, perfect);
  },
  // BOOL FreeImage_JPEGTransformCombinedU(const wchar_t *src_file, const wchar_t *dst_file, FREE_IMAGE_OPERATION operation, int* left, int* top, int* right, int* bottom, BOOL perfect FI_DEFAULT(TRUE));
  jPEGTransformCombinedU: function (src_file, dst_file, operation, left, top, right, bottom, perfect) {
    return library.FreeImage_JPEGTransformCombinedU(src_file, dst_file, operation, left, top, right, bottom, perfect);
  },
  // BOOL FreeImage_JPEGTransformCombinedFromMemory(FIMEMORY* src_stream, FIMEMORY* dst_stream, FREE_IMAGE_OPERATION operation, int* left, int* top, int* right, int* bottom, BOOL perfect FI_DEFAULT(TRUE));
  jPEGTransformCombinedFromMemory: function (src_stream, dst_stream, operation, left, top, right, bottom, perfect) {
    return library.FreeImage_JPEGTransformCombinedFromMemory(src_stream, dst_stream, operation, left, top, right, bottom, perfect);
  },
  // FIBITMAP *FreeImage_RotateClassic(FIBITMAP *dib, double angle);
  rotateClassic: function (dib, angle) {
    return library.FreeImage_RotateClassic(dib, angle);
  },
  // FIBITMAP *FreeImage_Rotate(FIBITMAP *dib, double angle, const void *bkcolor FI_DEFAULT(NULL));
  rotate: function (dib, angle, bkcolor) {
    return library.FreeImage_Rotate(dib, angle, bkcolor);
  },
  // FIBITMAP *FreeImage_RotateEx(FIBITMAP *dib, double angle, double x_shift, double y_shift, double x_origin, double y_origin, BOOL use_mask);
  rotateEx: function (dib, angle, x_shift, y_shift, x_origin, y_origin, use_mask) {
    return library.FreeImage_RotateEx(dib, angle, x_shift, y_shift, x_origin, y_origin, use_mask);
  },
  // BOOL FreeImage_FlipHorizontal(FIBITMAP *dib);
  flipHorizontal: function (dib) {
    return library.FreeImage_FlipHorizontal(dib);
  },
  // BOOL FreeImage_FlipVertical(FIBITMAP *dib);
  flipVertical: function (dib) {
    return library.FreeImage_FlipVertical(dib);
  },
  // FIBITMAP *FreeImage_Rescale(FIBITMAP *dib, int dst_width, int dst_height, FREE_IMAGE_FILTER filter FI_DEFAULT(FILTER_CATMULLROM));
  rescale: function (dib, dst_width, dst_height, filter) {
    return library.FreeImage_Rescale(dib, dst_width, dst_height, filter);
  },
  // FIBITMAP *FreeImage_MakeThumbnail(FIBITMAP *dib, int max_pixel_size, BOOL convert FI_DEFAULT(TRUE));
  makeThumbnail: function (dib, max_pixel_size, convert) {
    return library.FreeImage_MakeThumbnail(dib, max_pixel_size, convert);
  },
  // BOOL FreeImage_AdjustCurve(FIBITMAP *dib, BYTE *LUT, FREE_IMAGE_COLOR_CHANNEL channel);
  adjustCurve: function (dib, LUT, channel) {
    return library.FreeImage_AdjustCurve(dib, LUT, channel);
  },
  // BOOL FreeImage_AdjustGamma(FIBITMAP *dib, double gamma);
  adjustGamma: function (dib, gamma) {
    return library.FreeImage_AdjustGamma(dib, gamma);
  },
  // BOOL FreeImage_AdjustBrightness(FIBITMAP *dib, double percentage);
  adjustBrightness: function (dib, percentage) {
    return library.FreeImage_AdjustBrightness(dib, percentage);
  },
  // BOOL FreeImage_AdjustContrast(FIBITMAP *dib, double percentage);
  adjustContrast: function (dib, percentage) {
    return library.FreeImage_AdjustContrast(dib, percentage);
  },
  // BOOL FreeImage_Invert(FIBITMAP *dib);
  invert: function (dib) {
    return library.FreeImage_Invert(dib);
  },
  // BOOL FreeImage_GetHistogram(FIBITMAP *dib, DWORD *histo, FREE_IMAGE_COLOR_CHANNEL channel FI_DEFAULT(FICC_BLACK));
  getHistogram: function (dib, histo, channel) {
    return library.FreeImage_GetHistogram(dib, histo, channel);
  },
  // int FreeImage_GetAdjustColorsLookupTable(BYTE *LUT, double brightness, double contrast, double gamma, BOOL invert);
  getAdjustColorsLookupTable: function (LUT, brightness, contrast, gamma, invert) {
    return library.FreeImage_GetAdjustColorsLookupTable(LUT, brightness, contrast, gamma, invert);
  },
  // BOOL FreeImage_AdjustColors(FIBITMAP *dib, double brightness, double contrast, double gamma, BOOL invert FI_DEFAULT(FALSE));
  adjustColors: function (dib, brightness, contrast, gamma, invert) {
    return library.FreeImage_AdjustColors(dib, brightness, contrast, gamma, invert);
  },
  // unsigned FreeImage_ApplyColorMapping(FIBITMAP *dib, RGBQUAD *srccolors, RGBQUAD *dstcolors, unsigned count, BOOL ignore_alpha, BOOL swap);
  applyColorMapping: function (dib, srccolors, dstcolors, count, ignore_alpha, swap) {
    return library.FreeImage_ApplyColorMapping(dib, srccolors, dstcolors, count, ignore_alpha, swap);
  },
  // unsigned FreeImage_SwapColors(FIBITMAP *dib, RGBQUAD *color_a, RGBQUAD *color_b, BOOL ignore_alpha);
  swapColors: function (dib, color_a, color_b, ignore_alpha) {
    return library.FreeImage_SwapColors(dib, color_a, color_b, ignore_alpha);
  },
  // unsigned FreeImage_ApplyPaletteIndexMapping(FIBITMAP *dib, BYTE *srcindices,  BYTE *dstindices, unsigned count, BOOL swap);
  applyPaletteIndexMapping: function (dib, srcindices, dstindices, count, swap) {
    return library.FreeImage_ApplyPaletteIndexMapping(dib, srcindices, dstindices, count, swap);
  },
  // unsigned FreeImage_SwapPaletteIndices(FIBITMAP *dib, BYTE *index_a, BYTE *index_b);
  swapPaletteIndices: function (dib, index_a, index_b) {
    return library.FreeImage_SwapPaletteIndices(dib, index_a, index_b);
  },
  // FIBITMAP *FreeImage_GetChannel(FIBITMAP *dib, FREE_IMAGE_COLOR_CHANNEL channel);
  getChannel: function (dib, channel) {
    return library.FreeImage_GetChannel(dib, channel);
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
  // FIBITMAP *FreeImage_Copy(FIBITMAP *dib, int left, int top, int right, int bottom);
  copy: function (dib, left, top, right, bottom) {
    return library.FreeImage_Copy(dib, left, top, right, bottom);
  },
  // BOOL FreeImage_Paste(FIBITMAP *dst, FIBITMAP *src, int left, int top, int alpha);
  paste: function (dst, src, left, top, alpha) {
    return library.FreeImage_Paste(dst, src, left, top, alpha);
  },
  // FIBITMAP *FreeImage_Composite(FIBITMAP *fg, BOOL useFileBkg FI_DEFAULT(FALSE), RGBQUAD *appBkColor FI_DEFAULT(NULL), FIBITMAP *bg FI_DEFAULT(NULL));
  composite: function (fg, useFileBkg, appBkColor, bg) {
    return library.FreeImage_Composite(fg, useFileBkg, appBkColor, bg);
  },
  // BOOL FreeImage_PreMultiplyWithAlpha(FIBITMAP *dib);
  preMultiplyWithAlpha: function (dib) {
    return library.FreeImage_PreMultiplyWithAlpha(dib);
  },
  // BOOL FreeImage_FillBackground(FIBITMAP *dib, const void *color, int options FI_DEFAULT(0));
  fillBackground: function (dib, color, options) {
    return library.FreeImage_FillBackground(dib, color, options);
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
  // FIBITMAP *FreeImage_MultigridPoissonSolver(FIBITMAP *Laplacian, int ncycle FI_DEFAULT(3));
  multigridPoissonSolver: function (Laplacian, ncycle) {
    return library.FreeImage_MultigridPoissonSolver(Laplacian, ncycle);
  }
}


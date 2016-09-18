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
    FIMEMORY = RefStruct({
        data: PVOID
    }),
    PFIMEMORY = ref.refType(FIMEMORY),
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

function assertNullObject(arg, argName) {
    if (arg !== ref.NULL) {
        throw new Error(
            "Argument \"" + argName + "\" " +
            "must be a null object (" + arg + ")."
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

function assertMetadataType(arg, argName) {
    var p;
    for (p in module.exports.METADATA_TYPE) {
        if (arg === module.exports.METADATA_TYPE[p]) {
            return;
        }
    }
    throw new Error(
        "Argument \"" + argName + "\" " +
        "must be a metadata type (" + arg + ")."
    );
}

function assertMetadataModel(arg, argName) {
    var p;
    for (p in module.exports.METADATA_MODEL) {
        if (arg === module.exports.METADATA_MODEL[p]) {
            return;
        }
    }
    throw new Error(
        "Argument \"" + argName + "\" " +
        "must be a metadata model (" + arg + ")."
    );
}

function assertFilter(arg, argName) {
    var p;
    for (p in module.exports.FILTER) {
        if (arg === module.exports.FILTER[p]) {
            return;
        }
    }
    throw new Error(
        "Argument \"" + argName + "\" " +
        "must be a filter (" + arg + ")."
    );
}

function assertColorChannel(arg, argName) {
    var p;
    for (p in module.exports.COLOR_CHANNEL) {
        if (arg === module.exports.COLOR_CHANNEL[p]) {
            return;
        }
    }
    throw new Error(
        "Argument \"" + argName + "\" " +
        "must be a color channel (" + arg + ")."
    );
}

function assertJpegOperation(arg, argName) {
    var p;
    for (p in module.exports.JPEG_OPERATION) {
        if (arg === module.exports.JPEG_OPERATION[p]) {
            return;
        }
    }
    throw new Error(
        "Argument \"" + argName + "\" " +
        "must be a JPEG operation (" + arg + ")."
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
    "FreeImage_GetFileTypeFromMemory": [LONG, [FIMEMORY, LONG]],
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
    // Memory I/O Streams
    "FreeImage_OpenMemory": [PFIMEMORY, [PBYTE, DWORD]],
    "FreeImage_CloseMemory": [VOID, [PFIMEMORY]],
    "FreeImage_LoadFromMemory": [PBITMAP, [LONG, PFIMEMORY, LONG]],
    "FreeImage_SaveToMemory": [BOOL, [LONG, PBITMAP, PFIMEMORY, LONG]],
    "FreeImage_ReadMemory": [DWORD, [PVOID, DWORD, DWORD, PFIMEMORY]],
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
    //"FreeImage_JPEGTransformCombined": [BOOL, [STRING, STRING, LONG, PLONG, PLONG, PLONG, PLONG, BOOL]],
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
    getFileTypeFromMemory: function (fimem, size) {
        size = setToDefaultIfUndefined(size, 0);
        assertNonNullObject(fimem, "fimem");
        assertInteger(size, "size");
        return library.FreeImage_GetFileTypeFromMemory(fimem, size);
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
        library.FreeImage_ConvertToRawBits(bits, bitmap, pitch, bpp, redMask, greenMask, blueMask, topDown ? TRUE : FALSE);
    },
    convertToStandardType: function (bitmap, scaleLinear) {
        scaleLinear = setToDefaultIfUndefined(scaleLinear, true);
        assertNonNullObject(bitmap, "bitmap");
        assertBoolean(scaleLinear, "scaleLinear");
        return library.FreeImage_ConvertToStandardType(bitmap, scaleLinear ? TRUE : FALSE);
    },
    convertToType: function (bitmap, type, scaleLinear) {
        scaleLinear = setToDefaultIfUndefined(scaleLinear, true);
        assertNonNullObject(bitmap, "bitmap");
        assertImageType(type, "type");
        assertBoolean(scaleLinear, "scaleLinear");
        return library.FreeImage_ConvertToType(bitmap, type, scaleLinear ? TRUE : FALSE);
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
    getICCProfile: function (bitmap) {
        assertNonNullObject(bitmap, "bitmap");
        return library.FreeImage_GetICCProfile(bitmap);
    },
    createICCProfile: function (bitmap, data, size) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(data, "data");
        assertInteger(size, "size");
        return library.FreeImage_CreateICCProfile(bitmap, data, size);
    },
    destroyICCProfile: function (bitmap) {
        assertNonNullObject(bitmap, "bitmap");
        library.FreeImage_DestroyICCProfile(bitmap);
    },
    // Multipage functions
    openMultiBitmap: function (format, fileName, createNew, readOnly, keepCacheInMemory, flags) {
        keepCacheInMemory = setToDefaultIfUndefined(keepCacheInMemory, false);
        flags = setToDefaultIfUndefined(flags, 0);
        assertImageFormat(format, "format");
        assertNonEmptyString(fileName, "fileName");
        assertBoolean(createNew, "createNew");
        assertBoolean(readOnly, "readOnly");
        assertBoolean(keepCacheInMemory, "keepCacheInMemory");
        assertInteger(flags, "flags");
        return library.FreeImage_OpenMultiBitmap(format, fileName, createNew ? TRUE : FALSE, readOnly ? TRUE : FALSE, keepCacheInMemory ? TRUE : FALSE, flags);
    },
    closeMultiBitmap: function (multiBitmap, flags) {
        flags = setToDefaultIfUndefined(flags, 0);
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertInteger(flags, "flags");
        return library.FreeImage_CloseMultiBitmap(multiBitmap, flags) === TRUE;
    },
    getPageCount: function (multiBitmap) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        return library.FreeImage_GetPageCount(multiBitmap);
    },
    appendPage: function (multiBitmap, pageBitmap) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertNonNullObject(pageBitmap, "pageBitmap");
        library.FreeImage_AppendPage(multiBitmap, pageBitmap);
    },
    insertPage: function (multiBitmap, pageIndex, pageBitmap) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertInteger(pageIndex, "pageIndex");
        assertNonNullObject(pageBitmap, "pageBitmap");
        library.FreeImage_InsertPage(multiBitmap, pageIndex, pageBitmap);
    },
    deletePage: function (multiBitmap, pageIndex) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertInteger(pageIndex, "pageIndex");
        library.FreeImage_DeletePage(multiBitmap, pageIndex);
    },
    lockPage: function (multiBitmap, pageIndex) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertInteger(pageIndex, "pageIndex");
        return library.FreeImage_LockPage(multiBitmap, pageIndex);
    },
    unlockPage: function (multiBitmap, pageBitmap, changed) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertNonNullObject(pageBitmap, "pageBitmap");
        assertBoolean(changed, "changed");
        library.FreeImage_UnlockPage(multiBitmap, pageBitmap, changed ? TRUE : FALSE);
    },
    movePage: function (multiBitmap, targetPageIndex, sourcePageIndex) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertInteger(targetPageIndex, "targetPageIndex");
        assertInteger(sourcePageIndex, "sourcePageIndex");
        return library.FreeImage_MovePage(multiBitmap, targetPageIndex, sourcePageIndex) === TRUE;
    },
    getLockedPageNumbers: function (multiBitmap, lockedPageIndexes, lockedPageCount) {
        assertNonNullObject(multiBitmap, "multiBitmap");
        assertObject(lockedPageIndexes, "lockedPageIndexes");
        assertObject(lockedPageCount, "lockedPageCount");
        return library.FreeImage_GetLockedPageNumbers(multiBitmap, lockedPageIndexes, lockedPageCount) === TRUE;
    },
    // Memory I/O Streams
    openMemory: function (data, size_in_bytes) {
        setToDefaultIfUndefined(size_in_bytes, 0);
        setToDefaultIfUndefined(data, 0);
        assertInteger(size_in_bytes, "size_in_bytes");
        return library.FreeImage_OpenMemory(data, size_in_bytes);
    },
    closeMemory: function (fimem) {
        assertNonNullObject(fimem, "fimem");
        return library.FreeImage_CloseMemory(fimem);
    },
    loadFromMemory: function (format, fimem, flags) {
        flags = setToDefaultIfUndefined(flags, 0);
        assertImageFormat(format, "format");
        assertNonNullObject(fimem, "fimem");
        assertInteger(flags, "flags");
        return library.FreeImage_LoadFromMemory(format, fimem, flags);
    },
    saveToMemory: function (format, bitmap, fimem, flags) {
        assertImageFormat(format, "format");
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(fimem, "fimem");
        assertInteger(flags, "flags");
        return library.FreeImage_SaveToMemory(format, bitmap, fimem, flags);
    },
    readMemory: function (buffer, size, count, fimem) {
        assertNonNullObject(buffer, "buffer");
        assertInteger(size, "size");
        assertInteger(count, "count");
        assertNonNullObject(fimem, "fimem");
        return library.FreeImage_ReadMemory(buffer, size, count, fimem);
    },
    // Compression functions
    zLibCompress: function (target, targetSize, source, sourceSize) {
        assertNonNullObject(target, "target");
        assertUnsignedInteger(targetSize, "targetSize");
        assertNonNullObject(source, "source");
        assertUnsignedInteger(sourceSize, "sourceSize");
        return library.FreeImage_ZLibCompress(target, targetSize, source, sourceSize);
    },
    zLibUncompress: function (target, targetSize, source, sourceSize) {
        assertNonNullObject(target, "target");
        assertUnsignedInteger(targetSize, "targetSize");
        assertNonNullObject(source, "source");
        assertUnsignedInteger(sourceSize, "sourceSize");
        return library.FreeImage_ZLibUncompress(target, targetSize, source, sourceSize);
    },
    zLibGZip: function (target, targetSize, source, sourceSize) {
        assertNonNullObject(target, "target");
        assertUnsignedInteger(targetSize, "targetSize");
        assertNonNullObject(source, "source");
        assertUnsignedInteger(sourceSize, "sourceSize");
        return library.FreeImage_ZLibGZip(target, targetSize, source, sourceSize);
    },
    zLibGUnzip: function (target, targetSize, source, sourceSize) {
        assertNonNullObject(target, "target");
        assertUnsignedInteger(targetSize, "targetSize");
        assertNonNullObject(source, "source");
        assertUnsignedInteger(sourceSize, "sourceSize");
        return library.FreeImage_ZLibGUnzip(target, targetSize, source, sourceSize);
    },
    zLibCRC32: function (crc, source, sourceSize) {
        assertUnsignedInteger(crc, "crc");
        assertObject(source, "source");
        assertUnsignedInteger(sourceSize, "sourceSize");
        return library.FreeImage_ZLibCRC32(crc, source, sourceSize);
    },
    // Helper functions
    isLittleEndian: function () {
        return library.FreeImage_IsLittleEndian() === TRUE;
    },
    lookupX11Color: function (colorName, red, green, blue) {
        assertNonEmptyString(colorName, "colorName");
        assertNonNullObject(red, "red");
        assertNonNullObject(green, "green");
        assertNonNullObject(blue, "blue");
        return library.FreeImage_LookupX11Color(colorName, red, green, blue) === TRUE;
    },
    lookupSVGColor: function (colorName, red, green, blue) {
        assertNonEmptyString(colorName, "colorName");
        assertNonNullObject(red, "red");
        assertNonNullObject(green, "green");
        assertNonNullObject(blue, "blue");
        return library.FreeImage_LookupSVGColor(colorName, red, green, blue) === TRUE;
    },
    // METADATA FUNCTION REFERENCE
    // Tag creation and destruction
    createTag: function () {
        return library.FreeImage_CreateTag();
    },
    deleteTag: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_DeleteTag(tag);
    },
    cloneTag: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_CloneTag(tag);
    },
    // Tag accessors
    getTagKey: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagKey(tag);
    },
    getTagDescription: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagDescription(tag);
    },
    getTagID: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagID(tag);
    },
    getTagType: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagType(tag);
    },
    getTagCount: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagCount(tag);
    },
    getTagLength: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagLength(tag);
    },
    getTagValue: function (tag) {
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetTagValue(tag);
    },
    setTagKey: function (tag, key) {
        assertNonNullObject(tag, "tag");
        assertNonEmptyString(key, "key");
        return library.FreeImage_SetTagKey(tag, key) === TRUE;
    },
    setTagDescription: function (tag, description) {
        assertNonNullObject(tag, "tag");
        assertNonEmptyString(description, "description");
        return library.FreeImage_SetTagDescription(tag, description) === TRUE;
    },
    setTagID: function (tag, id) {
        assertNonNullObject(tag, "tag");
        assertUnsignedInteger(id, "id");
        return library.FreeImage_SetTagID(tag, id) === TRUE;
    },
    setTagType: function (tag, type) {
        assertNonNullObject(tag, "tag");
        assertMetadataType(type, "type");
        return library.FreeImage_SetTagType(tag, type) === TRUE;
    },
    setTagCount: function (tag, count) {
        assertNonNullObject(tag, "tag");
        assertUnsignedInteger(count, "count");
        return library.FreeImage_SetTagCount(tag, count) === TRUE;
    },
    setTagLength: function (tag, length) {
        assertNonNullObject(tag, "tag");
        assertUnsignedInteger(length, "length");
        return library.FreeImage_SetTagLength(tag, length) === TRUE;
    },
    setTagValue: function (tag, value) {
        assertNonNullObject(tag, "tag");
        assertNonNullObject(value, "value");
        return library.FreeImage_SetTagValue(tag, value) === TRUE;
    },
    // Metadata iterator
    findFirstMetadata: function (model, bitmap, tag) {
        assertMetadataModel(model, "model");
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(tag, "tag");
        return library.FreeImage_FindFirstMetadata(model, bitmap, tag);
    },
    findNextMetadata: function (metadataHandle, tag) {
        assertNonNullObject(metadataHandle, "metadataHandle");
        assertNonNullObject(tag, "tag");
        return library.FreeImage_FindNextMetadata(metadataHandle, tag) === TRUE;
    },
    findCloseMetadata: function (metadataHandle) {
        assertNonNullObject(metadataHandle, "metadataHandle");
        library.FreeImage_FindCloseMetadata(metadataHandle);
    },
    // Metadata accessors
    getMetadata: function (model, bitmap, key, tag) {
        assertMetadataModel(model, "model");
        assertNonNullObject(bitmap, "bitmap");
        assertNonEmptyString(key, "key");
        assertNonNullObject(tag, "tag");
        return library.FreeImage_GetMetadata(model, bitmap, key, tag) === TRUE;
    },
    setMetadata: function (model, bitmap, key, tag) {
        assertMetadataModel(model, "model");
        assertNonNullObject(bitmap, "bitmap");
        assertNonEmptyString(key, "key");
        assertNonNullObject(tag, "tag");
        return library.FreeImage_SetMetadata(model, bitmap, key, tag) === TRUE;
    },
    // Metadata helper functions
    getMetadataCount: function (model, bitmap) {
        assertMetadataModel(model, "model");
        assertNonNullObject(bitmap, "bitmap");
        return library.FreeImage_GetMetadataCount(model, bitmap);
    },
    cloneMetadata: function (dstBitmap, srcBitmap) {
        assertNonNullObject(dstBitmap, "dstBitmap");
        assertNonNullObject(srcBitmap, "srcBitmap");
        return library.FreeImage_CloneMetadata(dstBitmap, srcBitmap) === TRUE;
    },
    tagToString: function (model, tag) {
        assertMetadataModel(model, "model");
        assertNonNullObject(tag, "tag");
        return library.FreeImage_TagToString(model, tag, ref.NULL);
    },
    // TOOLKIT FUNCTION REFERENCE
    // Rotation and flipping
    rotate: function (bitmap, angle, color) {
        color = setToDefaultIfUndefined(color, ref.NULL);
        assertNonNullObject(bitmap, "bitmap");
        assertDouble(angle, "angle");
        assertObject(color, "color");
        return library.FreeImage_Rotate(bitmap, angle, color);
    },
    rotateEx: function (bitmap, angle, xShift, yShift, xOrigin, yOrigin, useMask) {
        assertNonNullObject(bitmap, "bitmap");
        assertDouble(angle, "angle");
        assertDouble(xShift, "xShift");
        assertDouble(yShift, "yShift");
        assertDouble(xOrigin, "xOrigin");
        assertDouble(yOrigin, "yOrigin");
        assertBoolean(useMask, "useMask");
        return library.FreeImage_RotateEx(bitmap, angle, xShift, yShift, xOrigin, yOrigin, useMask ? TRUE : FALSE);
    },
    flipHorizontal: function (bitmap) {
        assertNonNullObject(bitmap, "bitmap");
        return library.FreeImage_FlipHorizontal(bitmap) === TRUE;
    },
    flipVertical: function (bitmap) {
        assertNonNullObject(bitmap, "bitmap");
        return library.FreeImage_FlipVertical(bitmap) === TRUE;
    },
    // Upsampling / downsampling
    rescale: function (bitmap, width, height, filter) {
        filter = setToDefaultIfUndefined(filter, this.FILTER.CATMULLROM);
        assertNonNullObject(bitmap, "bitmap");
        assertInteger(width, "width");
        assertInteger(height, "height");
        assertFilter(filter, "filter");
        return library.FreeImage_Rescale(bitmap, width, height, filter);
    },
    makeThumbnail: function (bitmap, maxSize, convert) {
        convert = setToDefaultIfUndefined(convert, true);
        assertNonNullObject(bitmap, "bitmap");
        assertInteger(maxSize, "maxSize");
        assertBoolean(convert, "convert");
        return library.FreeImage_MakeThumbnail(bitmap, maxSize, convert ? TRUE : FALSE);
    },
    // Color manipulation
    adjustCurve: function (bitmap, lookupTable, channel) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(lookupTable, "lookupTable");
        assertColorChannel(channel, "channel");
        return library.FreeImage_AdjustCurve(bitmap, lookupTable, channel) === TRUE;
    },
    adjustGamma: function (bitmap, gamma) {
        assertNonNullObject(bitmap, "bitmap");
        assertDouble(gamma, "gamma");
        return library.FreeImage_AdjustGamma(bitmap, gamma) === TRUE;
    },
    adjustBrightness: function (bitmap, percentage) {
        assertNonNullObject(bitmap, "bitmap");
        assertDouble(percentage, "percentage");
        return library.FreeImage_AdjustBrightness(bitmap, percentage) === TRUE;
    },
    adjustContrast: function (bitmap, percentage) {
        assertNonNullObject(bitmap, "bitmap");
        assertDouble(percentage, "percentage");
        return library.FreeImage_AdjustContrast(bitmap, percentage) === TRUE;
    },
    invert: function (bitmap) {
        assertNonNullObject(bitmap, "bitmap");
        return library.FreeImage_Invert(bitmap) === TRUE;
    },
    getHistogram: function (bitmap, histogram, channel) {
        channel = setToDefaultIfUndefined(channel, this.COLOR_CHANNEL.BLACK);
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(histogram, "histogram");
        assertColorChannel(channel, "channel");
        return library.FreeImage_GetHistogram(bitmap, histogram, channel) === TRUE;
    },
    getAdjustColorsLookupTable: function (lookupTable, brightness, contrast, gamma, invert) {
        assertNonNullObject(lookupTable, "lookupTable");
        assertDouble(brightness, "brightness");
        assertDouble(contrast, "contrast");
        assertDouble(gamma, "gamma");
        assertBoolean(invert, "invert");
        return library.FreeImage_GetAdjustColorsLookupTable(lookupTable, brightness, contrast, gamma, invert ? TRUE : FALSE);
    },
    adjustColors: function (bitmap, brightness, contrast, gamma, invert) {
        invert = setToDefaultIfUndefined(invert, false);
        assertNonNullObject(bitmap, "bitmap");
        assertDouble(brightness, "brightness");
        assertDouble(contrast, "contrast");
        assertDouble(gamma, "gamma");
        assertBoolean(invert, "invert");
        return library.FreeImage_AdjustColors(bitmap, brightness, contrast, gamma, invert ? TRUE : FALSE) === TRUE;
    },
    applyColorMapping: function (bitmap, srcColors, dstColors, count, ignoreAlpha, swap) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(srcColors, "srcColors");
        assertNonNullObject(dstColors, "dstColors");
        assertUnsignedInteger(count, "count");
        assertBoolean(ignoreAlpha, "ignoreAlpha");
        assertBoolean(swap, "swap");
        return library.FreeImage_ApplyColorMapping(bitmap, srcColors, dstColors, count, ignoreAlpha ? TRUE : FALSE, swap ? TRUE : FALSE);
    },
    swapColors: function (bitmap, colorA, colorB, ignoreAlpha) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(colorA, "colorA");
        assertNonNullObject(colorB, "colorB");
        assertBoolean(ignoreAlpha, "ignoreAlpha");
        return library.FreeImage_SwapColors(bitmap, colorA, colorB, ignoreAlpha ? TRUE : FALSE);
    },
    applyPaletteIndexMapping: function (bitmap, srcIndices, dstIndices, count, swap) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(srcIndices, "srcIndices");
        assertNonNullObject(dstIndices, "dstIndices");
        assertUnsignedInteger(count, "count");
        assertBoolean(swap, "swap");
        return library.FreeImage_ApplyPaletteIndexMapping(bitmap, srcIndices, dstIndices, count, swap ? TRUE : FALSE);
    },
    swapPaletteIndices: function (bitmap, indexA, indexB) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(indexA, "indexA");
        assertNonNullObject(indexB, "indexB");
        return library.FreeImage_SwapPaletteIndices(bitmap, indexA, indexB);
    },
    // Channel processing
    getChannel: function (bitmap, channel) {
        assertNonNullObject(bitmap, "bitmap");
        assertColorChannel(channel, "channel");
        return library.FreeImage_GetChannel(bitmap, channel);
    },
    setChannel: function (bitmap, channelBitmap, channel) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(channelBitmap, "channelBitmap");
        assertColorChannel(channel, "channel");
        return library.FreeImage_SetChannel(bitmap, channelBitmap, channel) === TRUE;
    },
    getComplexChannel: function (bitmap, channel) {
        assertNonNullObject(bitmap, "bitmap");
        assertColorChannel(channel, "channel");
        return library.FreeImage_GetComplexChannel(bitmap, channel);
    },
    setComplexChannel: function (bitmap, channelBitmap, channel) {
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(channelBitmap, "channelBitmap");
        assertColorChannel(channel, "channel");
        return library.FreeImage_SetComplexChannel(bitmap, channelBitmap, channel) === TRUE;
    },
    // Copy / Paste / Composite routines
    copy: function (bitmap, left, top, right, bottom) {
        assertNonNullObject(bitmap, "bitmap");
        assertInteger(left, "left");
        assertInteger(top, "top");
        assertInteger(right, "right");
        assertInteger(bottom, "bottom");
        return library.FreeImage_Copy(bitmap, left, top, right, bottom);
    },
    paste: function (dstBitmap, srcBitmap, left, top, alpha) {
        assertNonNullObject(dstBitmap, "dstBitmap");
        assertNonNullObject(srcBitmap, "srcBitmap");
        assertInteger(left, "left");
        assertInteger(top, "top");
        assertInteger(alpha, "alpha");
        return library.FreeImage_Paste(dstBitmap, srcBitmap, left, top, alpha) === TRUE;
    },
    composite: function (bitmap, useOwnBackgroundColor, backgroundColorToUse, backgroundBitmapToUse) {
        useOwnBackgroundColor = setToDefaultIfUndefined(useOwnBackgroundColor, false);
        backgroundColorToUse = setToDefaultIfUndefined(backgroundColorToUse, ref.NULL);
        backgroundBitmapToUse = setToDefaultIfUndefined(backgroundBitmapToUse, ref.NULL);
        assertNonNullObject(bitmap, "bitmap");
        assertBoolean(useOwnBackgroundColor, "useOwnBackgroundColor");
        assertObject(backgroundColorToUse, "backgroundColorToUse");
        assertObject(backgroundBitmapToUse, "backgroundBitmapToUse")
        return library.FreeImage_Composite(bitmap, useOwnBackgroundColor ? TRUE : FALSE, backgroundColorToUse, backgroundBitmapToUse);
    },
    preMultiplyWithAlpha: function (bitmap) {
        assertNonNullObject(bitmap, "bitmap");
        return library.FreeImage_PreMultiplyWithAlpha(bitmap) === TRUE;
    },
    // JPEG lossless transformations
    jpegTransform: function (srcFileName, dstFileName, jpegOperation, perfect) {
        perfect = setToDefaultIfUndefined(perfect, true);
        assertNonEmptyString(srcFileName, "srcFileName");
        assertNonEmptyString(dstFileName, "dstFileName");
        assertJpegOperation(jpegOperation, "jpegOperation");
        assertBoolean(perfect, "perfect");
        return library.FreeImage_JPEGTransform(srcFileName, dstFileName, jpegOperation, perfect ? TRUE : FALSE) === TRUE;
    },
    jpegCrop: function (srcFileName, dstFileName, left, top, right, bottom) {
        assertNonEmptyString(srcFileName, "srcFileName");
        assertNonEmptyString(dstFileName, "dstFileName");
        assertInteger(left, "left");
        assertInteger(top, "top");
        assertInteger(right, "right");
        assertInteger(bottom, "bottom");
        return library.FreeImage_JPEGCrop(srcFileName, dstFileName, left, top, right, bottom) === TRUE;
    },
    //jpegTransformCombined: function (srcFileName, dstFileName, jpegOperation, left, top, right, bottom, perfect) {
    //  perfect = setToDefaultIfUndefined(perfect, true);
    //  assertNonEmptyString(srcFileName, "srcFileName");
    //  assertNonEmptyString(dstFileName, "dstFileName");
    //  assertJpegOperation(jpegOperation, "jpegOperation");
    //  assertObject(left, "left");
    //  assertObject(top, "top");
    //  assertObject(right, "right");
    //  assertObject(bottom, "bottom");
    //  assertBoolean(perfect, "perfect");
    //  return library.FreeImage_JPEGTransformCombined(srcFileName, dstFileName, jpegOperation, left, top, right, bottom, perfect ? TRUE : FALSE) === TRUE;
    //},
    // Background filling
    fillBackground: function (bitmap, color, options) {
        options = setToDefaultIfUndefined(options, 0);
        assertNonNullObject(bitmap, "bitmap");
        assertNonNullObject(color, "color");
        assertInteger(options, "options");
        return library.FreeImage_FillBackground(bitmap, color, options) === TRUE;
    },
    enlargeCanvas: function (bitmap, left, top, right, bottom, color, options) {
        options = setToDefaultIfUndefined(options, 0);
        assertNonNullObject(bitmap, "bitmap");
        assertInteger(left, "left");
        assertInteger(top, "top");
        assertInteger(right, "right");
        assertInteger(bottom, "bottom");
        assertNonNullObject(color, "color");
        assertInteger(options, "options");
        return library.FreeImage_EnlargeCanvas(bitmap, left, top, right, bottom, color, options);
    },
    allocateEx: function (width, height, bpp, color, options, palette, redMask, greenMask, blueMask) {
        options = setToDefaultIfUndefined(options, 0);
        palette = setToDefaultIfUndefined(palette, ref.NULL);
        redMask = setToDefaultIfUndefined(redMask, 0);
        greenMask = setToDefaultIfUndefined(greenMask, 0);
        blueMask = setToDefaultIfUndefined(blueMask, 0);
        assertInteger(width, "width");
        assertInteger(height, "height");
        assertInteger(bpp, "bpp");
        assertNonNullObject(color, "color");
        assertInteger(options, "options");
        assertObject(palette, "palette");
        assertUnsignedInteger(redMask, "redMask");
        assertUnsignedInteger(greenMask, "greenMask");
        assertUnsignedInteger(blueMask, "blueMask");
        return library.FreeImage_AllocateEx(width, height, bpp, color, options, palette, redMask, greenMask, blueMask);
    },
    allocateExT: function (type, width, height, bpp, color, options, palette, redMask, greenMask, blueMask) {
        options = setToDefaultIfUndefined(options, 0);
        palette = setToDefaultIfUndefined(palette, ref.NULL);
        redMask = setToDefaultIfUndefined(redMask, 0);
        greenMask = setToDefaultIfUndefined(greenMask, 0);
        blueMask = setToDefaultIfUndefined(blueMask, 0);
        assertImageType(type, "type");
        assertInteger(width, "width");
        assertInteger(height, "height");
        assertInteger(bpp, "bpp");
        assertNonNullObject(color, "color");
        assertInteger(options, "options");
        assertObject(palette, "palette");
        assertUnsignedInteger(redMask, "redMask");
        assertUnsignedInteger(greenMask, "greenMask");
        assertUnsignedInteger(blueMask, "blueMask");
        return library.FreeImage_AllocateExT(type, width, height, bpp, color, options, palette, redMask, greenMask, blueMask);
    },
    // Miscellaneous algorithms
    multigridPoissonSolver: function (laplacian, nCycles) {
        nCycles = setToDefaultIfUndefined(nCycles, 3);
        assertNonNullObject(laplacian, "laplacian");
        assertInteger(nCycles, "nCycles");
        return library.FreeImage_MultigridPoissonSolver(laplacian, nCycles);
    }
}

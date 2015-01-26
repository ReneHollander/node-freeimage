var should = require("chai").should(),
    fs = require('fs'),
    ref = require("ref"),
    RefArray = require("ref-array"),
    RefStruct = require("ref-struct"),
    fi = require("../index"),
    // Types
    BYTE = ref.types.uint8,
    INT = ref.types.int32,
    RGBQUAD = RefStruct({
      rgbBlue: BYTE,
      rgbGreen: BYTE,
      rgbRed: BYTE,
      rgbReserved: BYTE
    }),
    Palette = RefArray(RGBQUAD),
    TransparencyTable = RefArray(BYTE),
    ByteArray = RefArray(BYTE),
    IntArray = RefArray(INT),
    // Constants
    BYTES_TO_BITS = 8,
    INCHES_TO_METERS = 0.0254,
    BITMAPINFOHEADER_SIZE = 40,
    RGBQUAD_SIZE = 4,
    DWORD_SIZE = 4,
    INT_SIZE = 4,
    BLACK = new RGBQUAD({ rgbBlue: 0, rgbGreen: 0, rgbRed: 0, rgbReserved: 0 }),
    WHITE = new RGBQUAD({ rgbBlue: 255, rgbGreen: 255, rgbRed: 255, rgbReserved: 0 }),
    GRAY = new RGBQUAD({ rgbBlue: 128, rgbGreen: 128, rgbRed: 128, rgbReserved: 0 }),
    SILVER = new RGBQUAD({ rgbBlue: 192, rgbGreen: 192, rgbRed: 192, rgbReserved: 0 }),
    RED = new RGBQUAD({ rgbBlue: 0, rgbGreen: 0, rgbRed: 255, rgbReserved: 0 }),
    LIME = new RGBQUAD({ rgbBlue: 0, rgbGreen: 255, rgbRed: 0, rgbReserved: 0 }),
    BLUE = new RGBQUAD({ rgbBlue: 255, rgbGreen: 0, rgbRed: 0, rgbReserved: 0 }),
    AQUA = new RGBQUAD({ rgbBlue: 255, rgbGreen: 255, rgbRed: 0, rgbReserved: 0 }),
    FUCHSIA = new RGBQUAD({ rgbBlue: 255, rgbGreen: 0, rgbRed: 255, rgbReserved: 0 }),
    YELLOW = new RGBQUAD({ rgbBlue: 0, rgbGreen: 255, rgbRed: 255, rgbReserved: 0 }),
    MAROON = new RGBQUAD({ rgbBlue: 0, rgbGreen: 0, rgbRed: 128, rgbReserved: 0 }),
    GREEN = new RGBQUAD({ rgbBlue: 0, rgbGreen: 128, rgbRed: 0, rgbReserved: 0 }),
    NAVY = new RGBQUAD({ rgbBlue: 128, rgbGreen: 0, rgbRed: 0, rgbReserved: 0 }),
    TEAL = new RGBQUAD({ rgbBlue: 128, rgbGreen: 128, rgbRed: 0, rgbReserved: 0 }),
    PURPLE = new RGBQUAD({ rgbBlue: 128, rgbGreen: 0, rgbRed: 128, rgbReserved: 0 }),
    OLIVE = new RGBQUAD({ rgbBlue: 0, rgbGreen: 128, rgbRed: 128, rgbReserved: 0 }),
    // Properties of temporary bitmap #1
    TEMP_BITMAP_01_FILENAME = __dirname + "/temp-01.png",
    TEMP_BITMAP_01_IMAGE_TYPE = fi.IMAGE_TYPE.BITMAP,
    TEMP_BITMAP_01_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEMP_BITMAP_01_WIDTH = 16,
    TEMP_BITMAP_01_HEIGHT = 16,
    TEMP_BITMAP_01_BPP = 24,
    TEMP_BITMAP_01_DPI_X = 96,
    TEMP_BITMAP_01_DPI_Y = 96,
    TEMP_BITMAP_01_DPM_X = Math.round(TEMP_BITMAP_01_DPI_X / INCHES_TO_METERS),
    TEMP_BITMAP_01_DPM_Y = Math.round(TEMP_BITMAP_01_DPI_Y / INCHES_TO_METERS),
    // Properties of temporary bitmap #2
    TEMP_BITMAP_02_FILENAME = __dirname + "/temp-02.png",
    TEMP_BITMAP_02_IMAGE_TYPE = fi.IMAGE_TYPE.BITMAP,
    TEMP_BITMAP_02_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEMP_BITMAP_02_WIDTH = 16,
    TEMP_BITMAP_02_HEIGHT = 16,
    TEMP_BITMAP_02_BPP = 4,
    TEMP_BITMAP_02_COLOR_COUNT = Math.pow(2, TEMP_BITMAP_02_BPP),
    TEMP_BITMAP_02_PALETTE = [
      BLACK, WHITE, GRAY, SILVER, 
      RED, LIME, BLUE, AQUA, FUCHSIA, YELLOW,
      MAROON, GREEN, NAVY, TEAL, PURPLE, OLIVE
    ],
    TEMP_BITMAP_02_TRANSPARENCY_TABLE = [
      255, 255, 255, 255, 
      255, 255, 255, 255, 0, 255,
      255, 255, 255, 255, 255, 255
    ],
    // Properties of test bitmap #1
    TEST_BITMAP_01_FILENAME = __dirname + "/test-01.png",
    TEST_BITMAP_01_IMAGE_TYPE = fi.IMAGE_TYPE.BITMAP,
    TEST_BITMAP_01_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEST_BITMAP_01_WIDTH = 16,
    TEST_BITMAP_01_HEIGHT = 16,
    TEST_BITMAP_01_BPP = 32,
    TEST_BITMAP_01_PALETTE_SIZE = 0,
    TEST_BITMAP_01_LINE = TEST_BITMAP_01_WIDTH * TEST_BITMAP_01_BPP / BYTES_TO_BITS,
    TEST_BITMAP_01_PITCH = TEST_BITMAP_01_WIDTH * TEST_BITMAP_01_BPP / BYTES_TO_BITS,
    TEST_BITMAP_01_DIB_SIZE = BITMAPINFOHEADER_SIZE + TEST_BITMAP_01_PALETTE_SIZE + TEST_BITMAP_01_PITCH * TEST_BITMAP_01_HEIGHT,
    TEST_BITMAP_01_DPI_X = 96,
    TEST_BITMAP_01_DPI_Y = 96,
    TEST_BITMAP_01_DPM_X = Math.round(TEST_BITMAP_01_DPI_X / INCHES_TO_METERS),
    TEST_BITMAP_01_DPM_Y = Math.round(TEST_BITMAP_01_DPI_Y / INCHES_TO_METERS),
    TEST_BITMAP_01_COLOR_TYPE = fi.COLOR_TYPE.RGBALPHA,
    TEST_BITMAP_01_RED_MASK = fi.RGBA_MASK.RED,
    TEST_BITMAP_01_GREEN_MASK = fi.RGBA_MASK.GREEN,
    TEST_BITMAP_01_BLUE_MASK = fi.RGBA_MASK.BLUE,
    // Properties of test bitmap #2
    TEST_BITMAP_02_FILENAME = __dirname + "/test-02.png",
    TEST_BITMAP_02_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEST_BITMAP_02_BPP = 4,
    TEST_BITMAP_02_COLOR_COUNT = Math.pow(2, TEST_BITMAP_02_BPP),
    TEST_BITMAP_02_PALETTE = [
      BLACK, MAROON, GREEN, OLIVE, NAVY, PURPLE, TEAL, GRAY,
      SILVER, RED, LIME, YELLOW, BLUE, FUCHSIA, AQUA, WHITE
    ],
    TEST_BITMAP_02_TRANSPARENCY_TABLE = [
      255, 255, 255, 255, 255, 255, 255, 255, 
      255, 255, 255, 255, 255, 0, 255, 255
    ],
    // Properties of test bitmap #3
    TEST_BITMAP_03_FILENAME = __dirname + "/test-03.png",
    TEST_BITMAP_03_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEST_BITMAP_03_WIDTH = 2,
    TEST_BITMAP_03_HEIGHT = 2,
    TEST_BITMAP_03_BPP = 24,
    TEST_BITMAP_03_PITCH = Math.ceil((TEST_BITMAP_03_WIDTH * TEST_BITMAP_03_BPP / BYTES_TO_BITS) / DWORD_SIZE) * DWORD_SIZE,
    TEST_BITMAP_03_PIXEL_COLORS = [ 
      BLUE, BLACK,
      RED, LIME
    ],
    TEST_BITMAP_03_TEST_PIXEL_COLOR = MAROON,
    // Properties of test bitmap #4
    TEST_BITMAP_04_FILENAME = __dirname + "/test-04.png",
    TEST_BITMAP_04_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    // Properties of test bitmap #5
    TEST_BITMAP_05_FILENAME = __dirname + "/test-05.tif",
    TEST_BITMAP_05_IMAGE_FORMAT = fi.IMAGE_FORMAT.TIFF,
    TEST_BITMAP_05_PAGE_COUNT = 3;
    TEST_BITMAP_05_PAGE_WIDTH = 6;
    TEST_BITMAP_05_PAGE_HEIGHT = 7;
    
describe("BITMAP FUNCTION REFERENCE", function () {    
  describe("General functions", function () {
    describe("fi.getVersion", function () {
      it("should return major, minor and patch version", function () {
        fi.getVersion().should.match(/^\d+\.\d+\.\d+$/);
      });
    });
    
    describe("fi.getCopyrightMessage", function () {
      it("should return a string containing \"FreeImage\"", function () {
        fi.getCopyrightMessage().should.have.string("FreeImage");
      });
    });
  });

  describe("Bitmap management functions", function () {
    describe("fi.allocate", function () {
      it("should be able to create a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_01_WIDTH, TEMP_BITMAP_01_HEIGHT, TEMP_BITMAP_01_BPP);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    }); 
    
    describe("fi.allocateT", function () {
      it("should be able to create a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_01_IMAGE_TYPE, TEMP_BITMAP_01_WIDTH, TEMP_BITMAP_01_HEIGHT, TEMP_BITMAP_01_BPP);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });
    
    describe("fi.load", function () {
      it("should be able to load a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });

    describe("fi.save", function () {
      it("should be able to save a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_01_WIDTH, TEMP_BITMAP_01_HEIGHT, TEMP_BITMAP_01_BPP),
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.save(TEMP_BITMAP_01_IMAGE_FORMAT, bitmap, TEMP_BITMAP_01_FILENAME);
        success.should.be.true();
        fi.unload(bitmap);
        fs.unlinkSync(TEMP_BITMAP_01_FILENAME);
      });
    });
    
    describe("fi.clone", function () {
      it("should be able to clone a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_01_WIDTH, TEMP_BITMAP_01_HEIGHT, TEMP_BITMAP_01_BPP),
            bitmap2 = null;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.clone(bitmap);
        bitmap2.isNull().should.be.false();
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    }); 
  });

  describe("Bitmap information functions", function () {
    describe("fi.getImageType", function () {
      it("should be able to get the type of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            type = -1;
        bitmap.isNull().should.be.false();
        type = fi.getImageType(bitmap);
        type.should.equal(TEST_BITMAP_01_IMAGE_TYPE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getColorsUsed", function () {
      it("should be able to get the palette size (!) of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            paletteSize = -1;
        bitmap.isNull().should.be.false();
        paletteSize = fi.getColorsUsed(bitmap);
        paletteSize.should.equal(TEST_BITMAP_01_PALETTE_SIZE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getBPP", function () {
      it("should be able to get the size of one pixel in the bitmap in bits", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bpp = -1;
        bitmap.isNull().should.be.false();
        bpp = fi.getBPP(bitmap);
        bpp.should.equal(TEST_BITMAP_01_BPP);
        fi.unload(bitmap);
      });
    });

    describe("fi.getWidth", function () {
      it("should be able to get the width of a bitmap in pixels", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            width = -1;
        bitmap.isNull().should.be.false();
        width = fi.getWidth(bitmap);
        width.should.equal(TEST_BITMAP_01_WIDTH);
        fi.unload(bitmap);
      });
    });

    describe("fi.getHeight", function () {
      it("should be able to get the height of a bitmap in pixels", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            height = -1;
        bitmap.isNull().should.be.false();
        height = fi.getHeight(bitmap);
        height.should.equal(TEST_BITMAP_01_HEIGHT);
        fi.unload(bitmap);
      });
    });

    describe("fi.getLine", function () {
      it("should be able to get the width of a bitmap in bytes", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            line = -1;
        bitmap.isNull().should.be.false();
        line = fi.getLine(bitmap);
        line.should.equal(TEST_BITMAP_01_LINE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getPitch", function () {
      it("should be able to get the pitch (scan width) of a bitmap in bytes", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            pitch = -1;
        bitmap.isNull().should.be.false();
        pitch = fi.getPitch(bitmap);
        pitch.should.equal(TEST_BITMAP_01_PITCH);
        fi.unload(bitmap);
      });
    });

    describe("fi.getDIBSize", function () {
      it("should be able to get the DIB size of a bitmap in bytes", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            dibSize = -1;
        bitmap.isNull().should.be.false();
        dibSize = fi.getDIBSize(bitmap);
        dibSize.should.equal(TEST_BITMAP_01_DIB_SIZE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getPalette", function () {
      it("should return null for a non-palettized bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            palette = null;
        bitmap.isNull().should.be.false();
        palette = fi.getPalette(bitmap);
        palette.isNull().should.be.true();
        fi.unload(bitmap);
      });
      
      it("should be able to get the palette of a palettized bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_02_IMAGE_FORMAT, TEST_BITMAP_02_FILENAME),
            palette = null,
            palette2 = null,
            i = -1;
        bitmap.isNull().should.be.false();
        palette = fi.getPalette(bitmap);
        palette.isNull().should.be.false();
        palette2 = new Palette(ref.reinterpret(palette, TEST_BITMAP_02_COLOR_COUNT * RGBQUAD_SIZE, 0));
        for (i = 0; i < TEST_BITMAP_02_COLOR_COUNT; i += 1) {
          palette2[i].rgbBlue.should.equal(TEST_BITMAP_02_PALETTE[i].rgbBlue);
          palette2[i].rgbGreen.should.equal(TEST_BITMAP_02_PALETTE[i].rgbGreen);
          palette2[i].rgbRed.should.equal(TEST_BITMAP_02_PALETTE[i].rgbRed);
          palette2[i].rgbReserved.should.equal(TEST_BITMAP_02_PALETTE[i].rgbReserved);
        }
        fi.unload(bitmap);
      });
    });

    describe("fi.getDotsPerMeterX", function () {
      it("should be able to get the X-resolution of a bitmap in dpm", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            dpmX = -1;
        bitmap.isNull().should.be.false();
        dpmX = fi.getDotsPerMeterX(bitmap);
        dpmX.should.equal(TEST_BITMAP_01_DPM_X);
        fi.unload(bitmap);
      });
    });

    describe("fi.getDotsPerMeterY", function () {
      it("should be able to get the Y-resolution of a bitmap in dpm", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            dpmY = -1;
        bitmap.isNull().should.be.false();
        dpmY = fi.getDotsPerMeterY(bitmap);
        dpmY.should.equal(TEST_BITMAP_01_DPM_Y);
        fi.unload(bitmap);
      });
    });

    describe("fi.setDotsPerMeterX", function () {
      it("should be able to set the X-resolution of a bitmap in dpm", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_01_WIDTH, TEMP_BITMAP_01_HEIGHT, TEMP_BITMAP_01_BPP),
            dpmX = TEMP_BITMAP_01_DPM_X;
        bitmap.isNull().should.be.false();
        fi.setDotsPerMeterX(bitmap, dpmX);
        dpmX = fi.getDotsPerMeterX(bitmap);
        dpmX.should.equal(dpmX);
        fi.unload(bitmap);
      });
    });

    describe("fi.setDotsPerMeterY", function () {
      it("should be able to set the Y-resolution of a bitmap in dpm", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_01_WIDTH, TEMP_BITMAP_01_HEIGHT, TEMP_BITMAP_01_BPP),
            dpmY = TEMP_BITMAP_01_DPM_Y;
        bitmap.isNull().should.be.false();
        fi.setDotsPerMeterY(bitmap, dpmY);
        dpmY = fi.getDotsPerMeterY(bitmap);
        dpmY.should.equal(dpmY);
        fi.unload(bitmap);
      });
    });

    describe("fi.getInfoHeader", function () {
      it("should be able to get the BITMAPINFOHEADER of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            infoHeader = null;
        bitmap.isNull().should.be.false();
        infoHeader = fi.getInfoHeader(bitmap);
        infoHeader.isNull().should.be.false();
        infoHeader = infoHeader.deref();
        infoHeader.biSize.should.equal(BITMAPINFOHEADER_SIZE);
        infoHeader.biWidth.should.equal(TEST_BITMAP_01_WIDTH);
        infoHeader.biHeight.should.equal(TEST_BITMAP_01_HEIGHT);
        infoHeader.biPlanes.should.equal(1);
        infoHeader.biBitCount.should.equal(TEST_BITMAP_01_BPP);
        infoHeader.biCompression.should.equal(0);
        infoHeader.biSizeImage.should.equal(0);
        infoHeader.biXPelsPerMeter.should.equal(TEST_BITMAP_01_DPM_X);
        infoHeader.biYPelsPerMeter.should.equal(TEST_BITMAP_01_DPM_Y);
        infoHeader.biClrUsed.should.equal(0);
        infoHeader.biClrImportant.should.equal(0);
        fi.unload(bitmap);
      });
    });

    describe("fi.getInfo", function () {
      it("should be able to get the BITMAPINFO of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            info = null;
        bitmap.isNull().should.be.false();
        info = fi.getInfo(bitmap);
        info.isNull().should.be.false();
        info = info.deref();
        info.bmiHeader.biSize.should.equal(BITMAPINFOHEADER_SIZE);
        info.bmiHeader.biWidth.should.equal(TEST_BITMAP_01_WIDTH);
        info.bmiHeader.biHeight.should.equal(TEST_BITMAP_01_HEIGHT);
        info.bmiHeader.biPlanes.should.equal(1);
        info.bmiHeader.biBitCount.should.equal(TEST_BITMAP_01_BPP);
        info.bmiHeader.biCompression.should.equal(0);
        info.bmiHeader.biSizeImage.should.equal(0);
        info.bmiHeader.biXPelsPerMeter.should.equal(TEST_BITMAP_01_DPM_X);
        info.bmiHeader.biYPelsPerMeter.should.equal(TEST_BITMAP_01_DPM_Y);
        info.bmiHeader.biClrUsed.should.equal(0);
        info.bmiHeader.biClrImportant.should.equal(0);
        info.bmiColors.length.should.equal(0);
        fi.unload(bitmap);
      });
    });

    describe("fi.getColorType", function () {
      it("should be able to get the color type of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            colorType = -1;
        bitmap.isNull().should.be.false();
        colorType = fi.getColorType(bitmap);
        colorType.should.equal(TEST_BITMAP_01_COLOR_TYPE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getRedMask", function () {
      it("should be able to get the red mask of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            redMask = -1;
        bitmap.isNull().should.be.false();
        redMask = fi.getRedMask(bitmap);
        redMask.should.equal(TEST_BITMAP_01_RED_MASK);
        fi.unload(bitmap);
      });
    });

    describe("fi.getGreenMask", function () {
      it("should be able to get the green mask of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            greenMask = -1;
        bitmap.isNull().should.be.false();
        greenMask = fi.getGreenMask(bitmap);
        greenMask.should.equal(TEST_BITMAP_01_GREEN_MASK);
        fi.unload(bitmap);
      });
    });

    describe("fi.getBlueMask", function () {
      it("should be able to get the blue mask of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            blueMask = -1;
        bitmap.isNull().should.be.false();
        blueMask = fi.getBlueMask(bitmap);
        blueMask.should.equal(TEST_BITMAP_01_BLUE_MASK);
        fi.unload(bitmap);
      });
    });

    describe("fi.getTransparencyCount", function () {
      it("should be able to get the transparency count of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_02_IMAGE_FORMAT, TEST_BITMAP_02_FILENAME),
            count = -1;
        bitmap.isNull().should.be.false();
        count = fi.getTransparencyCount(bitmap);
        count.should.equal(TEST_BITMAP_02_COLOR_COUNT);
        fi.unload(bitmap);
      });
    });

    describe("fi.getTransparencyTable", function () {
      it("should be able to get the transparency table of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_02_IMAGE_FORMAT, TEST_BITMAP_02_FILENAME),
            table = null,
            table2 = null,
            i = -1;
        bitmap.isNull().should.be.false();
        table = fi.getTransparencyTable(bitmap);
        table.isNull().should.be.false();
        table2 = new TransparencyTable(ref.reinterpret(table, TEST_BITMAP_02_COLOR_COUNT, 0));
        for (i = 0; i < TEST_BITMAP_02_COLOR_COUNT; i += 1) {
          table2[i].should.equal(TEST_BITMAP_02_TRANSPARENCY_TABLE[i]);
        }
        fi.unload(bitmap);
      });
    });

    describe("fi.setTransparencyTable", function () {
      it("should be able to set the transparency table of a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_02_WIDTH, TEMP_BITMAP_02_HEIGHT, TEMP_BITMAP_02_BPP),
            table = new Buffer(TEMP_BITMAP_02_TRANSPARENCY_TABLE),
            table2 = null;
        bitmap.isNull().should.be.false();
        fi.setTransparencyTable(bitmap, table, TEMP_BITMAP_02_COLOR_COUNT);
        bitmap.isNull().should.be.false();
        table = fi.getTransparencyTable(bitmap);
        table.isNull().should.be.false();
        table2 = new TransparencyTable(ref.reinterpret(table, TEMP_BITMAP_02_COLOR_COUNT, 0));
        for (i = 0; i < TEMP_BITMAP_02_COLOR_COUNT; i += 1) {
          table2[i].should.equal(TEMP_BITMAP_02_TRANSPARENCY_TABLE[i]);
        }
        fi.unload(bitmap);
      });
    });

    describe("fi.(is|set)Transparent", function () {
      it("should be able to get/set the transparency state of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_02_IMAGE_FORMAT, TEST_BITMAP_02_FILENAME),
            isTransparent = false,
            i = -1;
        bitmap.isNull().should.be.false();
        for (i = 0; i < 5; i += 1) {
          isTransparent = i % 2 === 0;
          fi.setTransparent(bitmap, isTransparent); 
          fi.isTransparent(bitmap).should.equal(isTransparent);
        }
        fi.unload(bitmap);
      });
    });

    describe("fi.(get|set)TransparentIndex", function () {
      it("should be able to get/set the palette index of the transparent color of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_02_IMAGE_FORMAT, TEST_BITMAP_02_FILENAME),
            i = -1;
        bitmap.isNull().should.be.false();
        for (i = 0; i < TEST_BITMAP_02_COLOR_COUNT; i += 1) {
          fi.setTransparentIndex(bitmap, i); 
          fi.getTransparentIndex(bitmap).should.equal(i);
        }
        fi.unload(bitmap);
      });
    });

    describe("fi.(has|get|set)BackgroundColor", function () {
      it("should be able to get/set the background color of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            color = new RGBQUAD(AQUA);
        bitmap.isNull().should.be.false();
        fi.hasBackgroundColor(bitmap).should.be.false();
        fi.getBackgroundColor(bitmap, color.ref()).should.be.false();
        fi.setBackgroundColor(bitmap, color.ref()).should.be.true();
        fi.hasBackgroundColor(bitmap).should.be.true();
        fi.getBackgroundColor(bitmap, color.ref()).should.be.true();
        color.rgbBlue.should.equal(AQUA.rgbBlue);
        color.rgbGreen.should.equal(AQUA.rgbGreen);
        color.rgbRed.should.equal(AQUA.rgbRed);
        color.rgbReserved.should.equal(AQUA.rgbReserved);
        fi.setBackgroundColor(bitmap, ref.NULL).should.be.true();
        fi.hasBackgroundColor(bitmap).should.be.false();
        fi.getBackgroundColor(bitmap, color.ref()).should.be.false();
        fi.unload(bitmap);
      });
    });
    
    describe("fi.hasPixels", function () {
      it("should be able to determine if a bitmap has pixels", function () {
        var bitmap1 = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME, fi.LOAD_SAVE_OPTION.LOAD_NOPIXELS);
        bitmap1.isNull().should.be.false();
        bitmap2.isNull().should.be.false();
        fi.hasPixels(bitmap1).should.be.true();
        fi.hasPixels(bitmap2).should.be.false();
        fi.unload(bitmap2);
        fi.unload(bitmap1);
      });
    });
    
    describe("fi.(get|set)Thumbnail", function () {
      it("should be able to get/set the thumbnail of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            thumbnail = null;
        bitmap.isNull().should.be.false();
        fi.getThumbnail(bitmap).isNull().should.be.true();
        thumbnail = fi.clone(bitmap);
        thumbnail.isNull().should.be.false();
        fi.setThumbnail(bitmap, thumbnail).should.be.true();
        fi.getThumbnail(bitmap).isNull().should.be.false();
        fi.unload(bitmap);
      });
    });
  });

  describe("Filetype functions", function () {
    describe("fi.getFileType", function () {
      it("should be able to get the image format of a bitmap", function () {
        var format = fi.getFileType(TEST_BITMAP_01_FILENAME);
        format.should.equal(TEST_BITMAP_01_IMAGE_FORMAT);
      });
    });
  });

  describe("Pixel access functions", function () {
    describe("fi.getBits", function () {
      it("should be able to get the bits of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            bits = null,
            bits2 = null;
        bitmap.isNull().should.be.false();
        bits = fi.getBits(bitmap);
        bits.isNull().should.be.false();
        bits2 = new ByteArray(ref.reinterpret(bits, TEST_BITMAP_03_PITCH * TEST_BITMAP_03_HEIGHT, 0));
        bits2[0].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbBlue);
        bits2[1].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbGreen);
        bits2[2].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbRed);
        bits2[3].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbBlue);
        bits2[4].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbGreen);
        bits2[5].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbRed);
        bits2[TEST_BITMAP_03_PITCH + 0].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbBlue);
        bits2[TEST_BITMAP_03_PITCH + 1].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbGreen);
        bits2[TEST_BITMAP_03_PITCH + 2].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbRed);
        bits2[TEST_BITMAP_03_PITCH + 3].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbBlue);
        bits2[TEST_BITMAP_03_PITCH + 4].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbGreen);
        bits2[TEST_BITMAP_03_PITCH + 5].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbRed);        
        fi.unload(bitmap);
      });
    });

    describe("fi.getScanLine", function () {
      it("should be able to get the scan lines of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            scanLine = null,
            scanLine2 = null;
        bitmap.isNull().should.be.false();
        scanLine = fi.getScanLine(bitmap, 0);
        scanLine.isNull().should.be.false();
        scanLine2 = new ByteArray(ref.reinterpret(scanLine, TEST_BITMAP_03_PITCH, 0));
        scanLine2[0].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbBlue);
        scanLine2[1].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbGreen);
        scanLine2[2].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbRed);
        scanLine2[3].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbBlue);
        scanLine2[4].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbGreen);
        scanLine2[5].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbRed);
        scanLine = fi.getScanLine(bitmap, 1);
        scanLine.isNull().should.be.false();
        scanLine2 = new ByteArray(ref.reinterpret(scanLine, TEST_BITMAP_03_PITCH, 0));
        scanLine2[0].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbBlue);
        scanLine2[1].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbGreen);
        scanLine2[2].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbRed);
        scanLine2[3].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbBlue);
        scanLine2[4].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbGreen);
        scanLine2[5].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbRed);
        fi.unload(bitmap);
      });
    });
    
    describe("fi.getPixelIndex", function () {
      it("should return false for a non-palettized bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            pixelIndex = ref.alloc(BYTE, 0),
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.getPixelIndex(bitmap, 0, 0, pixelIndex);
        success.should.be.false();
        pixelIndex.deref().should.equal(0);
        fi.unload(bitmap);
      });
    });
    
    describe("fi.getPixelColor", function () {
      it("should be able to get the pixel colors of a non-palettized bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            pixelColor = ref.alloc(RGBQUAD, BLACK),
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.getPixelColor(bitmap, 0, 0, pixelColor);
        success.should.be.true();
        pixelColor.deref().rgbBlue.should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbBlue);
        pixelColor.deref().rgbGreen.should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbGreen);
        pixelColor.deref().rgbRed.should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbRed);
        fi.unload(bitmap);
      });
    });
    
    describe("fi.setPixelIndex", function () {
      it("should return false for a non-palettized bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            pixelIndex = ref.alloc(BYTE, 0),
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.setPixelIndex(bitmap, 0, 0, pixelIndex);
        success.should.be.false();
        pixelIndex.deref().should.equal(0);
        fi.unload(bitmap);
      });
    });
    
    describe("fi.setPixelColor", function () {
      it("should be able to set the pixel colors of a non-palettized bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            pixelColor = ref.alloc(RGBQUAD, TEST_BITMAP_03_TEST_PIXEL_COLOR),
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.setPixelColor(bitmap, 0, 0, pixelColor);
        success.should.be.true();
        success = fi.getPixelColor(bitmap, 0, 0, pixelColor);
        success.should.be.true();
        pixelColor.deref().rgbBlue.should.equal(TEST_BITMAP_03_TEST_PIXEL_COLOR.rgbBlue);
        pixelColor.deref().rgbGreen.should.equal(TEST_BITMAP_03_TEST_PIXEL_COLOR.rgbGreen);
        pixelColor.deref().rgbRed.should.equal(TEST_BITMAP_03_TEST_PIXEL_COLOR.rgbRed);
        fi.unload(bitmap);
      });
    });
  });

  describe("Conversion functions", function () {
    describe("fi.convertTo4Bits", function () {
      it("should be able to convert a 32-bit bitmap to a 4-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertTo4Bits(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(4);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertTo8Bits", function () {
      it("should be able to convert a 32-bit bitmap to an 8-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertTo8Bits(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(8);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToGreyscale", function () {
      it("should be able to convert a 32-bit bitmap to a greyscale one", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToGreyscale(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(8);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertTo16Bits555", function () {
      it("should be able to convert a 32-bit bitmap to a 16-bit one (555)", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertTo16Bits555(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(16);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertTo16Bits565", function () {
      it("should be able to convert a 32-bit bitmap to a 16-bit one (565)", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertTo16Bits565(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(16);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertTo24Bits", function () {
      it("should be able to convert a 32-bit bitmap to a 24-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertTo24Bits(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(24);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertTo32Bits", function () {
      it("should be able to convert a 4-bit bitmap to a 32-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_02_IMAGE_FORMAT, TEST_BITMAP_02_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertTo32Bits(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(32);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.colorQuantize", function () {
      it("should be able to quantize a 24-bit bitmap (Wu)", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.colorQuantize(bitmap, fi.QUANTIZATION.WUQUANT);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(8);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.colorQuantizeEx", function () {
      it("should be able to quantize a 24-bit bitmap (Wu)", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.colorQuantizeEx(bitmap, fi.QUANTIZATION.WUQUANT);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(8);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.threshold", function () {
      it("should be able to convert a 32-bit bitmap to a 1-bit one using a threshold", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.threshold(bitmap, 150);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(1);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.dither", function () {
      it("should be able to convert a 32-bit bitmap to a 1-bit one using dithering", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.dither(bitmap, fi.DITHERING.FS);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(1);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });
    
    describe("fi.convertFromRawBits", function () {
      it("should be able to create a bitmap from a pixel color array", function () {
        var width = 2,
            height = 2,
            bpp = 24,
            pitch = width * bpp / BYTES_TO_BITS,
            bits = ref.reinterpret(new Buffer([
              0, 255, 255,
              0, 0, 0,
              255, 255, 0,
              255, 0, 255
            ]), height * pitch, 0),
            bitmap = null;
        bitmap = fi.convertFromRawBits(
          bits,
          width, height, pitch, bpp,
          fi.RGBA_MASK.RED, fi.RGBA_MASK.GREEN, fi.RGBA_MASK.BLUE
        );
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToRawBits", function () {
      it("should be able to convert a bitmap to a pixel color array", function () {
        var bitmap = fi.load(TEST_BITMAP_03_IMAGE_FORMAT, TEST_BITMAP_03_FILENAME),
            pitch = TEST_BITMAP_03_WIDTH * TEST_BITMAP_03_BPP / BYTES_TO_BITS,
            bits = new Buffer(TEST_BITMAP_03_HEIGHT * pitch);
        bitmap.isNull().should.be.false();
        fi.convertToRawBits(
          bits, bitmap,
          pitch, TEST_BITMAP_03_BPP,
          fi.RGBA_MASK.RED, fi.RGBA_MASK.GREEN, fi.RGBA_MASK.BLUE,
          true
        );
        bits[0].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbBlue);
        bits[1].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbGreen);
        bits[2].should.equal(TEST_BITMAP_03_PIXEL_COLORS[2].rgbRed);
        bits[3].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbBlue);
        bits[4].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbGreen);
        bits[5].should.equal(TEST_BITMAP_03_PIXEL_COLORS[3].rgbRed);
        bits[pitch + 0].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbBlue);
        bits[pitch + 1].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbGreen);
        bits[pitch + 2].should.equal(TEST_BITMAP_03_PIXEL_COLORS[0].rgbRed);
        bits[pitch + 3].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbBlue);
        bits[pitch + 4].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbGreen);
        bits[pitch + 5].should.equal(TEST_BITMAP_03_PIXEL_COLORS[1].rgbRed);        
        fi.unload(bitmap);
      });
    });
    
    describe("fi.convertToStandardType", function () {
      it("should return the clone of a standard bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToStandardType(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(32);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToType", function () {
      it("should be able to convert a bitmap to another type", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            type2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToType(bitmap, fi.IMAGE_TYPE.FLOAT);
        bitmap2.isNull().should.be.false();
        type2 = fi.getImageType(bitmap2);
        type2.should.equal(fi.IMAGE_TYPE.FLOAT);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToFloat", function () {
      it("should be able to convert a bitmap to float type", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            type2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToFloat(bitmap);
        bitmap2.isNull().should.be.false();
        type2 = fi.getImageType(bitmap2);
        type2.should.equal(fi.IMAGE_TYPE.FLOAT);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToRGBF", function () {
      it("should be able to convert a bitmap to RGBF type", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            type2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToRGBF(bitmap);
        bitmap2.isNull().should.be.false();
        type2 = fi.getImageType(bitmap2);
        type2.should.equal(fi.IMAGE_TYPE.RGBF);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToUINT16", function () {
      it("should be able to convert a bitmap to UINT16 type", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            type2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToUINT16(bitmap);
        bitmap2.isNull().should.be.false();
        type2 = fi.getImageType(bitmap2);
        type2.should.equal(fi.IMAGE_TYPE.UINT16);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.convertToRGB16", function () {
      it("should be able to convert a bitmap to RGB16 type", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bitmap2 = null,
            type2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.convertToRGB16(bitmap);
        bitmap2.isNull().should.be.false();
        type2 = fi.getImageType(bitmap2);
        type2.should.equal(fi.IMAGE_TYPE.RGB16);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });
  });

  describe("Tone mapping operators", function () {
    describe("fi.toneMapping", function () {
      it("should be able to convert a 48-bit bitmap to a 24-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_04_IMAGE_FORMAT, TEST_BITMAP_04_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.toneMapping(bitmap, fi.TONE_MAPPING_OPERATION.REINHARD05);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(24);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.tmoDrago03", function () {
      it("should be able to convert a 48-bit bitmap to a 24-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_04_IMAGE_FORMAT, TEST_BITMAP_04_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.tmoDrago03(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(24);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.tmoReinhard05", function () {
      it("should be able to convert a 48-bit bitmap to a 24-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_04_IMAGE_FORMAT, TEST_BITMAP_04_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.tmoReinhard05(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(24);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.tmoReinhard05Ex", function () {
      it("should be able to convert a 48-bit bitmap to a 24-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_04_IMAGE_FORMAT, TEST_BITMAP_04_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.tmoReinhard05Ex(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(24);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });

    describe("fi.tmoFattal02", function () {
      it("should be able to convert a 48-bit bitmap to a 24-bit one", function () {
        var bitmap = fi.load(TEST_BITMAP_04_IMAGE_FORMAT, TEST_BITMAP_04_FILENAME),
            bitmap2 = null,
            bpp2 = -1;
        bitmap.isNull().should.be.false();
        bitmap2 = fi.tmoFattal02(bitmap);
        bitmap2.isNull().should.be.false();
        bpp2 = fi.getBPP(bitmap2);
        bpp2.should.equal(24);
        fi.unload(bitmap2);
        fi.unload(bitmap);
      });
    });
  });

  describe("ICC profile functions", function () {
    describe("fi.(get|create|destroy)ICCProfile", function () {
      it("should be able to get/create/destroy the ICC profile of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            profile = null,
            data = null,
            data2 = null;
        bitmap.isNull().should.be.false();
        profile = fi.getICCProfile(bitmap);
        profile.isNull().should.be.false();
        profile.deref().flags.should.equal(0);
        profile.deref().size.should.equal(0);
        profile.deref().data.isNull().should.be.true();
        data = new Buffer([1, 2, 3, 4, 5]);
        fi.createICCProfile(bitmap, data, data.length);
        profile = fi.getICCProfile(bitmap);
        profile.deref().flags.should.equal(0);
        profile.deref().size.should.equal(data.length);
        profile.deref().data.isNull().should.be.false();
        data2 = ref.reinterpret(profile.deref().data, profile.deref().size, 0);
        data2.should.deep.equal(data);
        fi.destroyICCProfile(bitmap);
        profile = fi.getICCProfile(bitmap);
        profile.isNull().should.be.false();
        profile.deref().flags.should.equal(0);
        profile.deref().size.should.equal(0);
        profile.deref().data.isNull().should.be.true();
        fi.unload(bitmap);
      });
    });
  });

  describe("Multipage functions", function () {
    describe("fi.(open|close)MultiBitmap", function () {
      it("should be able to open/close a multibitmap", function () {
        var multiBitmap = null,
            success = false;
        multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_FILENAME, false, true);
        multiBitmap.isNull().should.be.false();
        success = fi.closeMultiBitmap(multiBitmap);
        success.should.be.true();
      });
    });
    
    describe("fi.getPageCount", function () {
      it("should return the page count of a multibitmap", function () {
        var multiBitmap = null,
            pageCount = -1;
        multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_FILENAME, false, true);
        multiBitmap.isNull().should.be.false();
        pageCount = fi.getPageCount(multiBitmap);
        pageCount.should.equal(TEST_BITMAP_05_PAGE_COUNT);
        success = fi.closeMultiBitmap(multiBitmap);
        success.should.be.true();
      });
    });
    
    describe("fi.appendPage", function () {
      it("should be able to append a page to a multibitmap", function () {
        var TEST_BITMAP_05_TMP_COPY_FILENAME = TEST_BITMAP_05_FILENAME + ".tmp",
            bitmap = null,
            multiBitmap = null,
            pageCount = -1;
        fs.writeFileSync(TEST_BITMAP_05_TMP_COPY_FILENAME, fs.readFileSync(TEST_BITMAP_05_FILENAME));
        try {
          bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME);
          bitmap.isNull().should.be.false();
          multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_TMP_COPY_FILENAME, false, false);
          multiBitmap.isNull().should.be.false();
          fi.appendPage(multiBitmap, bitmap);
          pageCount = fi.getPageCount(multiBitmap);
          pageCount.should.equal(TEST_BITMAP_05_PAGE_COUNT + 1);
          success = fi.closeMultiBitmap(multiBitmap);
          success.should.be.true();
          fi.unload(bitmap);
        } finally {
          fs.unlinkSync(TEST_BITMAP_05_TMP_COPY_FILENAME);
        }
      });
    });
    
    describe("fi.insertPage", function () {
      it("should be able to insert a page into a multibitmap", function () {
        var TEST_BITMAP_05_TMP_COPY_FILENAME = TEST_BITMAP_05_FILENAME + ".tmp",
            bitmap = null,
            multiBitmap = null,
            pageCount = -1;
        fs.writeFileSync(TEST_BITMAP_05_TMP_COPY_FILENAME, fs.readFileSync(TEST_BITMAP_05_FILENAME));
        try {
          bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME);
          bitmap.isNull().should.be.false();
          multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_TMP_COPY_FILENAME, false, false);
          multiBitmap.isNull().should.be.false();
          fi.insertPage(multiBitmap, 1, bitmap);
          pageCount = fi.getPageCount(multiBitmap);
          pageCount.should.equal(TEST_BITMAP_05_PAGE_COUNT + 1);
          success = fi.closeMultiBitmap(multiBitmap);
          success.should.be.true();
          fi.unload(bitmap);
        } finally {
          fs.unlinkSync(TEST_BITMAP_05_TMP_COPY_FILENAME);
        }
      });
    });
    
    describe("fi.deletePage", function () {
      it("should be able to delete a page from a multibitmap", function () {
        var TEST_BITMAP_05_TMP_COPY_FILENAME = TEST_BITMAP_05_FILENAME + ".tmp",
            bitmap = null,
            multiBitmap = null,
            pageCount = -1;
        fs.writeFileSync(TEST_BITMAP_05_TMP_COPY_FILENAME, fs.readFileSync(TEST_BITMAP_05_FILENAME));
        try {
          bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME);
          bitmap.isNull().should.be.false();
          multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_TMP_COPY_FILENAME, false, false);
          multiBitmap.isNull().should.be.false();
          fi.deletePage(multiBitmap, 1);
          pageCount = fi.getPageCount(multiBitmap);
          pageCount.should.equal(TEST_BITMAP_05_PAGE_COUNT - 1);
          success = fi.closeMultiBitmap(multiBitmap);
          success.should.be.true();
          fi.unload(bitmap);
        } finally {
          fs.unlinkSync(TEST_BITMAP_05_TMP_COPY_FILENAME);
        }
      });
    });
    
    describe("fi.(lock|unlock)Page", function () {
      it("should be able to lock/unlock a page of a multibitmap", function () {
        var multiBitmap = null,
            pageCount = -1,
            pageIndex = -1,
            pageBitmap = null,
            width = -1,
            height = -1,
            success = false;
        multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_FILENAME, false, true);
        multiBitmap.isNull().should.be.false();
        pageCount = fi.getPageCount(multiBitmap);
        pageCount.should.equal(TEST_BITMAP_05_PAGE_COUNT);
        for (pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
          pageBitmap = fi.lockPage(multiBitmap, pageIndex);
          try {
            width = fi.getWidth(pageBitmap);
            width.should.equal(TEST_BITMAP_05_PAGE_WIDTH);
            height = fi.getHeight(pageBitmap);
            height.should.equal(TEST_BITMAP_05_PAGE_HEIGHT);
          } finally {
            fi.unlockPage(multiBitmap, pageBitmap, false);
          }
        }
        success = fi.closeMultiBitmap(multiBitmap);
        success.should.be.true();
      });
    });
    
    describe("fi.movePage", function () {
      it("should be able to move a page inside a multibitmap", function () {
        var TEST_BITMAP_05_TMP_COPY_FILENAME = TEST_BITMAP_05_FILENAME + ".tmp",
            multiBitmap = null,
            success = false;
        fs.writeFileSync(TEST_BITMAP_05_TMP_COPY_FILENAME, fs.readFileSync(TEST_BITMAP_05_FILENAME));
        try {
          multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_TMP_COPY_FILENAME, false, false);
          multiBitmap.isNull().should.be.false();
          success = fi.movePage(multiBitmap, 2, 0);
          success.should.be.true();
          success = fi.closeMultiBitmap(multiBitmap);
          success.should.be.true();
        } finally {
          fs.unlinkSync(TEST_BITMAP_05_TMP_COPY_FILENAME);
        }
      });
    });
    
    describe("fi.getLockedPageNumbers", function () {
      it("should be able to get the indexes of locked pages of a multibitmap", function () {
        var TEST_BITMAP_05_TMP_COPY_FILENAME = TEST_BITMAP_05_FILENAME + ".tmp",
            multiBitmap = null,
            pageBitmap0 = null,
            pageBitmap2 = null,
            success = false,
            lockedPageCount = ref.alloc(INT),
            lockedPageIndexes = null,
            lockedPageIndexes2 = null;
        fs.writeFileSync(TEST_BITMAP_05_TMP_COPY_FILENAME, fs.readFileSync(TEST_BITMAP_05_FILENAME));
        try {
          multiBitmap = fi.openMultiBitmap(TEST_BITMAP_05_IMAGE_FORMAT, TEST_BITMAP_05_TMP_COPY_FILENAME, false, false);
          multiBitmap.isNull().should.be.false();
          pageBitmap0 = fi.lockPage(multiBitmap, 0);
          pageBitmap2 = fi.lockPage(multiBitmap, 2);
          try {
            success = fi.getLockedPageNumbers(multiBitmap, ref.NULL, lockedPageCount);
            success.should.be.true();
            lockedPageCount.deref().should.equal(2);
            lockedPageIndexes = new Buffer(lockedPageCount.deref() * INT_SIZE);
            success = fi.getLockedPageNumbers(multiBitmap, lockedPageIndexes, lockedPageCount);
            success.should.be.true();
            lockedPageIndexes2 = new IntArray(lockedPageIndexes);
            lockedPageIndexes2.length.should.equal(lockedPageCount.deref());
            lockedPageIndexes2.toString().should.match(/^(0,2)|(2,0)$/);
          } finally {
            fi.unlockPage(multiBitmap, pageBitmap2, false);
            fi.unlockPage(multiBitmap, pageBitmap0, false);
          }
          success = fi.closeMultiBitmap(multiBitmap);
          success.should.be.true();
        } finally {
          fs.unlinkSync(TEST_BITMAP_05_TMP_COPY_FILENAME);
        }
      });
    });
  });

  describe("Compression functions", function () {
    describe("fi.zLib(Compress|Uncompress)", function () {
      it("should be able to compress/uncompress a byte array", function () {
        var data = null,
            compressedSize = -1,
            compressedData = null,
            uncompressedSize = -1,
            uncompressedData = null,
            i = -1;
        data = new Buffer([1, 2, 3, 4, 1, 2, 3, 4]);
        compressedSize = Math.round(1.1 * data.length + 12);
        compressedData = new Buffer(compressedSize);
        compressedSize = fi.zLibCompress(compressedData, compressedSize, data, data.length);
        compressedSize.should.not.equal(0);
        uncompressedSize = 10 * data.length;
        uncompressedData = new Buffer(uncompressedSize);
        uncompressedSize = fi.zLibUncompress(uncompressedData, uncompressedSize, compressedData, compressedSize);
        uncompressedSize.should.equal(data.length);
        for (i = 0; i < data.length; i += 1) {
          uncompressedData[i].should.equal(data[i]);
        }
      });
    });

    describe("fi.zLib(GZip|GUnzip)", function () {
      it("should be able to compress/uncompress a byte array", function () {
        var data = null,
            compressedSize = -1,
            compressedData = null,
            uncompressedSize = -1,
            uncompressedData = null,
            i = -1;
        data = new Buffer([1, 2, 3, 4, 1, 2, 3, 4]);
        compressedSize = Math.round(1.1 * data.length + 24);
        compressedData = new Buffer(compressedSize);
        compressedSize = fi.zLibGZip(compressedData, compressedSize, data, data.length);
        compressedSize.should.not.equal(0);
        uncompressedSize = 10 * data.length;
        uncompressedData = new Buffer(uncompressedSize);
        uncompressedSize = fi.zLibGUnzip(uncompressedData, uncompressedSize, compressedData, compressedSize);
        uncompressedSize.should.equal(data.length);
        for (i = 0; i < data.length; i += 1) {
          uncompressedData[i].should.equal(data[i]);
        }
      });
    });
    
    describe("fi.zLibCRC32", function () {
      it("should be able to calculate the CRC checksum of a byte array", function () {
        var data = null,
            crc = -1;
        data = new Buffer([0xCA, 0xFE, 0xBA, 0xBE]);
        crc = fi.zLibCRC32(0, data, data.length);
        crc.should.equal(0xB51D571D);
      });
    });
  });

  describe("Helper functions", function () {
  });
});

describe("METADATA FUNCTION REFERENCE", function () {
  describe("Tag creation and destruction", function () {
  });
  
  describe("Tag accessors", function () {
  });
  
  describe("Metadata iterator", function () {
  });
  
  describe("Metadata accessors", function () {
  });
  
  describe("Metadata helper functions", function () {
  });
});

describe("TOOLKIT FUNCTION REFERENCE", function () {
  describe("Rotation and flipping", function () {
  });

  describe("Upsampling / downsampling", function () {
  });

  describe("Color manipulation", function () {
  });

  describe("Channel processing", function () {
  });

  describe("Copy / Paste / Composite routines", function () {
  });

  describe("JPEG lossless transformations", function () {
  });

  describe("Background filling", function () {
  });

  describe("Miscellaneous algorithms", function () {
  });
});

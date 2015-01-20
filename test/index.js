var should = require("chai").should(),
    fs = require('fs'),
    fi = require("../index"),
    // General constants
    BYTES_TO_BITS = 8,
    INCHES_TO_METERS = 0.0254,
    BITMAPINFOHEADER_SIZE = 40,
    // Properties of temporary bitmaps
    TEMP_BITMAP_FILENAME = __dirname + "/temp.png",
    TEMP_BITMAP_IMAGE_TYPE = fi.IMAGE_TYPE.BITMAP,
    TEMP_BITMAP_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEMP_BITMAP_WIDTH = 16,
    TEMP_BITMAP_HEIGHT = 16,
    TEMP_BITMAP_BPP = 24,
    TEMP_BITMAP_DPI_X = 96,
    TEMP_BITMAP_DPI_Y = 96,
    TEMP_BITMAP_DPM_X = Math.round(TEMP_BITMAP_DPI_X / INCHES_TO_METERS),
    TEMP_BITMAP_DPM_Y = Math.round(TEMP_BITMAP_DPI_Y / INCHES_TO_METERS),
    // Properties of test bitmap #1
    TEST_BITMAP_01_FILENAME = __dirname + "/test-01.png",
    TEST_BITMAP_01_IMAGE_TYPE = fi.IMAGE_TYPE.BITMAP,
    TEST_BITMAP_01_IMAGE_FORMAT = fi.IMAGE_FORMAT.PNG,
    TEST_BITMAP_01_WIDTH = 16,
    TEST_BITMAP_01_HEIGHT = 16,
    TEST_BITMAP_01_BPP = 32;
    TEST_BITMAP_01_PALETTE_SIZE = 0;
    TEST_BITMAP_01_LINE = TEST_BITMAP_01_WIDTH * TEST_BITMAP_01_BPP / BYTES_TO_BITS,
    TEST_BITMAP_01_PITCH = TEST_BITMAP_01_WIDTH * TEST_BITMAP_01_BPP / BYTES_TO_BITS,
    TEST_BITMAP_01_DIB_SIZE = BITMAPINFOHEADER_SIZE + TEST_BITMAP_01_PALETTE_SIZE + TEST_BITMAP_01_PITCH * TEST_BITMAP_01_HEIGHT,
    TEST_BITMAP_01_DPI_X = 96,
    TEST_BITMAP_01_DPI_Y = 96,
    TEST_BITMAP_01_DPM_X = Math.round(TEST_BITMAP_01_DPI_X / INCHES_TO_METERS),
    TEST_BITMAP_01_DPM_Y = Math.round(TEST_BITMAP_01_DPI_Y / INCHES_TO_METERS);
    
describe("Bitmap function reference", function () {    
  describe("General functions", function () {
    describe("fi.getVersion", function () {
      it ("should return major, minor and patch version", function () {
        fi.getVersion().should.match(/^\d+\.\d+\.\d+$/);
      });
    });
    
    describe("fi.getCopyrightMessage", function () {
      it ("should return a string containing \"FreeImage\"", function () {
        fi.getCopyrightMessage().should.have.string("FreeImage");
      });
    });
  });

  describe("Bitmap management functions", function () {
    describe("fi.allocate", function () {
      it ("should be able to create a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_WIDTH, TEMP_BITMAP_HEIGHT, TEMP_BITMAP_BPP);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    }); 
    
    describe("fi.allocateT", function () {
      it ("should be able to create a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_IMAGE_TYPE, TEMP_BITMAP_WIDTH, TEMP_BITMAP_HEIGHT, TEMP_BITMAP_BPP);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });
    
    describe("fi.load", function () {
      it ("should be able to load a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });

    describe("fi.save", function () {
      it ("should be able to save a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_WIDTH, TEMP_BITMAP_HEIGHT, TEMP_BITMAP_BPP),
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.save(TEMP_BITMAP_IMAGE_FORMAT, bitmap, TEMP_BITMAP_FILENAME);
        success.should.be.true();
        fi.unload(bitmap);
        fs.unlinkSync(TEMP_BITMAP_FILENAME);
      });
    });
    
    describe("fi.clone", function () {
      it ("should be able to clone a bitmap", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_WIDTH, TEMP_BITMAP_HEIGHT, TEMP_BITMAP_BPP),
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
      it ("should be able to get the type of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            type = -1;
        bitmap.isNull().should.be.false();
        type = fi.getImageType(bitmap);
        type.should.equal(TEST_BITMAP_01_IMAGE_TYPE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getColorsUsed", function () {
      it ("should be able to get the palette size (!) of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            paletteSize = -1;
        bitmap.isNull().should.be.false();
        paletteSize = fi.getColorsUsed(bitmap);
        paletteSize.should.equal(TEST_BITMAP_01_PALETTE_SIZE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getBPP", function () {
      it ("should be able to get the size of one pixel in the bitmap in bits", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            bpp = -1;
        bitmap.isNull().should.be.false();
        bpp = fi.getBPP(bitmap);
        bpp.should.equal(TEST_BITMAP_01_BPP);
        fi.unload(bitmap);
      });
    });

    describe("fi.getWidth", function () {
      it ("should be able to get the width of a bitmap in pixels", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            width = -1;
        bitmap.isNull().should.be.false();
        width = fi.getWidth(bitmap);
        width.should.equal(TEST_BITMAP_01_WIDTH);
        fi.unload(bitmap);
      });
    });

    describe("fi.getHeight", function () {
      it ("should be able to get the height of a bitmap in pixels", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            height = -1;
        bitmap.isNull().should.be.false();
        height = fi.getHeight(bitmap);
        height.should.equal(TEST_BITMAP_01_HEIGHT);
        fi.unload(bitmap);
      });
    });

    describe("fi.getLine", function () {
      it ("should be able to get the width of a bitmap in bytes", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            line = -1;
        bitmap.isNull().should.be.false();
        line = fi.getLine(bitmap);
        line.should.equal(TEST_BITMAP_01_LINE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getPitch", function () {
      it ("should be able to get the pitch (scan width) of a bitmap in bytes", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            pitch = -1;
        bitmap.isNull().should.be.false();
        pitch = fi.getPitch(bitmap);
        pitch.should.equal(TEST_BITMAP_01_PITCH);
        fi.unload(bitmap);
      });
    });

    describe("fi.getDIBSize", function () {
      it ("should be able to get the DIB size of a bitmap in bytes", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            dibSize = -1;
        bitmap.isNull().should.be.false();
        dibSize = fi.getDIBSize(bitmap);
        dibSize.should.equal(TEST_BITMAP_01_DIB_SIZE);
        fi.unload(bitmap);
      });
    });

    describe("fi.getPalette", function () {
      it ("should be able to get the palette of a bitmap", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            palette = null;
        bitmap.isNull().should.be.false();
        palette = fi.getPalette(bitmap);
        palette.isNull().should.be.true();
        fi.unload(bitmap);
      });
    });

    describe("fi.getDotsPerMeterX", function () {
      it ("should be able to get the X-resolution of a bitmap in dpm", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            dpmX = -1;
        bitmap.isNull().should.be.false();
        dpmX = fi.getDotsPerMeterX(bitmap);
        dpmX.should.equal(TEST_BITMAP_01_DPM_X);
        fi.unload(bitmap);
      });
    });

    describe("fi.getDotsPerMeterY", function () {
      it ("should be able to get the Y-resolution of a bitmap in dpm", function () {
        var bitmap = fi.load(TEST_BITMAP_01_IMAGE_FORMAT, TEST_BITMAP_01_FILENAME),
            dpmY = -1;
        bitmap.isNull().should.be.false();
        dpmY = fi.getDotsPerMeterY(bitmap);
        dpmY.should.equal(TEST_BITMAP_01_DPM_Y);
        fi.unload(bitmap);
      });
    });

    describe("fi.setDotsPerMeterX", function () {
      it ("should be able to set the X-resolution of a bitmap in dpm", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_WIDTH, TEMP_BITMAP_HEIGHT, TEMP_BITMAP_BPP),
            dpmX = TEMP_BITMAP_DPM_X;
        bitmap.isNull().should.be.false();
        fi.setDotsPerMeterX(bitmap, dpmX);
        dpmX = fi.getDotsPerMeterX(bitmap);
        dpmX.should.equal(dpmX);
        fi.unload(bitmap);
      });
    });

    describe("fi.setDotsPerMeterY", function () {
      it ("should be able to set the Y-resolution of a bitmap in dpm", function () {
        var bitmap = fi.allocate(TEMP_BITMAP_WIDTH, TEMP_BITMAP_HEIGHT, TEMP_BITMAP_BPP),
            dpmY = TEMP_BITMAP_DPM_Y;
        bitmap.isNull().should.be.false();
        fi.setDotsPerMeterY(bitmap, dpmY);
        dpmY = fi.getDotsPerMeterY(bitmap);
        dpmY.should.equal(dpmY);
        fi.unload(bitmap);
      });
    });

    describe("fi.getInfoHeader", function () {
      it ("should be able to get the BITMAPINFOHEADER of a bitmap", function () {
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
      it ("should be able to get the BITMAPINFO of a bitmap", function () {
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
  });

  describe("Filetype functions", function () {
  });

  describe("Pixel access functions", function () {
  });

  describe("Conversion functions", function () {
  });

  describe("Tone mapping operators", function () {
  });

  describe("ICC profile functions", function () {
  });

  describe("Multipage functions", function () {
  });

  describe("Memory I/O streams", function () {
  });

  describe("Compression functions", function () {
  });
});

describe("Metadata function reference", function () {
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

describe("Toolkit function reference", function () {
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

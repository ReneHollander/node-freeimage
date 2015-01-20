var should = require("chai").should(),
    fs = require('fs'),
    fi = require("../index");

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
        var bitmap = fi.allocate(16, 16, 24);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    }); 
    
    describe("fi.allocateT", function () {
      it ("should be able to create a bitmap", function () {
        var bitmap = fi.allocate(fi.IMAGE_TYPE.BITMAP, 16, 16, 24);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });
    
    describe("fi.load", function () {
      it ("should be able to load a bitmap", function () {
        var bitmap = null,
            fileName = __dirname + "/load-test.png";
        bitmap = fi.load(fi.IMAGE_FORMAT.PNG, fileName);
        bitmap.isNull().should.be.false();
        fi.unload(bitmap);
      });
    });

    describe("fi.save", function () {
      it ("should be able to save a bitmap", function () {
        var bitmap = fi.allocate(16, 16, 24),
            fileName = __dirname + "/save-test.png",
            success = false;
        bitmap.isNull().should.be.false();
        success = fi.save(fi.IMAGE_FORMAT.PNG, bitmap, fileName);
        success.should.be.true();
        fi.unload(bitmap);
        fs.unlinkSync(fileName);
      });
    });
    
    describe("fi.clone", function () {
      it ("should be able to clone a bitmap", function () {
        var bitmap = fi.allocate(16, 16, 24),
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

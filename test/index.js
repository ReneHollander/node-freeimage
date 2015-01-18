var should = require("chai").should(),
    fs = require('fs'),
    fi = require("../index");

describe("fi", function () {
  describe(".getVersion", function () {
    it ("should return major, minor and patch version", function () {
      fi.getVersion().should.match(/^\d+\.\d+\.\d+$/);
    });
  });
  
  describe(".getCopyrightMessage", function () {
    it ("should return a string containing \"FreeImage\"", function () {
      fi.getCopyrightMessage().should.have.string("FreeImage");
    });
  });
  
  describe(".allocate", function () {
    it ("should be able to create a bitmap", function () {
      var bitmap = fi.allocate(16, 16, 24);
      bitmap.isNull().should.be.false();
      fi.unload(bitmap);
    });
  }); 
  
  describe(".allocateT", function () {
    it ("should be able to create a bitmap", function () {
      var bitmap = fi.allocate(fi.IMAGE_TYPE.BITMAP, 16, 16, 24);
      bitmap.isNull().should.be.false();
      fi.unload(bitmap);
    });
  });
  
  describe(".save", function () {
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
  
  describe(".load", function () {
    it ("should be able to load a bitmap", function () {
      var bitmap = null,
          fileName = __dirname + "/load-test.png";
      bitmap = fi.load(fi.IMAGE_FORMAT.PNG, fileName);
      bitmap.isNull().should.be.false();
      fi.unload(bitmap);
    });
  });
});


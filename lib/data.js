//store edit data

const fs = require("fs");
const path = require("path");

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = (dir, file, data, callBack) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, "wx", (err, fileDescription) => {
    if (!err && fileDescription) {
      const stringData = JSON.stringify(data);
      //write file and close

      fs.writeFile(fileDescription, stringData, (err) => {
        if (!err) {
          fs.close(fileDescription, (err) => {
            if (!err) {
              callBack(false);
            } else {
              callBack("Error closing new file");
            }
          });
        } else {
          callBack("Error writing to new file");
        }
      });
    } else {
      callBack("Could not create new file, it may already exist");
    }
  });
};

//read data

lib.read = (dir, file, callBack) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, "utf8", (err, date) => {
    callBack(err, date);
  });
};

// update file
lib.update = (dir, file, data, callBack) => {
  //open and write
  fs.open(`${lib.baseDir}${dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callBack(false);
                } else {
                  callBack("error closing existing file");
                }
              });
            } else {
              callBack("Error writing existing file");
            }
          });
          //
        } else {
          callBack("error truncating file");
        }
      });
    } else {
      callBack("could update file,it may already exist");
    }
  });
};
//delete fail

lib.delete = (dir, file, callBack) => {
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
    if (!err) {
      callBack(false);
    } else {
      callBack("failed to delete fail");
    }
  });
};

// Export module

module.exports = lib;

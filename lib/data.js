/**
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');
// const debug = require('util').debuglog('data');
const helpers = require('./helpers');

// Container for module (it to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (errOpen, fileDescriptor) => {
    if (!errOpen && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);
      // Write data to the file and close it
      fs.writeFile(fileDescriptor, stringData, (errWrite) => {
        if (!errWrite) {
          fs.close(fileDescriptor, (errClose) => {
            if (!errClose) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

// Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf8', (errRead, data) => {
    if (!errRead && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(errRead, data);
    }
  });
};

// Update data inside a file
lib.update = (dir, file, data, callback) => {
  // Open file for writing
  // r+ changed to w
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'w', (errOpen, fileDescriptor) => {
    if (!errOpen && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);
      // Truncate the file
      fs.ftruncate(fileDescriptor, (errFileDescriptor) => {
        if (!errFileDescriptor) {
          // Write to the file and close it
          fs.writeFile(fileDescriptor, stringData, (errWrite) => {
            if (!errWrite) {
              fs.close(fileDescriptor, (errClose) => {
                if (!errClose) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open the file for updating, it may not exist yet');
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

// List all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// List all the items in a directory with birttime
/**
 * @param {dir} string Name of directory where files contains
 * @param {callback} function Callback function
 * @return {[]} Return array with objects {filename, birthtime}
 *
 */
lib.listWithBirtTime = (dir, callback) => {
  fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
    if (!err && data && data.length > 0) {
      // Get size of array to callback when count will be 0
      let size = data.length;
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        // Get a birthtime for the fileName
        fs.stat(`${lib.baseDir}${dir}/${fileName}`, (errStat, stats) => {
          if (!errStat && stats) {
            trimmedFileNames.push({
              fileName: fileName.replace('.json', ''),
              birthtime: stats.birthtime,
            });
            size -= 1;
            if (size === 0) {
              callback(false, trimmedFileNames);
            }
          }
        });
      });
    } else {
      callback(err, data);
    }
  });
};


// List all the items in a directory with mask
lib.listMask = (dir, mask, callback) => {
  fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        if (fileName.includes(mask)) {
          trimmedFileNames.push(fileName.replace('.json', ''));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};


// Export the module
module.exports = lib;

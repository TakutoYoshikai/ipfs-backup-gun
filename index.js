const Gun = require("gun");
const gun = Gun(['https://mvp-gun.herokuapp.com/gun', 'https://e2eec.herokuapp.com/gun']);
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function BackupStore () {
  const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
  const privKey = fs.readFileSync(path.join(userHome, ".ipfs-backup-key"), "utf8");
  const username = crypto.createHash("sha256").update(privKey + ":username").digest("hex").slice(0, 8);
  const password = crypto.createHash("sha256").update(privKey + ":password").digest("hex").slice(0, 24);
  const user = gun.user();
  this.init = function() {
    return new Promise((resolve, reject) => {
      user.auth(username, password, function(response) {
        if (response.err) {
          user.create(username, password, function(response) {
            if (response.err) {
              reject();
            }
            resolve();
          });
          return;
        }
        resolve();
      });
    });
  }
  this.setBackupId = function(key, backupId) {
    return new Promise((resolve, reject) => {
      user.get(key).put({backupId}, (response) => {
        if (response.err) {
          reject();
          return;
        }
        resolve();
      });
    });
  }
  this.getNewestBackupId = function(key) {
    return new Promise((resolve, reject) => {
      let backupId;
      user.get(key).map().once(function(_backupId, id) {
        if (!backupId) {
          backupId = _backupId;
          resolve(backupId);
        }
      });
      reject();
    });
  }
}

module.exports = BackupStore;

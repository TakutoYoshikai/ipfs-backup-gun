const Gun = require("gun");
const gun = Gun(['https://mvp-gun.herokuapp.com/gun', 'https://e2eec.herokuapp.com/gun']);

function BackupStore (username, password) {
  const user = gun.user();
  const key = "backup_ids";
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
  this.setBackupId = function(backupId) {
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
  this.getNewestBackupId = function() {
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

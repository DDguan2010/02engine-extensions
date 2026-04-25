class AdbCommands {
  constructor(runtime) {
    this.runtime = runtime;
    this.devices = [];
    this.adbPath = 'adb';
  }

  getInfo() {
    return {
      id: 'adbCommands',
      name: '安卓adb工具',
      blocks: [
        {
          opcode: 'checkAdbDevices',
          blockType: Scratch.BlockType.REPORTER,
          text: '列出连接的Android设备',
          arguments: {}
        },
        {
          opcode: 'executeAdbCommand',
          blockType: Scratch.BlockType.COMMAND,
          text: '执行ADB命令[COMMAND]',
          arguments: {
            COMMAND: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'devices'
            }
          }
        },
        {
          opcode: 'downloadFileToDevice',
          blockType: Scratch.BlockType.COMMAND,
          text: '从[URL]下载文件到设备路径[DEVICE_PATH]',
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://example.com/file.apk'
            },
            DEVICE_PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '/sdcard/Download/'
            }
          }
        },
        {
          opcode: 'installApkFromUcl',
          blockType: Scratch.BlockType.COMMAND,
          text: '通过ucl安装APK: [UCL_DATA]',
          arguments: {
            UCL_DATA: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'data:ucl;base64,...'
            }
          }
        },
        {
          opcode: 'setBatteryLevel',
          blockType: Scratch.BlockType.COMMAND,
          text: '设置设备电池电量为[LEVEL]%',
          arguments: {
            LEVEL: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: '50'
            }
          }
        },
        {
          opcode: 'freezeApp',
          blockType: Scratch.BlockType.COMMAND,
          text: '冻结应用[PACKAGE_NAME]',
          arguments: {
            PACKAGE_NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'com.example.app'
            }
          }
        },
        {
          opcode: 'unfreezeApp',
          blockType: Scratch.BlockType.COMMAND,
          text: '解冻应用[PACKAGE_NAME]',
          arguments: {
            PACKAGE_NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'com.example.app'
            }
          }
        }
      ]
    };
  }

  checkAdbDevices() {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('adb devices', (err, stdout) => {
        if (err) return resolve('ADB未找到，请安装Android SDK工具');
        this.devices = stdout.split('\n')
          .slice(1)
          .filter(d => d.includes('\tdevice'))
          .map(d => d.split('\t')[0]);
        resolve(this.devices.join(','));
      });
    });
  }

  executeAdbCommand(args) {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec(`adb ${args.COMMAND}`, (err, stdout) => {
        if (err) return resolve(`执行失败: ${err.message}`);
        resolve(stdout);
      });
    });
  }

  downloadFileToDevice(args) {
    const { exec } = require('child_process');
    const { URL, DEVICE_PATH } = args;
    const tempFilePath = `C:\\temp\\downloaded_file_${Date.now()}`;
    
    // 首先下载文件到本地
    return new Promise((resolve) => {
      const { https } = require('follow-redirects');
      const fs = require('fs');
      
      const file = fs.createWriteStream(tempFilePath);
      const request = https.get(URL, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          
          // 然后上传到设备
          exec(`adb push ${tempFilePath} ${DEVICE_PATH}`, (err, stdout) => {
            // 删除临时文件
            fs.unlinkSync(tempFilePath);
            
            if (err) return resolve(`下载并推送失败: ${err.message}`);
            resolve(`文件已成功下载并推送至设备: ${stdout}`);
          });
        });
      }).on('error', (e) => {
        fs.unlinkSync(tempFilePath);
        resolve(`下载失败: ${e.message}`);
      });
    });
  }

  installApkFromUcl(args) {
    const { exec } = require('child_process');
    const { UCL_DATA } = args;
    const tempFilePath = `C:\\temp\\apk_${Date.now()}.apk`;
    
    return new Promise((resolve) => {
      try {
        // 解析ucl数据
        const base64Data = UCL_DATA.replace(/^data:ucl;base64,/, '');
        const apkBuffer = Buffer.from(base64Data, 'base64');
        
        // 写入临时文件
        const fs = require('fs');
        fs.writeFileSync(tempFilePath, apkBuffer);
        
        // 安装APK
        exec(`adb install ${tempFilePath}`, (err, stdout) => {
          // 删除临时文件
          fs.unlinkSync(tempFilePath);
          
          if (err) return resolve(`安装失败: ${err.message}`);
          resolve(`APK安装成功: ${stdout}`);
        });
      } catch (e) {
        resolve(`处理UCL数据失败: ${e.message}`);
      }
    });
  }

  setBatteryLevel(args) {
    const { exec } = require('child_process');
    const { LEVEL } = args;
    
    return new Promise((resolve) => {
      // 确保电量在0-100之间
      const level = Math.max(0, Math.min(100, parseInt(LEVEL)));
      
      exec(`adb shell dumpsys battery set level ${level}`, (err, stdout) => {
        if (err) return resolve(`设置电池电量失败: ${err.message}`);
        resolve(`电池电量已设置为 ${level}%`);
      });
    });
  }

  freezeApp(args) {
    const { exec } = require('child_process');
    const { PACKAGE_NAME } = args;
    
    return new Promise((resolve) => {
      exec(`adb shell pm disable-user ${PACKAGE_NAME}`, (err, stdout) => {
        if (err) return resolve(`冻结应用失败: ${err.message}`);
        resolve(`应用 ${PACKAGE_NAME} 已冻结`);
      });
    });
  }

  unfreezeApp(args) {
    const { exec } = require('child_process');
    const { PACKAGE_NAME } = args;
    
    return new Promise((resolve) => {
      exec(`adb shell pm enable ${PACKAGE_NAME}`, (err, stdout) => {
        if (err) return resolve(`解冻应用失败: ${err.message}`);
        resolve(`应用 ${PACKAGE_NAME} 已解冻`);
      });
    });
  }
}

Scratch.extensions.register(new AdbCommands());
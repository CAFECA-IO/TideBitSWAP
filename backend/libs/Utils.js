const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');
const toml = require('toml');
const i18n = require("i18n");
const dvalue = require('dvalue');
const ecRequest = require('ecrequest');

class Utils {
  static waterfallPromise(jobs) {
    return jobs.reduce((prev, curr) => {
      return prev.then(() => curr());
    }, Promise.resolve());
  }
  static retryPromise(promise, args, maxTries, context, timeout) {
    context = context || null;
    return promise.apply(context, args)
    .then((d) => {
      return Promise.resolve(d);
    },
    (e) => {
      if (maxTries <= 0) return Promise.reject(e);
      else {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.retryPromise(promise, args, maxTries - 1, context, timeout)
            .then(resolve, reject);
          }, timeout || 0);
        });
      }
    });
  }

  static toHex(n) {
    return `0x${(n).toString(16)}`;
  }

  static zeroFill(i, l) {
    let s = i.toString();
    if(l > s.length) {
      s = `${new Array(l - s.length).fill(0).join('')}${s}`;
    }
    return s;
  }

  static parseBoolean(bool) {
    return typeof(bool) == 'string' ?
      bool.toLowerCase() != 'false' :
      !!bool;
  }

  static parseTime(timestamp) {
    let result;
    const uptime = new Date().getTime() - timestamp;
    if(uptime > 86400 * 365 * 1000) {
      result = `${(uptime / (86400 * 365 * 1000)).toFixed(2)} Yrs`;
    } else if(uptime > 86400 * 30 * 1000) {
      result = `${(uptime / (86400 * 30 * 1000)).toFixed(2)} Mon`;
    } else if(uptime > 86400 * 1000) {
      result = `${(uptime / (86400 * 1000)).toFixed(2)} Day`;
    } else if(uptime > 3600 * 1000) {
      result = `${(uptime / (3600 * 1000)).toFixed(2)} Hrs`;
    } else if(uptime > 60 * 1000) {
      result = `${(uptime / (60 * 1000)).toFixed(2)} Min`;
    } else {
      result = `${(uptime / (1000)).toFixed(2)} Sec`;
    }
    return result;
  }

  static jsonStableStringify(obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    let space = opts.space || '';
    if (typeof space === 'number') space = Array(space+1).join(' ');
    const cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    const replacer = opts.replacer || function(key, value) { return value; };
  
    const cmp = opts.cmp && (function (f) {
      return (node) => {
        (a, b) => {
          const aobj = { key: a, value: node[a] };
          const bobj = { key: b, value: node[b] };
          return f(aobj, bobj);
        };
      };
    })(opts.cmp);
  
    const seen = [];
    return (function stringify(parent, key, node, level) {
      const indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
      const colonSeparator = space ? ': ' : ':';
  
      if (node && node.toJSON && typeof node.toJSON === 'function') {
        node = node.toJSON();
      }
  
      node = replacer.call(parent, key, node);
  
      if (node === undefined) {
        return;
      }
      if (typeof node !== 'object' || node === null) {
        return JSON.stringify(node);
      }
      if (Array.isArray(node)) {
        const out = [];
        for (var i = 0; i < node.length; i++) {
          const item = stringify(node, i, node[i], level+1) || JSON.stringify(null);
          out.push(indent + space + item);
        }
        return '[' + out.join(',') + indent + ']';
      } else {
        if (seen.indexOf(node) !== -1) {
          if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        } else {
          seen.push(node);
        }
        const keys = Object.keys(node).sort(cmp && cmp(node));
        const out = [];
        for (var i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = stringify(node, key, node[key], level+1);
  
          if(!value) continue;
  
          const keyValue = JSON.stringify(key) + colonSeparator + value;
          out.push(indent + space + keyValue);
        }
        seen.splice(seen.indexOf(node), 1);
        return '{' + out.join(',') + indent + '}';
      }
    })({ '': obj }, '', obj, 0);
  };

  static toToml(data, notRoot) {
    let result;
    if(data instanceof Object || typeof data == 'object') {
      result = Object.keys(data)
      .map((v) => {
      if(data[v] instanceof Object || typeof data[v] == 'object') {
        return `[${v}]\r\n${this.toToml(data[v], true)}\r\n` ;
      } else if (typeof(data[v]) == 'string') {
          return `${v} = "${data[v]}"${!notRoot ? '\r\n' : ''}`;
      } else {
        return `${v} = ${data[v]}${!notRoot ? '\r\n' : ''}`;
      }
      }).join('\r\n');
    } else {
      result = new String(data).toString();
    }

    return result;
  }

  static ETHRPC({ protocol, port, hostname, path, data }) {
    const opt = {
      protocol,
      port,
      hostname,
      path,
      headers: { 'content-type': 'application/json' },
      data
    };
    return ecRequest.post(opt).then((rs) => {
      return Promise.resolve(JSON.parse(rs.data));
    });
  }

  static initialAll({ version, configPath }) {
    const filePath = configPath ? configPath : path.resolve(__dirname, '../../private/config.toml');
    return this.readConfig({ filePath })
    .then((config) => {
      const rsConfig = config;
      rsConfig.argv = arguments[0];
      return this.initialFolder(config)
      .then(() => rsConfig);
    })
    .then((config) => Promise.all([
      config,
      this.initialDB(config),
      this.initialLogger(config),
      this.initiali18n(config),
      this.initialProcess(config)
    ]))
    .then((rs) => Promise.resolve({
      config: rs[0],
      database: rs[1],
      logger: rs[2],
      i18n: rs[3]
    }))
    .catch(console.trace);
  }

  static readJSON({ filePath }) {
    return this.readFile({ filePath })
    .then((data) => JSON.parse(data))
  }

  static readFile({ filePath }) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if(err) {
          reject(err);
        } else {
          resolve(data)
        }
      })
    })
  }

  static fileExists({ filePath }) {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err);
      })
    })
  }

  static async readConfig({ filePath }) {
    let config, defaultCFG, currentCFG;
  
    const packageInfo = await this.readPackageInfo();
    const basePath = path.resolve(os.homedir(), packageInfo.name);
    const fileExists = await this.fileExists({ filePath });
    const defaultCFGP = path.resolve(__dirname, '../../default.config.toml');
    const defaultCFGTOML = await this.readFile({ filePath: defaultCFGP });
    try {
      defaultCFG = toml.parse(defaultCFGTOML);
    } catch(e) {
      return Promise.reject(new Error(`Invalid config file: ${defaultCFGP}`));
    }

    if(!fileExists) {
      config = defaultCFG
    } else {
      const currentCFGP = filePath;
      const currentCFGTOML = await this.readFile({ filePath: currentCFGP });
      try {
        currentCFG = toml.parse(currentCFGTOML);
      } catch(e) {
        return Promise.reject(new Error(`Invalid config file: ${currentCFGP}`));
      }
      config = dvalue.default(currentCFG, defaultCFG);
    }
    config.packageInfo = packageInfo;
    config.runtime = {
      filePath,
      startTime: new Date().getTime()
    };
    config.homeFolder = config.base.folder ?
      path.resolve(basePath, config.base.folder) :
      basePath;
    return Promise.resolve(config);
  }

  static getConfig() {
    return JSON.parse(process.env.MERMER || '{}');
  }

  static readPackageInfo() {
    const filePath = path.resolve(__dirname, '../../package.json');
    return this.readJSON({ filePath  })
    .then((pkg) => {
      const packageInfo = {
        name: pkg.name,
        version: pkg.version,
        powerby: pkg.name + " v" + pkg.version
      };
      return Promise.resolve(packageInfo);
    });
  }

  static getLocaleData() {
    return {}
  }

  static listProcess() {
    return this.readPackageInfo()
    .then((packageInfo) => {
      const PIDFolder = path.resolve(os.homedir(), packageInfo.name, 'PIDs');
      this.scanFolder({ folder: PIDFolder })
      .then((list) => {
        const jobs = list
        .map((v) => parseInt(path.parse(v).name))
        .filter((v) => v > -1)
        .sort((a, b) => {
          return a > b ?
            1 :
            -1 ;
        })
        .map((PID, i) => this.readProcess({ PID, PIDFolder }));

        return Promise.all(jobs)
        .then((d) => {
          const bar = new Array(20).fill('-').join('');
          console.log(`${bar}\r\n${d.join('\r\n')}\r\n${bar}`);
        });
      });
    });
  }

  static readProcess({ PID, PIDFolder }) {
    return this.readPackageInfo()
    .then(packageInfo => {
      const PIDFolder = path.resolve(os.homedir(), packageInfo.name, 'PIDs');
      const PFile = path.resolve(PIDFolder, `${PID}.toml`);
      return Promise.resolve(PFile);
    })
    .then((PFile) => new Promise((resolve, reject) => {
      fs.readFile(PFile, (e, d) => {
        if(e) {
          reject(e);
        } else {
          let status;
          let uptime = '';
          const pInfo = toml.parse(d);
          const cPath = pInfo.runtime.configPath;
          if(this.testProcess({ PID })) {
            status = `\x1b[42m  on  \x1b[0m`;
            uptime = this.parseTime(pInfo.runtime.startTime);
          } else {
            status = `\x1b[41m off  \x1b[0m`;
            PID = `\x1b[90m${PID}\x1b[0m`;
            uptime = '\t';
          }
          resolve([PID, status, uptime, cPath].join('\t'));
        }
      });
    }));
  }

  static testProcess({ PID }) {
    try {
      process.kill(PID, 0);
      return true;
    } catch(e) {
      return false;
    }
  }

  static killProcess({ PID, pause }) {
    if(PID == 0) {
      return this.readPackageInfo()
      .then(packageInfo => {
        const PIDFolder = path.resolve(os.homedir(), packageInfo.name, 'PIDs');
        return this.scanFolder({ folder: PIDFolder });
      })
      .then((list) => {
        const PIDs = list.map((PFile) => path.parse(PFile).name);
        return Promise.all(PIDs.map((pid) => this.killProcess({ PID: pid, pause })));
      });
    }

    try {
      process.kill(PID);
    } catch(e) {

    }
    return this.readPackageInfo()
    .then(packageInfo => {
      const fPID = path.resolve(os.homedir(), packageInfo.name, 'PIDs', `${PID}.toml`);
      return new Promise((resolve, reject) => {
        if(pause) {
          resolve(true);
        } else {
          fs.unlink(fPID, resolve);
        }
      });
    })
  }

  static scanFolder({ folder }) {
    return new Promise((resolve, reject) => {
      fs.readdir(folder, (e, d) => {
        if(e) {
          reject(e);
        } else {
          resolve(d.map(v => path.resolve(folder, v)));
        }
      });
    })
  }

  static initialFolder({ homeFolder }) {
    if(!homeFolder) {
      return Promise.reject(new Error('folder name is undefined'));
    }
    return new Promise((resolve, reject) => {
      fs.exists(homeFolder, (rs) => {
        if(!rs) {
          fs.mkdir(homeFolder, (e, d) => {
            if(e) {
              reject(e);
            } else {
              resolve(homeFolder);
            }
          });
        } else {
          resolve(homeFolder);
        }
      });
    });
  }

  static initialProcess(config) {
    const { packageInfo } = config;
    const processContent = Utils.toToml(config);
    const systemHome = path.resolve(os.homedir(), packageInfo.name);

    return new Promise((resolve, reject) => {
      const PID = process.pid;
      const pathPID = path.resolve(systemHome, 'PIDs', `${PID}.toml`);
      fs.writeFile(pathPID, processContent, function(e) {
        if(e) {
          reject(e);
        } else {
          resolve(true);
        }
      });
    });
  }

  static initialDB({ homeFolder }) {
    const dbPath = path.resolve(homeFolder, 'dataset');
    return {};
  }

  static initialLogger({ homeFolder, base }) {
    return Promise.resolve({
      log: console.log,
      debug: base.debug ? console.log : () => {},
      trace: console.trace
    });
  }

  static initiali18n() {
    const localesFolder = path.resolve(__dirname, '../locales');
    return Promise.resolve(i18n);
  }

  static initialBots({ config, database, logger, i18n }) {
    const interfaceFN = 'Bot.js';
    const interfaceBot = require(path.resolve(__dirname, interfaceFN));
    return this.scanFolder({ folder: __dirname })
    .then((list) => list.filter((v) => path.parse(v).name != path.parse(interfaceFN).name))
    .then((list) => list.map((v) => require(v)))
    .then((list) => list.filter((v) => v.isBot))
    .then((list) => list.map((v) => new v()))
    .then((list) => Promise.all(
      list.map((v) => v.init({ config, database, logger, i18n }))
    ))
  }

  static startBots({ Bots }) {
    return Promise.all(Bots.map((bot) => bot.start()))
    .then(() => Promise.all(Bots.map((bot) => bot.ready())))
    .then(() => Bots );
  }

  static close({ Bots }) {
    const database = Bots[0].database;
    database.mongodb.close();
    database.leveldb.close();
  }

  static crossOrigin(options = {}) {
    const defaultOptions = {
      allowMethods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    };
  
    // set defaultOptions to options
    options = Object.assign({}, defaultOptions, options); // eslint-disable-line no-param-reassign
  
    // eslint-disable-next-line consistent-return
    return async function cors(ctx, next) {
      // always set vary Origin Header
      // https://github.com/rs/cors/issues/10
      ctx.vary('Origin');
  
      let origin;
      if (typeof options.origin === 'function') {
        origin = options.origin(ctx);
      } else {
        origin = options.origin || ctx.get('Origin') || '*';
      }
      if (!origin) {
        return await next();
      }
  
      // Access-Control-Allow-Origin
      ctx.set('Access-Control-Allow-Origin', origin);
  
      if (ctx.method === 'OPTIONS') {
        // Preflight Request
        if (!ctx.get('Access-Control-Request-Method')) {
          return await next();
        }
  
        // Access-Control-Max-Age
        if (options.maxAge) {
          ctx.set('Access-Control-Max-Age', String(options.maxAge));
        }
  
        // Access-Control-Allow-Credentials
        if (options.credentials === true) {
          // When used as part of a response to a preflight request,
          // this indicates whether or not the actual request can be made using credentials.
          ctx.set('Access-Control-Allow-Credentials', 'true');
        }
  
        // Access-Control-Allow-Methods
        if (options.allowMethods) {
          ctx.set('Access-Control-Allow-Methods', options.allowMethods.join(','));
        }
  
        // Access-Control-Allow-Headers
        if (options.allowHeaders) {
          ctx.set('Access-Control-Allow-Headers', options.allowHeaders.join(','));
        } else {
          ctx.set('Access-Control-Allow-Headers', ctx.get('Access-Control-Request-Headers'));
        }
  
        ctx.status = 204; // No Content
      } else {
        // Request
        // Access-Control-Allow-Credentials
        if (options.credentials === true) {
          if (origin === '*') {
            // `credentials` can't be true when the `origin` is set to `*`
            ctx.remove('Access-Control-Allow-Credentials');
          } else {
            ctx.set('Access-Control-Allow-Credentials', 'true');
          }
        }
  
        // Access-Control-Expose-Headers
        if (options.exposeHeaders) {
          ctx.set('Access-Control-Expose-Headers', options.exposeHeaders.join(','));
        }
  
        try {
          await next();
        } catch (err) {
          throw err;
        }
      }
    };
  }
}

module.exports = Utils;
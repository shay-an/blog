---
title: session
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2023-09-28
category:
  - session
tag:
  - session
  - 后端
star: true
sticky: true
---

由于 HTTP 请求是无状态的，为了实现用户登录状态，可以使用 token session 等技术实现登录状态保持。

token 和 session 在实现上某些点还是比较类似的，token 是登录后后端给前端返回一个字符串标识用来映射用户，这个字符串可以是一个 uuid 等唯一标识。

session 实际上是 Web 上的一个技术实现，session 的大概流程是用户登录后后端通过 setCookie 的 HTTP 请求头在 cookie 上持久化一个 sessionID，用这个 sessionID来映射这个用户，从而实现了用户状态保持这样一个功能。

下面从 express-session 这个库看看 session 的具体实现。

先看一下用法：
```javascript
var session = require('express-session');
app.use(session({
    secret: '12345',    // 秘钥
    name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 80000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false, // 是否重新保存 session
    saveUninitialized: true,
}));

```

index.js

```javascript
function session(options) {
  var opts = options || {}

  // 省略读取配置代码
  // 生成新的session
  store.generate = function(req){
    req.sessionID = generateId(req);
    req.session = new Session(req);
    req.session.cookie = new Cookie(cookieOptions);

    if (cookieOptions.secure === 'auto') {
      req.session.cookie.secure = issecure(req, trustProxy);
    }
  };

  var storeImplementsTouch = typeof store.touch === 'function';

  // express-session 支持自定义 store,这里注册了 store 连接成功/断开连接时的标志位
  var storeReady = true
  store.on('disconnect', function ondisconnect() {
    storeReady = false
  })
  store.on('connect', function onconnect() {
    storeReady = true
  })
  // 这里返回了函数，这里是一个标准的 express 中间件实现方式，以下代码着重看一下中文注释
  return function session(req, res, next) {
    // self-awareness
    if (req.session) {
      next()
      return
    }
    // 如果 store 没有连接成功则打印错误
    if (!storeReady) {
      debug('store is disconnected')
      next()
      return
    }

    // pathname mismatch
    var originalPath = parseUrl.original(req).pathname || '/'
    if (originalPath.indexOf(cookieOptions.path || '/') !== 0) return next();

    // ensure a secret is available or bail
    if (!secret && !req.secret) {
      next(new Error('secret option required for sessions'));
      return;
    }

    // backwards compatibility for signed cookies
    // req.secret is passed from the cookie parser middleware
    var secrets = secret || [req.secret];

    var originalHash;
    var originalId;
    var savedHash;
    var touched = false

    // expose store
    req.sessionStore = store;

    // 从 cookie 中获取 cookieId 和 sessionID
    var cookieId = req.sessionID = getcookie(req, name, secrets);
    // 
    function shouldSetCookie(req) {
      // 没有sessionID 就没有办法设置cookie
      if (typeof req.sessionID !== 'string') {
        return false;
      }
      // 当 cookieId 和 sessionID 不同
      return cookieId !== req.sessionID
        ? saveUninitializedSession || isModified(req.session)
        : rollingSessions || req.session.cookie.expires != null && isModified(req.session);
    }

    // set-cookie 设置cookie
    onHeaders(res, function(){
      // 如果没有session
      if (!req.session) {
        debug('no session');
        return;
      }
      // 关键流程，是否需要设置cookie
      if (!shouldSetCookie(req)) {
        return;
      }

      // only send secure cookies via https
      if (req.session.cookie.secure && !issecure(req, trustProxy)) {
        debug('not secured');
        return;
      }

      if (!touched) {
        // touch session
        req.session.touch()
        touched = true
      }

      // set cookie
      setcookie(res, name, req.sessionID, secrets[0], req.session.cookie.data);
    });

    // proxy end() to commit the session
    // 这里重写原生的 res.end 方法，用于提交session
    // 缓存原生 end 方法
    var _end = res.end;
    var _write = res.write;
    var ended = false;
    res.end = function end(chunk, encoding) {
      // 如果之前执行过则不再提交 session
      if (ended) {
        return false;
      }

      ended = true;

      var ret;
      var sync = true;

      function writeend() {
        if (sync) {
          ret = _end.call(res, chunk, encoding);
          sync = false;
          return;
        }

        _end.call(res);
      }

      function writetop() {
        if (!sync) {
          return ret;
        }

        if (!res._header) {
          res._implicitHeader()
        }

        if (chunk == null) {
          ret = true;
          return ret;
        }

        var contentLength = Number(res.getHeader('Content-Length'));

        if (!isNaN(contentLength) && contentLength > 0) {
          // measure chunk
          chunk = !Buffer.isBuffer(chunk)
            ? Buffer.from(chunk, encoding)
            : chunk;
          encoding = undefined;

          if (chunk.length !== 0) {
            debug('split response');
            ret = _write.call(res, chunk.slice(0, chunk.length - 1));
            chunk = chunk.slice(chunk.length - 1, chunk.length);
            return ret;
          }
        }

        ret = _write.call(res, chunk, encoding);
        sync = false;

        return ret;
      }

      if (shouldDestroy(req)) {
        // 销毁session
        debug('destroying');
        store.destroy(req.sessionID, function ondestroy(err) {
          if (err) {
            defer(next, err);
          }

          debug('destroyed');
          writeend();
        });

        return writetop();
      }

      // no session to save
      if (!req.session) {
        debug('no session');
        return _end.call(res, chunk, encoding);
      }

      if (!touched) {
        // touch session
        req.session.touch()
        touched = true
      }

      if (shouldSave(req)) {
        req.session.save(function onsave(err) {
          if (err) {
            defer(next, err);
          }

          writeend();
        });

        return writetop();
      } else if (storeImplementsTouch && shouldTouch(req)) {
        // store implements touch method
        debug('touching');
        store.touch(req.sessionID, req.session, function ontouch(err) {
          if (err) {
            defer(next, err);
          }

          debug('touched');
          writeend();
        });

        return writetop();
      }

      return _end.call(res, chunk, encoding);
    };

    // generate the session
    function generate() {
      store.generate(req);
      originalId = req.sessionID;
      originalHash = hash(req.session);
      wrapmethods(req.session);
    }

    // inflate the session
    function inflate (req, sess) {
      store.createSession(req, sess)
      originalId = req.sessionID
      originalHash = hash(sess)

      if (!resaveSession) {
        savedHash = originalHash
      }

      wrapmethods(req.session)
    }

    function rewrapmethods (sess, callback) {
      return function () {
        if (req.session !== sess) {
          wrapmethods(req.session)
        }

        callback.apply(this, arguments)
      }
    }

    // wrap session methods
    function wrapmethods(sess) {
      var _reload = sess.reload
      var _save = sess.save;

      function reload(callback) {
        debug('reloading %s', this.id)
        _reload.call(this, rewrapmethods(this, callback))
      }

      function save() {
        debug('saving %s', this.id);
        savedHash = hash(this);
        _save.apply(this, arguments);
      }

      Object.defineProperty(sess, 'reload', {
        configurable: true,
        enumerable: false,
        value: reload,
        writable: true
      })

      Object.defineProperty(sess, 'save', {
        configurable: true,
        enumerable: false,
        value: save,
        writable: true
      });
    }

    // check if session has been modified
    function isModified(sess) {
      return originalId !== sess.id || originalHash !== hash(sess);
    }

    // check if session has been saved
    function isSaved(sess) {
      return originalId === sess.id && savedHash === hash(sess);
    }

    // determine if session should be destroyed
    function shouldDestroy(req) {
      return req.sessionID && unsetDestroy && req.session == null;
    }

    // determine if session should be saved to store
    function shouldSave(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        debug('session ignored because of bogus req.sessionID %o', req.sessionID);
        return false;
      }

      return !saveUninitializedSession && !savedHash && cookieId !== req.sessionID
        ? isModified(req.session)
        : !isSaved(req.session)
    }

    // determine if session should be touched
    function shouldTouch(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        debug('session ignored because of bogus req.sessionID %o', req.sessionID);
        return false;
      }

      return cookieId === req.sessionID && !shouldSave(req);
    }

    // determine if cookie should be set on response
    function shouldSetCookie(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        return false;
      }

      return cookieId !== req.sessionID
        ? saveUninitializedSession || isModified(req.session)
        : rollingSessions || req.session.cookie.expires != null && isModified(req.session);
    }

    // generate a session if the browser doesn't send a sessionID
    if (!req.sessionID) {
      debug('no SID sent, generating session');
      generate();
      next();
      return;
    }

    // generate the session object
    debug('fetching %s', req.sessionID);
    store.get(req.sessionID, function(err, sess){
      // error handling
      if (err && err.code !== 'ENOENT') {
        debug('error %j', err);
        next(err)
        return
      }

      try {
        if (err || !sess) {
          debug('no session found')
          generate()
        } else {
          debug('session found')
          inflate(req, sess)
        }
      } catch (e) {
        next(e)
        return
      }

      next()
    });
  };
}
```

中间件开发可以参考这个代码结构，通过一个闭包先处理 options,然后返回一个函数用作中间件执行的回调，函数内可以访问 options。重写方法可以先缓存原有方法，覆盖对象身上原有方法，利用call apply bind 可绑定 this 的特性调用缓存方法指定该对象，实现完整的方法覆写，并保证原有逻辑不变。

自定义 store 需实现 store.get(sessionID) 获取 session  store.touch(sessionID) 删除空闲 session store.destroy(sessionID) 销毁指定 session, 在 store 连接断开时发送 disconnect 事件，在 store 连接成功时发送 connect 事件。
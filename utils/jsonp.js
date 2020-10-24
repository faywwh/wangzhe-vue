function jsonp(url, opts = {}) {
  // 实现Promise化
  return new Promise((resolve, reject) => {
    //设置默认参数
    const {
      name = '__jp',
      param = 'callback',
      timeout = 60000,
      data = {},
    } = opts;
    let timer;
    //清除script标签以及注册的全局函数以及超时定时器
    function cleanup() {
      // 清除函数
      if (script.parentNode) {
        script.parentNode.removeChild(script);
        window[name] = null;
        if (timer) {
          clearTimeout(timer);
        }
      }
    }
    if (timeout) {
      // 超时
      timer = setTimeout(() => {
        cleanup();
        reject('timeout');
      }, timeout);
    }
    // 注册全局函数，等待执行中...
    window[name] = (res) => {
      // 只要这个函数一执行，就表示请求成功，可以使用清除函数了
      if (window[name]) {
        cleanup();
      }
      // 将请求到的数据扔给then
      resolve(res);
    };
    // 以下将data对象格式的参数拼接到url的后面
    url +=
      (url.indexOf('?') < 0 ? '?' : '&') +
      parseParam({ ...data, ...{ [param]: name } });
    // 最后加上与服务端协商的jsonp请求字段
    const script = document.createElement('script');
    script.src = url;
    // 以下这条执行且成功后，全局等待函数就会被执行
    document.head.appendChild(script);
  });
}

function parseParam(data) {
  let url = '';
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''; // 如果有data,则value等于data中的值
    url += `&${k}=${encodeURIComponent(value)}`; // 拼接url
  }
  return url ? url.substring(1) : ''; // 去掉第一个 & 符号
}


// ---------------------Tools--------------------------
// 自调用函数传入 window的目的，是让变量名可以被压缩
// 在老版本的浏览器中 undefined 可以被重新赋值
;(function (window, undefined) {
  var Tools = {
    getRandom: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) +  min;
    }
  }
  // 暴露Tools给window
  window.Tools = Tools;
})(window, undefined)

// -----------------------Food---------------------------
;(function (window, undefined) {
  // 局部作用域
  var position = 'absolute';
  // 记录上一次创建的食物，为删除做准备
  var elements = [];
  function Food(options) {
    options = options || {};
    this.x = options.x || 0;
    this.y = options.y || 0;

    this.width = options.width || 20;
    this.height = options.height || 20;

    this.color = options.color || 'green';
  }

  // 渲染
  Food.prototype.render = function (map) {
    // 删除之前创建的食物
    remove();

    // 随机设置x和y的值
    this.x = Tools.getRandom(0, map.offsetWidth/this.width - 1) * this.width;
    this.y = Tools.getRandom(0, map.offsetHeight/this.height - 1) * this.height;

    // 动态创建div  页面上显示的食物
    var div = document.createElement('div');
    map.appendChild(div);

    elements.push(div);

    // 设置div的样式
    div.style.position = position;
    div.style.left = this.x + 'px';
    div.style.top = this.y + 'px';
    div.style.width = this.width + 'px';
    div.style.height = this.height + 'px';
    div.style.backgroundColor = this.color;
  }

  function remove() {
    for (var i = elements.length - 1; i >= 0; i--) {
      // 删除div
      elements[i].parentNode.removeChild(elements[i]);
      // 删除数组中的元素
      // 删除数组元素
      // 第一个参数，从哪个元素开始删除
      // 第二个参数，删除几个元素
      elements.splice(i, 1);
    }
  }

  // 把Food构造函数  让外部可以访问
  window.Food = Food;
})(window, undefined)

// ---------------------------Snake----------------------
;(function (window, undefined) {
  var position = 'absolute';
  // 记录之前创建的蛇
  var elements = [];
  function Snake(options) {
    options = options || {};
    // 蛇节 的大小
    this.width = options.width || 20;
    this.height = options.height || 20;
    // 蛇移动的方向
    this.direction = options.direction || 'right';
    // 蛇的身体(蛇节)  第一个元素是蛇头
    this.body = [
      {x: 3, y: 2, color: 'red'},
      {x: 2, y: 2, color: 'blue'},
      {x: 1, y: 2, color: 'blue'}
    ];
  }

  Snake.prototype.render = function (map) {
    // 删除之前创建的蛇
    remove();
    // 把每一个蛇节渲染到地图上
    for (var i = 0, len = this.body.length; i < len; i++) {
      // 蛇节
      var object = this.body[i];
      // 
      var div = document.createElement('div');
      map.appendChild(div);

      // 记录当前蛇
      elements.push(div);

      // 设置样式
      div.style.position = position;
      div.style.width = this.width + 'px';
      div.style.height = this.height + 'px';
      div.style.left = object.x * this.width + 'px';
      div.style.top = object.y * this.height + 'px';
      div.style.backgroundColor = object.color;
    }
  }
  // 私有的成员
  function remove() {
    for (var i = elements.length - 1; i >= 0; i--) {
      // 删除div
      elements[i].parentNode.removeChild(elements[i]);
      // 删除数组中的元素
      elements.splice(i, 1);
    }
  }

  // 控制蛇移动的方法
  Snake.prototype.move = function (food, map) {
    // 控制蛇的身体移动（当前蛇节 到 上一个蛇节的位置）
    for (var i = this.body.length - 1; i > 0; i--) {
      this.body[i].x = this.body[i - 1].x;
      this.body[i].y = this.body[i - 1].y;
    }
    // 控制蛇头的移动
    // 判断蛇移动的方向
    var head = this.body[0];
    switch(this.direction) {
      case 'right': 
        head.x += 1;
        break;
      case 'left': 
        head.x -= 1;
        break;
      case 'top':
        head.y -= 1;
        break;
      case 'bottom':
        head.y += 1;
        break;
    }

    // 2.4 判断蛇头是否和食物的坐标重合
    var headX = head.x * this.width;
    var headY = head.y * this.height;
    if (headX === food.x && headY === food.y) {
      // 让蛇增加一节
      // 获取蛇的最后一节
      var last = this.body[this.body.length - 1];
      this.body.push({
        x: last.x,
        y: last.y,
        color: last.color
      })

      // 随机在地图上重新生成食物
      food.render(map);
    }

  }

  // 暴露构造函数给外部
  window.Snake = Snake;
})(window, undefined)

//----------------------Game---------------------------
;(function (window, undefined) {
  var that;  // 记录游戏对象
  function Game(map) {
    this.food = new Food();
    this.snake = new Snake();
    this.map = map;
    that = this;
  }

  Game.prototype.start = function () {
    // 1 把蛇和食物对象，渲染到地图上
    this.food.render(this.map);
    this.snake.render(this.map);
    // 2 开始游戏的逻辑
    // 2.1  让蛇移动起来
    // 2.2  当蛇遇到边界游戏结束
    runSnake();
    // 2.3  通过键盘控制蛇移动的方向
    bindKey();
    // 2.4  当蛇遇到食物 --- 在snake的move方法中处理  
   }

   // 通过键盘控制蛇移动的方向
  function bindKey() {
    // document.onkeydown = function () {};
    document.addEventListener('keydown', function (e) {
      // console.log(e.keyCode);
      // 37 - left
      // 38 - top
      // 39 - right
      // 40 - bottom
      switch (e.keyCode) {
        case 37: 
          this.snake.direction = 'left';
          break;
        case 38:
          this.snake.direction = 'top';
          break;
        case 39:
          this.snake.direction = 'right';
          break;
        case 40:
          this.snake.direction = 'bottom';
          break;
      }
    }.bind(that), false);
  }

   // 私有的函数  让蛇移动
   function runSnake() {
     var timerId = setInterval(function () {
       // 让蛇走一格
       // 在定时器的function中this是指向window对象的
       // this.snake
       // 要获取游戏对象中的蛇属性
       this.snake.move(this.food, this.map);
       this.snake.render(this.map);

        // 2.2  当蛇遇到边界游戏结束
        // 获取蛇头的坐标
        var maxX = this.map.offsetWidth / this.snake.width;
        var maxY = this.map.offsetHeight / this.snake.height;
        var headX = this.snake.body[0].x;
        var headY = this.snake.body[0].y;
        if (headX < 0 || headX >= maxX) {
          alert('Game Over');
          clearInterval(timerId);
        }

        if (headY < 0 || headY >= maxY) {
          alert('Game Over');
          clearInterval(timerId);
        }
     }.bind(that), 150);
   }

  // 暴露构造函数给外部
  window.Game = Game;
})(window, undefined)

// -------------------调用------------------
;(function (window, undefined) {
  var map = document.getElementById('map');
  var game = new Game(map);
  game.start();
})(window, undefined)

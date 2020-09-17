/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Aframe Fractal component for A-Frame.框架的框架分形组件。
 */
AFRAME.registerComponent('fractal', {
  schema: {
    x: {type: 'string', default: 't' },//基于t值确定每个点的坐标
    y: {type: 'string', default: 't' },
    z: {type: 'string', default: 't' },
    audioSource: {type:'selector'},//探测的声音源
    colors: {type: 'array', default: [ '#f4ee42', '#41f468', '#41dff4' ]},//根据音乐数据进行相应的颜色
    detail: {type: 'int', default: 100},//用多少材质对象，不太明白
    fftSize: {type: 'int', default: 256},//fft尺寸
    points: {type: 'int', default: 100},//点的是数量
    pointSize: {type: 'int', default: 1},//点的大小
    scale: {type: 'float', default: 1},//坐标的缩放
    logValues: {type: 'boolean', default: false}//往控制台输出点的坐标值
  },

  /**
   * Set if component needs multiple instancing.设置组件是否需要多个实例。
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.附加组件时调用一次。通常用于初始设置。
   */
  init: function () {
    console.log("Hello");
    this.Fractal = {
      pause: false
    };
    var self = this;

    if ( !this.data.audioSource ) {//得到输入的音源名

      let sourceSelector = this.el.getAttribute('audioSource');//找到并选择音源

      if ( !sourceSelector ) {

        this.data.audioSource = false;//如果找不到就取消

      } else {

        this.data.audioSource = document.querySelector( sourceSelector );//找到就把aframe的音源装载到3js的音源里

      }

    }

//这里也是音源相关的操作，具体不知道什么意思
    this.data.audioSource = this.data.audioSource ? this.data.audioSource : this.el.getAttribute('audioSource');

//创建一个自定义函数，将颜色转换为16进制（待定）
    this.Fractal.componentToHex = function (c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };

    /*
      Prepare colors in the following format... 按照以下格式准备颜色...
      You can have more or less than 3 colors 您可以有多于或少于3种颜色

      [
        { pct: 0, color: { r: 0xf4, g: 0xee, b: 0x42 } },
        { pct: 0.5, color: { r: 0x41, g: 0xf4, b: 0x68 } },
        { pct: 1, color: { r: 0x41, g: 0xdf, b: 0xf4 } }
      ]

    */

    //一个更新颜色的函数
    this.Fractal.updateColors = function () {

      //先设一个数组
      this.Fractal.colors = [];

      //遍历数组
      for ( var i = 0; i < this.data.colors.length; i++  ) {

        try {

          //把颜色单独拎出来，用3js获取颜色，colors是输入的颜色
          var color = new THREE.Color( this.data.colors[i] ).getHexString();

          //有点超出知识范围了，应该是实际开始更新颜色
          this.Fractal.colors.push({
            pct: i / ( this.data.colors.length - 1 ),//pct应该是百分比的意思，应该是内置的参数
            color: {
              r: '0x' + color.slice(0,2),//可能是颜色模式的转换
              g: '0x' + color.slice(2,4),
              b: '0x' + color.slice(4,6)
            }
          });

        } catch ( err ) {
          console.log(`Please enter a valid color.\n${err}`);
        }

      }

    }.bind(self);

    /*
      The function to generate colors based on percentages 基于百分比生成颜色的函数
    */

    //getColor应该是一个自定义函数
    this.Fractal.getColor = function ( pct ) {
  		for (var i = 1; i < this.Fractal.colors.length - 1; i++) {//从点组中获取每个点的颜色
          if (pct < this.Fractal.colors[i].pct) {//获取这个点的颜色的百分比然后进行比较，若当前颜色的百分比大于给的百分比，就拿出来
              break;
          }
      }
      var lower = this.Fractal.colors[i - 1];//前一个颜色，为低的百分比
      var upper = this.Fractal.colors[i];//当前颜色，为高的百分比
      var range = upper.pct - lower.pct;//高减低为范围
      var rangePct = (pct - lower.pct) / range;//范围的百分比
      var pctLower = 1 - rangePct;//低的百分比
      var pctUpper = rangePct;//高的百分比
      var color = {//根据百分比生成一个颜色
          r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
          g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
          b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
      };
      //把颜色弄出来
      return '0x' + this.Fractal.componentToHex(color.r) + this.Fractal.componentToHex(color.g) + this.Fractal.componentToHex(color.b);
  	}.bind(self);

    /*
      Generate the function to plot the coordinates  生成绘制坐标的函数
    */

    //这个函数应该是读取点的数组种指定序号的点的坐标
    this.Fractal.ft = function ( t ) {
      //获取前一个点，如果有长度，就获取最后一个（待定），如果没有，就生成一个
      var prev = this.Fractal.PointArray.length ? this.Fractal.PointArray[this.Fractal.PointArray.length-1] : {x:0.0000001,y:0.0000001,z:0.0000001};
      //返回坐标值
      return { x: eval(this.data.x), y: eval(this.data.y), z: eval(this.data.z) };
    }.bind(self);

    //元素生成
    this.Fractal.generate = function () {
      //先声明点的数组
      this.Fractal.PointArray = [];

      //如果音源数据不小于2或者颜色长度小于2
      if ( !this.data.audioSource || this.data.colors.length < 2 ) {

        //What to do if there is no audio or the user only selected 1 color
        //这是没有音频或者用户只选择了一种颜色的情况下所执行的操作

        //如果没有音频，或者用户只选择了一种颜色
        this.Fractal.geometry = new THREE.Geometry();//创建几何体

        for(var i=0; i < this.data.points; i++) {//遍历设好的点

          var result = this.Fractal.ft( i );//调用读取点的坐标的函数
          var point = new THREE.Vector3();//点作为网格模型的顶点

          this.Fractal.PointArray.push( result );//push是给数组添加一个新元素，这里就是把刚刚获取的点的坐标push进数组
    			point.x = result.x * this.data.scale;//这里是做一个scale的功能
    			point.y = result.y * this.data.scale;//scale来自于输入的数据
    			point.z = result.z * this.data.scale;
          // console.log("Hello");
          //这里是做一个print点的坐标的功能，是否开启决定于输入的数据
          if ( this.data.logValues ) {
            console.log( `x: ${point.x}, y: ${point.y}, z: ${point.z}` );
          }

          //将点push到顶点数组中
          this.Fractal.geometry.vertices.push( point );

        }

        //通过点创建网格模型
        this.Fractal.mesh = new THREE.Points(
            this.Fractal.geometry,
            new THREE.PointsMaterial({
              color: this.data.colors[0],
              size: this.data.pointSize} )
        );

        //将3js网格模型添加到aframe的3D对象中
        this.el.setObject3D('mesh', this.Fractal.mesh);

      } else {
        //如果有音频，或者用户选择了多种颜色

        //声明音频分析数组
        this.Fractal.audioAnalysers = [];
        //声明材质数组
        this.Fractal.materials = [];
        //声明云（云是什么待定），应该是由顶点组成的形状
        this.Fractal.clouds = [];
        //创建一个3js对象组
        this.Fractal.group = new THREE.Group();

        //求一个点和材质对象的平均数
        var average = (this.data.points - (this.data.points % this.data.detail)) / this.data.detail;
        //平均数小于1则为1，大于1就为平均数
        average = average < 1 ? 1 : average;
        //好像有点明白点和细节的意思了，细节的材质对象可能是最终能形成对象的数量，而形成一个最终对象可能需要多个点
        //细节和点可能是两种控制数量的方式
        //网格模型数量
        //网格模型的数量取决于点或者细节
        //如果细节多于点，就用点，如果点多于细节，就用细节
        var meshes = this.data.detail > this.data.points ? this.data.points : this.data.detail;

        //变量细节，也就是网格模型
        for ( var i = 0; i < meshes; i++ ) {
          // The shape is made up of vertexes generated 由顶点组成形状
          //直接通过一个i创建几何体
          this.Fractal.clouds[i] = new THREE.Geometry();
          //通过i设置材质
          this.Fractal.materials[i] = new THREE.PointsMaterial({color: this.data.colors[0], size: this.data.pointSize});
        }

        //Plot points 绘制点，点的数量为传入的数量，这里是通过point绘制图形
        //遍历点的数组
        for(var i=0; i < this.data.points; i++) {

          //获取该序号的点的坐标
          var result = this.Fractal.ft( i );

          //将点的坐标放入数组
          this.Fractal.PointArray.push( result );
          //创建一个组
          var group;

          //将点变成向量
          var point = new THREE.Vector3();
    			point.x = result.x * this.data.scale;//以下x,y, z都是来自于外部
    			point.y = result.y * this.data.scale;//坐标进行缩放
    			point.z = result.z * this.data.scale;

          //打印坐标
          if ( this.data.logValues ) {
            console.log( `x: ${point.x}, y: ${point.y}, z: ${point.z}` );
          }


          //这块没太看得明白，大概是为点分组，为创建几何体做准备
          if ( Math.floor( i / average )  > ( meshes - 1 ) ) {
    				group = ( meshes - 1 );
    			} else {
    				group = Math.floor( i / average );
    			}

          //把顶点放到同一个几何体的组里，为创建几何体做准备
          //至此，cloud也是一个每个元素由几个顶点组成的组
          this.Fractal.clouds[ group ].vertices.push( point );


        }

        //Create meshes and add it to the group 创建网格模型并加入到组中

        //遍历cloud组的元素
        for(var i=0; i < this.Fractal.clouds.length; i++) {
          //用cloud和材质创建一个3js点，并加入到组中
          this.Fractal.group.add(new THREE.Points( this.Fractal.clouds[i], this.Fractal.materials[i] ));
        }

        //把整个组从3js加入到aframe中
        this.el.setObject3D('group', this.Fractal.group);

        //做一个能够监听音源的函数
        this.data.audioSource.addEventListener('sound-loaded', function ( e ) {

          //声明一个音源分析的数组
          this.Fractal.audioAnalysers = [];

          //获取声音，然后遍历声音，我也不是特别明白
          this.data.audioSource.components.sound.pool.children.forEach(function ( sound ) {
            //Create audioAnalyzer
            //创建声音分析器

            //实际上也就是把3js的声音分析装进来
            this.Fractal.audioAnalysers.push( new THREE.AudioAnalyser( sound, this.data.fftSize) );

          }.bind(self));

        }.bind(self))

      }

    }.bind(self);

    /*
      Update Material Colors based on audio input 基于音频输入更新材质颜色
    */

    this.Fractal.listen = function () {

      //如果音频分析存在
      if ( this.Fractal.audioAnalysers.length ) {
        //频谱等于音频分析每一个片段中的频率
        var spectrum = this.Fractal.audioAnalysers[0].getFrequencyData();
        //i从0开始
        var i = 0;


        //根据音频数据更新颜色
        //遍历材质里的每一个点对象
        this.Fractal.materials.forEach(( point ) => {

          //计算好对应的颜色
          var color = this.Fractal.getColor( spectrum[ i ] / 256 );
          console.log(spectrum[ i ]);
          //把颜色放进去
          point.color.setHex( color );
          i++;
        });
      }

    }.bind(self);

    this.Fractal.updateColors();
    this.Fractal.generate();
  },

  /**
   * Called when component is attached and when component data changes. 在附加组件和组件数据更改时调用。
   * Generally modifies the entity based on the data. 通常根据数据修改实体。
   */
  update: function (oldData) {

    data = this.data;

    //The if statement would have been far too long so I added this function to add a digit to the regenerate variable for each statement that is true.
    //if语句太长了，所以我添加了这个函数，为每个正确的语句的再生变量添加一个数字。

    function needsRegeneration () {
      let regenerate = data.x != oldData.x ? 1 : 0;
      regenerate += data.y != oldData.y ? 1 : 0;
      regenerate += data.z != oldData.z ? 1 : 0;
      regenerate += data.scale != oldData.scale ? 1 : 0;
      regenerate += data.points != oldData.points ? 1 : 0;
      regenerate += data.detail != oldData.detail ? 1 : 0;
      regenerate += data.detail != oldData.detail ? 1 : 0;
      regenerate += data.fftSize != oldData.fftSize ? 1 : 0;
      regenerate += data.pointSize != oldData.pointSize ? 1 : 0;
      return regenerate;
    }

    if ( needsRegeneration() > 0 ) {
      this.Fractal.generate();
    }

    if ( data.colors != oldData.colors ) {
      this.Fractal.updateColors();
    }

  },

  /**
   * Called when a component is removed (e.g., via removeAttribute). 移除组件时调用(例如，通过移除属性)。
   * Generally undoes all modifications to the entity. 通常撤消对实体的所有修改。
   */
  remove: function () { },

  /**
   * Called on each scene tick. 在每个场景中调用。
   */
  tick: function (t) {
    if ( this.data.audioSource && this.data.colors.length > 1 && !this.Fractal.pause ) {
      this.Fractal.listen();
    }
  },

  /**
   * Called when entity pauses. 实体暂停时调用。
   * Use to stop or remove any dynamic or background behavior such as events. 用于停止或删除任何动态或背景行为，如事件。
   */
  pause: function () {
    this.Fractal.pause = true;
  },

  /**
   * Called when entity resumes. 实体恢复时调用。
   * Use to continue or add any dynamic or background behavior such as events. 用于继续或添加任何动态或背景行为，如事件。
   */
  play: function () {
    this.Fractal.pause = false;
  }
});


/***/ })
/******/ ]);
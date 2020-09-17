var ImprovedNoise = function () {

    var p = [ 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10,
        23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87,
        174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
        133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208,
        89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5,
        202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119,
        248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
        178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
        14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205,
        93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180 ];

    for ( var i = 0; i < 256; i ++ ) {

        p[ 256 + i ] = p[ i ];

    }

    function fade( t ) {

        return t * t * t * ( t * ( t * 6 - 15 ) + 10 );

    }

    function lerp( t, a, b ) {

        return a + t * ( b - a );

    }

    function grad( hash, x, y, z ) {

        var h = hash & 15;
        var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ( ( h & 1 ) == 0 ? u : - u ) + ( ( h & 2 ) == 0 ? v : - v );

    }

    return {

        noise: function ( x, y, z ) {

            var floorX = Math.floor( x ), floorY = Math.floor( y ), floorZ = Math.floor( z );

            var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;

            x -= floorX;
            y -= floorY;
            z -= floorZ;

            var xMinus1 = x - 1, yMinus1 = y - 1, zMinus1 = z - 1;

            var u = fade( x ), v = fade( y ), w = fade( z );

            var A = p[ X ] + Y, AA = p[ A ] + Z, AB = p[ A + 1 ] + Z, B = p[ X + 1 ] + Y, BA = p[ B ] + Z, BB = p[ B + 1 ] + Z;

            return lerp( w, lerp( v, lerp( u, grad( p[ AA ], x, y, z ),
                grad( p[ BA ], xMinus1, y, z ) ),
                lerp( u, grad( p[ AB ], x, yMinus1, z ),
                    grad( p[ BB ], xMinus1, yMinus1, z ) ) ),
                lerp( v, lerp( u, grad( p[ AA + 1 ], x, y, zMinus1 ),
                    grad( p[ BA + 1 ], xMinus1, y, z - 1 ) ),
                    lerp( u, grad( p[ AB + 1 ], x, yMinus1, zMinus1 ),
                        grad( p[ BB + 1 ], xMinus1, yMinus1, zMinus1 ) ) ) );

        }
    };

};



/**
 * Aframe cube component for A-Frame.框架的框架分形组件。
 */
AFRAME.registerComponent('cube', {
    schema: {
        audioSource: {type:'selector'},//探测的声音源
        fftSize: {type: 'int', default: 256},//fft尺寸
        color: {
            default: {
                H: 175/360,
                S: 0.551,
                L: 0.7
            }
        },
        position: {
            default: {
                x: 0,
                y: 0,
                z: -5,
            }
        }
    },

    /**
     * Set if component needs multiple instancing.设置组件是否需要多个实例。
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.附加组件时调用一次。通常用于初始设置。
     */
    init: function () {
        this.cube = {
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



        /*
          The function to generate colors based on percentages 基于百分比生成颜色的函数
        */








        //元素生成
        this.cube.generate = function () {

            //如果音源数据不小于2或者颜色长度小于2
            if ( !this.data.audioSource) {
                console.log('No music source');
            } else {
                //如果有音频，或者用户选择了多种颜色

                //声明音频分析数组
                this.cube.audioAnalysers = [];

                //创建方块

                this.cube.drawLoop(1,0);
                this.cube.drawLoop(1,1);
                this.cube.drawLoop(1,-1);
                this.cube.drawLoop(1,2);
                this.cube.drawLoop(1,-2);
                //
                this.cube.drawLoop(2,0);
                this.cube.drawLoop(2,1);
                this.cube.drawLoop(2,-1);
                this.cube.drawLoop(2,2);
                this.cube.drawLoop(2,-2);



                // for(var i = 10; i <= 10; i++){
                //     // this.cube.Box( (Math.cos(i * 0.1) * 10) , (Math.cos(i * 0.1) * 10), Math.random()*2);
                //     this.cube.Box( i*2 , 0, 0);
                // }


                //做一个能够监听音源的函数
                this.data.audioSource.addEventListener('sound-loaded', function ( e ) {

                    //声明一个音源分析的数组
                    this.cube.audioAnalysers = [];

                    //获取声音，然后遍历声音，我也不是特别明白
                    this.data.audioSource.components.sound.pool.children.forEach(function ( sound ) {
                        //Create audioAnalyzer
                        //创建声音分析器

                        //实际上也就是把3js的声音分析装进来
                        this.cube.audioAnalysers.push( new THREE.AudioAnalyser( sound, this.data.fftSize) );

                    }.bind(self));

                }.bind(self))

            }

        }.bind(self);


        this.cube.map = function (num, min1, max1, min2, max2){
            if(num <= min1){
                num = min2;
                return num;
            }
            if(num >= max1){
                num = max2;
                return num;
            }
            if(num > min1 || num < max1){
                num = num / max1 * max2;
                return num;
            }
        }.bind(self);

        this.cube.Box = function(x, y, z){
            var perlin = new ImprovedNoise();
            var scale = 1.00004;

            let object = this.el.object3D;
            var data = this.data;
            var color = data.color;
            var H = color.H;
            var S = color.S;
            var L = color.L;

            var colorHSL = new THREE.Color();
            colorHSL.setHSL( H, S, L);
            var material = new THREE.MeshBasicMaterial({
                color: colorHSL,
                transparent:true,//开启透明度
                opacity:1//设置透明度具体值
                // wireframe: true
            });

            var geometry = new THREE.BoxGeometry(1, 1, 1);
            // var noise =  perlin.noise( x*scale + 0.2   , y*scale   , z*scale ) *1.5  ;
            var noise =  0.5 *perlin.noise( x*scale +10.04 , y*scale, z*scale) * 10;
            // var noise = 0;
            var interval = 0.5;

            var box = new THREE.Mesh(geometry, material);
            // box.position.x = noise + x * interval;
            // box.position.y = noise + y * interval;
            // box.position.z = noise + z * interval;
            box.position.x = noise + x - interval;
            box.position.y = noise + y - interval;
            box.position.z = noise + z - interval;


            object.add(box);
        }.bind(self);


        this.cube.drawLoop = function( num, z){
            var l = 1;
            if(num == 1){
                this.cube.Box(0,0,z);
            }
            for(var i = num; i <= num; i++){
                for(var k = i + num; k > 0; k--){
                    this.cube.Box( i*l, (i-k)*l, z);
                    this.cube.Box( (i-k)*l, -i*l, z);
                    this.cube.Box( -i*l, -(i-k)*l, z);
                    this.cube.Box( -(i-k)*l, i*l, z);
                }
            }



        }.bind(self);





        /*
          Update Material Colors based on audio input 基于音频输入更新材质颜色
        */



        this.cube.listen = function () {

            //如果音频分析存在
            if ( this.cube.audioAnalysers.length ) {
                //频谱等于音频分析每一个片段中的频率
                var spectrum = this.cube.audioAnalysers[0].getFrequencyData();
                //i从0开始
                var i = 0;


                Array.from(this.el.object3D.children).forEach((elem, index) => {
                    var f = spectrum[index];

                    var lightness = this.cube.map(f,0,255,0,0.9) ;
                    // var lightness = 0.9;

                    elem.material.color.setHSL(175/360, 0.551, lightness);
                    // console.log(lightness);

                    var opacityNum = lightness + 0.1;
                    if(lightness <= 0.05){
                        opacityNum = 0;
                    }
                    elem.material.opacity = opacityNum;
                    // console.log('opacityNum');

                });

            }

        }.bind(self);

        // this.cube.updateColors();
        this.cube.generate();
    },



    // Box: function(x, y, z){
    //     let object = this.el.object3D;
    //     var data = this.data;
    //     var color = data.color;
    //     var H = color.H;
    //     var S = color.S;
    //     var L = color.L;
    //
    //     var colorHSL = new THREE.Color();
    //     colorHSL.setHSL( H, S, L);
    //     var material = new THREE.MeshBasicMaterial({
    //         color: colorHSL,
    //         transparent:true,//开启透明度
    //         opacity:1//设置透明度具体值
    //         // wireframe: true
    //     });
    //
    //     var geometry = new THREE.BoxGeometry(1, 1, 1);
    //
    //     var box = new THREE.Mesh(geometry, material);
    //     box.position.x = x;
    //     box.position.y = y;
    //     box.position.z = z;
    //
    //
    //     object.add(box);
    // },

    // map: function (num, min1, max1, min2, max2){//num：输入的数；min1，max1：原本范围；min2，max2:需要映射的新范围
    //     if(num <= min1){
    //         num = min2;
    //         return num;
    //     }
    //     if(num >= max1){
    //         num = max2;
    //         return num;
    //     }
    //     if(num > min1 || num < max1){
    //         num = num / max1 * max2;
    //         return num;
    //     }
    // },

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
            return regenerate;
        }

        if ( needsRegeneration() > 0 ) {
            this.cube.generate();
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
        if ( this.data.audioSource && !this.cube.pause ) {
            this.cube.listen();
        }
    },

    /**
     * Called when entity pauses. 实体暂停时调用。
     * Use to stop or remove any dynamic or background behavior such as events. 用于停止或删除任何动态或背景行为，如事件。
     */
    pause: function () {
        this.cube.pause = true;
    },

    /**
     * Called when entity resumes. 实体恢复时调用。
     * Use to continue or add any dynamic or background behavior such as events. 用于继续或添加任何动态或背景行为，如事件。
     */
    play: function () {
        this.cube.pause = false;
    }
});
# WebGLのメモ

- [#010_行列演算とライブラリ](#010_行列演算とライブラリ)
- [#009_頂点バッファの基礎](#009_頂点バッファの基礎)
- [#008_シェーダの記述と基礎](#008_シェーダの記述と基礎)
- [#006_頂点とポリゴン](#006_頂点とポリゴン)
- [#005_行列(マトリックス)の基礎知識](#005_行列(マトリックス)の基礎知識)
- [#004_レンダリングのための下準備](#004_レンダリングのための下準備)
- [#003_3D描画の基礎知識](#003_3D描画の基礎知識)

## #010_行列演算とライブラリ

- javascript を用いた行列演算用のライブラリ
  - [MatrixGL](https://github.com/kotofurumiya/matrixgl)
      - これ使う
  - [glMatrix](http://code.google.com/p/glmatrix/)
  - [mjs](http://code.google.com/p/webgl-mjs/)
  - [Sylvester](http://sylvester.jcoglan.com/)
  - [closure](http://code.google.com/p/closure-library/)
  - [TDL](http://code.google.com/p/threedlibrary/)

- MatrixGL サンプル
```
const { Vector3, Vector4, Matrix4 } = require('matrixgl');
// Vector2、Vector3、Vector4がある
// 4次元ベクトルを作る
const vec = new Vector4(1, 2, 3, 4);

// 値を表示する（セットもできるよ！）
console.log(vec.x); // 1
console.log(vec.y); // 2
console.log(vec.z); // 3
console.log(vec.w); // 4

// 全部の値を表示する
console.log(vec.values);

// ベクトルの計算 ===========
const vec1 = new Vector4(1, 2, 3, 4);
const vec2 = new Vector4(5, 6, 7, 8);
const scalar = 5;

// 計算！
const vecSum = vec1.add(vec2);
const vecSub = vec1.sub(vec2);
const vecProd = vec1.mulByScalar(scalar);
const vecMag = vec1.magnitude;

// モデル行列
const transform = Matrix4.identity()
                         .translate(1, 2, 3)
                         .rotateX(Math.PI)
                         .scale(5, 5, 5);
     
// ”look at”ビュー行列                    
const camera = new Vector3(1, 2, 3);
const lookAt = new Vector3(4, 5, 6);
const cameraUpDirection = new Vector3(7, 8, 9);

const view = Matrix4.lookAt(camera, lookAt, cameraUpDirection);

// プロジェクション行列：平行投影（orthographic）
const orthographic = Matrix4.orthographic({
  top: 1,
  bottom: -1,
  left: -1,
  right: 1,
  near: 1,
  far: 2
});

// プロジェクション行列：透視投影（perspective）
const perspective = Matrix4.perspective({
  fovYRadian: 60 * Math.PI / 180,
  aspectRatio: 1,
  near: 1,
  far: 2
});

// ModelViewProjection行列
const mvp = perspective.mulByMatrix4(view)
                       .mulByMatrix4(transform);

// クォータニオンを作成する
const q = new Quaternion(1, 2, 3, 4);

// 回転軸を作る（Vector3）。軸は正規化されている必要がある
const axis = new Vector3(1, 2, 3).normalize();
const radian = 45 * Math.PI / 180;

// 軸axisについてradian度の回転を表すクォータニオンを作る
const q = Quaternion.rotationAround(axis, radian);

// クォータニオンを4x4の回転行列に変換する
const rotation = q.toRotationMatrix4();

// 補間するには両方のクォータニオンが正規化されている必要があります
const q1 = new Quaternion(1, 2, 3, 4).normalize();
const q2 = new Quaternion(5, 6, 7, 8).normalize();

// 2つのクォータニオンの中間（t=0.5）を補間して作ります
const interpolated = q1.slerp(q2, 0.5);

// Buffer
gl.bufferData(gl.ARRAY_BUFFER, vec1.values, gl.STATIC_DRAW);

// Uniform Variable
gl.uniformMatrix4fv(mvpLocation, false, mvp.values);
```

- [APIドキュメント](https://kotofurumiya.github.io/matrixgl/)

## #009_頂点バッファの基礎

- 点や線でも、どんなものを描画するにしても必ず登場するのが**頂点**
- WebGL のプログラミングにおいては頂点情報を扱うことが必須
- 必ず持っていなければならない情報は**頂点の位置情報**
- 頂点群がどのように配置されているのかを表した座標を、一般に**ローカル座標**と呼ぶ
- モデルを構成する各頂点の X ・ Y ・ Z の各座標が全て 0 の原点を基準として、それぞれがどのような位置に置かれているのかを定義したもの
- **頂点バッファ**という頂点情報を格納する入れ物を使う
- WebGL では頂点バッファのことを**VBO**(vertex buffer object)と呼ぶ
- 頂点バッファが所持できる情報
  - 位置情報
  - 頂点が持つ法線の情報
  - 色に関する情報
  - テクスチャ座標
  - 頂点の重さ
  - etc...
- 頂点に付加する情報の種類一つにつき、個別に VBO が必要
  - 頂点が[ 位置座標 ]と[ 法線 ]と[ 色 ]を持っている場合は、VBO は三つ必要
- **attribute**変数にデータを渡す役割を担うのが **VBO**
- 頂点バッファに関する処理の流れ
  1. 頂点の各情報をいったん配列に格納
  1. WebGL のメソッドを使って VBO を生成
  1. WebGL のメソッドを使い VBO に配列のデータを転送
  1. 頂点シェーダ内の attribute 変数と VBO を紐付ける
- VBO を生成するには配列にデータを格納。（位置情報なら[x,y,z]）
  - 配列は多次元配列にしないようにする

## #008_シェーダの記述と基礎

- GLSL( OpenGL Shading Language )
  - OpenGL との親和性を持つシェーダ記述言語
  - GLSL がわからないとレンダリングできない
- 頂点シェーダは、**頂点に関する情報**の全てを渡すことができる
  - 頂点の位置情報(必須)や、頂点が持つ法線、テクスチャ座標、頂点の色など
- フラグメントシェーダは、**画面にどんな色を出力すればいいのか**を決めることができる
- 必ず `main` メソッドを定義する

```頂点シェーダサンプルこのままではつかえない
// attribute修飾子は、頂点ごとに異なるデータを受け取るためのもの
attribute vec3 position;

void main(void) {
    gl_Position = position;
}
```

- モデル変換・ビュー変換・プロジェクション変換の三つの変換を行なうのも頂点シェーダの仕事

```
// attribute修飾子は、頂点ごとに異なるデータを受け取るためのもの
attribute vec3 position;
attribute vec4 color;

// uniform修飾子を使うと、全ての頂点に対して一律に処理される情報を渡すことが可能になる
// mvpMatrixというのは、モデル・ビュー・プロジェクションのそれぞれの変換行列を掛け合わせた座標変換行列
uniform mat4 mvpMatrix;

// varying修飾子の使い道は頂点シェーダとフラグメントシェーダの橋渡し
varying vec4 vColor;

void main(void) {
    vColor = color;
    
    // フラグメントシェーダにおいてはgl_FragColorにデータを代入
    gl_FragColor = vColor;
    
    gl_Position = mvpMatrix * position;
}
```

- 頂点シェーダからフラグメントシェーダにデータを渡したい場合にはvarying修飾子付きの変数を使う

## #006_頂点とポリゴン

- ポリゴンの頂点を線で結ぶ順序がある
  - 時計回り
  - 反時計回り
- 3Dレンダリングでは **カリング(見えないものは描画しない仕組み)** で描画負荷を軽減
  - 例えば頂点を結ぶ順序が時計回りなら裏、反時計回りは表といった感じ

## #005_行列(マトリックス)の基礎知識

- 正方行列: 行列の行と列が同じ要素数になっている行列  
  3D レンダリングの世界では 4 x 4 の行列を用いるのが一般的  
  3D レンダリングの計算に使うことができる便利な仕組み
- 行列は、上記のそれぞれの変換についての情報を保持することができる
  - モデル変換行列の場合、以下を一つの行列で定義できる
    - 描画したい 3D モデルの位置
    - 拡大縮小の有無
    - 回転しているかどうか
  - ビュー変換行列
    - カメラの位置
    - カメラの向き
    - カメラがどこを見ているのか(注視点)
  - プロジェクション変換行列
    - ディスプレイの縦横の比率(アスペクト比)
    - 視野角
- 三つの行列を掛け合わせて、最終的に出来上がった変換行列をシェーダに渡す
  - **掛ける順序によって結果が変わる**ため、モデル・ビュー・プロジェクションのそれぞれの行列を掛け合わせる順序に気をつける

## #004_レンダリングのための下準備
- 固定機能パイプラインというのは、3D でレンダリングを行なう一連の処理の流れ  
モデル・ビュー・プロジェクションの座標変換をやってくれる  
WebGL には固定機能パイプラインは存在しないため、座標変換は全て自前でやる必要がある。  
座標変換を記述するための仕組みこそが **シェーダ**  
（プログラマが自前で記述できる仕組みのことをプログラマブルシェーダと呼ぶ）
- 頂点シェーダ(またはバーテックスシェーダ):ポリゴンの頂点情報を扱う  
（WebGLでは自前で用意する必要がある）
- フラグメントシェーダ(またはピクセルシェーダ):描画される際のピクセルの情報を扱う  
（WebGLでは自前で用意する必要がある）
- シェーダーをかんたんに実装するにはHTMLの中に書く

``` sample.html
<script id="vshader" type="x-shader/x-vertex">
    ※頂点シェーダのソース
</script>
<script id="fshader" type="x-shader/x-fragment">
    ※フラグメントシェーダのソース
</script>
※ type 属性を指定しているのは javascript として認識されないようにするため
```

## #003_3D描画の基礎知識
- WebGLは右手座標系（OpenGL）。Z軸手前が＋。
- 座標変換には3つの種類がある
  - 座標変換1:モデル変換  
被写体となる物体が三次元空間のどの位置にあるのかを定義するための座標変換
  - 座標変換2:ビュー変換  
実際にカメラがどの位置にあるのか、そしてカメラはどこを向いているのかなどを定義  
カメラの位置や、その向けられている方角を決めるために行なう座標変換  
  - 座標変換3:プロジェクション変換
三次元空間のどの領域を撮影するのかなどを定義  
パノラマとして撮影するのか縦長として撮影するのか

onload = () => {
  const c = document.getElementById("canvas")
  c.width = 500
  c.height = 300

  // WebGLのコンテキストを取得
  const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
  // クリアカラーを指定（黒）
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // clear: 指定色で画面をクリアにするメソッド
  gl.clear(gl.COLOR_BUFFER_BIT)
}

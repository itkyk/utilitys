/**
 * ベジェ曲線から、時間経過に対するx軸の値を返す関数を生成します。
 *
 *
 * @param x1 -　ベジェ曲線のx1の値
 * @param y1 - ベジェ曲線のy1の値
 * @param x2 - ベジェ曲線のx2の値
 * @param y2 - ベジェ曲線のy2の値
 * @returns 0~1の時間を引数に渡すとX軸のポジションを返す関数<br/>createCubicBezier(0,0,1,1)(0.1)
 *
 * @beta
 */

const createCubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  let cx = 3 * x1;
  let cy = 3 * y1;
  let by = 3 * (y2 - y1) - cy;
  let ay = 1 - cy - by;
  let bx = 3 * (x2 - x1) - cx;
  let ax = 1 - cx - bx;
  return (t: number) => {
    let _t;
    if (t <= 0) {
      _t = 0;
    } else if (t >= 1) {
      _t = 1;
    } else {
      let prev,
        temp = t;
      do {
        prev = temp;
        temp =
          temp -
          (temp * (cx + temp * (bx + temp * ax)) - t) /
            (cx + temp * (2 * bx + 3 * ax * temp));
      } while (Math.abs(temp - prev) > 1e-4);
      _t = temp;
    }
    return _t * (cy + _t * (by + _t * ay));
  };
};

export default createCubicBezier;

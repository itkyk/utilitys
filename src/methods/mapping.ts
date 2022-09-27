/**
 * ベジェ曲線から、時間経過に対するx軸の値を返す関数を生成します。
 *
 *
 * @param x1 -　ベジェ曲線のx1の値
 * @param y1 - ベジェ曲線のy1の値
 * @param x2 - ベジェ曲線のx2の値
 * @param y2 - ベジェ曲線のy2の値
 * @returns 0~1の時間を引数に渡すと`X軸`のポジションを返す関数
 * <br/>
 * `createCubicBezier(0,0,1,1)(0.1)`
 *
 * @alpha
 * @beta
 */

const mapping = (
  value: number,
  minVal: number,
  maxVal: number,
  transformMinVal: number,
  transformMaxVal: number
) => {
  const transformDiff = transformMaxVal - transformMinVal;
  const diff = maxVal - minVal;
  const percentage = value / diff;
  return transformDiff * percentage + transformMinVal;
};

export default mapping;

// Railmath engine - model railroad grade, scale speed and helix math.
// Anchors (labeled in-app):
//  - Scale ratios: Z 1:220, N 1:160, TT 1:120, HO 1:87.1 (NMRA), S 1:64, O 1:48, G 1:22.5.
//  - Scale speed: model real speed = prototype speed / ratio. At scale speed, timing matches
//    the prototype (a 40 ft car passes a point in the same seconds on the layout as in life).
//  - Grade bands are community/NMRA guidance, labeled: <=2% comfortable mainline,
//    <=4% steep but workable, >4% very steep (short trains / helper territory).
//  - Helix clearance: rise per turn must exceed railhead clearance + roadbed thickness.
//  - Coupler/diaphragm overhang ~0.25 in per car (labeled estimate).
const SCALES = { Z:220, N:160, TT:120, HO:87.1, S:64, O:48, G:22.5 };
const MPH_TO_INPS = 17.6;       // 1 mph = 17.6 inches per second (exact: 63360/3600)
const FT_PER_MPH_PS = 1.4666666666666668; // 5280/3600 exact recurring
const COUPLER_IN = 0.25;        // labeled estimate

function needScale(scale){
  const r = SCALES[scale];
  if (!r) throw new Error('unknown scale - use one of ' + Object.keys(SCALES).join(', '));
  return r;
}

// Prototype mph -> model speed: real mph on the layout, inches per second,
// and seconds for a car of carFt prototype feet to pass a fixed point.
function scaleSpeed(protoMph, scale, carFt){
  if (!(protoMph > 0)) throw new Error('prototype speed must be positive');
  const ratio = needScale(scale);
  if (!(carFt > 0)) throw new Error('car length must be positive');
  const modelMph = protoMph / ratio;
  const modelInPerSec = modelMph * MPH_TO_INPS;
  // scale-time invariance: car passage time matches the prototype exactly
  const passSec = carFt / (protoMph * FT_PER_MPH_PS);
  const carInches = carFt * 12 / ratio;
  return { protoMph, scale, ratio, modelMph, modelInPerSec, carInches, passSec };
}

// Rise over run -> grade percent and labeled band.
function grade(riseIn, runIn){
  if (!(riseIn > 0)) throw new Error('rise must be positive');
  if (!(runIn > 0)) throw new Error('run must be positive');
  const pct = riseIn / runIn * 100;
  const band = pct <= 2 ? 'comfortable mainline (<=2%)'
             : pct <= 4 ? 'steep but workable (<=4%)'
             : 'very steep (>4%) - short trains and helpers';
  return { riseIn, runIn, pct, band };
}

// Helix: radius + grade + total climb -> turns, rise per turn, track length,
// clearance verdict against required railhead clearance and roadbed thickness.
function helix(radiusIn, gradePct, climbIn, clearanceIn, roadbedIn){
  if (!(radiusIn > 0)) throw new Error('radius must be positive');
  if (!(gradePct > 0)) throw new Error('grade must be positive');
  if (!(climbIn > 0)) throw new Error('climb must be positive');
  if (!(clearanceIn > 0)) throw new Error('clearance must be positive');
  if (!(roadbedIn >= 0)) throw new Error('roadbed thickness cannot be negative');
  const circ = 2 * Math.PI * radiusIn;
  const risePerTurn = circ * gradePct / 100;
  const turnsExact = climbIn / risePerTurn;
  const turns = Math.ceil(turnsExact);
  const trackIn = circ * turnsExact;
  const needPerTurn = clearanceIn + roadbedIn;
  const clears = risePerTurn >= needPerTurn;
  const verdict = clears
    ? 'rises ' + risePerTurn.toFixed(2) + ' in per turn - clears ' + needPerTurn.toFixed(2) + ' in needed'
    : 'rises only ' + risePerTurn.toFixed(2) + ' in per turn - needs ' + needPerTurn.toFixed(2) + ' in; raise grade or radius';
  const band = grade(gradePct, 100).band;
  return { radiusIn, gradePct, climbIn, circ, risePerTurn, turnsExact, turns, trackIn,
    needPerTurn, clears, verdict, band };
}

// Max cars on a track: actual car pitch = scale length + coupler overhang.
function capacity(trackIn, carFt, scale){
  if (!(trackIn > 0)) throw new Error('track length must be positive');
  if (!(carFt > 0)) throw new Error('car length must be positive');
  const ratio = needScale(scale);
  const pitch = carFt * 12 / ratio + COUPLER_IN;
  const cars = Math.floor(trackIn / pitch);
  return { trackIn, carFt, scale, ratio, pitch, cars, usedIn: cars * pitch };
}

module.exports = { SCALES, MPH_TO_INPS, FT_PER_MPH_PS, COUPLER_IN,
  scaleSpeed, grade, helix, capacity };
const API = module.exports;
if (typeof window !== 'undefined') window.Railmath = API;

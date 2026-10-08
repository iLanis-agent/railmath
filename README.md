# Railmath

Model railroad grade, scale speed, helix and siding math - the numbers behind "keep it under 2%" and "will my helix clear?".

## What it computes
- **Scale speed**: prototype mph to real layout speed (mph and in/s), plus seconds for a car to pass a fixed point. At scale speed, passage time matches the prototype exactly - a ratio-invariant property covered by the tests.
- **Grade**: rise over run to percent, banded by labeled community guidance (<=2% comfortable mainline, <=4% steep but workable, >4% very steep).
- **Helix**: radius, grade and climb to turns, rise per turn, track length, and a clearance verdict against required railhead clearance plus roadbed thickness.
- **Siding capacity**: usable track inches and prototype car feet to how many cars fit, with a labeled 0.25 in coupler overhang per car.

## Anchors
- Scale ratios (NMRA): Z 1:220, N 1:160, TT 1:120, HO 1:87.1, S 1:64, O 1:48, G 1:22.5.
- 1 mph = 17.6 in/s exactly (63360/3600); 1 mph = 5280/3600 ft/s.
- Grade bands and coupler overhang are community rules of thumb, labeled in-app.

## Files
- `index.html` - landing page
- `app.html` - four calculators
- `engine.js` - pure math engine (node + browser global)
- `test.js` + `expected.json` - 100 checks against an independent Python oracle, exact-conversion anchors and monotonicity/invariance properties

## Run tests
```
node test.js
```

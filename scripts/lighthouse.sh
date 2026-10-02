#!/usr/bin/env bash
# Runs Lighthouse (mobile) against a running production server and prints the scores.
# Needs Chrome/Chromium and network access to install lighthouse on first use.
#   npx ng build && PORT=4310 node dist/quality-school-angular/server/server.mjs &
#   ./scripts/lighthouse.sh http://localhost:4310/bn http://localhost:4310/en/gallery
set -eu
[ $# -gt 0 ] || { echo "usage: $0 <url>..." >&2; exit 1; }
for url in "$@"; do
  npx --yes lighthouse@12 "$url" --quiet --output=json --output-path=stdout \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new --no-sandbox" |
    node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
const r=JSON.parse(s),c=r.categories,a=r.audits,v=k=>a[k].displayValue;
console.log(r.finalUrl,"perf",Math.round(c.performance.score*100),"a11y",Math.round(c.accessibility.score*100),
"best-practices",Math.round(c["best-practices"].score*100),"seo",Math.round(c.seo.score*100),
"| LCP",v("largest-contentful-paint"),"TBT",v("total-blocking-time"),"CLS",v("cumulative-layout-shift"));});'
done

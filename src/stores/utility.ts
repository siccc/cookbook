export function isMobile() {
  let isMobile = false;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }
  return isMobile;
}

export function getDPR() {
  const dpr = window ? Math.ceil(Number((window.devicePixelRatio).toFixed(2))) : 1;
  return `dpr_${dpr}.0`;
}
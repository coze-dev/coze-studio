/**
 * get asset upload cdn address
 * @param assetName asset name
 * @returns asset name with cdn address
 */
export function getUploadCDNAsset(assetName: string) {
  // If the `UPLOAD_CDN` environment variable exists, use it
  if (UPLOAD_CDN) {
    return `${UPLOAD_CDN}/${assetName}`;
  }

  throw new Error('The UPLOAD_CDN environment variable is not configured');
}

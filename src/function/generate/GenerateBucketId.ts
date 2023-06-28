const epoch = new Date('2023-01-01').getTime();
const time = 7 * 24 * 60 * 60 * 1000;

export default function generateBucketId() {
  const current_timestamp = Date.now();
  const bucketId = Math.floor((current_timestamp - epoch) / time);
  return bucketId;
}

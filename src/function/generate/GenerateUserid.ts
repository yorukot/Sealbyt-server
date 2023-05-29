let sequence = 1000;
let lastTimestamp = 0;

export default function generateUserId() {
  const epoch = new Date('2023-01-01').getTime();
  const currentTimestamp = Date.now();
  const timestampPart = currentTimestamp - epoch;
  const processid = process.pid.toString().slice(-4).padStart(4, '0');
  if (currentTimestamp === lastTimestamp) {
    sequence = sequence + 1;
  } else {
    sequence = 1000;
  }

  lastTimestamp = currentTimestamp;

  const generateUserId = `${timestampPart}${processid}${sequence}`;
  return generateUserId;
}

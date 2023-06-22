let sequence = 100;
let last_timestamp = 0;
const epoch = new Date('2023-01-01').getTime();

export default function generateRoomId() {
  const current_timestamp = Date.now();
  const timestamp_part = current_timestamp - epoch;
  const machine_id = 10;
  if (current_timestamp === last_timestamp) {
    sequence = sequence + 1;
  } else {
    sequence = 100;
  }

  last_timestamp = current_timestamp;

  const generateUserId = `${timestamp_part}${machine_id}${sequence}`;
  return generateUserId;
}

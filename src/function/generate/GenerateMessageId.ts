const epoch = new Date('2023-01-01').getTime();

export default function generateMessageId() {
  const current_timestamp = Date.now();
  const timestamp_part = current_timestamp - epoch;
  const machine_id = 10;
  const generateUserId = `${timestamp_part}${machine_id}`;
  return generateUserId;
}

const epoch = new Date('2023-01-01').getTime();

export default function generateOldMessageId(old_time: number) {
  const timestamp_part = old_time - epoch;
  const machine_id = 99;
  const generateUserId = `${timestamp_part}${machine_id}`;
  return generateUserId;
}

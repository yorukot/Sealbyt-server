export default function validateUsername(username: string) {
  const pattern = /^[A-Za-z0-9._]+$/;
  return pattern.test(username);
}

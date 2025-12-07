import { useZanoCompanionCredentials } from "./companion";
import { Group } from "./Group";

export const Credentials = () => {
  const credentials = useZanoCompanionCredentials();
  if (!credentials) return null;
  return (
    <Group>
      <Group.Item label="address" value={credentials.address} />
      <Group.Item label="nonce" value={credentials.nonce} />
      <Group.Item label="publicKey" value={credentials.publicKey} />
      <Group.Item label="signature" value={credentials.signature} />
    </Group>
  );
};

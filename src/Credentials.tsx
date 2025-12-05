import { useZanoCompanionCredentials } from "./companion";

export const Credentials = () => {
  const [credentials] = useZanoCompanionCredentials();
  if (!credentials) return null;
  return (
    <div className="group">
      <div className="group-item">
        <span className="label">address:</span>
        <span className="value">{credentials.address}</span>
      </div>
      <div className="group-item">
        <span className="label">nonce:</span>
        <span className="value">{credentials.nonce}</span>
      </div>
      <div className="group-item">
        <span className="label">publicKey:</span>
        <span className="value">{credentials.publicKey}</span>
      </div>
      <div className="group-item">
        <span className="label">signature:</span>
        <span className="value">{credentials.signature}</span>
      </div>
    </div>
  );
};

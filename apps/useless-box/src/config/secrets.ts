import { 
  SecretsManagerClient, 
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager';

interface UselessBoxSecrets {
  session_secret: string;
  jwt_secret: string;
}

let cachedSecrets: UselessBoxSecrets | null = null;

export const getSecrets = async(): Promise<UselessBoxSecrets> => {
  if (cachedSecrets) return cachedSecrets;

  const client = new SecretsManagerClient({ region: 'ap-northeast-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'useless-box-app' })
  );

  cachedSecrets = JSON.parse(response.SecretString!);
  return cachedSecrets;
}

import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config';
import { logger } from '../utils/logger';

export class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;

  constructor() {
    this.pinataApiKey = config.ipfs.pinataApiKey;
    this.pinataSecretKey = config.ipfs.pinataSecretKey;
  }

  async pinJSON(data: object): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      logger.warn('Pinata credentials not configured, returning mock hash');
      return `QmMock${Date.now()}`;
    }

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: data,
          pinataMetadata: {
            name: `agent-code-hub-${Date.now()}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      logger.error('Failed to pin JSON to IPFS:', error);
      throw new Error('IPFS pinning failed');
    }
  }

  async pinFile(fileBuffer: Buffer, filename: string): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      logger.warn('Pinata credentials not configured, returning mock hash');
      return `QmMockFile${Date.now()}`;
    }

    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename });
      formData.append(
        'pinataMetadata',
        JSON.stringify({ name: filename })
      );

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      logger.error('Failed to pin file to IPFS:', error);
      throw new Error('IPFS pinning failed');
    }
  }

  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}
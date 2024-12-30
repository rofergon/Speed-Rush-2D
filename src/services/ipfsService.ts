import { create } from '@web3-storage/w3up-client';

class IPFSClient {
  private static instance: any;

  private constructor() {}

  public static async getInstance() {
    if (!IPFSClient.instance) {
      IPFSClient.instance = await create();
    }
    return IPFSClient.instance;
  }
}

export const ipfsService = {
  async uploadImage(file: File): Promise<string> {
    try {
      const client = await IPFSClient.getInstance();
      const cid = await client.uploadFile(file);
      const url = `ipfs://${cid}`;
      return url;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  },

  async uploadJSON(data: any): Promise<string> {
    try {
      const client = await IPFSClient.getInstance();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const file = new File([blob], 'metadata.json', { type: 'application/json' });
      const cid = await client.uploadFile(file);
      const url = `ipfs://${cid}`;
      return url;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  },

  getHttpUrl(ipfsUrl: string): string {
    if (!ipfsUrl) return '';
    const cid = ipfsUrl.replace('ipfs://', '');
    return `https://${cid}.ipfs.w3s.link`;
  }
}; 
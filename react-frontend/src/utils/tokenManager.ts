import { jwtDecode } from 'jwt-decode';
import CryptoJS from 'crypto-js';

interface CustomJwtPayload {
  data: {
    user_id: string;
    email: string;
    user_type: 'student' | 'school';
  };
  exp: number;
}

class TokenManager {
  private static readonly TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'jwtToken';
  private static readonly REFRESH_TOKEN_KEY = process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refreshToken';
  private static readonly TOKEN_HASH_KEY = process.env.REACT_APP_TOKEN_HASH_KEY || 'tokenHash';
  private static readonly ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secure-encryption-key';

  private static encryptToken(token: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, this.ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting token:', error);
      throw error;
    }
  }

  private static decryptToken(encryptedToken: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, this.ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Error decrypting token:', error);
      throw error;
    }
  }

  private static generateTokenHash(token: string): string {
    try {
      const hash = CryptoJS.SHA256(token).toString();
      return hash;
    } catch (error) {
      console.error('Error generating token hash:', error);
      throw error;
    }
  }

  private static verifyTokenIntegrity(token: string): boolean {
    try {
      const storedHash = localStorage.getItem(this.TOKEN_HASH_KEY);
      if (!storedHash) {
        return false;
      }

      const currentHash = this.generateTokenHash(token);
      const isValid = storedHash === currentHash;
      return isValid;
    } catch (error) {
      console.error('Error verifying token integrity:', error);
      return false;
    }
  }

  static setTokens(token: string, refreshToken: string): void {
    try {
      
      // Validate token before storing
      const decodedToken = jwtDecode<CustomJwtPayload>(token);

      // Generate and store hash
      const tokenHash = this.generateTokenHash(token);

      // Encrypt tokens
      const encryptedToken = this.encryptToken(token);
      const encryptedRefreshToken = this.encryptToken(refreshToken);

      // Store encrypted tokens and hash
      localStorage.setItem(this.TOKEN_KEY, encryptedToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
      localStorage.setItem(this.TOKEN_HASH_KEY, tokenHash);

    } catch (error) {
      console.error('Error setting tokens:', error);
      this.clearTokens();
      throw error;
    }
  }

  static getToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedToken) {
        return null;
      }

      const decryptedToken = this.decryptToken(encryptedToken);

      if (!this.verifyTokenIntegrity(decryptedToken)) {
        this.clearTokens();
        return null;
      }
      return decryptedToken;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearTokens();
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      const encryptedRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!encryptedRefreshToken) {
        return null;
      }

      const decryptedRefreshToken = this.decryptToken(encryptedRefreshToken);
      return decryptedRefreshToken;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_HASH_KEY);
  }

  static isTokenValid(): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;

      const decoded = jwtDecode<CustomJwtPayload>(token);
      const currentTime = Date.now() / 1000;
      const isValid = decoded.exp > currentTime;
      return isValid;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  static getDecodedToken(): CustomJwtPayload | null {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      
      // Validate user type
      if (!decodedToken.data?.user_type || !['student', 'school'].includes(decodedToken.data.user_type)) {
        console.error('Invalid user type in token');
        return null;
      }

      return decodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

export default TokenManager; 
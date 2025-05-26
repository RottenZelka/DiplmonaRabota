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
      console.debug('Token encrypted successfully');
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
      console.debug('Token decrypted successfully');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting token:', error);
      throw error;
    }
  }

  private static generateTokenHash(token: string): string {
    try {
      const hash = CryptoJS.SHA256(token).toString();
      console.debug('Token hash generated successfully');
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
        console.debug('No stored hash found');
        return false;
      }

      const currentHash = this.generateTokenHash(token);
      const isValid = storedHash === currentHash;
      console.debug('Token integrity check:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error verifying token integrity:', error);
      return false;
    }
  }

  static setTokens(token: string, refreshToken: string): void {
    try {
      console.debug('Setting tokens...');
      
      // Validate token before storing
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      console.debug('Token decoded successfully:', decodedToken);

      // Generate and store hash
      const tokenHash = this.generateTokenHash(token);
      console.debug('Token hash generated successfully');

      // Encrypt tokens
      const encryptedToken = this.encryptToken(token);
      const encryptedRefreshToken = this.encryptToken(refreshToken);

      // Store encrypted tokens and hash
      localStorage.setItem(this.TOKEN_KEY, encryptedToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
      localStorage.setItem(this.TOKEN_HASH_KEY, tokenHash);

      console.debug('Tokens stored successfully');
    } catch (error) {
      console.error('Error setting tokens:', error);
      this.clearTokens();
      throw error;
    }
  }

  static getToken(): string | null {
    try {
      console.debug('Getting token...');
      const encryptedToken = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedToken) {
        console.debug('No encrypted token found');
        return null;
      }

      const decryptedToken = this.decryptToken(encryptedToken);
      console.debug('Token decrypted');

      if (!this.verifyTokenIntegrity(decryptedToken)) {
        console.debug('Token integrity check failed');
        this.clearTokens();
        return null;
      }

      console.debug('Token retrieved successfully');
      return decryptedToken;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearTokens();
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      console.debug('Getting refresh token...');
      const encryptedRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!encryptedRefreshToken) {
        console.debug('No encrypted refresh token found');
        return null;
      }

      const decryptedRefreshToken = this.decryptToken(encryptedRefreshToken);
      console.debug('Refresh token retrieved successfully');
      return decryptedRefreshToken;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static clearTokens(): void {
    console.debug('Clearing tokens...');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_HASH_KEY);
    console.debug('Tokens cleared successfully');
  }

  static isTokenValid(): boolean {
    try {
      console.debug('Checking token validity...');
      const token = this.getToken();
      if (!token) return false;

      const decoded = jwtDecode<CustomJwtPayload>(token);
      const currentTime = Date.now() / 1000;
      const isValid = decoded.exp > currentTime;
      console.debug('Token validity check:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  static getDecodedToken(): CustomJwtPayload | null {
    try {
      console.debug('Getting decoded token...');
      const token = this.getToken();
      if (!token) {
        console.debug('No token found for decoding');
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
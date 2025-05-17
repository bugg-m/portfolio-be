import {
  AttestationFormat,
  CredentialDeviceType,
  type WebAuthnCredential,
} from '@simplewebauthn/server';
import { AuthenticationExtensionsAuthenticatorOutputs } from '@simplewebauthn/server/script/helpers/decodeAuthenticatorExtensions';
import { Model, Document } from 'mongoose';

export interface UserRequestBodyTypes {
  username: string;
  email: string;
  password: string;
}

export interface UserDocument extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  refreshToken: string;
  passkeyCredentials: PasskeysDocument;
  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect(password: string): Promise<boolean>;

  generateAccessToken(): Promise<string>;

  generateRefreshToken(): Promise<string>;
}

export interface PasskeysDocument {
  registerChallenge: string;
  loginChallenge: string;
  registrationInfo: RegistrationInfoDocument;
  createdAt: Date;
  displayName: string;
}

export interface RegistrationInfoDocument {
  fmt: AttestationFormat;
  aaguid: string;
  credential: WebAuthnCredential;
  credentialType: 'public-key';
  attestationObject: Uint8Array;
  userVerified: boolean;
  credentialDeviceType: CredentialDeviceType;
  credentialBackedUp: boolean;
  origin: string;
  rpID?: string;
  authenticatorExtensionResults?: AuthenticationExtensionsAuthenticatorOutputs;
}

export interface UserModel extends Model<UserDocument> {}

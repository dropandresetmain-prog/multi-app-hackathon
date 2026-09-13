import { google } from "googleapis";
import type { GoogleWorkspaceConfig } from "./config";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/spreadsheets",
] as const;

export function googleAuth(config: GoogleWorkspaceConfig) {
  const auth = new google.auth.OAuth2(config.clientId, config.clientSecret);
  auth.setCredentials({ refresh_token: config.refreshToken });
  return auth;
}

export function calendarClient(config: GoogleWorkspaceConfig) {
  return google.calendar({ version: "v3", auth: googleAuth(config) });
}

export function driveClient(config: GoogleWorkspaceConfig) {
  return google.drive({ version: "v3", auth: googleAuth(config) });
}

export function gmailClient(config: GoogleWorkspaceConfig) {
  return google.gmail({ version: "v1", auth: googleAuth(config) });
}

export function sheetsClient(config: GoogleWorkspaceConfig) {
  return google.sheets({ version: "v4", auth: googleAuth(config) });
}

export { SCOPES };
